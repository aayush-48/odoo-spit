import MainLayout from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, Download, List, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'list' | 'kanban';

const MoveHistory = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const movements = [
    {
      reference: 'DEL-001',
      date: '02/20/2024',
      content: 'ABC Manufacturing Corp.',
      from: 'Vendor',
      to: 'WH-001',
      quantity: 85,
      status: 'Done',
      type: 'In',
    },
    {
      reference: 'DEL-002',
      date: '02/19/2024',
      content: 'XYZ Industrial Solutions',
      from: 'WH-002',
      to: 'Customer',
      quantity: 5,
      status: 'Ready',
      type: 'Out',
    },
    {
      reference: 'TRF-001',
      date: '02/19/2024',
      content: 'Stock Rebalancing',
      from: 'WH-001',
      to: 'WH-002',
      quantity: 150,
      status: 'Done',
      type: 'Internal',
    },
    {
      reference: 'DEL-003',
      date: '02/18/2024',
      content: 'Premium Parts Distributors',
      from: 'Vendor',
      to: 'WH-002',
      quantity: 150,
      status: 'Done',
      type: 'In',
    },
    {
      reference: 'TRF-002',
      date: '02/17/2024',
      content: 'Transfer to South Hub',
      from: 'WH-002',
      to: 'WH-003',
      quantity: 10,
      status: 'Ready',
      type: 'Internal',
    },
    {
      reference: 'ADJ-001',
      date: '02/16/2024',
      content: 'Stock Adjustment',
      from: 'WH-001',
      to: 'WH-001',
      quantity: 25,
      status: 'Done',
      type: 'In',
    },
    {
      reference: 'DEL-004',
      date: '02/15/2024',
      content: 'Tech Components Ltd.',
      from: 'WH-001',
      to: 'Customer',
      quantity: 40,
      status: 'Done',
      type: 'Out',
    },
    {
      reference: 'TRF-003',
      date: '02/14/2024',
      content: 'Quality Check Return',
      from: 'WH-003',
      to: 'WH-001',
      quantity: 45,
      status: 'Done',
      type: 'Internal',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-success/10 text-success border-success/20';
      case 'waiting':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'done':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'In':
        return 'bg-success/10 text-success border-success/20';
      case 'Out':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Internal':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Move History
            </h1>
            <p className="text-muted-foreground">
              Track all inventory movements between locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/50">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border border-border">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Movement Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Movements</SelectItem>
              <SelectItem value="in">Incoming</SelectItem>
              <SelectItem value="out">Outgoing</SelectItem>
              <SelectItem value="internal">Internal Transfer</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        <Card className="border-2">
          {viewMode === 'list' ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Content</TableHead>
                    <TableHead className="font-semibold">From</TableHead>
                    <TableHead className="font-semibold">To</TableHead>
                    <TableHead className="font-semibold text-right">Quantity</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <TableCell className="font-medium font-mono text-sm">
                        {movement.reference}
                      </TableCell>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.content}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {movement.from}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {movement.to}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(movement.status)}>
                          {movement.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Populates all moves done between the From → To location in inventory. 
                  {' '}If single reference has multiple products, display it in multiple rows. 
                  {' '}In export should be displayed in green, Out moves should be displayed in red.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movements.map((movement, index) => (
                  <Card key={index} className="border-2 hover-lift cursor-pointer">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {movement.reference}
                          </p>
                          <p className="text-xs text-muted-foreground">{movement.date}</p>
                        </div>
                        <Badge className={getTypeColor(movement.type)}>
                          {movement.type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-foreground mb-3">{movement.content}</h4>
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Badge variant="outline" className="font-mono text-xs">
                          {movement.from}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {movement.to}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Qty: <strong className="text-foreground">{movement.quantity}</strong>
                        </span>
                        <Badge className={getStatusColor(movement.status)}>
                          {movement.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default MoveHistory;
