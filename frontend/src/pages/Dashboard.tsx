import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import FilterBar from '@/components/dashboard/FilterBar';
import { useInventory } from '@/context/InventoryContext';
import { Package, AlertTriangle, ClipboardList, Truck, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const Dashboard = () => {
  const { products, receipts, deliveries, transfers, adjustments, user } = useInventory();
  const isInventoryManager = user?.role === 'inventory_manager';
  const isWarehouseStaff = user?.role === 'warehouse_staff';

  const kpis = useMemo(() => {
    const totalStock = products.reduce((sum, p) => {
      return sum + Object.values(p.stock).reduce((a, b) => a + b, 0);
    }, 0);

    const lowStockItems = products.filter(p => {
      const totalProdStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
      return p.minStock && totalProdStock <= p.minStock;
    }).length;

    const pendingReceipts = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
    const pendingDeliveries = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
    const scheduledTransfers = transfers.filter(t => t.status !== 'done' && t.status !== 'canceled').length;
    const pendingAdjustments = adjustments.filter(a => a.status !== 'done' && a.status !== 'canceled').length;

    return {
      totalStock,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      pendingAdjustments,
    };
  }, [products, receipts, deliveries, transfers, adjustments]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your inventory operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KPICard
            label="Total Products in Stock"
            value={kpis.totalStock.toLocaleString()}
            icon={Package}
            trend="up"
            change={12}
            variant="default"
          />
          <KPICard
            label="Low Stock Items"
            value={kpis.lowStockItems}
            icon={AlertTriangle}
            variant={kpis.lowStockItems > 0 ? 'warning' : 'success'}
            trend={kpis.lowStockItems > 0 ? 'up' : 'neutral'}
            change={kpis.lowStockItems > 0 ? 8 : 0}
          />
          {isInventoryManager && (
            <>
              <KPICard
                label="Pending Receipts"
                value={kpis.pendingReceipts}
                icon={ClipboardList}
                trend="neutral"
                variant="default"
              />
              <KPICard
                label="Pending Deliveries"
                value={kpis.pendingDeliveries}
                icon={Truck}
                trend="down"
                change={5}
                variant="default"
              />
            </>
          )}
          <KPICard
            label="Scheduled Transfers"
            value={kpis.scheduledTransfers}
            icon={ArrowRightLeft}
            trend="neutral"
            variant="default"
          />
          {isWarehouseStaff && (
            <KPICard
              label="Pending Adjustments"
              value={kpis.pendingAdjustments}
              icon={TrendingUp}
              trend="neutral"
              variant="default"
            />
          )}
        </div>

        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Filter Operations
          </h2>
          <FilterBar />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-medium">Receipt DEL-001 completed for ABC Manufacturing Corp.</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm font-medium">Low stock alert: Industrial Bolt M12x50</span>
              </div>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm font-medium">Transfer TRF-001 initiated: WH-001 → WH-002</span>
              </div>
              <span className="text-xs text-muted-foreground">6 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-medium">Delivery DEL-002 packed and ready for shipment</span>
              </div>
              <span className="text-xs text-muted-foreground">8 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm font-medium">New product added: Pneumatic Valve V-100</span>
              </div>
              <span className="text-xs text-muted-foreground">12 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm font-medium">Stock adjustment created for Safety Equipment category</span>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
