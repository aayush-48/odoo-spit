import { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/types';
import { toast } from 'sonner';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

const ProductForm = ({ open, onClose, editingProduct }: ProductFormProps) => {
  const { addProduct, updateProduct, warehouses } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: '',
    minStock: 0,
  });

  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        unitOfMeasure: editingProduct.unitOfMeasure,
        minStock: editingProduct.minStock || 0,
      });
      setStockLevels(editingProduct.stock);
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        unitOfMeasure: '',
        minStock: 0,
      });
      const initialStock: Record<string, number> = {};
      warehouses.forEach(wh => {
        initialStock[wh.id] = 0;
      });
      setStockLevels(initialStock);
    }
  }, [editingProduct, warehouses, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        stock: stockLevels,
      });
      toast.success('Product updated successfully');
    } else {
      addProduct({
        ...formData,
        stock: stockLevels,
      });
      toast.success('Product added successfully');
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? 'Update product details' : 'Create a new product in your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU/Code *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Machinery">Machinery</SelectItem>
                  <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                  <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measure *</Label>
              <Input
                id="unit"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                placeholder="e.g., pieces, kg, liters"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="bg-background"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-4">Initial Stock Levels by Warehouse</h4>
            <div className="grid grid-cols-2 gap-4">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="space-y-2">
                  <Label htmlFor={`stock-${warehouse.id}`}>
                    {warehouse.name} ({warehouse.code})
                  </Label>
                  <Input
                    id={`stock-${warehouse.id}`}
                    type="number"
                    value={stockLevels[warehouse.id] || 0}
                    onChange={(e) => setStockLevels({
                      ...stockLevels,
                      [warehouse.id]: parseInt(e.target.value) || 0
                    })}
                    className="bg-background"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
