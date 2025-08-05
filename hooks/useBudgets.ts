'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';
import { useAuth } from '@/contexts/AuthContext';
import { budgetsApi } from '@/lib/api';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const { token } = useAuth();

  const fetchBudgets = useCallback(async () => {
    if (token) {
      const response = await budgetsApi.getBudgets(token);
      if (response.data) {
        setBudgets(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch budgets.');
        setBudgets([]);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!token) {
      toast.error('Authentication required to add a budget.');
      return;
    }
    const response = await budgetsApi.createBudget(budgetData, token);
    if (response.data) {
      fetchBudgets(); // Refetch to get the latest list with the new ID from DB
      toast.success('Budget added successfully!');
    } else {
      toast.error(response.error || 'Failed to add budget.');
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!token) {
      toast.error('Authentication required to update a budget.');
      return;
    }
    const response = await budgetsApi.updateBudget(id, updates, token);
    if (response.data) {
      setBudgets(prev => prev.map(b => (b.id === id ? response.data! : b)));
      toast.success('Budget updated successfully!');
    } else {
      toast.error(response.error || 'Failed to update budget.');
    }
  };

  const deleteBudget = async (id: string) => {
    if (!token) {
      toast.error('Authentication required to delete a budget.');
      return;
    }
    const response = await budgetsApi.deleteBudget(id, token);
    if (!response.error) {
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget deleted successfully!');
    } else {
      toast.error(response.error || 'Failed to delete budget.');
    }
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

      if (categoryExpenses > budget.amount) {
        violations.push({
          category: budget.category,
          amount: categoryExpenses - budget.amount,
          limit: budget.amount
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
    checkBudgetLimits,
  };
}