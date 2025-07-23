'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/goal';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Add some demo goals
      const demoGoals: Goal[] = [
        {
          id: '1',
          userId: 'demo',
          name: 'Emergency Fund',
          description: 'Build an emergency fund for unexpected expenses',
          targetAmount: 5000,
          currentAmount: 1500,
          deadline: '2024-12-31',
          category: 'Emergency Fund',
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'demo',
          name: 'Summer Vacation',
          description: 'Save for a trip to Europe',
          targetAmount: 3000,
          currentAmount: 800,
          deadline: '2024-06-01',
          category: 'Vacation',
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setGoals(demoGoals);
      localStorage.setItem('goals', JSON.stringify(demoGoals));
    }
  }, []);

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('goals', JSON.stringify(newGoals));
  };

  const addGoal = (goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      userId: 'current-user',
      name: goalData.name || '',
      description: goalData.description || '',
      targetAmount: goalData.targetAmount || 0,
      currentAmount: goalData.currentAmount || 0,
      deadline: goalData.deadline || '',
      category: goalData.category || 'Other',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal =>
      goal.id === id
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    saveGoals(updatedGoals);
  };

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal
  };
}