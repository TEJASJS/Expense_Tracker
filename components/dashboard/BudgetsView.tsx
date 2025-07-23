'use client';

import { useState } from 'react';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AddBudgetDialog } from './AddBudgetDialog'; // Import the new dialog
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface BudgetsViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetsView({ budgets, expenses, onAddBudget, onUpdateBudget, onDeleteBudget }: BudgetsViewProps) {
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null); // State to hold budget being edited

  // Calculate current month's expenses by category
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const expensesByCategory = thisMonthExpenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monthly Budgets</h2>
        <Button onClick={() => setIsAddBudgetDialogOpen(true)}>Add Budget</Button> {/* Open dialog on click */}
      </div>
      
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No budgets set. Add your first budget to start tracking your spending limits.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const percentage = Math.min(Math.round((spent / budget.monthlyLimit) * 100), 100);
            const isOverBudget = spent > budget.monthlyLimit;
            
            return (
              <Card key={budget.id} className={isOverBudget ? 'border-red-500' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm">
                      <span className={isOverBudget ? 'text-red-500 font-bold' : ''}>
                        ${spent.toFixed(2)}
                      </span> / ${budget.monthlyLimit.toFixed(2)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingBudget(budget);
                          setIsAddBudgetDialogOpen(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteBudget(budget.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Progress value={percentage} className={isOverBudget ? 'bg-red-200' : ''} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <AddBudgetDialog
        open={isAddBudgetDialogOpen}
        onOpenChange={(open) => {
          setIsAddBudgetDialogOpen(open);
          if (!open) {
            setEditingBudget(null); // Clear editing budget when dialog closes
          }
        }}
        onSave={(newBudget) => {
          if (editingBudget) {
            onUpdateBudget({ ...newBudget, id: editingBudget.id });
          } else {
            onAddBudget(newBudget);
          }
          setIsAddBudgetDialogOpen(false);
          setEditingBudget(null);
        }}
        initialData={editingBudget} // Pass initial data for editing
      />
    </div>
  );
}