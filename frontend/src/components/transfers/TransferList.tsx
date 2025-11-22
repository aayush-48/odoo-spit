import { useInventory } from '@/context/InventoryContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle2, XCircle, Eye, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Transfer } from '@/types';
import { format } from 'date-fns';

interface TransferListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onOptimize?: (id: string) => void;
}

const TransferList = ({ onEdit, onView, onConfirm, onCancel, onOptimize }: TransferListProps) => {
  const { transfers, warehouses, filters } = useInventory();

  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = !filters.searchQuery || 
        transfer.id.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || transfer.status === filters.status;
      const matchesWarehouse = filters.warehouseId === 'all' || 
        transfer.fromWarehouseId === filters.warehouseId || 
        transfer.toWarehouseId === filters.warehouseId;
      const matchesDocumentType = filters.documentType === 'all' || filters.documentType === 'internal';
      
      return matchesSearch && matchesStatus && matchesWarehouse && matchesDocumentType;
    });
  }, [transfers, filters]);

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

  const getTotalQuantity = (lines: Transfer['lines']) => {
    return lines.reduce((sum, line) => sum + line.quantity, 0);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Transfer ID</TableHead>
            <TableHead className="font-semibold">From</TableHead>
            <TableHead className="font-semibold">To</TableHead>
            <TableHead className="font-semibold">Products</TableHead>
            <TableHead className="font-semibold text-right">Total Qty</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransfers.map((transfer) => (
            <TableRow key={transfer.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium font-mono text-sm">
                {transfer.id}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {getWarehouseName(transfer.fromWarehouseId)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="font-mono text-xs">
                    {getWarehouseName(transfer.toWarehouseId)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {transfer.lines.length} item{transfer.lines.length !== 1 ? 's' : ''}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {getTotalQuantity(transfer.lines).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(transfer.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(transfer.status)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(transfer.id)}
                    className="hover:bg-accent hover:text-accent-foreground"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {onOptimize && transfer.status !== 'done' && transfer.status !== 'canceled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOptimize(transfer.id)}
                      className="hover:bg-purple-500 hover:text-white"
                      title="Optimize Route"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  )}
                  {transfer.status !== 'done' && transfer.status !== 'canceled' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(transfer.id)}
                        className="hover:bg-accent hover:text-accent-foreground"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {transfer.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onConfirm(transfer.id)}
                          className="hover:bg-success hover:text-success-foreground"
                          title="Confirm Transfer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {transfer.status !== 'done' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancel(transfer.id)}
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
      {filteredTransfers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No transfers found
        </div>
      )}
    </div>
  );
};

export default TransferList;

