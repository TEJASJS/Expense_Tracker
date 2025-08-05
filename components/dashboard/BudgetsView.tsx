'use client';

import { useState } from 'react';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AddBudgetDialog } from './AddBudgetDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, AlertTriangle, Check, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BudgetsViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudgetAction: (budget: Omit<Budget, 'id'>) => Promise<void>;
  onUpdateBudgetAction: (budget: Budget) => Promise<void>;
  onDeleteBudgetAction: (id: string) => Promise<void>;
}

export function BudgetsView({ 
  budgets, 
  expenses, 
  onAddBudgetAction, 
  onUpdateBudgetAction, 
  onDeleteBudgetAction 
}: BudgetsViewProps) {
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Calculate expenses by category for the current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const expensesByCategory: Record<string, number> = {};
  currentMonthExpenses.forEach(expense => {
    if (expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] += expense.amount;
    } else {
      expensesByCategory[expense.category] = expense.amount;
    }
  });

  const handleSaveBudget = async (budget: Omit<Budget, 'id' | 'name'>) => {
    if (editingBudget) {
      await onUpdateBudgetAction({ ...editingBudget, ...budget });
    } else {
      await onAddBudgetAction(budget as Omit<Budget, 'id'>);
    }
    setEditingBudget(null);
    setIsAddBudgetDialogOpen(false);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await onDeleteBudgetAction(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monthly Budgets</h2>
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setIsAddBudgetDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          Add Budget
        </Button>
      </div>
      
      {budgets.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="pt-6 text-center text-muted-foreground p-10">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Target className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">No budgets set</h3>
              <p className="text-sm">Add your first budget to start tracking your spending limits.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
            const isOverBudget = spent > budget.amount;
            const isCloseToLimit = percentage >= 80 && percentage < 100;
            
            return (
              <Card 
                key={budget.id} 
                className={`dashboard-card dashboard-card-hover ${isOverBudget ? 'border-destructive' : isCloseToLimit ? 'border-amber-500' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <CardDescription>Monthly budget</CardDescription>
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
                        <DropdownMenuItem 
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        <span className={isOverBudget ? 'text-destructive font-bold' : ''}>
                          ₹{spent.toFixed(2)}
                        </span>
                        {' '}/{' '}
                        <span>₹{budget.amount.toFixed(2)}</span>
                      </span>
                      <Badge 
                        variant={isOverBudget ? 'destructive' : isCloseToLimit ? 'outline' : 'secondary'}
                        className="font-medium"
                      >
                        {isOverBudget ? (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Over by {((spent / budget.amount - 1) * 100).toFixed(0)}%
                          </>
                        ) : isCloseToLimit ? (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {percentage}%
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            {percentage}%
                          </>
                        )}
                      </Badge>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isOverBudget ? 'bg-destructive/20' : isCloseToLimit ? 'bg-amber-500/20' : 'bg-primary/20'} ${isOverBudget ? 'text-destructive' : isCloseToLimit ? 'text-amber-500' : 'text-primary'}`}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <AddBudgetDialog
        open={isAddBudgetDialogOpen}
        onOpenChangeAction={setIsAddBudgetDialogOpen}
        onSaveAction={handleSaveBudget}
        initialData={editingBudget}
      />
    </div>
  );
}