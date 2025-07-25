export type WalletType = 'personal' | 'shared' | 'business';

export interface WalletBase {
  id: string | number;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  description?: string;
  created_at?: string | null;
  updated_at?: string | null;
  owner_id?: string;
  ownerId?: string;
  shared_with?: string[];
  sharedWith?: string[];
}

export interface Wallet extends Omit<WalletBase, 'owner_id' | 'shared_with' | 'created_at' | 'updated_at'> {
  id: string;
  ownerId: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string | null;  // Can be null if never updated
}

export interface WalletApiResponse extends Omit<WalletBase, 'ownerId' | 'sharedWith'> {
  id: string;
  owner_id: string;
  shared_with: string[];
  created_at: string;
  updated_at: string | null;
}

export interface WalletMember {
  id: string;
  walletId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}