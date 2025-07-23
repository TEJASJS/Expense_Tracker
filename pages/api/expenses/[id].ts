import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Expense ID is required' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        const updates = req.body;
        const dbUpdates: any = {};
        
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.person !== undefined) dbUpdates.person = updates.person;
        if (updates.walletId !== undefined) dbUpdates.wallet_id = updates.walletId;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
        if (updates.recurringType !== undefined) dbUpdates.recurring_type = updates.recurringType;
        if (updates.nextDue !== undefined) dbUpdates.next_due = updates.nextDue;
        if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

        await db.updateExpense(id, dbUpdates);
        res.status(200).json({ success: true });
        break;

      case 'DELETE':
        await db.deleteExpense(id);
        res.status(200).json({ success: true });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Expense API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}