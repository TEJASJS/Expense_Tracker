'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/hooks/useAuth';
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
  AlertTriangle
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
    return categoryExpenses > budget.monthlyLimit;
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
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">This Month</span>
            {budgetViolations > 0 && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{totalSpent.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {thisMonthExpenses.length} transactions this month
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onViewChangeAction(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={item.badgeVariant || "secondary"}
                  className="ml-2"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          &copy; 2024 SmartExpense
        </div>
      </div>
    </div>
  );
}