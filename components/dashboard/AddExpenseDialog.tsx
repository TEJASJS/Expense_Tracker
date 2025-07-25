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
    
    if (!description || !amount || isNaN(parseFloat(amount)) || !walletId) {
      console.error('Please fill in all required fields');
      return;
    }
    
    const expenseData: Partial<Expense> = {
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date,
      walletId: walletId || undefined,
      person: 'Self',
      tags: [],
      isRecurring: false,
      ...(editExpense ? { id: editExpense.id } : {})
    };
    
    onAdd(expenseData);
    onOpenChangeAction(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent 
        className="sm:max-w-[425px]"
        aria-labelledby="expense-dialog-title"
        aria-describedby="expense-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="expense-dialog-title">
            {editExpense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <p id="expense-dialog-description" className="sr-only">
            {editExpense ? 'Edit the expense details' : 'Enter details for a new expense'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="What was this expense for?"
              required
              aria-required="true"
              minLength={3}
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
                required
                aria-required="true"
              />
            </div>
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
          {wallets && wallets.length > 0 ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wallet" className="text-right">
                Wallet <span className="text-red-500">*</span>
              </Label>
              <Select 
                onValueChange={setWalletId} 
                value={walletId}
                required
              >
                <SelectTrigger className="col-span-3" id="wallet">
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground col-span-4 py-4">
              You need to create a wallet before adding an expense.
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
            <Button type="submit" disabled={wallets.length === 0 && !editExpense}>{editExpense ? 'Update' : 'Add'} Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}