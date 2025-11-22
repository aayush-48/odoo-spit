import { useInventory } from '@/context/InventoryContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProductListProps {
  onEdit: (id: string) => void;
}

const ProductList = ({ onEdit }: ProductListProps) => {
  const { products, deleteProduct, warehouses, filters } = useInventory();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !filters.searchQuery || 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, filters]);

  const getTotalStock = (stock: Record<string, number>) => {
    return Object.values(stock).reduce((a, b) => a + b, 0);
  };

  const isLowStock = (product: typeof products[0]) => {
    const total = getTotalStock(product.stock);
    return product.minStock && total <= product.minStock;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Product Name</TableHead>
            <TableHead className="font-semibold">SKU</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold text-right">Total Stock</TableHead>
            {warehouses.map(wh => (
              <TableHead key={wh.id} className="font-semibold text-right">
                {wh.code}
              </TableHead>
            ))}
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="text-muted-foreground">{product.unitOfMeasure}</TableCell>
              <TableCell className="text-right font-semibold">
                {getTotalStock(product.stock).toLocaleString()}
              </TableCell>
              {warehouses.map(wh => (
                <TableCell key={wh.id} className="text-right">
                  {product.stock[wh.id] || 0}
                </TableCell>
              ))}
              <TableCell className="text-center">
                {isLowStock(product) ? (
                  <Badge variant="destructive" className="gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Low Stock
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    In Stock
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(product.id)}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProduct(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
};

export default ProductList;
