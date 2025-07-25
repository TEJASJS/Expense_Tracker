'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Wallet } from '@/types/wallet';

interface ExpensesListProps {
  expenses: Expense[];
  onEditAction: (expense: Expense) => void;
  onDeleteAction: (id: string) => void;
  wallets?: Wallet[];
}

export function ExpensesList({ expenses, onEditAction, onDeleteAction, wallets }: ExpensesListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter expenses
  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(expense => expense.category === filter);

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(expenses.map(expense => expense.category)));
  
  // Define the handleEdit function outside of JSX
  const handleEdit = (expense: Expense) => {
    onEditAction(expense);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            variant={filter === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortBy === 'amount') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('amount');
                setSortOrder('desc');
              }
            }}
          >
            Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {sortedExpenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No expenses found. Add your first expense to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map(expense => (
            <Card key={expense.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">₹{expense.amount.toFixed(2)}</div>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteAction(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}