import { useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { predictOrders } from '@/lib/predictionEngine';
import { OrderPrediction } from '@/types/alerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const OrderPredictions = () => {
  const { products, warehouses, receipts, deliveries, transfers } = useInventory();
  const navigate = useNavigate();

  const predictions = useMemo(() => {
    return predictOrders(products, warehouses, {
      receipts,
      deliveries,
      transfers,
    });
  }, [products, warehouses, receipts, deliveries, transfers]);

  const reorderPredictions = predictions.filter(p => p.recommendedOrder > 0);
  const overstockPredictions = predictions.filter(p => p.recommendedOrder < 0);

  const handleCreateReceipt = (prediction: OrderPrediction) => {
    // Navigate to receipts page with pre-filled data
    navigate('/receipts', { state: { suggestedProduct: prediction.productId, suggestedWarehouse: prediction.warehouseId, suggestedQuantity: prediction.recommendedOrder } });
  };

  return (
    <div className="space-y-6">
      {/* Reorder Predictions */}
      {reorderPredictions.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              Reorder Recommendations
            </CardTitle>
            <CardDescription>
              Products that need to be reordered to prevent stockouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Warehouse</TableHead>
                    <TableHead className="font-semibold text-right">Current Stock</TableHead>
                    <TableHead className="font-semibold text-right">Predicted Demand</TableHead>
                    <TableHead className="font-semibold text-right">Recommended Order</TableHead>
                    <TableHead className="font-semibold text-right">Days Until Stockout</TableHead>
                    <TableHead className="font-semibold text-center">Confidence</TableHead>
                    <TableHead className="font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderPredictions.map((prediction) => (
                    <TableRow key={`${prediction.productId}-${prediction.warehouseId}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{prediction.productName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {prediction.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{prediction.warehouseName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{prediction.currentStock.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {prediction.predictedDemand.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-warning text-warning-foreground">
                          {prediction.recommendedOrder.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {prediction.daysUntilStockout < 15 && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                          <span
                            className={
                              prediction.daysUntilStockout < 15
                                ? 'text-destructive font-semibold'
                                : prediction.daysUntilStockout < 30
                                ? 'text-warning font-semibold'
                                : ''
                            }
                          >
                            {prediction.daysUntilStockout === 999 ? 'N/A' : `${prediction.daysUntilStockout} days`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            prediction.confidence >= 80
                              ? 'border-success text-success'
                              : prediction.confidence >= 60
                              ? 'border-warning text-warning'
                              : 'border-muted text-muted-foreground'
                          }
                        >
                          {prediction.confidence}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateReceipt(prediction)}
                          className="gap-1"
                        >
                          <Package className="w-3 h-3" />
                          Create Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Predictions are based on historical consumption patterns. 
                Confidence scores reflect data availability and pattern reliability.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overstock Predictions */}
      {overstockPredictions.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              Overstock Alerts
            </CardTitle>
            <CardDescription>
              Products with excess inventory that may need redistribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Warehouse</TableHead>
                    <TableHead className="font-semibold text-right">Current Stock</TableHead>
                    <TableHead className="font-semibold text-right">Days of Stock</TableHead>
                    <TableHead className="font-semibold text-right">Recommended Reduction</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overstockPredictions.map((prediction) => (
                    <TableRow key={`overstock-${prediction.productId}-${prediction.warehouseId}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{prediction.productName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {prediction.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{prediction.warehouseName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{prediction.currentStock.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-accent text-accent-foreground">
                          {prediction.daysUntilStockout} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="border-accent text-accent">
                          {Math.abs(prediction.recommendedOrder).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prediction.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reorderPredictions.length === 0 && overstockPredictions.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
            <p className="text-muted-foreground">
              Predictions will appear here once there's enough historical data to analyze consumption patterns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderPredictions;

