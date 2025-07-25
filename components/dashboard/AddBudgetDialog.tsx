'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget } from '@/types/budget';
import { EXPENSE_CATEGORIES } from '@/types/expense';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBudgetDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSaveAction: (budget: Omit<Budget, 'id' | 'name'>) => void;
  initialData?: Budget | null;
}

export function AddBudgetDialog({ open, onOpenChangeAction: onOpenChange, onSaveAction: onSave, initialData }: AddBudgetDialogProps) {

  const [amount, setAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      if (initialData.startDate) {
        setStartDate(initialData.startDate.split('T')[0]); // Format for date input
      }
      if (initialData.endDate) {
        setEndDate(initialData.endDate.split('T')[0]); // Format for date input
      }
      setCategory(initialData.category || '');
    } else {
      setAmount('');
      setStartDate('');
      setEndDate('');
      setCategory('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (amount !== '' && startDate && endDate && category) {
      const newBudget: Omit<Budget, 'id' | 'name'> = {
        amount: Number(amount),
        startDate,
        endDate,
        category,
        userId: '', // This will be set in the parent component/hook
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(newBudget);
      onOpenChange(false);
    }
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Edit your budget details here. Click update when you are done.' : 'Set up a new monthly budget. Click add when you are done.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              type="number"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!amount || !startDate || !endDate || !category}
            aria-disabled={!amount || !startDate || !endDate || !category}
          >
            {initialData ? 'Update' : 'Add'} Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}