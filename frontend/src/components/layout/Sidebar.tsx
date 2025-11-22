import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Truck, 
  ArrowRightLeft, 
  Settings, 
  ChevronDown,
  TrendingUp,
  History,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useInventory } from '@/context/InventoryContext';

const Sidebar = () => {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const { user } = useInventory();
  const isInventoryManager = user?.role === 'inventory_manager';
  const isWarehouseStaff = user?.role === 'warehouse_staff';

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-display font-bold text-sidebar-primary-foreground">
          StockMaster
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Inventory Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/products"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <Package className="w-5 h-5" />
              Products
            </NavLink>
          </li>

          <li className="pt-2">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <span className="uppercase tracking-wider">Operations</span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform",
                  operationsOpen && "rotate-180"
                )}
              />
            </button>
            
            {operationsOpen && (
              <ul className="mt-1 space-y-1">
                {/* Receipts - Inventory Managers only */}
                {isInventoryManager && (
                  <li>
                    <NavLink
                      to="/receipts"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <ClipboardList className="w-5 h-5" />
                      Receipts
                    </NavLink>
                  </li>
                )}
                
                {/* Deliveries - Inventory Managers only */}
                {isInventoryManager && (
                  <li>
                    <NavLink
                      to="/deliveries"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <Truck className="w-5 h-5" />
                      Deliveries
                    </NavLink>
                  </li>
                )}
                
                {/* Transfers - Both roles */}
                <li>
                  <NavLink
                    to="/transfers"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfers
                  </NavLink>
                </li>
                
                {/* Adjustments - Warehouse Staff only */}
                {isWarehouseStaff && (
                  <li>
                    <NavLink
                      to="/adjustments"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Adjustments
                    </NavLink>
                  </li>
                )}
                
                {/* Route Optimization - Both roles */}
                <li>
                  <NavLink
                    to="/optimization"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <Sparkles className="w-5 h-5" />
                    Route Optimization
                  </NavLink>
                </li>
                
                {/* Move History - Both roles */}
                <li>
                  <NavLink
                    to="/history"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors pl-8"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <History className="w-5 h-5" />
                    Move History
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className="pt-2">
            <NavLink
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
