'use client';

import { useState, useEffect } from 'react';
import { Wallet } from '@/types/wallet';
import { v4 as uuidv4 } from 'uuid';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    if (typeof window !== 'undefined') {
      const savedWallets = localStorage.getItem('wallets');
      return savedWallets ? JSON.parse(savedWallets) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallets', JSON.stringify(wallets));
    }
  }, [wallets]);

  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    const newWallet = { ...wallet, id: uuidv4() };
    setWallets((prevWallets) => [...prevWallets, newWallet]);
  };

  const updateWallet = (updatedWallet: Wallet) => {
    setWallets((prevWallets) =>
      prevWallets.map((wallet) =>
        wallet.id === updatedWallet.id ? updatedWallet : wallet
      )
    );
  };

  const deleteWallet = (id: string) => {
    setWallets((prevWallets) => prevWallets.filter((wallet) => wallet.id !== id));
  };

  return {
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
  };
}