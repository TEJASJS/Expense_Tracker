'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, WalletType, WalletApiResponse } from '@/types/wallet';
import { walletsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';



interface UseWalletsReturn {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  addWallet: (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Wallet>;
  addBalanceToWallet: (id: string, amount: number) => Promise<Wallet>;
  deleteWallet: (id: string) => Promise<void>;
  refreshWallets: () => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated, user } = useAuth();
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('Auth state in useWallets:', { isAuthenticated, token: token ? 'Token exists' : 'No token' });
  }, [isAuthenticated, token]);

  const loadWallets = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletsApi.getWallets(token);
      
      if (response.data) {
        // Transform the API response to match the Wallet type
        const formattedWallets = (response.data as WalletApiResponse[]).map(wallet => ({
          id: wallet.id.toString(),
          name: wallet.name,
          type: wallet.type as WalletType,
          balance: wallet.balance,
          currency: wallet.currency,
          description: wallet.description || '',
          createdAt: wallet.created_at,
          updatedAt: wallet.updated_at || wallet.created_at,
          ownerId: wallet.owner_id.toString(),
          sharedWith: wallet.shared_with.map(id => id.toString())
        }));
        
        setWallets(formattedWallets);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error loading wallets:', err);
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('addWallet called with:', { walletData, hasToken: !!token, isAuthenticated });
    
    if (!token) {
      const errorMsg = 'Authentication required. Please log in to create a wallet.';
      console.error(errorMsg, { 
        isAuthenticated, 
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorMsg);
    }
    
    try {
      console.log('Creating wallet with token:', token.substring(0, 10) + '...');
      
      // Get user ID from auth context
      if (!user?.id) {
        throw new Error('User information not found. Please log in again.');
      }
      const walletPayload = {
        name: walletData.name,
        type: walletData.type || 'personal',
        description: walletData.description,
        currency: walletData.currency || 'USD',
        balance: walletData.balance || 0,
        shared_with: walletData.sharedWith || []
      };
      console.log('Sending wallet payload:', walletPayload);
      
      const response = await walletsApi.createWallet(walletPayload, token);

      if (response?.data) {
        const apiWallet = response.data as WalletApiResponse;
        const newWallet: Wallet = {
          id: apiWallet.id.toString(),
          name: apiWallet.name,
          type: apiWallet.type as WalletType,
          balance: apiWallet.balance,
          currency: apiWallet.currency,
          description: apiWallet.description || '',
          ownerId: apiWallet.owner_id.toString(),
          sharedWith: apiWallet.shared_with.map(id => id.toString()),
          createdAt: apiWallet.created_at,
          updatedAt: apiWallet.updated_at || apiWallet.created_at
        };
        
        setWallets(prev => [...prev, newWallet]);
        return newWallet;
      } else {
        throw new Error(response.error || 'Failed to add wallet');
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  };

  const addBalanceToWallet = async (id: string, amount: number): Promise<Wallet> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const response = await walletsApi.addBalanceToWallet(id, amount, token);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const updatedWalletData = response.data as WalletApiResponse;
      const updatedWallet: Wallet = {
        id: updatedWalletData.id.toString(),
        name: updatedWalletData.name,
        type: updatedWalletData.type as WalletType,
        balance: updatedWalletData.balance,
        currency: updatedWalletData.currency,
        description: updatedWalletData.description || '',
        ownerId: updatedWalletData.owner_id.toString(),
        sharedWith: updatedWalletData.shared_with.map(id => id.toString()),
        createdAt: updatedWalletData.created_at,
        updatedAt: updatedWalletData.updated_at || updatedWalletData.created_at,
      };

      setWallets(prev =>
        prev.map(wallet =>
          wallet.id === id ? updatedWallet : wallet
        )
      );

      return updatedWallet;
    } catch (error) {
      console.error('[useWallets] Error in addBalanceToWallet:', error);
      throw error;
    }
  };

  const deleteWallet = async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const response = await walletsApi.deleteWallet(id, token);
      
      if (!response.error) {
        setWallets(prev => prev.filter(wallet => wallet.id !== id));
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  };

  return {
    wallets,
    loading,
    error,
    addWallet,
    addBalanceToWallet,
    deleteWallet,
    refreshWallets: loadWallets,
  };
}