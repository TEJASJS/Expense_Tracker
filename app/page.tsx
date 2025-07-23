'use client';

import { useState, useEffect } from 'react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading, login, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuth(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SmartExpense</h1>
            <p className="text-white/80">AI-Powered Expense Tracking</p>
          </div>
          <AuthDialog 
            open={showAuth} 
            onOpenChange={setShowAuth}
            onLogin={login}
          />
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={logout} />;
}