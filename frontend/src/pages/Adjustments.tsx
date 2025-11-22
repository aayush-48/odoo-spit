import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdjustmentList from '@/components/adjustments/AdjustmentList';
import AdjustmentForm from '@/components/adjustments/AdjustmentForm';
import AdjustmentDetails from '@/components/adjustments/AdjustmentDetails';
import FilterBar from '@/components/dashboard/FilterBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Adjustment } from '@/types';
import { toast } from 'sonner';

const Adjustments = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { adjustments, updateAdjustment, confirmAdjustment } = useInventory();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    setDetailsOpen(true);
  };

  const handleConfirm = (id: string) => {
    confirmAdjustment(id);
    toast.success('Adjustment confirmed and stock updated');
  };

  const handleCancel = (id: string) => {
    updateAdjustment(id, { status: 'canceled' });
    toast.success('Adjustment canceled');
  };

  const handleClose = () => {
    setFormOpen(false);
    setDetailsOpen(false);
    setEditingId(null);
    setViewingId(null);
  };

  const editingAdjustment = editingId ? adjustments.find(a => a.id === editingId) : null;
  const viewingAdjustment = viewingId ? adjustments.find(a => a.id === viewingId) : null;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Stock Adjustments
            </h1>
            <p className="text-muted-foreground">
              Adjust stock levels based on physical inventory counts
            </p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </Button>
        </div>

        <FilterBar />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Adjustments List
            </h2>
            <span className="text-sm text-muted-foreground">
              {adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <AdjustmentList
            onEdit={handleEdit}
            onView={handleView}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>

        <AdjustmentForm
          open={formOpen}
          onClose={handleClose}
          editingAdjustment={editingAdjustment}
        />

        <AdjustmentDetails
          adjustment={viewingAdjustment}
          open={detailsOpen}
          onClose={handleClose}
        />
      </div>
    </MainLayout>
  );
};

export default Adjustments;

