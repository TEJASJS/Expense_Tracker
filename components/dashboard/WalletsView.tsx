'use client';

import { Wallet } from '@/types/wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WalletsViewProps {
  wallets: Wallet[];
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
  onUpdateWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
}

export function WalletsView({ wallets, onAddWallet, onUpdateWallet, onDeleteWallet }: WalletsViewProps) {
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Wallets</h2>
        <Button>Add Wallet</Button>
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
                  </div>
                  <div className="font-semibold">${wallet.balance.toFixed(2)}</div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Transfer</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}