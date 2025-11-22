import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/context/InventoryContext';
import { Search } from 'lucide-react';

const FilterBar = () => {
  const { filters, setFilters, warehouses } = useInventory();

  return (
    <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border border-border">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products, SKU..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="pl-10 bg-background"
        />
      </div>

      <Select
        value={filters.documentType}
        onValueChange={(value) => setFilters({ ...filters, documentType: value as any })}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="all">All Documents</SelectItem>
          <SelectItem value="receipt">Receipts</SelectItem>
          <SelectItem value="delivery">Deliveries</SelectItem>
          <SelectItem value="internal">Internal Transfers</SelectItem>
          <SelectItem value="adjustment">Adjustments</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => setFilters({ ...filters, status: value as any })}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="waiting">Waiting</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.warehouseId}
        onValueChange={(value) => setFilters({ ...filters, warehouseId: value })}
      >
        <SelectTrigger className="w-[200px] bg-background">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="all">All Warehouses</SelectItem>
          {warehouses.map((wh) => (
            <SelectItem key={wh.id} value={wh.id}>
              {wh.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) => setFilters({ ...filters, category: value })}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="all">All Categories</SelectItem>
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
  );
};

export default FilterBar;
