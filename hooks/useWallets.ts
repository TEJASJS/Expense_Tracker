'use client';

import { useState, useEffect } from 'react';
import { Wallet } from '@/types/wallet';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const response = await fetch(`/api/wallets?userId=${user.id}`);
        if (response.ok) {
          const wallets = await response.json();
          setWallets(wallets);
        }
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) throw new Error('User not authenticated');

      const response = await fetch(`/api/wallets?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        throw new Error('Failed to add wallet');
      }

      const newWallet = await response.json();
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    try {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update wallet');
      }
      
      setWallets(prev => prev.map(wallet =>
        wallet.id === id
          ? { ...wallet, ...updates, updatedAt: new Date().toISOString() }
          : wallet
      ));
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete wallet');
      }

      setWallets(prev => prev.filter(wallet => wallet.id !== id));
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  };

  return {
    wallets,
    loading,
    addWallet,
    updateWallet,
    deleteWallet
  };
}
// Update addWallet in useWallets hook
const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) throw new Error('User not authenticated');

    const response = await fetch(`/api/wallets?userId=${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      throw new Error('Failed to add wallet');
    }

    const newWallet = await response.json();
    // Only update state after API call succeeds
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
};// Update addWallet in useWallets hook
const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) throw new Error('User not authenticated');

    const response = await fetch(`/api/wallets?userId=${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      throw new Error('Failed to add wallet');
    }

    const newWallet = await response.json();
    // Only update state after API call succeeds
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
};// Update addWallet in useWallets hook
const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) throw new Error('User not authenticated');

    const response = await fetch(`/api/wallets?userId=${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      throw new Error('Failed to add wallet');
    }

    const newWallet = await response.json();
    // Only update state after API call succeeds
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
};// Update addWallet in useWallets hook
const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) throw new Error('User not authenticated');

    const response = await fetch(`/api/wallets?userId=${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      throw new Error('Failed to add wallet');
    }

    const newWallet = await response.json();
    // Only update state after API call succeeds
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
};// Update addWallet in useWallets hook
const addWallet = async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) throw new Error('User not authenticated');

    const response = await fetch(`/api/wallets?userId=${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      throw new Error('Failed to add wallet');
    }

    const newWallet = await response.json();
    // Only update state after API call succeeds
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
};
// Add this function to the useWallets hook

const migrateLocalWallets = async () => {
  try {
    // Check if we've already migrated
    const migrated = localStorage.getItem('wallets_migrated');
    if (migrated === 'true') return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    // Get wallets from local storage
    const localWallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    if (localWallets.length === 0) {
      // No wallets to migrate
      localStorage.setItem('wallets_migrated', 'true');
      return;
    }

    // Migrate each wallet to the database
    for (const wallet of localWallets) {
      const walletData = {
        name: wallet.name,
        ownerId: user.id,
        sharedWith: wallet.sharedWith || [],
        type: wallet.type || 'personal',
        balance: wallet.balance || 0,
        currency: wallet.currency || 'USD',
        description: wallet.description
      };

      await addWallet(walletData);
    }

    // Mark as migrated
    localStorage.setItem('wallets_migrated', 'true');
    // Clear local wallets
    localStorage.removeItem('wallets');
  } catch (error) {
    console.error('Error migrating wallets:', error);
  }
};

// Call this function in the useEffect
useEffect(() => {
  loadWallets().then(() => {
    migrateLocalWallets();
  });
}, []);