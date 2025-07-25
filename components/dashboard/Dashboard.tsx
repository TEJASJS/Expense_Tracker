'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ExpensesList } from './ExpensesList';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AnalyticsView } from './AnalyticsView';
import { BudgetsView } from './BudgetsView';
import { GoalsView } from './GoalsView';
import { WalletsView } from './WalletsView';
import { SettingsView } from './SettingsView';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';
import { useBudgets } from '@/hooks/useBudgets';
import { Budget } from '@/types/budget';
import { useGoals } from '@/hooks/useGoals';
import { useWallets } from '@/hooks/useWallets';
import { Goal } from '@/types/goal';
import { User } from '@/hooks/useAuth';

import { Wallet } from '@/types/wallet';
import { Button } from '@/components/ui/button';
import { Plus, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import client components with no SSR to avoid hydration issues
const DynamicExpensesList = dynamic(
  () => import('./ExpensesList').then(mod => mod.ExpensesList),
  { ssr: false }
);

const DynamicBudgetsView = dynamic(
  () => import('./BudgetsView').then(mod => mod.BudgetsView),
  { ssr: false }
);

const DynamicGoalsView = dynamic(
  () => import('./GoalsView').then(mod => mod.GoalsView),
  { ssr: false }
);

const DynamicWalletsView = dynamic(
  () => import('./WalletsView').then(mod => mod.WalletsView),
  { ssr: false }
);

interface DashboardProps {
  user: User;
  onLogoutAction: () => void;
}

export type ViewType = 'expenses' | 'analytics' | 'budgets' | 'goals' | 'wallets' | 'settings';

export function Dashboard({ user, onLogoutAction }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('expenses');
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget, checkBudgetLimits } = useBudgets();
  
  // Create a wrapper function to handle the type mismatch for updateBudget
  const handleUpdateBudget = (budget: Budget) => {
    const { id, ...updates } = budget;
    return updateBudget(id, updates);
  };
  const { goals, addGoal, updateGoal, deleteGoal, addFundsToGoal } = useGoals();
    const { wallets, addWallet, addBalanceToWallet, deleteWallet, refreshWallets } = useWallets();

  // Calculate total spending for the current month
  const totalSpent = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  


  const handleDeleteWallet = async (id: string) => {
    await deleteWallet(id);
  };

  // Check budget limits when expenses change
  useEffect(() => {
    const checkBudgetViolations = async () => {
      const violations = await checkBudgetLimits(expenses);
      violations.forEach(violation => {
        toast.warning(`Budget Alert: You've exceeded your ${violation.category} budget by ₹${violation.amount.toFixed(2)}`);
      });
    };
    
    checkBudgetViolations();
  }, [expenses]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddExpenseDialog(true);
  };

  const handleSaveExpense = async (expenseData: Partial<Expense>) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
      toast.success('Expense updated successfully!');
    } else {
      await addExpense(expenseData as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Expense added successfully!');
    }
    await refreshWallets();
    setEditingExpense(null);
    setShowAddExpenseDialog(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingExpense(null);
    }
    setShowAddExpenseDialog(open);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'expenses':
        const handleDeleteExpense = async (id: string) => {
          await deleteExpense(id);
          await refreshWallets();
        };
        return (
          <DynamicExpensesList
            expenses={expenses}
            onEditAction={handleEdit}
            onDeleteAction={handleDeleteExpense}
          />
        );
      case 'analytics':
        return <AnalyticsView expenses={expenses} />;
      case 'budgets':
        return (
          <DynamicBudgetsView
            budgets={budgets}
            expenses={expenses}
            onAddBudgetAction={addBudget}
            onUpdateBudgetAction={handleUpdateBudget}
            onDeleteBudgetAction={deleteBudget}
          />
        );
                  case 'goals':
        return (
          <DynamicGoalsView
            goals={goals}
            wallets={wallets}
            expenses={expenses}
            onAddGoalAction={async (goalData) => {
              await addGoal(goalData);
            }}
            onUpdateGoalAction={async (goal: Goal) => {
              const { id, ...updates } = goal;
              await updateGoal(id, updates);
            }}
            onDeleteGoalAction={deleteGoal}
            onAddFundsAction={async (goalId, amount, walletId) => {
              await addFundsToGoal(goalId, amount, walletId);
              await refreshWallets();
            }}
          />
        );
      case 'wallets':
        return (
          <DynamicWalletsView
            wallets={wallets}
            onAddAction={addWallet}
            onAddBalanceAction={addBalanceToWallet}
            onDeleteAction={handleDeleteWallet}
          />
        );
      case 'settings':
        return <SettingsView user={user} onLogoutAction={onLogoutAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          currentView={currentView}
          onViewChangeAction={(view: ViewType) => {
            setCurrentView(view);
            setSidebarOpen(false);
          }}
          onLogoutAction={onLogoutAction}
          className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex`}
          user={user}
          expenses={expenses}
          budgets={budgets}
          totalSpent={totalSpent}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
                        <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {currentView === 'expenses' ? 'My Expenses' : currentView}
            </h1>
          </div>
          
          {currentView === 'expenses' && (
            <Button
              onClick={() => setShowAddExpenseDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderCurrentView()}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpenseDialog}
        onOpenChangeAction={handleDialogChange}
        onAdd={handleSaveExpense}
        editExpense={editingExpense}
        wallets={wallets}
      />
    </div>
  );
}