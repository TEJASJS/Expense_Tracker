'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet } from '@/types/wallet';

interface AddWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (wallet: Omit<Wallet, 'id'>) => void;
  initialData?: Wallet | null;
}

export function AddWalletDialog({ open, onOpenChange, onSave, initialData }: AddWalletDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'personal' | 'shared' | 'family'>('personal');
  const [balance, setBalance] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setBalance(initialData.balance);
      setCurrency(initialData.currency);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setType('personal');
      setBalance('');
      setCurrency('USD');
      setDescription('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (name && balance !== '') {
      const newWallet: Omit<Wallet, 'id'> = {
        name,
        ownerId: 'current-user', // This should be replaced with the actual user ID
        sharedWith: [],
        type,
        balance: Number(balance),
        currency,
        description: description || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(newWallet);
      onOpenChange(false);
    }
  };

  const walletTypes = [
    { value: 'personal', label: 'Personal' },
    { value: 'shared', label: 'Shared' },
    { value: 'family', label: 'Family' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'JPY', label: 'JPY (¥)' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Wallet' : 'Add New Wallet'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Wallet"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => setType(value as any)} value={type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select wallet type" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              Balance
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              Currency
            </Label>
            <Select onValueChange={setCurrency} value={currency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Add Wallet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}