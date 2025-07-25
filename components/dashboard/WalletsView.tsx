'use client';

import { useState } from 'react';
import { Wallet } from '@/types/wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddBalanceDialog } from '@/components/dialogs/AddBalanceDialog';
import { AddWalletDialog } from '@/components/dialogs/AddWalletDialog';
import { toast } from 'sonner';

interface WalletsViewProps {
  wallets: Wallet[];
  onAddBalanceAction: (id: string, amount: number) => Promise<any>;
  onDeleteAction: (id: string) => Promise<void>;
  // onAdd is kept for future functionality, e.g., opening a new AddWalletDialog
  onAddAction: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Wallet>;
}

export function WalletsView({ 
  wallets, 
  onAddBalanceAction, 
  onDeleteAction, 
  onAddAction 
}: WalletsViewProps) {
  const [showAddBalanceDialog, setShowAddBalanceDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const handleOpenAddBalance = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowAddBalanceDialog(true);
  };

  const handleAddBalance = async (amount: number) => {
    if (!selectedWallet) return;
    await onAddBalanceAction(selectedWallet.id, amount);
  };

  const handleAddWallet = async (wallet: Partial<Wallet>) => {
    try {
      // The onAddAction expects a more specific type, so we ensure the wallet object conforms to it.
      // This is a safe cast because the dialog ensures these fields are present.
      await onAddAction(wallet as Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Wallet added successfully!');
      setShowAddWalletDialog(false);
    } catch (error) {
      console.error('Failed to add wallet:', error);
      toast.error('Failed to add wallet.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      try {
        await onDeleteAction(id);
        toast.success('Wallet deleted successfully.');
      } catch (error) {
        console.error('Error deleting wallet:', error);
        toast.error('Failed to delete wallet.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Wallets</h2>
        {/* This button is a placeholder for when AddWalletDialog is re-implemented */}
        <Button onClick={() => setShowAddWalletDialog(true)}>Add Wallet</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₹{totalBalance.toFixed(2)}</div>
        </CardContent>
      </Card>
      
      {wallets.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No wallets added. Add your first wallet to start tracking your balances.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {wallets.map(wallet => (
            <Card key={wallet.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">{wallet.type}</div>
                  </div>
                  <div className="font-semibold">₹{wallet.balance.toFixed(2)}</div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenAddBalance(wallet)}
                  >
                    Add Balance
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(wallet.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedWallet && (
        <AddBalanceDialog
          open={showAddBalanceDialog}
          onOpenChangeAction={setShowAddBalanceDialog}
          onAddBalanceAction={handleAddBalance}
          walletName={selectedWallet.name}
        />
      )}

      <AddWalletDialog
        open={showAddWalletDialog}
        onOpenChangeAction={setShowAddWalletDialog}
        onAddWalletAction={handleAddWallet}
      />
    </div>
  );
}