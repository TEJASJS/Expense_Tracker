'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';
import { Wallet } from '@/types/wallet';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  editExpense?: Expense;
  wallets?: Wallet[];
}

export function AddExpenseDialog({ open, onOpenChange, onAdd, editExpense, wallets }: AddExpenseDialogProps) {
  const [description, setDescription] = useState(editExpense?.description || '');
  const [amount, setAmount] = useState(editExpense?.amount.toString() || '');
  const [category, setCategory] = useState(editExpense?.category || 'Food & Dining');
  const [date, setDate] = useState(editExpense?.date || new Date().toISOString().split('T')[0]);
  const [walletId, setWalletId] = useState(editExpense?.walletId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      category,
      date,
      walletId: walletId || undefined,
      // Add missing required properties from Expense type
      person: 'Self',
      tags: [],
      isRecurring: false,
      ...(editExpense ? { id: editExpense.id } : {})
    };
    
    // Remove the 'as any' type assertion
    onAdd(expenseData);
    
    // Reset form if not editing
    if (!editExpense) {
      setDescription('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setWalletId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <SelectItem value="">None</SelectItem>
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