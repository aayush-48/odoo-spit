import { useInventory } from '@/context/InventoryContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Transfer } from '@/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRightLeft } from 'lucide-react';

interface TransferDetailsProps {
  transfer: Transfer | null;
  open: boolean;
  onClose: () => void;
}

const TransferDetails = ({ transfer, open, onClose }: TransferDetailsProps) => {
  const { warehouses, products } = useInventory();

  if (!transfer) return null;

  const getStatusBadge = (status: Transfer['status']) => {
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

  const totalQuantity = transfer.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center justify-between">
            <span>Transfer Details</span>
            {getStatusBadge(transfer.status)}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Transfer ID</label>
              <p className="font-mono text-sm font-semibold mt-1">{transfer.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(transfer.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">From Warehouse</label>
              <p className="font-semibold mt-1">{getWarehouseName(transfer.fromWarehouseId)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">To Warehouse</label>
              <div className="flex items-center gap-2 mt-1">
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold">{getWarehouseName(transfer.toWarehouseId)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-sm mt-1">{format(new Date(transfer.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm mt-1">{format(new Date(transfer.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            {transfer.notes && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{transfer.notes}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">
              Products ({transfer.lines.length} item{transfer.lines.length !== 1 ? 's' : ''})
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
                  {transfer.lines.map((line) => (
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

export default TransferDetails;

