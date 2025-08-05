'use client';

import { useState } from 'react';
import { Wallet } from '@/types/wallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddBalanceDialog } from '@/components/dialogs/AddBalanceDialog';
import { AddWalletDialog } from '@/components/dialogs/AddWalletDialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Wallet as WalletIcon, CreditCard, Briefcase, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WalletsViewProps {
  wallets: Wallet[];
  onAddBalanceAction: (id: string, amount: number) => Promise<any>;
  onDeleteAction: (id: string) => Promise<void>;
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

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <WalletIcon className="h-5 w-5 text-primary" />;
      case 'business':
        return <Briefcase className="h-5 w-5 text-primary" />;
      case 'shared':
        return <Users className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Wallets</h2>
        <Button 
          onClick={() => setShowAddWalletDialog(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          Add Wallet
        </Button>
      </div>
      
      <Card className="dashboard-card dashboard-card-hover">
        <CardHeader className="pb-2">
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>Across all wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₹{totalBalance.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">{wallets.length} wallets</p>
        </CardContent>
      </Card>
      
      {wallets.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="pt-6 text-center text-muted-foreground p-10">
            <div className="flex flex-col items-center justify-center space-y-3">
              <WalletIcon className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">No wallets added</h3>
              <p className="text-sm">Add your first wallet to start tracking your balances.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map(wallet => (
            <Card key={wallet.id} className="dashboard-card dashboard-card-hover">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <Badge variant="outline" className="mt-1 capitalize">{wallet.type}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenAddBalance(wallet)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Balance
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(wallet.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">₹{wallet.balance.toFixed(2)}</div>
                  {wallet.description && (
                    <p className="text-sm text-muted-foreground mt-1">{wallet.description}</p>
                  )}
                </div>
                <div className="mt-4">
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