'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/contexts/AuthContext';
import { Expense } from '@/types/expense';
import { Budget } from '@/types/budget';
import { ViewType } from './Dashboard';
import {
  BarChart3,
  CreditCard,
  Target,
  Wallet,
  Settings,
  Receipt,
  TrendingUp,
  AlertTriangle,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChangeAction: (view: ViewType) => void;
  onLogoutAction: () => void;
  user: User;
  expenses: Expense[];
  budgets: Budget[];
  totalSpent: number;
  className?: string;
}

export function Sidebar({ 
  currentView, 
  onViewChangeAction, 
  onLogoutAction, 
  user, 
  expenses, 
  budgets,
  totalSpent,
  className = '' 
}: SidebarProps) {
  // Calculate this month's expenses
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
  });
  
  const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Check budget violations
  const budgetViolations = budgets.filter(budget => {
    const categoryExpenses = thisMonthExpenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return categoryExpenses > budget.amount;
  }).length;

  const menuItems = [
    {
      id: 'expenses' as ViewType,
      label: 'Expenses',
      icon: Receipt,
      badge: expenses.length.toString()
    },
    {
      id: 'analytics' as ViewType,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'budgets' as ViewType,
      label: 'Budgets',
      icon: Target,
      badge: budgetViolations > 0 ? budgetViolations.toString() : null,
      badgeVariant: 'destructive' as const
    },
    {
      id: 'goals' as ViewType,
      label: 'Goals',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'wallets' as ViewType,
      label: 'Wallets',
      icon: Wallet,
      badge: null
    },
    {
      id: 'settings' as ViewType,
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">This Month</span>
            {budgetViolations > 0 && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalThisMonth.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {thisMonthExpenses.length} transactions this month
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-left mb-1 ${currentView === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => onViewChangeAction(item.id)}
            >
              <item.icon className={`h-5 w-5 mr-3 ${currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'secondary'} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          onClick={onLogoutAction}
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
          Logout
        </Button>
      </div>
    </div>
  );
}