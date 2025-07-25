'use client';

import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsViewProps {
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2'];

export function AnalyticsView({ expenses }: AnalyticsViewProps) {
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by category for PieChart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array for Recharts PieChart
  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Group expenses by day for the current month for BarChart
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const expensesByDay = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((acc, expense) => {
      const day = new Date(expense.date).getDate();
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

  // Create data for all days of the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const barChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      name: `Day ${day}`,
      total: expensesByDay[day] || 0,
      day,
    };
  });

  // Sort categories by amount for display list
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Total expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4 mt-4">
            {sortedCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="font-medium">{category}</div>
                <div className="font-semibold">₹{amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} 
                labelStyle={{ color: '#f9fafb' }} 
                formatter={(value: number, name: string, props: any) => [`₹${value.toFixed(2)}`, `Day ${props.payload.day}`]}
              />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}