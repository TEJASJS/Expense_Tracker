'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal } from '@/types/goal';
import { goalsApi } from '@/lib/api';
import { useWallets } from './useWallets';
import { useAuth } from '@/contexts/AuthContext';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token, isAuthenticated } = useAuth();
  const { wallets, refreshWallets } = useWallets();

  // Load goals from API
  const loadGoals = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await goalsApi.getGoals(token);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const formattedGoals = response.data.map((goal: any) => ({
          id: goal.id.toString(),
          name: goal.name,
          description: goal.description,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
          deadline: goal.deadline,
          category: goal.category,
          isCompleted: goal.is_completed,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at || goal.created_at,
          userId: goal.user_id?.toString() || ''
        }));
        
        setGoals(formattedGoals);
      }
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load goals on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadGoals();
    } else {
      setLoading(false);
    }
  }, [loadGoals, isAuthenticated, token]);

  // Add a new goal
  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('addGoal called with:', { goalData, hasToken: !!token, isAuthenticated });
    
    if (!token) {
      const errorMsg = 'Authentication required. Please log in to create a goal.';
      console.error(errorMsg, { 
        isAuthenticated, 
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorMsg);
    }

    try {
      console.log('Creating goal with token:', token.substring(0, 10) + '...');
      
      // Ensure required fields are present
      if (!goalData.name || goalData.targetAmount == null) {
        throw new Error('Goal name and target amount are required');
      }
      
      // Prepare the request payload with required fields
      const goalPayload = {
        name: goalData.name,
        description: goalData.description || '',
        target_amount: goalData.targetAmount,
        current_amount: goalData.currentAmount || 0,
        deadline: goalData.deadline || new Date().toISOString(), // Provide a default deadline if not provided
        category: goalData.category || 'Other',
        is_completed: goalData.isCompleted || false
      };

      const response = await goalsApi.createGoal(goalPayload, token);

      if (response.error) {
        console.error('API error in addGoal:', response.error);
        throw new Error(response.error);
      }

      // Refresh the goals list
      console.log('Goal created, refreshing goals list...');
      await loadGoals();
      return response.data;
    } catch (err) {
      console.error('Error in addGoal:', err);
      throw err;
    }
  };

  // Update an existing goal
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!isAuthenticated || !token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await goalsApi.updateGoal(id, {
        name: updates.name,
        description: updates.description,
        target_amount: updates.targetAmount,
        current_amount: updates.currentAmount,
        deadline: updates.deadline,
        category: updates.category,
        is_completed: updates.isCompleted
      }, token);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh the goals list
      await loadGoals();
    } catch (err) {
      console.error('Failed to update goal:', err);
      throw err;
    }
  };

  // Delete a goal
  const deleteGoal = async (id: string) => {
    if (!isAuthenticated || !token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await goalsApi.deleteGoal(id, token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh the goals list
      await loadGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
      throw err;
    }
  };

  const addFundsToGoal = async (goalId: string, amountToAdd: number, walletId: string) => {
    if (!isAuthenticated || !token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await goalsApi.addFundsToGoal(goalId, amountToAdd, walletId, token);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh both goals and wallets to reflect the changes
      await loadGoals();
      await refreshWallets();

    } catch (err) {
      console.error('Failed to add funds to goal:', err);
      throw err;
    }
  };

  return { 
    goals, 
    loading, 
    error, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    addFundsToGoal,
    refreshGoals: loadGoals
  };
}