'use client';

import { useState, useEffect } from 'react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuth(true);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-16 h-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">SmartExpense</h1>
            <p className="text-white/80 text-lg">AI-Powered Expense Tracking</p>
          </div>
          <AuthDialog 
            open={showAuth} 
            onOpenChangeAction={setShowAuth}
            onLoginAction={login}
            onRegisterAction={register}
          />
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogoutAction={logout} />;
}