'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Filter, ArrowUpDown, Search, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpensesListProps {
  expenses: Expense[];
  onEditAction: (expense: Expense) => void;
  onDeleteAction: (id: string) => void;
}

export function ExpensesList({ expenses, onEditAction, onDeleteAction }: ExpensesListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique categories from expenses
    const categories = ['all', ...Array.from(new Set(expenses.map(expense => expense.category)))];

  // Filter expenses by category and search term
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleSort = (by: 'date' | 'amount') => {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('desc');
    }
  };

  const handleEdit = (expense: Expense) => {
    onEditAction(expense);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDeleteAction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {sortedExpenses.length} {sortedExpenses.length === 1 ? 'expense' : 'expenses'} found
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('date')}
            className="flex items-center"
          >
            <span>Date</span>
            {sortBy === 'date' && (
              <ArrowUpDown className="ml-2 h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('amount')}
            className="flex items-center"
          >
            <span>Amount</span>
            {sortBy === 'amount' && (
              <ArrowUpDown className="ml-2 h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {sortedExpenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <div className="py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No expenses found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first expense to get started!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map(expense => (
            <Card key={expense.id} className="overflow-hidden expense-card">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">₹{expense.amount.toFixed(2)}</div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} className="text-gray-500 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="text-gray-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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