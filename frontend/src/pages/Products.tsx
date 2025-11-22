import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductList from '@/components/products/ProductList';
import ProductForm from '@/components/products/ProductForm';
import FilterBar from '@/components/dashboard/FilterBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

const Products = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { products } = useInventory();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const editingProduct = editingId ? products.find(p => p.id === editingId) : null;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Products
            </h1>
            <p className="text-muted-foreground">
              Manage your inventory products and stock levels
            </p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        <FilterBar />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Product Inventory
            </h2>
            <span className="text-sm text-muted-foreground">
              {products.length} products
            </span>
          </div>
          <ProductList onEdit={handleEdit} />
        </div>

        <ProductForm
          open={formOpen}
          onClose={handleClose}
          editingProduct={editingProduct}
        />
      </div>
    </MainLayout>
  );
};

export default Products;
