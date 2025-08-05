'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
import { User } from '@/contexts/AuthContext';

import { Wallet } from '@/types/wallet';
import { Button } from '@/components/ui/button';
import { Plus, Menu, X, Bell } from 'lucide-react';
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
  const { goals, addGoal, updateGoal, deleteGoal, addFundsToGoal } = useGoals();
      const { wallets, addWallet, deleteWallet, addBalanceToWallet } = useWallets();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const refreshWallets = async () => {
    // This is a placeholder for any wallet refresh logic
    // The actual implementation would depend on your API structure
  };

  const handleUpdateBudget = async (budget: Budget) => {
    await updateBudget(budget.id, budget);
  };

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
            onAddBalanceAction={addBalanceToWallet}
            onDeleteAction={handleDeleteWallet}
            onAddAction={addWallet}
          />
        );
            case 'settings':
        return <SettingsView user={user} onLogoutAction={onLogoutAction} onDeleteAccountAction={() => setShowDeleteConfirm(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white shadow-md border-gray-200 dark:bg-gray-800"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out 
          fixed inset-y-0 left-0 z-40 w-64 lg:static lg:w-72 lg:min-h-screen`}
      >
        <Sidebar
          currentView={currentView}
          onViewChangeAction={(view) => {
            setCurrentView(view);
            setSidebarOpen(false);
          }}
          onLogoutAction={onLogoutAction}
          user={user}
          expenses={expenses}
          budgets={budgets}
          totalSpent={totalSpent}
          className="h-full shadow-lg"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {currentView === 'expenses' ? 'My Expenses' : currentView}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            {currentView === 'expenses' && (
              <Button
                onClick={() => setShowAddExpenseDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderCurrentView()}
          </div>
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                // TODO: Implement backend account deletion
                console.log(`Deleting account for user: ${user.id}`);
                toast.success('Account deleted successfully.');
                onLogoutAction();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}