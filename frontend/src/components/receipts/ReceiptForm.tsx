import { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, ReceiptLine } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReceiptFormProps {
  open: boolean;
  onClose: () => void;
  editingReceipt?: Receipt | null;
}

const ReceiptForm = ({ open, onClose, editingReceipt }: ReceiptFormProps) => {
  const { addReceipt, updateReceipt, products, warehouses, suppliers } = useInventory();
  const [formData, setFormData] = useState({
    supplierId: '',
    warehouseId: '',
    status: 'draft' as Receipt['status'],
    notes: '',
  });

  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (editingReceipt) {
      setFormData({
        supplierId: editingReceipt.supplierId,
        warehouseId: editingReceipt.warehouseId,
        status: editingReceipt.status,
        notes: editingReceipt.notes || '',
      });
      setLines(editingReceipt.lines);
    } else {
      setFormData({
        supplierId: '',
        warehouseId: '',
        status: 'draft',
        notes: '',
      });
      setLines([]);
    }
    setSelectedProductId('');
    setQuantity(1);
  }, [editingReceipt, open]);

  const handleAddLine = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (lines.find(l => l.productId === selectedProductId)) {
      toast.error('Product already added. Edit the existing line instead.');
      return;
    }

    setLines([...lines, { productId: selectedProductId, quantity }]);
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveLine = (productId: string) => {
    setLines(lines.filter(l => l.productId !== productId));
  };

  const handleUpdateLineQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveLine(productId);
      return;
    }
    setLines(lines.map(l => 
      l.productId === productId ? { ...l, quantity: newQuantity } : l
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    if (!formData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }
    if (lines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    if (editingReceipt) {
      updateReceipt(editingReceipt.id, {
        ...formData,
        lines,
      });
      toast.success('Receipt updated successfully');
    } else {
      addReceipt({
        ...formData,
        lines,
      });
      toast.success('Receipt created successfully');
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
      <DialogContent className="bg-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}
          </DialogTitle>
          <DialogDescription>
            {editingReceipt ? 'Update receipt details' : 'Create a new receipt for incoming stock from supplier'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                required
                disabled={editingReceipt?.status === 'done'}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseId}
                onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                required
                disabled={editingReceipt?.status === 'done'}
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

            {editingReceipt && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Receipt['status'] })}
                  disabled={editingReceipt.status === 'done' || editingReceipt.status === 'canceled'}
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
                placeholder="Additional notes about this receipt..."
                className="bg-background min-h-[80px]"
                disabled={editingReceipt?.status === 'done'}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Products</h4>
            
            {editingReceipt?.status !== 'done' && (
              <div className="flex gap-2 mb-4">
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                  className="w-24 bg-background"
                />
                <Button
                  type="button"
                  onClick={handleAddLine}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  disabled={!selectedProductId}
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
                      <TableHead className="font-semibold text-right">Quantity</TableHead>
                      <TableHead className="font-semibold">Unit</TableHead>
                      {editingReceipt?.status !== 'done' && (
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.productId}>
                        <TableCell className="font-medium">
                          {getProductName(line.productId)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {getProductSKU(line.productId)}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingReceipt?.status === 'done' ? (
                            <span className="font-semibold">{line.quantity.toLocaleString()}</span>
                          ) : (
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => handleUpdateLineQuantity(line.productId, parseInt(e.target.value) || 0)}
                              className="w-24 bg-background text-right"
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getProductUnit(line.productId)}
                        </TableCell>
                        {editingReceipt?.status !== 'done' && (
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
                    ))}
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
              disabled={editingReceipt?.status === 'done'}
            >
              {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptForm;

