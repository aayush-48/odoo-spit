import { TruckLoad, OptimizedRoute } from '@/lib/supplyChainOptimizer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Weight, Box, Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TruckLoadViewProps {
  truckLoads: TruckLoad[][];
  route: OptimizedRoute;
}

const TruckLoadView = ({ truckLoads, route }: TruckLoadViewProps) => {
  const getWeightPercentage = (loads: TruckLoad[]) => {
    const totalWeight = loads.reduce((sum, l) => sum + l.weight, 0);
    return Math.round((totalWeight / route.truckCapacity.maxWeight) * 100);
  };

  const getVolumePercentage = (loads: TruckLoad[]) => {
    const totalVolume = loads.reduce((sum, l) => sum + l.volume, 0);
    return Math.round((totalVolume / route.truckCapacity.maxVolume) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Truck className="w-5 h-5 text-accent" />
          Truck Loading Plan
        </h3>
        <Badge variant="outline" className="text-sm">
          {truckLoads.length} Truck{truckLoads.length !== 1 ? 's' : ''} Required
        </Badge>
      </div>

      <div className="grid gap-4">
        {truckLoads.map((loads, truckIndex) => {
          const totalWeight = loads.reduce((sum, l) => sum + l.weight, 0);
          const totalVolume = loads.reduce((sum, l) => sum + l.volume, 0);
          const weightPercentage = getWeightPercentage(loads);
          const volumePercentage = getVolumePercentage(loads);

          return (
            <Card key={truckIndex} className="p-4 bg-card border border-border">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Truck #{truckIndex + 1}
                  </h4>
                  <Badge variant={weightPercentage > 90 || volumePercentage > 90 ? 'destructive' : 'default'}>
                    {loads.length} Item{loads.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Weight className="w-3 h-3" />
                        Weight
                      </span>
                      <span className="text-sm font-semibold">
                        {totalWeight.toLocaleString()} kg / {route.truckCapacity.maxWeight.toLocaleString()} kg
                      </span>
                    </div>
                    <Progress value={weightPercentage} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {weightPercentage}% capacity
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        Volume
                      </span>
                      <span className="text-sm font-semibold">
                        {totalVolume.toFixed(2)} m³ / {route.truckCapacity.maxVolume} m³
                      </span>
                    </div>
                    <Progress value={volumePercentage} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {volumePercentage}% capacity
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold text-right">Quantity</TableHead>
                      <TableHead className="font-semibold text-right">Weight (kg)</TableHead>
                      <TableHead className="font-semibold text-right">Volume (m³)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loads.map((load) => (
                      <TableRow key={load.productId}>
                        <TableCell className="font-medium">{load.productName}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {load.sku}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {load.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {load.weight.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {load.volume.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TruckLoadView;

