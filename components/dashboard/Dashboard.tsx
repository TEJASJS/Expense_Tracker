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
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useWallets } from '@/hooks/useWallets';
import { User } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export type ViewType = 'expenses' | 'analytics' | 'budgets' | 'goals' | 'wallets' | 'settings';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget, checkBudgetLimits } = useBudgets();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { wallets, addWallet, updateWallet, deleteWallet } = useWallets();

  // Check budget limits when expenses change
  useEffect(() => {
    const violations = checkBudgetLimits(expenses);
    violations.forEach(violation => {
      toast.warning(`Budget Alert: You've exceeded your ${violation.category} budget by $${violation.amount.toFixed(2)}`);
    });
  }, [expenses, checkBudgetLimits]);

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setShowAddExpense(false);
    toast.success('Expense added successfully!');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'expenses':
        return (
          <ExpensesList
            expenses={expenses}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
            wallets={wallets}
          />
        );
      case 'analytics':
        return <AnalyticsView expenses={expenses} />;
      case 'budgets':
        return (
          <BudgetsView
            budgets={budgets}
            expenses={expenses}
            onAddBudget={addBudget}
            onUpdateBudget={updateBudget}
            onDeleteBudget={deleteBudget}
          />
        );
      case 'goals':
        return (
          <GoalsView
            goals={goals}
            expenses={expenses}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
          />
        );
      case 'wallets':
        return (
          <WalletsView
            wallets={wallets}
            expenses={expenses}
            onAdd={addWallet}
            onUpdate={updateWallet}
            onDelete={deleteWallet}
          />
        );
      case 'settings':
        return <SettingsView user={user} onLogout={onLogout} />;
      default:
        return <ExpensesList expenses={expenses} onUpdate={updateExpense} onDelete={deleteExpense} wallets={wallets} />;
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
          onViewChange={(view) => {
            setCurrentView(view);
            setSidebarOpen(false);
          }}
          user={user}
          expenses={expenses}
          budgets={budgets}
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
              onClick={() => setShowAddExpense(true)}
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
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onAdd={handleAddExpense}
        wallets={wallets}
      />
    </div>
  );
}