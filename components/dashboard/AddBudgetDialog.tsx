'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget } from '@/types/budget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  initialData?: Budget | null;
}

export function AddBudgetDialog({ open, onOpenChange, onSave, initialData }: AddBudgetDialogProps) {
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState<number | ''>('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setMonthlyLimit(initialData.monthlyLimit);
    } else {
      setCategory('');
      setMonthlyLimit('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (category && monthlyLimit !== '') {
      const newBudget: Omit<Budget, 'id'> = {
        userId: '', // This should be replaced with the actual user ID
        category,
        monthlyLimit: Number(monthlyLimit),
        currentSpent: 0,
        alertThreshold: 80, // Default alert threshold
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(newBudget);
      onOpenChange(false);
    }
  };

  const categories = [
    'Groceries', 'Utilities', 'Rent', 'Transportation', 'Entertainment',
    'Dining Out', 'Shopping', 'Healthcare', 'Education', 'Salary', 'Investments', 'Other'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyLimit" className="text-right">
              Monthly Limit
            </Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Add Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}