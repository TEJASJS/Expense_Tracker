export interface Wallet {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
  type: 'personal' | 'shared' | 'family';
  balance: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletMember {
  id: string;
  walletId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}