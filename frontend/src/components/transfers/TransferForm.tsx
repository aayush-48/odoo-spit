import { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Transfer, TransferLine } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  editingTransfer?: Transfer | null;
}

const TransferForm = ({ open, onClose, editingTransfer }: TransferFormProps) => {
  const { addTransfer, updateTransfer, products, warehouses } = useInventory();
  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    status: 'draft' as Transfer['status'],
    notes: '',
  });

  const [lines, setLines] = useState<TransferLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (editingTransfer) {
      setFormData({
        fromWarehouseId: editingTransfer.fromWarehouseId,
        toWarehouseId: editingTransfer.toWarehouseId,
        status: editingTransfer.status,
        notes: editingTransfer.notes || '',
      });
      setLines(editingTransfer.lines);
    } else {
      setFormData({
        fromWarehouseId: '',
        toWarehouseId: '',
        status: 'draft',
        notes: '',
      });
      setLines([]);
    }
    setSelectedProductId('');
    setQuantity(1);
  }, [editingTransfer, open]);

  const handleAddLine = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!formData.fromWarehouseId) {
      toast.error('Please select source warehouse first');
      return;
    }
    if (lines.find(l => l.productId === selectedProductId)) {
      toast.error('Product already added. Edit the existing line instead.');
      return;
    }

    // Check stock availability
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      const availableStock = product.stock[formData.fromWarehouseId] || 0;
      if (quantity > availableStock) {
        toast.warning(`Only ${availableStock} units available in source warehouse`);
      }
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

    // Check stock availability
    const product = products.find(p => p.id === productId);
    if (product && formData.fromWarehouseId) {
      const availableStock = product.stock[formData.fromWarehouseId] || 0;
      if (newQuantity > availableStock) {
        toast.warning(`Only ${availableStock} units available in source warehouse`);
        return;
      }
    }

    setLines(lines.map(l => 
      l.productId === productId ? { ...l, quantity: newQuantity } : l
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromWarehouseId) {
      toast.error('Please select source warehouse');
      return;
    }
    if (!formData.toWarehouseId) {
      toast.error('Please select destination warehouse');
      return;
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      toast.error('Source and destination warehouses must be different');
      return;
    }
    if (lines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Validate stock availability
    for (const line of lines) {
      const product = products.find(p => p.id === line.productId);
      if (product) {
        const availableStock = product.stock[formData.fromWarehouseId] || 0;
        if (line.quantity > availableStock) {
          toast.error(`Insufficient stock for ${product.name}. Available: ${availableStock}`);
          return;
        }
      }
    }

    if (editingTransfer) {
      updateTransfer(editingTransfer.id, {
        ...formData,
        lines,
      });
      toast.success('Transfer updated successfully');
    } else {
      addTransfer({
        ...formData,
        lines,
      });
      toast.success('Transfer created successfully');
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

  const getAvailableStock = (productId: string) => {
    if (!formData.fromWarehouseId) return null;
    const product = products.find(p => p.id === productId);
    return product ? (product.stock[formData.fromWarehouseId] || 0) : null;
  };

  const availableProducts = products.filter(p => !lines.find(l => l.productId === p.id));
  const availableWarehouses = warehouses.filter(w => w.id !== formData.fromWarehouseId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {editingTransfer ? 'Edit Transfer' : 'Create New Transfer'}
          </DialogTitle>
          <DialogDescription>
            {editingTransfer ? 'Update transfer details' : 'Transfer stock between warehouses'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromWarehouse">From Warehouse *</Label>
              <Select
                value={formData.fromWarehouseId}
                onValueChange={(value) => {
                  setFormData({ ...formData, fromWarehouseId: value });
                  // Clear lines if warehouse changes
                  if (editingTransfer?.fromWarehouseId !== value) {
                    setLines([]);
                  }
                }}
                required
                disabled={editingTransfer?.status === 'done'}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select source warehouse" />
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

            <div className="space-y-2">
              <Label htmlFor="toWarehouse">To Warehouse *</Label>
              <Select
                value={formData.toWarehouseId}
                onValueChange={(value) => setFormData({ ...formData, toWarehouseId: value })}
                required
                disabled={editingTransfer?.status === 'done'}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingTransfer && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Transfer['status'] })}
                  disabled={editingTransfer.status === 'done' || editingTransfer.status === 'canceled'}
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
                placeholder="Additional notes about this transfer..."
                className="bg-background min-h-[80px]"
                disabled={editingTransfer?.status === 'done'}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Products to Transfer</h4>
            
            {editingTransfer?.status !== 'done' && (
              <div className="flex gap-2 mb-4">
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={!formData.fromWarehouseId}
                >
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder={formData.fromWarehouseId ? "Select product" : "Select source warehouse first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {availableProducts.map((product) => {
                      const availableStock = formData.fromWarehouseId ? (product.stock[formData.fromWarehouseId] || 0) : null;
                      return (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) {availableStock !== null && `- Stock: ${availableStock}`}
                        </SelectItem>
                      );
                    })}
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
                  disabled={!selectedProductId || !formData.fromWarehouseId}
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
                      {formData.fromWarehouseId && (
                        <TableHead className="font-semibold text-right">Available</TableHead>
                      )}
                      {editingTransfer?.status !== 'done' && (
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const availableStock = getAvailableStock(line.productId);
                      return (
                        <TableRow key={line.productId}>
                          <TableCell className="font-medium">
                            {getProductName(line.productId)}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {getProductSKU(line.productId)}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingTransfer?.status === 'done' ? (
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
                          {formData.fromWarehouseId && (
                            <TableCell className="text-right">
                              <span className={availableStock !== null && line.quantity > availableStock ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                                {availableStock !== null ? availableStock.toLocaleString() : 'N/A'}
                              </span>
                            </TableCell>
                          )}
                          {editingTransfer?.status !== 'done' && (
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
              disabled={editingTransfer?.status === 'done'}
            >
              {editingTransfer ? 'Update Transfer' : 'Create Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferForm;

