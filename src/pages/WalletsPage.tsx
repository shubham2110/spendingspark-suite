import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletForm } from '@/components/wallets/WalletForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { Wallet, createWallet, updateWallet, deleteWallet } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Wallet as WalletIcon } from 'lucide-react';

const WalletsPage: React.FC = () => {
  const { wallets, selectedWallet, setSelectedWallet, isLoading, refreshWallets } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, w) => sum + (w.is_enabled ? (w.balance || 0) : 0), 0);
  const activeWallets = wallets.filter(w => w.is_enabled).length;

  const handleCreateWallet = async (data: any) => {
    try {
      await createWallet(data);
      toast.success('Wallet created successfully');
      setIsFormOpen(false);
      refreshWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wallet');
    }
  };

  const handleUpdateWallet = async (data: any) => {
    if (!editingWallet) return;

    try {
      await updateWallet(editingWallet.id, data);
      toast.success('Wallet updated successfully');
      setEditingWallet(null);
      refreshWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wallet');
    }
  };

  const handleDeleteWallet = async () => {
    if (!deletingWallet) return;

    try {
      await deleteWallet(deletingWallet.id);
      toast.success('Wallet deleted successfully');
      setDeletingWallet(null);
      if (selectedWallet?.id === deletingWallet.id) {
        setSelectedWallet(wallets.find(w => w.id !== deletingWallet.id) || null);
      }
      refreshWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete wallet');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Wallets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your accounts and track balances
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      {/* Summary */}
      <motion.div
        className="bg-card rounded-xl shadow-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <WalletIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-3xl font-heading font-bold text-foreground">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeWallets} active wallet{activeWallets !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Wallets Grid */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WalletCard
                wallet={wallet}
                isSelected={selectedWallet?.id === wallet.id}
                onClick={() => setSelectedWallet(wallet)}
                onEdit={() => setEditingWallet(wallet)}
                onDelete={() => setDeletingWallet(wallet)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💰"
          title="No wallets yet"
          description="Create your first wallet to start managing your finances"
          action={{
            label: 'Create Wallet',
            onClick: () => setIsFormOpen(true),
          }}
        />
      )}

      {/* Create Wallet Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Wallet</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <WalletForm
              onSubmit={handleCreateWallet}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Wallet Sheet */}
      <Sheet open={!!editingWallet} onOpenChange={() => setEditingWallet(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Wallet</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingWallet && (
              <WalletForm
                wallet={editingWallet}
                onSubmit={handleUpdateWallet}
                onCancel={() => setEditingWallet(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingWallet}
        onOpenChange={() => setDeletingWallet(null)}
        title="Delete Wallet"
        description={`Are you sure you want to delete "${deletingWallet?.name}"? All transactions in this wallet will also be deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteWallet}
      />
    </motion.div>
  );
};

export default WalletsPage;
