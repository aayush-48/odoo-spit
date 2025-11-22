import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ReceiptList from '@/components/receipts/ReceiptList';
import ReceiptForm from '@/components/receipts/ReceiptForm';
import ReceiptDetails from '@/components/receipts/ReceiptDetails';
import FilterBar from '@/components/dashboard/FilterBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Receipt } from '@/types';
import { toast } from 'sonner';

const Receipts = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { receipts, updateReceipt, confirmReceipt } = useInventory();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    setDetailsOpen(true);
  };

  const handleConfirm = (id: string) => {
    confirmReceipt(id);
    toast.success('Receipt confirmed and stock increased');
  };

  const handleCancel = (id: string) => {
    updateReceipt(id, { status: 'canceled' });
    toast.success('Receipt canceled');
  };

  const handleClose = () => {
    setFormOpen(false);
    setDetailsOpen(false);
    setEditingId(null);
    setViewingId(null);
  };

  const editingReceipt = editingId ? receipts.find(r => r.id === editingId) : null;
  const viewingReceipt = viewingId ? receipts.find(r => r.id === viewingId) : null;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Receipts
            </h1>
            <p className="text-muted-foreground">
              Manage incoming stock from suppliers
            </p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New Receipt
          </Button>
        </div>

        <FilterBar />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Receipts List
            </h2>
            <span className="text-sm text-muted-foreground">
              {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ReceiptList
            onEdit={handleEdit}
            onView={handleView}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>

        <ReceiptForm
          open={formOpen}
          onClose={handleClose}
          editingReceipt={editingReceipt}
        />

        <ReceiptDetails
          receipt={viewingReceipt}
          open={detailsOpen}
          onClose={handleClose}
        />
      </div>
    </MainLayout>
  );
};

export default Receipts;
