import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const wallets = await db.getWallets(userId);
        const formattedWallets = wallets.map(wallet => ({
          id: wallet.id,
          name: wallet.name,
          ownerId: wallet.owner_id,
          sharedWith: wallet.shared_with || [],
          type: wallet.type,
          balance: parseFloat(wallet.balance.toString()),
          currency: wallet.currency,
          description: wallet.description,
          createdAt: wallet.created_at,
          updatedAt: wallet.updated_at
        }));
        res.status(200).json(formattedWallets);
        break;

      case 'POST':
        const walletData = req.body;
        const walletToCreate = {
          name: walletData.name || 'New Wallet',
          owner_id: userId,
          shared_with: walletData.sharedWith || [],
          type: walletData.type || 'personal',
          balance: walletData.balance || 0,
          currency: walletData.currency || 'USD',
          description: walletData.description
        };

        const dbWallet = await db.createWallet(walletToCreate);
        const newWallet = {
          id: dbWallet.id,
          name: dbWallet.name,
          ownerId: dbWallet.owner_id,
          sharedWith: dbWallet.shared_with || [],
          type: dbWallet.type,
          balance: parseFloat(dbWallet.balance.toString()),
          currency: dbWallet.currency,
          description: dbWallet.description,
          createdAt: dbWallet.created_at,
          updatedAt: dbWallet.updated_at
        };

        res.status(201).json(newWallet);
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wallets API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}