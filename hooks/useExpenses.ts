'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { aiCategorizer } from '@/lib/ai-categorizer';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const response = await fetch(`/api/expenses?userId=${user.id}`);
        if (response.ok) {
          const expenses = await response.json();
          setExpenses(expenses);
        }
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Partial<Expense>) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) throw new Error('User not authenticated');

      const smartCategory = aiCategorizer.categorizeExpense(expenseData.description || '');
      
      const expensePayload = {
        amount: expenseData.amount || 0,
        category: expenseData.category || smartCategory,
        description: expenseData.description || '',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        person: expenseData.person || 'Self',
        walletId: expenseData.walletId, // Now this will be a valid database ID
        tags: expenseData.tags || [],
        isRecurring: expenseData.isRecurring || false,
        recurringType: expenseData.recurringType,
        nextDue: expenseData.nextDue,
        receiptUrl: expenseData.receiptUrl
      };

      const response = await fetch(`/api/expenses?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expensePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      const newExpense = await response.json();

      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }
      
      setExpenses(prev => prev.map(expense =>
        expense.id === id
          ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
          : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense
  };
}