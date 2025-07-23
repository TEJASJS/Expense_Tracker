'use client';

import { useState, useEffect } from 'react';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Add some demo budgets
      const demoBudgets: Budget[] = [
        {
          id: '1',
          userId: 'demo',
          category: 'Food & Dining',
          monthlyLimit: 500,
          currentSpent: 0,
          alertThreshold: 80,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'demo',
          category: 'Transportation',
          monthlyLimit: 200,
          currentSpent: 0,
          alertThreshold: 80,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setBudgets(demoBudgets);
      localStorage.setItem('budgets', JSON.stringify(demoBudgets));
    }
  }, []);

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const addBudget = (budgetData: Partial<Budget>) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      userId: 'current-user',
      category: budgetData.category || '',
      monthlyLimit: budgetData.monthlyLimit || 0,
      currentSpent: 0,
      alertThreshold: budgetData.alertThreshold || 80,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBudgets = [...budgets, newBudget];
    saveBudgets(updatedBudgets);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === id
        ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
        : budget
    );
    saveBudgets(updatedBudgets);
  };

  const deleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== id);
    saveBudgets(updatedBudgets);
  };

  const checkBudgetLimits = (expenses: Expense[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const violations: Array<{ category: string; amount: number; limit: number }> = [];

    budgets.forEach(budget => {
      if (!budget.isActive) return;

      const categoryExpenses = thisMonthExpenses
        .filter(expense => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);

      if (categoryExpenses > budget.monthlyLimit) {
        violations.push({
          category: budget.category,
          amount: categoryExpenses - budget.monthlyLimit,
          limit: budget.monthlyLimit
        });
      }
    });

    return violations;
  };

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    checkBudgetLimits
  };
}