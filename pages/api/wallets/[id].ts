import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Wallet ID is required' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        const updates = req.body;
        const dbUpdates: any = {};
        
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.sharedWith !== undefined) dbUpdates.shared_with = updates.sharedWith;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        await db.updateWallet(id, dbUpdates);
        res.status(200).json({ success: true });
        break;

      case 'DELETE':
        await db.deleteWallet(id);
        res.status(200).json({ success: true });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}