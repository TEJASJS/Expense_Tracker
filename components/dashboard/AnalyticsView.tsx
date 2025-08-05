'use client';

import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface AnalyticsViewProps {
  expenses: Expense[];
}

export function AnalyticsView({ expenses }: AnalyticsViewProps) {
  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(expense => {
    if (expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] += expense.amount;
    } else {
      expensesByCategory[expense.category] = expense.amount;
    }
  });

  // Prepare data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Get current month expenses
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
  });

  // Get last month expenses
  const lastMonthDate = subMonths(today, 1);
  const lastMonthStart = startOfMonth(lastMonthDate);
  const lastMonthEnd = endOfMonth(lastMonthDate);
  
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
  });

  // Calculate daily expenses for current month
  const daysInCurrentMonth = eachDayOfInterval({
    start: currentMonthStart,
    end: currentMonthEnd,
  });

  const dailyExpensesCurrentMonth = daysInCurrentMonth.map(day => {
    const dayExpenses = currentMonthExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isSameDay(expenseDate, day);
    });
    
    const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      date: format(day, 'MMM dd'),
      amount: total,
    };
  });

  // Calculate monthly trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(today, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: format(monthDate, 'MMM yy'),
      amount: total,
    };
  }).reverse();

  // Sort categories by amount for display list
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">{expenses.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{currentMonthExpenses.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card dashboard-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{lastMonthExpenses.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="daily">Daily Trend</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="category" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Breakdown of your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4 overflow-auto max-h-80">
                  {sortedCategories.map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{category}</span>
                      <span className="font-semibold">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Daily Expenses</CardTitle>
              <CardDescription>Your spending pattern for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyExpensesCurrentMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Your spending over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}