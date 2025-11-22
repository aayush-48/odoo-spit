import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/InventoryContext';
import { Building2, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const { warehouses } = useInventory();
  const [selectedTab, setSelectedTab] = useState('stock');
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);

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
                        <TableCell className="text-right font-semibold">1000</TableCell>
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
                  <Dialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                        <Plus className="w-4 h-4" />
                        Add Warehouse
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>Add New Warehouse</DialogTitle>
                        <DialogDescription>
                          Create a new warehouse location
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="wh-name">Name</Label>
                          <Input id="wh-name" placeholder="West Distribution Center" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wh-code">Short Code</Label>
                          <Input id="wh-code" placeholder="WDC" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wh-address">Address</Label>
                          <Input id="wh-address" placeholder="123 Warehouse St" className="bg-background" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setWarehouseDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          Create Warehouse
                        </Button>
                      </DialogFooter>
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
      </div>
    </MainLayout>
  );
};

export default Settings;
