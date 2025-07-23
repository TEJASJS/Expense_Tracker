'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';
import { Wallet } from '@/types/wallet';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void; // Renamed from onOpenChange
  onAdd: (expense: Partial<Expense>) => void;
  editExpense?: Expense | null;
  wallets: Wallet[];
}

export function AddExpenseDialog({
  open,
  onOpenChangeAction, // Renamed from onOpenChange
  onAdd,
  editExpense,
  wallets,
}: AddExpenseDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [walletId, setWalletId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (editExpense) {
        setDescription(editExpense.description);
        setAmount(editExpense.amount.toString());
        setCategory(editExpense.category);
        setDate(editExpense.date);
        setWalletId(editExpense.walletId);
      } else {
        // Reset form for new expense
        setDescription('');
        setAmount('');
        setCategory(EXPENSE_CATEGORIES[0]);
        setDate(new Date().toISOString().split('T')[0]);
        setWalletId(undefined);
      }
    }
  }, [editExpense, open]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      category,
      date,
      walletId: walletId || undefined,
      person: 'Self',
      tags: [],
      isRecurring: false,
      ...(editExpense ? { id: editExpense.id } : {})
    };
    
    onAdd(expenseData as any);
    onOpenChangeAction(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}> {/* Use the new prop name here */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grocery shopping"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25.50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {wallets && wallets.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet (Optional)</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{editExpense ? 'Update' : 'Add'} Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}