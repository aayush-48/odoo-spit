import { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, ReorderingRule } from '@/types';
import { toast } from 'sonner';
import { Settings, Package } from 'lucide-react';

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
    maxStock: 0,
  });

  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [reorderingRules, setReorderingRules] = useState<Record<string, ReorderingRule>>({});
  const [selectedWarehouseForRule, setSelectedWarehouseForRule] = useState<string>('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        unitOfMeasure: editingProduct.unitOfMeasure,
        minStock: editingProduct.minStock || 0,
        maxStock: editingProduct.maxStock || 0,
      });
      setStockLevels(editingProduct.stock);
      setReorderingRules(editingProduct.reorderingRules || {});
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        unitOfMeasure: '',
        minStock: 0,
        maxStock: 0,
      });
      const initialStock: Record<string, number> = {};
      warehouses.forEach(wh => {
        initialStock[wh.id] = 0;
      });
      setStockLevels(initialStock);
      setReorderingRules({});
    }
    if (warehouses.length > 0 && !selectedWarehouseForRule) {
      setSelectedWarehouseForRule(warehouses[0].id);
    }
  }, [editingProduct, warehouses, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      stock: stockLevels,
      reorderingRules: Object.keys(reorderingRules).length > 0 ? reorderingRules : undefined,
    };
    
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully');
    } else {
      addProduct(productData);
      toast.success('Product added successfully');
    }
    
    onClose();
  };

  const handleAddReorderingRule = () => {
    if (!selectedWarehouseForRule) {
      toast.error('Please select a warehouse');
      return;
    }
    
    const newRule: ReorderingRule = {
      reorderPoint: formData.minStock || 0,
      reorderQuantity: formData.minStock ? formData.minStock * 2 : 100,
      leadTimeDays: 7,
      autoReorder: false,
    };
    
    setReorderingRules({
      ...reorderingRules,
      [selectedWarehouseForRule]: newRule,
    });
    toast.success('Reordering rule added');
  };

  const handleUpdateReorderingRule = (warehouseId: string, rule: Partial<ReorderingRule>) => {
    setReorderingRules({
      ...reorderingRules,
      [warehouseId]: {
        ...reorderingRules[warehouseId],
        ...rule,
      },
    });
  };

  const handleRemoveReorderingRule = (warehouseId: string) => {
    const newRules = { ...reorderingRules };
    delete newRules[warehouseId];
    setReorderingRules(newRules);
    toast.success('Reordering rule removed');
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

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                min="0"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock Level</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                min="0"
                className="bg-background"
              />
            </div>
          </div>

          {/* Stock Levels by Warehouse */}
          <div className="space-y-2">
            <Label>Initial Stock by Warehouse</Label>
            <div className="grid grid-cols-2 gap-2">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="space-y-1">
                  <Label htmlFor={`stock-${warehouse.id}`} className="text-sm">
                    {warehouse.name}
                  </Label>
                  <Input
                    id={`stock-${warehouse.id}`}
                    type="number"
                    value={stockLevels[warehouse.id] || 0}
                    onChange={(e) => setStockLevels({
                      ...stockLevels,
                      [warehouse.id]: parseInt(e.target.value) || 0,
                    })}
                    min="0"
                    className="bg-background"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reordering Rules */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                <Label className="text-base font-semibold">Reordering Rules</Label>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedWarehouseForRule}
                  onValueChange={setSelectedWarehouseForRule}
                >
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {warehouses.filter(wh => !reorderingRules[wh.id]).map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddReorderingRule}
                  disabled={!selectedWarehouseForRule || !!reorderingRules[selectedWarehouseForRule]}
                  className="gap-1"
                >
                  <Package className="w-3 h-3" />
                  Add Rule
                </Button>
              </div>
            </div>

            {Object.keys(reorderingRules).length === 0 ? (
              <div className="p-4 bg-muted/50 rounded-lg border border-border text-center text-sm text-muted-foreground">
                No reordering rules configured. Add rules to enable automatic reorder suggestions.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(reorderingRules).map(([warehouseId, rule]) => {
                  const warehouse = warehouses.find(w => w.id === warehouseId);
                  return (
                    <Card key={warehouseId} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">
                            {warehouse?.name || 'Unknown Warehouse'}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReorderingRule(warehouseId)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Reorder Point</Label>
                            <Input
                              type="number"
                              value={rule.reorderPoint}
                              onChange={(e) => handleUpdateReorderingRule(warehouseId, {
                                reorderPoint: parseInt(e.target.value) || 0,
                              })}
                              min="0"
                              className="bg-background text-sm"
                            />
                            <p className="text-xs text-muted-foreground">Trigger level</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Reorder Quantity</Label>
                            <Input
                              type="number"
                              value={rule.reorderQuantity}
                              onChange={(e) => handleUpdateReorderingRule(warehouseId, {
                                reorderQuantity: parseInt(e.target.value) || 0,
                              })}
                              min="0"
                              className="bg-background text-sm"
                            />
                            <p className="text-xs text-muted-foreground">Order amount</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Lead Time (Days)</Label>
                            <Input
                              type="number"
                              value={rule.leadTimeDays}
                              onChange={(e) => handleUpdateReorderingRule(warehouseId, {
                                leadTimeDays: parseInt(e.target.value) || 0,
                              })}
                              min="0"
                              className="bg-background text-sm"
                            />
                            <p className="text-xs text-muted-foreground">Days until arrival</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Auto Reorder</Label>
                            <div className="flex items-center gap-2 pt-2">
                              <Switch
                                checked={rule.autoReorder}
                                onCheckedChange={(checked) => handleUpdateReorderingRule(warehouseId, {
                                  autoReorder: checked,
                                })}
                              />
                              <span className="text-xs text-muted-foreground">
                                {rule.autoReorder ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
