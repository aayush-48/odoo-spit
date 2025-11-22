import { useInventory } from '@/context/InventoryContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle2, XCircle, Eye, Package, PackageCheck, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Delivery } from '@/types';
import { format } from 'date-fns';

interface DeliveryListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onPick: (id: string) => void;
  onPack: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onOptimize?: (id: string) => void;
}

const DeliveryList = ({ onEdit, onView, onPick, onPack, onConfirm, onCancel, onOptimize }: DeliveryListProps) => {
  const { deliveries, warehouses, filters } = useInventory();

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = !filters.searchQuery || 
        delivery.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        delivery.customerName?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || delivery.status === filters.status;
      const matchesWarehouse = filters.warehouseId === 'all' || delivery.warehouseId === filters.warehouseId;
      const matchesDocumentType = filters.documentType === 'all' || filters.documentType === 'delivery';
      
      return matchesSearch && matchesStatus && matchesWarehouse && matchesDocumentType;
    });
  }, [deliveries, filters]);

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

  const getTotalQuantity = (lines: Delivery['lines']) => {
    return lines.reduce((sum, line) => sum + line.quantity, 0);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Delivery ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Warehouse</TableHead>
            <TableHead className="font-semibold">Products</TableHead>
            <TableHead className="font-semibold text-right">Total Qty</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeliveries.map((delivery) => (
            <TableRow key={delivery.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium font-mono text-sm">
                {delivery.id}
              </TableCell>
              <TableCell>{delivery.customerName || 'N/A'}</TableCell>
              <TableCell>{getWarehouseName(delivery.warehouseId)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {delivery.lines.length} item{delivery.lines.length !== 1 ? 's' : ''}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {getTotalQuantity(delivery.lines).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(delivery.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(delivery.status)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(delivery.id)}
                    className="hover:bg-accent hover:text-accent-foreground"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {onOptimize && delivery.status !== 'done' && delivery.status !== 'canceled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOptimize(delivery.id)}
                      className="hover:bg-purple-500 hover:text-white"
                      title="Optimize Route"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  )}
                  {delivery.status !== 'done' && delivery.status !== 'canceled' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(delivery.id)}
                        className="hover:bg-accent hover:text-accent-foreground"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {delivery.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPick(delivery.id)}
                          className="hover:bg-warning hover:text-warning-foreground"
                          title="Pick Items"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                      )}
                      {delivery.status === 'waiting' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPack(delivery.id)}
                          className="hover:bg-accent hover:text-accent-foreground"
                          title="Pack Items"
                        >
                          <PackageCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {delivery.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onConfirm(delivery.id)}
                          className="hover:bg-success hover:text-success-foreground"
                          title="Validate Delivery"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {delivery.status !== 'done' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancel(delivery.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No deliveries found
        </div>
      )}
    </div>
  );
};

export default DeliveryList;

