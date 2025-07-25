'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBalance: (amount: number) => Promise<any>;
  walletName: string;
}

export function AddBalanceDialog({
  open,
  onOpenChange,
  onAddBalance,
  walletName
}: AddBalanceDialogProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (amount === '' || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddBalance(Number(amount));
      toast.success(`Successfully added balance to ${walletName}.`);
      onOpenChange(false);
      setAmount(''); // Reset amount after successful submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Error adding balance:', err);
      setError(`Failed to add balance: ${errorMessage}`);
      toast.error(`Failed to add balance: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setError(null);
        setAmount('');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="add-balance-dialog-description">
        <DialogHeader>
          <DialogTitle>Add Balance to {walletName}</DialogTitle>
          <DialogDescription id="add-balance-dialog-description">
            Enter the amount you want to add to this wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="col-span-3"
              required
            />
          </div>
          
          {error && (
            <div className="col-span-4 mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm" role="alert">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || amount === '' || Number(amount) <= 0}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Balance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}