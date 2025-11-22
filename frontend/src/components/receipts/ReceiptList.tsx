import { useInventory } from '@/context/InventoryContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useMemo } from 'react';
import { Receipt } from '@/types';
import { format } from 'date-fns';

interface ReceiptListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

const ReceiptList = ({ onEdit, onView, onConfirm, onCancel }: ReceiptListProps) => {
  const { receipts, warehouses, suppliers, filters } = useInventory();

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const supplierName = suppliers.find(s => s.id === receipt.supplierId)?.name || '';
      const matchesSearch = !filters.searchQuery || 
        receipt.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || receipt.status === filters.status;
      const matchesWarehouse = filters.warehouseId === 'all' || receipt.warehouseId === filters.warehouseId;
      const matchesDocumentType = filters.documentType === 'all' || filters.documentType === 'receipt';
      
      return matchesSearch && matchesStatus && matchesWarehouse && matchesDocumentType;
    });
  }, [receipts, suppliers, filters]);

  const getStatusBadge = (status: Receipt['status']) => {
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

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  const getWarehouseName = (warehouseId: string) => {
    return warehouses.find(w => w.id === warehouseId)?.name || 'Unknown Warehouse';
  };

  const getTotalQuantity = (lines: Receipt['lines']) => {
    return lines.reduce((sum, line) => sum + line.quantity, 0);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Receipt ID</TableHead>
            <TableHead className="font-semibold">Supplier</TableHead>
            <TableHead className="font-semibold">Warehouse</TableHead>
            <TableHead className="font-semibold">Products</TableHead>
            <TableHead className="font-semibold text-right">Total Qty</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReceipts.map((receipt) => (
            <TableRow key={receipt.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium font-mono text-sm">
                {receipt.id}
              </TableCell>
              <TableCell>{getSupplierName(receipt.supplierId)}</TableCell>
              <TableCell>{getWarehouseName(receipt.warehouseId)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {receipt.lines.length} item{receipt.lines.length !== 1 ? 's' : ''}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {getTotalQuantity(receipt.lines).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(receipt.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(receipt.status)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(receipt.id)}
                    className="hover:bg-accent hover:text-accent-foreground"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {receipt.status !== 'done' && receipt.status !== 'canceled' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(receipt.id)}
                        className="hover:bg-accent hover:text-accent-foreground"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {receipt.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onConfirm(receipt.id)}
                          className="hover:bg-success hover:text-success-foreground"
                          title="Confirm Receipt"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {receipt.status !== 'done' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancel(receipt.id)}
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
      {filteredReceipts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No receipts found
        </div>
      )}
    </div>
  );
};

export default ReceiptList;

