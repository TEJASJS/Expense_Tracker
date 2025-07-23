'use client';

import { useState } from 'react';
import { Wallet } from '@/types/wallet';
import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddWalletDialog } from './AddWalletDialog';

interface WalletsViewProps {
  wallets: Wallet[];
  expenses: Expense[];
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
  onUpdateWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
}

export function WalletsView({ wallets, expenses, onAddWallet, onUpdateWallet, onDeleteWallet }: WalletsViewProps) {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  
  const handleAddWallet = () => {
    setEditingWallet(null);
    setShowAddWallet(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setShowAddWallet(true);
  };

  const handleSaveWallet = (walletData: Omit<Wallet, 'id'>) => {
    if (editingWallet) {
      onUpdateWallet({
        ...walletData,
        id: editingWallet.id
      });
    } else {
      onAddWallet(walletData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Wallets</h2>
        <Button onClick={handleAddWallet}>Add Wallet</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalBalance.toFixed(2)}</div>
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
                    {wallet.description && (
                      <div className="text-sm text-muted-foreground mt-1">{wallet.description}</div>
                    )}
                  </div>
                  <div className="font-semibold">${wallet.balance.toFixed(2)}</div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditWallet(wallet)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteWallet(wallet.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddWalletDialog
        open={showAddWallet}
        onOpenChange={setShowAddWallet}
        onSave={handleSaveWallet}
        initialData={editingWallet}
      />
    </div>
  );
}