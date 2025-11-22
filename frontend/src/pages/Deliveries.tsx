import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Deliveries = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Deliveries
            </h1>
            <p className="text-muted-foreground">
              Manage outgoing shipments to customers
            </p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Plus className="w-4 h-4" />
            New Delivery
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              Deliveries Module Coming Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              Create delivery orders and manage pick, pack, and ship processes for customer orders.
            </p>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Deliveries;
