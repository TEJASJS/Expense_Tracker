'use client';

import { useState, useEffect } from 'react';
import { Wallet } from '@/types/wallet';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    } else {
      // Add some demo wallets
      const demoWallets: Wallet[] = [
        {
          id: '1',
          name: 'Personal Wallet',
          ownerId: 'demo',
          sharedWith: [],
          type: 'personal',
          balance: 1500.00,
          currency: 'USD',
          description: 'My personal expenses',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Family Budget',
          ownerId: 'demo',
          sharedWith: ['family-member-1'],
          type: 'family',
          balance: 2300.00,
          currency: 'USD',
          description: 'Shared family expenses',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setWallets(demoWallets);
      localStorage.setItem('wallets', JSON.stringify(demoWallets));
    }
  }, []);

  const saveWallets = (newWallets: Wallet[]) => {
    setWallets(newWallets);
    localStorage.setItem('wallets', JSON.stringify(newWallets));
  };

  const addWallet = (walletData: Partial<Wallet>) => {
    const newWallet: Wallet = {
      id: Date.now().toString(),
      name: walletData.name || '',
      ownerId: 'current-user',
      sharedWith: walletData.sharedWith || [],
      type: walletData.type || 'personal',
      balance: walletData.balance || 0,
      currency: walletData.currency || 'USD',
      description: walletData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedWallets = [...wallets, newWallet];
    saveWallets(updatedWallets);
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    const updatedWallets = wallets.map(wallet =>
      wallet.id === id
        ? { ...wallet, ...updates, updatedAt: new Date().toISOString() }
        : wallet
    );
    saveWallets(updatedWallets);
  };

  const deleteWallet = (id: string) => {
    const updatedWallets = wallets.filter(wallet => wallet.id !== id);
    saveWallets(updatedWallets);
  };

  return {
    wallets,
    addWallet,
    updateWallet,
    deleteWallet
  };
}