import { useInventory } from '@/context/InventoryContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Delivery } from '@/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';

interface DeliveryDetailsProps {
  delivery: Delivery | null;
  open: boolean;
  onClose: () => void;
}

const DeliveryDetails = ({ delivery, open, onClose }: DeliveryDetailsProps) => {
  const { warehouses, products } = useInventory();

  if (!delivery) return null;

  const getStatusBadge = (status: Delivery['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
      waiting: { label: 'Picked', className: 'bg-warning/10 text-warning border-warning/20' },
      ready: { label: 'Packed', className: 'bg-accent/10 text-accent border-accent/20' },
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

  const totalQuantity = delivery.lines.reduce((sum, line) => sum + line.quantity, 0);

  const handleDownloadPDF = () => {
    generatePDF({
      delivery,
      warehouses,
      products,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center justify-between">
            <span>Delivery Details</span>
            <div className="flex items-center gap-2">
              {getStatusBadge(delivery.status)}
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
            View detailed information about this delivery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery ID</label>
              <p className="font-mono text-sm font-semibold mt-1">{delivery.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(delivery.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer</label>
              <p className="font-semibold mt-1">{delivery.customerName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
              <p className="font-semibold mt-1">{getWarehouseName(delivery.warehouseId)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-sm mt-1">{format(new Date(delivery.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm mt-1">{format(new Date(delivery.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            {delivery.notes && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{delivery.notes}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">
              Products ({delivery.lines.length} item{delivery.lines.length !== 1 ? 's' : ''})
            </h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold text-right">Quantity</TableHead>
                    <TableHead className="font-semibold">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delivery.lines.map((line) => (
                    <TableRow key={line.productId}>
                      <TableCell className="font-medium">
                        {getProductName(line.productId)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {getProductSKU(line.productId)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {line.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getProductUnit(line.productId)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="text-xl font-bold">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryDetails;

