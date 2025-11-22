import { useInventory } from '@/context/InventoryContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Adjustment } from '@/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';

interface AdjustmentDetailsProps {
  adjustment: Adjustment | null;
  open: boolean;
  onClose: () => void;
}

const AdjustmentDetails = ({ adjustment, open, onClose }: AdjustmentDetailsProps) => {
  const { warehouses, products } = useInventory();

  if (!adjustment) return null;

  const getStatusBadge = (status: Adjustment['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
      waiting: { label: 'Waiting', className: 'bg-warning/10 text-warning border-warning/20' },
      ready: { label: 'Ready', className: 'bg-accent/10 text-accent border-accent/20' },
      done: { label: 'Done', className: 'bg-success/10 text-success border-success/20' },
      canceled: { label: 'Canceled', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getWarehouseName = (warehouseId: string) => {
    return warehouses.find(w => w.id === warehouseId)?.name || 'Unknown Warehouse';
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const getProductSKU = (productId: string) => {
    return products.find(p => p.id === productId)?.sku || '';
  };

  const getProductUnit = (productId: string) => {
    return products.find(p => p.id === productId)?.unitOfMeasure || '';
  };

  const totalDifference = adjustment.lines.reduce((sum, line) => sum + Math.abs(line.difference), 0);

  const handleDownloadPDF = () => {
    generatePDF({
      adjustment,
      warehouses,
      products,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center justify-between">
            <span>Adjustment Details</span>
            <div className="flex items-center gap-2">
              {getStatusBadge(adjustment.status)}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this stock adjustment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Adjustment ID</label>
              <p className="font-mono text-sm font-semibold mt-1">{adjustment.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(adjustment.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
              <p className="font-semibold mt-1">{getWarehouseName(adjustment.warehouseId)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-sm mt-1">{format(new Date(adjustment.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            {adjustment.notes && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{adjustment.notes}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">
              Products ({adjustment.lines.length} item{adjustment.lines.length !== 1 ? 's' : ''})
            </h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold text-right">System Qty</TableHead>
                    <TableHead className="font-semibold text-right">Counted Qty</TableHead>
                    <TableHead className="font-semibold text-right">Difference</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustment.lines.map((line) => (
                    <TableRow key={line.productId}>
                      <TableCell className="font-medium">
                        {getProductName(line.productId)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {getProductSKU(line.productId)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {line.systemQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {line.countedQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${line.difference > 0 ? 'text-success' : line.difference < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {line.difference > 0 ? '+' : ''}{line.difference.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {line.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Absolute Difference</p>
                <p className="text-xl font-bold">{totalDifference.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentDetails;

