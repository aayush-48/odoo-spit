import { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Adjustment, AdjustmentLine } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdjustmentFormProps {
  open: boolean;
  onClose: () => void;
  editingAdjustment?: Adjustment | null;
}

const AdjustmentForm = ({ open, onClose, editingAdjustment }: AdjustmentFormProps) => {
  const { addAdjustment, updateAdjustment, products, warehouses } = useInventory();
  const [formData, setFormData] = useState({
    warehouseId: '',
    status: 'draft' as Adjustment['status'],
    notes: '',
  });

  const [lines, setLines] = useState<AdjustmentLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [countedQuantity, setCountedQuantity] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (editingAdjustment) {
      setFormData({
        warehouseId: editingAdjustment.warehouseId,
        status: editingAdjustment.status,
        notes: editingAdjustment.notes || '',
      });
      setLines(editingAdjustment.lines);
    } else {
      setFormData({
        warehouseId: '',
        status: 'draft',
        notes: '',
      });
      setLines([]);
    }
    setSelectedProductId('');
    setCountedQuantity(0);
    setReason('');
  }, [editingAdjustment, open]);

  const getSystemQuantity = (productId: string) => {
    if (!formData.warehouseId) return 0;
    const product = products.find(p => p.id === productId);
    return product ? (product.stock[formData.warehouseId] || 0) : 0;
  };

  const handleAddLine = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.warehouseId) {
      toast.error('Please select a warehouse first');
      return;
    }
    if (countedQuantity < 0) {
      toast.error('Counted quantity cannot be negative');
      return;
    }
    if (lines.find(l => l.productId === selectedProductId)) {
      toast.error('Product already added. Edit the existing line instead.');
      return;
    }

    const systemQty = getSystemQuantity(selectedProductId);
    const diff = countedQuantity - systemQty;

    setLines([...lines, {
      productId: selectedProductId,
      countedQuantity,
      systemQuantity: systemQty,
      difference: diff,
      reason: reason || 'Physical count adjustment',
    }]);
    setSelectedProductId('');
    setCountedQuantity(0);
    setReason('');
  };

  const handleRemoveLine = (productId: string) => {
    setLines(lines.filter(l => l.productId !== productId));
  };

  const handleUpdateLineCounted = (productId: string, newCounted: number) => {
    if (newCounted < 0) {
      toast.error('Counted quantity cannot be negative');
      return;
    }

    const systemQty = getSystemQuantity(productId);
    const diff = newCounted - systemQty;

    setLines(lines.map(l => 
      l.productId === productId 
        ? { ...l, countedQuantity: newCounted, difference: diff }
        : l
    ));
  };

  const handleUpdateLineReason = (productId: string, newReason: string) => {
    setLines(lines.map(l => 
      l.productId === productId ? { ...l, reason: newReason } : l
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }
    if (lines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Recalculate system quantities and differences
    const updatedLines = lines.map(line => {
      const systemQty = getSystemQuantity(line.productId);
      return {
        ...line,
        systemQuantity: systemQty,
        difference: line.countedQuantity - systemQty,
      };
    });

    if (editingAdjustment) {
      updateAdjustment(editingAdjustment.id, {
        ...formData,
        lines: updatedLines,
      });
      toast.success('Adjustment updated successfully');
    } else {
      addAdjustment({
        ...formData,
        lines: updatedLines,
      });
      toast.success('Adjustment created successfully');
    }
    
    onClose();
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

  const availableProducts = products.filter(p => !lines.find(l => l.productId === p.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {editingAdjustment ? 'Edit Stock Adjustment' : 'Create Stock Adjustment'}
          </DialogTitle>
          <DialogDescription>
            {editingAdjustment ? 'Update adjustment details' : 'Adjust stock levels based on physical count'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseId}
                onValueChange={(value) => {
                  setFormData({ ...formData, warehouseId: value });
                  // Recalculate system quantities when warehouse changes
                  if (lines.length > 0) {
                    setLines(lines.map(line => {
                      const product = products.find(p => p.id === line.productId);
                      const systemQty = product ? (product.stock[value] || 0) : 0;
                      return {
                        ...line,
                        systemQuantity: systemQty,
                        difference: line.countedQuantity - systemQty,
                      };
                    }));
                  }
                }}
                required
                disabled={editingAdjustment?.status === 'done'}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingAdjustment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Adjustment['status'] })}
                  disabled={editingAdjustment.status === 'done' || editingAdjustment.status === 'canceled'}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this adjustment..."
                className="bg-background min-h-[80px]"
                disabled={editingAdjustment?.status === 'done'}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Products to Adjust</h4>
            
            {editingAdjustment?.status !== 'done' && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={!formData.warehouseId}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={formData.warehouseId ? "Select product" : "Select warehouse first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {availableProducts.map((product) => {
                      const systemStock = formData.warehouseId ? (product.stock[formData.warehouseId] || 0) : 0;
                      return (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - System: {systemStock}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={countedQuantity || ''}
                  onChange={(e) => setCountedQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Counted Qty"
                  className="bg-background"
                />
                <Input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="bg-background"
                />
                <Button
                  type="button"
                  onClick={handleAddLine}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  disabled={!selectedProductId || !formData.warehouseId}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            )}

            {lines.length > 0 ? (
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
                      {editingAdjustment?.status !== 'done' && (
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const systemQty = getSystemQuantity(line.productId);
                      const currentDiff = line.countedQuantity - systemQty;
                      return (
                        <TableRow key={line.productId}>
                          <TableCell className="font-medium">
                            {getProductName(line.productId)}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {getProductSKU(line.productId)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {systemQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingAdjustment?.status === 'done' ? (
                              <span className="font-semibold">{line.countedQuantity.toLocaleString()}</span>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                value={line.countedQuantity}
                                onChange={(e) => handleUpdateLineCounted(line.productId, parseInt(e.target.value) || 0)}
                                className="w-24 bg-background text-right"
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${currentDiff > 0 ? 'text-success' : currentDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {currentDiff > 0 ? '+' : ''}{currentDiff.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {editingAdjustment?.status === 'done' ? (
                              <span className="text-sm text-muted-foreground">{line.reason}</span>
                            ) : (
                              <Input
                                type="text"
                                value={line.reason}
                                onChange={(e) => handleUpdateLineReason(line.productId, e.target.value)}
                                placeholder="Reason"
                                className="bg-background text-sm"
                              />
                            )}
                          </TableCell>
                          {editingAdjustment?.status !== 'done' && (
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveLine(line.productId)}
                                className="hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
                No products added yet. Add products using the form above.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={editingAdjustment?.status === 'done'}
            >
              {editingAdjustment ? 'Update Adjustment' : 'Create Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentForm;

