'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

type User = {
  id: string;
  email: string;
  full_name: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedToken) {
      // Verify token and fetch user data
      const verifyToken = async () => {
        try {
          const response = await authApi.getMe(storedToken);
          if (response.data) {
            setUser(response.data);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('auth_token');
        } finally {
          setIsLoading(false);
        }
      };

      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response.data?.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        
        // Fetch user data
        const userResponse = await authApi.getMe(response.data.access_token);
        if (userResponse.data) {
          setUser(userResponse.data);
          setToken(response.data.access_token);
          router.push('/');
        }
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password, fullName);
      
      if (!response.error) {
        // Auto-login after registration
        await login(email, password);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
