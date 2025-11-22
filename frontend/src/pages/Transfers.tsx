import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TransferList from '@/components/transfers/TransferList';
import TransferForm from '@/components/transfers/TransferForm';
import TransferDetails from '@/components/transfers/TransferDetails';
import FilterBar from '@/components/dashboard/FilterBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Transfer } from '@/types';
import { toast } from 'sonner';

const Transfers = () => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { transfers, updateTransfer, confirmTransfer } = useInventory();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    setDetailsOpen(true);
  };

  const handleConfirm = (id: string) => {
    confirmTransfer(id);
    toast.success('Transfer confirmed and stock moved');
  };

  const handleCancel = (id: string) => {
    updateTransfer(id, { status: 'canceled' });
    toast.success('Transfer canceled');
  };

  const handleOptimize = (id: string) => {
    navigate(`/optimization?type=transfer&id=${id}`);
  };

  const handleClose = () => {
    setFormOpen(false);
    setDetailsOpen(false);
    setEditingId(null);
    setViewingId(null);
  };

  const editingTransfer = editingId ? transfers.find(t => t.id === editingId) : null;
  const viewingTransfer = viewingId ? transfers.find(t => t.id === viewingId) : null;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Internal Transfers
            </h1>
            <p className="text-muted-foreground">
              Transfer stock between warehouses and locations
            </p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New Transfer
          </Button>
        </div>

        <FilterBar />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Transfers List
            </h2>
            <span className="text-sm text-muted-foreground">
              {transfers.length} transfer{transfers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <TransferList
            onEdit={handleEdit}
            onView={handleView}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onOptimize={handleOptimize}
          />
        </div>

        <TransferForm
          open={formOpen}
          onClose={handleClose}
          editingTransfer={editingTransfer}
        />

        <TransferDetails
          transfer={viewingTransfer}
          open={detailsOpen}
          onClose={handleClose}
        />
      </div>
    </MainLayout>
  );
};

export default Transfers;

