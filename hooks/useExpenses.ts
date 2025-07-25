'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types/expense';
import { useAuth } from '@/contexts/AuthContext';
import { expensesApi } from '@/lib/api';
import { useWallets } from './useWallets';

export function useExpenses() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallets, refreshWallets } = useWallets();

  const loadExpenses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      console.log('Fetching expenses...');
      const response = await expensesApi.getExpenses(token);
      console.log('Expenses API response:', response);
      
      if (response.error) {
        console.error('Error from API:', response.error);
        return;
      }
      
      if (response.data) {
        // Ensure response.data is an array before mapping
        const expensesData = Array.isArray(response.data) ? response.data : [];
        console.log('Expenses data:', expensesData);
        
        const formattedExpenses = expensesData.map((expense: any) => ({
          id: expense.id,
          userId: expense.user_id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          person: expense.person || 'Self',
          walletId: expense.wallet_id,
          tags: expense.tags || [],
          isRecurring: expense.is_recurring || false,
          recurringType: expense.recurring_type,
          nextDue: expense.next_due,
          receiptUrl: expense.receipt_url,
          createdAt: expense.created_at,
          updatedAt: expense.updated_at,
        }));
        
        console.log('Formatted expenses:', formattedExpenses);
        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!token) throw new Error('User not authenticated');
    try {
      const response = await expensesApi.createExpense(expenseData, token);
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to add expense');
      }
      // Type the API response as any to access snake_case properties
      const apiExpense = response.data as any;
      // Transform the API response to match the frontend Expense type
      const newExpense: Expense = {
        id: apiExpense.id,
        userId: apiExpense.user_id,
        amount: apiExpense.amount,
        category: apiExpense.category,
        description: apiExpense.description,
        date: apiExpense.date,
        person: apiExpense.person || 'Self',
        walletId: apiExpense.wallet_id,
        tags: apiExpense.tags || [],
        isRecurring: apiExpense.is_recurring || false,
        recurringType: apiExpense.recurring_type,
        nextDue: apiExpense.next_due,
        receiptUrl: apiExpense.receipt_url,
        createdAt: apiExpense.created_at,
        updatedAt: apiExpense.updated_at,
      };
      setExpenses(prev => [newExpense, ...prev]);
      await refreshWallets(); // Refresh wallets to show new balance
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!token) throw new Error('User not authenticated');
    try {
      const response = await expensesApi.updateExpense(id, updates, token);
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to update expense');
      }
      // Type the API response as any to access snake_case properties
      const apiExpense = response.data as any;
      // Transform the API response to match the frontend Expense type
      const updatedExpense: Expense = {
        id: apiExpense.id,
        userId: apiExpense.user_id,
        amount: apiExpense.amount,
        category: apiExpense.category,
        description: apiExpense.description,
        date: apiExpense.date,
        person: apiExpense.person || 'Self',
        walletId: apiExpense.wallet_id,
        tags: apiExpense.tags || [],
        isRecurring: apiExpense.is_recurring || false,
        recurringType: apiExpense.recurring_type,
        nextDue: apiExpense.next_due,
        receiptUrl: apiExpense.receipt_url,
        createdAt: apiExpense.created_at,
        updatedAt: apiExpense.updated_at,
      };
      setExpenses(prev => prev.map(exp => (exp.id === id ? updatedExpense : exp)));
      await refreshWallets(); // Refresh wallets to show new balance
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!token) throw new Error('User not authenticated');
    try {
      const response = await expensesApi.deleteExpense(id, token);
      if (response.error) {
        throw new Error(response.error || 'Failed to delete expense');
      }
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      await refreshWallets(); // Refresh wallets to show new balance
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
    deleteExpense,
    loadExpenses,
  };
}