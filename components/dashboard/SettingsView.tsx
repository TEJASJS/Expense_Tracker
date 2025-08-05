'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useExpenses } from '@/hooks/useExpenses';
import { User } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onLogoutAction: () => void;
  onDeleteAccountAction: () => void;
}

export function SettingsView({ user, onLogoutAction, onDeleteAccountAction }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { expenses } = useExpenses();

  const handleExportData = () => {
    const headers = ['ID', 'Date', 'Amount', 'Category', 'Description', 'Wallet ID'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(e => 
        [
          e.id,
          e.date,
          e.amount,
          e.category,
          `"${e.description.replace(/"/g, '""')}"`,
          e.walletId
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'smart-expense-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prevent hydration mismatch by only showing the UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium">Email</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
          <Button variant="outline" onClick={onLogoutAction}>Logout</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <Switch 
              id="dark-mode" 
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch id="notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="budget-alerts">Budget Alerts</Label>
            <Switch id="budget-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={handleExportData}>Export Data</Button>
                    <Button variant="destructive" onClick={onDeleteAccountAction}>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}