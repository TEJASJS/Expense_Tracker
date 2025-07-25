'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, WalletType } from '@/types/wallet';

interface AddWalletDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onAddWalletAction: (wallet: Partial<Wallet>) => void;
}

const WALLET_TYPES: WalletType[] = ['personal', 'shared', 'business'];

export function AddWalletDialog({ open, onOpenChangeAction, onAddWalletAction }: AddWalletDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>(WALLET_TYPES[0]);
  const [balance, setBalance] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      // Basic validation
      return;
    }
    onAddWalletAction({
      name: name.trim(),
      type: type,
      balance: parseFloat(balance) || 0,
      currency: 'INR', // Assuming INR for now
    });
    onOpenChangeAction(false); // Close dialog on submit
    // Reset fields
    setName('');
    setType(WALLET_TYPES[0]);
    setBalance('0');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Wallet</DialogTitle>
          <DialogDescription>
            Create a new wallet to manage your funds. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Savings Account"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={(value: WalletType) => setType(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Initial Balance
              </Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Wallet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
