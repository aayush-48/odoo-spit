import { Product, Receipt, Delivery, Transfer } from '@/types';
import { OrderPrediction } from '@/types/alerts';

interface HistoricalData {
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: Transfer[];
}

/**
 * Predicts future order requirements based on historical data
 */
export const predictOrders = (
  products: Product[],
  warehouses: Array<{ id: string; name: string }>,
  historicalData: HistoricalData
): OrderPrediction[] => {
  const predictions: OrderPrediction[] = [];

  // Calculate average consumption rate from deliveries
  const consumptionByProduct: Record<string, Record<string, number[]>> = {};
  
  // Group deliveries by product and warehouse, track consumption over time
  historicalData.deliveries.forEach(delivery => {
    if (delivery.status === 'done') {
      delivery.lines.forEach(line => {
        if (!consumptionByProduct[line.productId]) {
          consumptionByProduct[line.productId] = {};
        }
        if (!consumptionByProduct[line.productId][delivery.warehouseId]) {
          consumptionByProduct[line.productId][delivery.warehouseId] = [];
        }
        consumptionByProduct[line.productId][delivery.warehouseId].push(line.quantity);
      });
    }
  });

  // Calculate average daily consumption (assuming 30-day periods)
  const calculateAverageDailyConsumption = (quantities: number[]): number => {
    if (quantities.length === 0) return 0;
    const total = quantities.reduce((a, b) => a + b, 0);
    const days = Math.max(30, quantities.length * 7); // Assume deliveries spread over time
    return total / days;
  };

  // Analyze each product in each warehouse
  products.forEach(product => {
    warehouses.forEach(warehouse => {
      const currentStock = product.stock[warehouse.id] || 0;
      const minStock = product.minStock || 0;
      const maxStock = product.maxStock || 0;
      const reorderingRule = product.reorderingRules?.[warehouse.id];
      const reorderPoint = reorderingRule?.reorderPoint || minStock;
      const reorderQuantity = reorderingRule?.reorderQuantity;
      const leadTimeDays = reorderingRule?.leadTimeDays || 7;

      // Get consumption data
      const consumptionData = consumptionByProduct[product.id]?.[warehouse.id] || [];
      const avgDailyConsumption = calculateAverageDailyConsumption(consumptionData);

      // Calculate predicted demand for next 30 days
      const predictedDemand = avgDailyConsumption * 30;

      // Calculate days until stockout
      let daysUntilStockout = Infinity;
      if (avgDailyConsumption > 0) {
        daysUntilStockout = Math.floor(currentStock / avgDailyConsumption);
      }

      // Determine if prediction is needed
      // Use reorderPoint if available, otherwise use minStock
      const threshold = reorderPoint > 0 ? reorderPoint : minStock * 1.5;
      const needsPrediction = 
        currentStock <= threshold || // At or below reorder point
        daysUntilStockout < (leadTimeDays + 7) || // Will run out before lead time + buffer
        (avgDailyConsumption > 0 && currentStock < predictedDemand); // Current stock won't cover predicted demand

      if (needsPrediction && currentStock > 0) {
        // Calculate recommended order quantity
        // Use reorderQuantity if specified, otherwise calculate based on demand
        let recommendedOrder: number;
        if (reorderQuantity && reorderQuantity > 0) {
          recommendedOrder = reorderQuantity;
        } else {
          // Order enough to cover predicted demand + safety stock (20% buffer)
          const safetyStock = predictedDemand * 0.2;
          recommendedOrder = Math.ceil(predictedDemand + safetyStock - currentStock);
        }

        // Only recommend if order is positive and meaningful
        if (recommendedOrder > 0 && recommendedOrder >= currentStock * 0.1) {
          // Calculate confidence based on data availability
          const confidence = Math.min(
            100,
            50 + (consumptionData.length * 5) + (avgDailyConsumption > 0 ? 20 : 0)
          );

          // Determine reason
          let reason = '';
          if (reorderingRule && currentStock <= reorderPoint) {
            reason = `Stock at reorder point (${reorderPoint}). ${reorderingRule.autoReorder ? 'Auto-reorder enabled' : 'Manual reorder required'}`;
          } else if (currentStock <= minStock) {
            reason = 'Current stock is at or below minimum threshold';
          } else if (daysUntilStockout < (leadTimeDays + 7)) {
            reason = `Stock will run out in ${daysUntilStockout} days (lead time: ${leadTimeDays} days)`;
          } else if (currentStock < predictedDemand) {
            reason = 'Current stock insufficient for predicted demand';
          } else {
            reason = 'Preventive reorder recommended';
          }

          predictions.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            currentStock,
            predictedDemand: Math.ceil(predictedDemand),
            recommendedOrder,
            daysUntilStockout: daysUntilStockout === Infinity ? 999 : daysUntilStockout,
            confidence: Math.round(confidence),
            reason,
          });
        }
      }

      // Check for overstock
      if (maxStock > 0 && currentStock > maxStock * 1.2) {
        const excessStock = currentStock - maxStock;
        const avgDailyConsumption = calculateAverageDailyConsumption(consumptionData);
        const daysOfStock = avgDailyConsumption > 0 ? Math.floor(currentStock / avgDailyConsumption) : 999;

        if (daysOfStock > 90) { // More than 90 days of stock
          predictions.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            currentStock,
            predictedDemand: Math.ceil(avgDailyConsumption * 30),
            recommendedOrder: -Math.ceil(excessStock * 0.3), // Negative = reduce stock
            daysUntilStockout: daysOfStock,
            confidence: 85,
            reason: `Overstock detected: ${excessStock.toLocaleString()} units above maximum (${daysOfStock} days of stock)`,
          });
        }
      }
    });
  });

  // Sort by urgency (days until stockout, then by confidence)
  return predictions.sort((a, b) => {
    if (a.daysUntilStockout !== b.daysUntilStockout) {
      return a.daysUntilStockout - b.daysUntilStockout;
    }
    return b.confidence - a.confidence;
  });
};

