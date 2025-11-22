import { useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Alert, AlertType, AlertSeverity } from '@/types/alerts';
import { predictOrders } from '@/lib/predictionEngine';

export const useAlerts = () => {
  const { products, warehouses, receipts, deliveries, transfers, adjustments } = useInventory();

  const alerts = useMemo(() => {
    const alertList: Alert[] = [];

    // Low Stock Alerts
    products.forEach(product => {
      Object.entries(product.stock).forEach(([warehouseId, quantity]) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        const reorderingRule = product.reorderingRules?.[warehouseId];
        const threshold = reorderingRule?.reorderPoint || product.minStock || 0;
        
        if (threshold > 0 && quantity <= threshold) {
          const isReorderPoint = reorderingRule && quantity <= reorderingRule.reorderPoint;
          alertList.push({
            id: `low-stock-${product.id}-${warehouseId}`,
            type: isReorderPoint ? 'reorder_needed' : 'low_stock',
            severity: quantity === 0 ? 'error' : isReorderPoint ? 'warning' : 'warning',
            title: isReorderPoint ? 'Reorder Point Reached' : 'Low Stock Alert',
            message: `${product.name} (${product.sku}) is ${quantity === 0 ? 'out of stock' : isReorderPoint ? 'at reorder point' : 'running low'} in ${warehouse?.name || 'warehouse'}. Current: ${quantity.toLocaleString()} ${product.unitOfMeasure}, ${isReorderPoint ? `Reorder Point: ${reorderingRule.reorderPoint}` : `Minimum: ${product.minStock}`} ${product.unitOfMeasure}`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/products`,
            metadata: {
              productId: product.id,
              warehouseId,
            },
          });
        }
      });
    });

    // Overstock Alerts
    products.forEach(product => {
      Object.entries(product.stock).forEach(([warehouseId, quantity]) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (product.maxStock && quantity > product.maxStock * 1.2) {
          const excess = quantity - product.maxStock;
          alertList.push({
            id: `overstock-${product.id}-${warehouseId}`,
            type: 'overstock',
            severity: 'warning',
            title: 'Overstock Alert',
            message: `${product.name} (${product.sku}) exceeds maximum stock in ${warehouse?.name || 'warehouse'}. Current: ${quantity.toLocaleString()} ${product.unitOfMeasure}, Maximum: ${product.maxStock} ${product.unitOfMeasure} (${excess.toLocaleString()} excess)`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/products`,
            metadata: {
              productId: product.id,
              warehouseId,
            },
          });
        }
      });
    });

    // Pending Receipts
    const pendingReceipts = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled');
    if (pendingReceipts.length > 0) {
      alertList.push({
        id: 'pending-receipts',
        type: 'pending_receipt',
        severity: pendingReceipts.length > 5 ? 'warning' : 'info',
        title: 'Pending Receipts',
        message: `You have ${pendingReceipts.length} pending receipt(s) that need attention.`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/receipts`,
        metadata: {
          count: pendingReceipts.length,
        },
      });
    }

    // Pending Deliveries
    const pendingDeliveries = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled');
    if (pendingDeliveries.length > 0) {
      alertList.push({
        id: 'pending-deliveries',
        type: 'pending_delivery',
        severity: pendingDeliveries.length > 5 ? 'warning' : 'info',
        title: 'Pending Deliveries',
        message: `You have ${pendingDeliveries.length} pending delivery order(s) that need processing.`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/deliveries`,
        metadata: {
          count: pendingDeliveries.length,
        },
      });
    }

    // Pending Transfers
    const pendingTransfers = transfers.filter(t => t.status !== 'done' && t.status !== 'canceled');
    if (pendingTransfers.length > 0) {
      alertList.push({
        id: 'pending-transfers',
        type: 'pending_transfer',
        severity: 'info',
        title: 'Pending Transfers',
        message: `You have ${pendingTransfers.length} pending transfer(s) awaiting completion.`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/transfers`,
        metadata: {
          count: pendingTransfers.length,
        },
      });
    }

    // Reorder Recommendations (from predictions)
    const predictions = predictOrders(products, warehouses, {
      receipts,
      deliveries,
      transfers,
    });

    const reorderPredictions = predictions.filter(p => p.recommendedOrder > 0);
    if (reorderPredictions.length > 0) {
      reorderPredictions.slice(0, 5).forEach((prediction, idx) => {
        alertList.push({
          id: `reorder-${prediction.productId}-${prediction.warehouseId}-${idx}`,
          type: 'reorder_needed',
          severity: prediction.daysUntilStockout < 15 ? 'error' : prediction.daysUntilStockout < 30 ? 'warning' : 'info',
          title: 'Reorder Recommendation',
          message: `${prediction.productName} in ${prediction.warehouseName}: Recommended order of ${prediction.recommendedOrder.toLocaleString()} units. ${prediction.reason}`,
          timestamp: new Date(),
          read: false,
          actionUrl: `/receipts`,
          metadata: {
            productId: prediction.productId,
            warehouseId: prediction.warehouseId,
            recommendedOrder: prediction.recommendedOrder,
            daysUntilStockout: prediction.daysUntilStockout,
          },
        });
      });
    }

    // Sort by severity and timestamp (most recent first)
    return alertList.sort((a, b) => {
      const severityOrder: Record<AlertSeverity, number> = {
        error: 0,
        warning: 1,
        info: 2,
        success: 3,
      };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [products, warehouses, receipts, deliveries, transfers, adjustments]);

  const unreadCount = useMemo(() => {
    return alerts.filter(a => !a.read).length;
  }, [alerts]);

  return {
    alerts,
    unreadCount,
  };
};

