'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onAddBalanceAction: (amount: number) => void;
  walletName: string;
}

export function AddBalanceDialog({ open, onOpenChangeAction, onAddBalanceAction, walletName }: AddBalanceDialogProps) {
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      onAddBalanceAction(numericAmount);
      onOpenChangeAction(false);
      setAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Balance to {walletName}</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to this wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAdd}>Add Balance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
