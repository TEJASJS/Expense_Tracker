'use client';

import { useState } from 'react';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BudgetsViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetsView({ budgets, expenses, onAddBudget, onUpdateBudget, onDeleteBudget }: BudgetsViewProps) {
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
        <Button>Add Budget</Button>
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
                  </div>
                  <Progress value={percentage} className={isOverBudget ? 'bg-red-200' : ''} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}