import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import DeliveryList from '@/components/deliveries/DeliveryList';
import DeliveryForm from '@/components/deliveries/DeliveryForm';
import DeliveryDetails from '@/components/deliveries/DeliveryDetails';
import FilterBar from '@/components/dashboard/FilterBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Delivery } from '@/types';
import { toast } from 'sonner';

const Deliveries = () => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { deliveries, updateDelivery, pickDelivery, packDelivery, confirmDelivery } = useInventory();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    setDetailsOpen(true);
  };

  const handlePick = (id: string) => {
    pickDelivery(id);
    toast.success('Items marked as picked');
  };

  const handlePack = (id: string) => {
    packDelivery(id);
    toast.success('Items marked as packed');
  };

  const handleConfirm = (id: string) => {
    confirmDelivery(id);
    toast.success('Delivery confirmed and stock decreased');
  };

  const handleCancel = (id: string) => {
    updateDelivery(id, { status: 'canceled' });
    toast.success('Delivery canceled');
  };

  const handleOptimize = (id: string) => {
    navigate(`/optimization?type=delivery&id=${id}`);
  };

  const handleClose = () => {
    setFormOpen(false);
    setDetailsOpen(false);
    setEditingId(null);
    setViewingId(null);
  };

  const editingDelivery = editingId ? deliveries.find(d => d.id === editingId) : null;
  const viewingDelivery = viewingId ? deliveries.find(d => d.id === viewingId) : null;

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
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New Delivery
          </Button>
        </div>

        <FilterBar />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Deliveries List
            </h2>
            <span className="text-sm text-muted-foreground">
              {deliveries.length} deliver{deliveries.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
          <DeliveryList
            onEdit={handleEdit}
            onView={handleView}
            onPick={handlePick}
            onPack={handlePack}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onOptimize={handleOptimize}
          />
        </div>

        <DeliveryForm
          open={formOpen}
          onClose={handleClose}
          editingDelivery={editingDelivery}
        />

        <DeliveryDetails
          delivery={viewingDelivery}
          open={detailsOpen}
          onClose={handleClose}
        />
      </div>
    </MainLayout>
  );
};

export default Deliveries;
