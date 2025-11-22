import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/InventoryContext';
import { Building2, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Settings = () => {
  const { warehouses, locations, addWarehouse, updateWarehouse, deleteWarehouse, addLocation, updateLocation, deleteLocation } = useInventory();
  const [selectedTab, setSelectedTab] = useState('stock');
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null);
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    address: '',
  });
  
  const [locationForm, setLocationForm] = useState({
    name: '',
    code: '',
    warehouseId: '',
    description: '',
  });

  const handleWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        updateWarehouse(editingWarehouse, warehouseForm);
        toast.success('Warehouse updated successfully');
      } else {
        addWarehouse(warehouseForm);
        toast.success('Warehouse created successfully');
      }
      setWarehouseDialogOpen(false);
      setEditingWarehouse(null);
      setWarehouseForm({ name: '', code: '', address: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save warehouse');
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        updateLocation(editingLocation, locationForm);
        toast.success('Location updated successfully');
      } else {
        addLocation(locationForm);
        toast.success('Location created successfully');
      }
      setLocationDialogOpen(false);
      setEditingLocation(null);
      setLocationForm({ name: '', code: '', warehouseId: '', description: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save location');
    }
  };

  const handleEditWarehouse = (warehouse: typeof warehouses[0]) => {
    setEditingWarehouse(warehouse.id);
    setWarehouseForm({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
    });
    setWarehouseDialogOpen(true);
  };

  const handleEditLocation = (location: typeof locations[0]) => {
    setEditingLocation(location.id);
    setLocationForm({
      name: location.name,
      code: location.code,
      warehouseId: location.warehouseId,
      description: location.description || '',
    });
    setLocationDialogOpen(true);
  };

  const handleDeleteWarehouse = () => {
    if (deleteWarehouseId) {
      try {
        deleteWarehouse(deleteWarehouseId);
        toast.success('Warehouse deleted successfully');
        setDeleteWarehouseId(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete warehouse');
        setDeleteWarehouseId(null);
      }
    }
  };

  const handleDeleteLocation = () => {
    if (deleteLocationId) {
      try {
        deleteLocation(deleteLocationId);
        toast.success('Location deleted successfully');
        setDeleteLocationId(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete location');
        setDeleteLocationId(null);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage stock, warehouses, and locations
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="stock" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Stock
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Warehouse
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  Stock Management
                </CardTitle>
                <CardDescription>
                  View and update stock levels across all warehouses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">Per Unit Cost</TableHead>
                        <TableHead className="font-semibold text-right">On Hand</TableHead>
                        <TableHead className="font-semibold text-right">Free to Use</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Industrial Bolt M12x50</TableCell>
                        <TableCell>$2.50</TableCell>
                        <TableCell className="text-right font-semibold">1,000</TableCell>
                        <TableCell className="text-right">850</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Hydraulic Pump HP-2000</TableCell>
                        <TableCell>$450.00</TableCell>
                        <TableCell className="text-right font-semibold">35</TableCell>
                        <TableCell className="text-right">28</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Steel Plate 10mm</TableCell>
                        <TableCell>$85.00</TableCell>
                        <TableCell className="text-right font-semibold">190</TableCell>
                        <TableCell className="text-right">165</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Safety Helmet Industrial</TableCell>
                        <TableCell>$25.00</TableCell>
                        <TableCell className="text-right font-semibold">330</TableCell>
                        <TableCell className="text-right">280</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Electric Motor 3HP</TableCell>
                        <TableCell>$320.00</TableCell>
                        <TableCell className="text-right font-semibold">50</TableCell>
                        <TableCell className="text-right">42</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rubber Gasket Set</TableCell>
                        <TableCell>$15.00</TableCell>
                        <TableCell className="text-right font-semibold">540</TableCell>
                        <TableCell className="text-right">480</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Industrial Lubricant 5L</TableCell>
                        <TableCell>$45.00</TableCell>
                        <TableCell className="text-right font-semibold">235</TableCell>
                        <TableCell className="text-right">200</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cable Reel 100m</TableCell>
                        <TableCell>$120.00</TableCell>
                        <TableCell className="text-right font-semibold">105</TableCell>
                        <TableCell className="text-right">90</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Users can update stock quantities from this view
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse" className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-accent" />
                      Warehouse Management
                    </CardTitle>
                    <CardDescription>
                      Manage warehouse details and locations
                    </CardDescription>
                  </div>
                  <Dialog open={warehouseDialogOpen} onOpenChange={(open) => {
                    setWarehouseDialogOpen(open);
                    if (!open) {
                      setEditingWarehouse(null);
                      setWarehouseForm({ name: '', code: '', address: '' });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                        <Plus className="w-4 h-4" />
                        Add Warehouse
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
                        <DialogDescription>
                          {editingWarehouse ? 'Update warehouse details' : 'Create a new warehouse location'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleWarehouseSubmit}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="wh-name">Name *</Label>
                            <Input
                              id="wh-name"
                              placeholder="West Distribution Center"
                              className="bg-background"
                              value={warehouseForm.name}
                              onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wh-code">Short Code *</Label>
                            <Input
                              id="wh-code"
                              placeholder="WDC"
                              className="bg-background font-mono"
                              value={warehouseForm.code}
                              onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value.toUpperCase() })}
                              required
                              maxLength={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wh-address">Address *</Label>
                            <Input
                              id="wh-address"
                              placeholder="123 Warehouse St"
                              className="bg-background"
                              value={warehouseForm.address}
                              onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setWarehouseDialogOpen(false);
                              setEditingWarehouse(null);
                              setWarehouseForm({ name: '', code: '', address: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {editingWarehouse ? 'Update' : 'Create'} Warehouse
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {warehouses.map((warehouse) => (
                    <Card key={warehouse.id} className="border-2 hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-accent" />
                              </div>
                              <div>
                                <h3 className="text-lg font-display font-semibold text-foreground">
                                  {warehouse.name}
                                </h3>
                                <Badge variant="secondary" className="mt-1">
                                  {warehouse.code}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {warehouse.address}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-accent hover:text-accent-foreground"
                              onClick={() => handleEditWarehouse(warehouse)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => setDeleteWarehouseId(warehouse.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      Location Management
                    </CardTitle>
                    <CardDescription>
                      Manage storage locations within warehouses
                    </CardDescription>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    <Plus className="w-4 h-4" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Aisle A-01</h4>
                          <p className="text-sm text-muted-foreground">Main Warehouse - Section A</p>
                          <Badge variant="secondary" className="mt-2">WH-001</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Aisle B-02</h4>
                          <p className="text-sm text-muted-foreground">Main Warehouse - Section B</p>
                          <Badge variant="secondary" className="mt-2">WH-001</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    This holds multiple locations of warehouses, rooms, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialogs */}
        <AlertDialog open={!!deleteWarehouseId} onOpenChange={(open) => !open && setDeleteWarehouseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this warehouse? This action cannot be undone.
                {deleteWarehouseId && warehouses.find(w => w.id === deleteWarehouseId) && (
                  <span className="block mt-2 font-semibold">
                    Warehouse: {warehouses.find(w => w.id === deleteWarehouseId)?.name}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWarehouse} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteLocationId} onOpenChange={(open) => !open && setDeleteLocationId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Location</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this location? This action cannot be undone.
                {deleteLocationId && locations.find(l => l.id === deleteLocationId) && (
                  <span className="block mt-2 font-semibold">
                    Location: {locations.find(l => l.id === deleteLocationId)?.name}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteLocation} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Settings;
