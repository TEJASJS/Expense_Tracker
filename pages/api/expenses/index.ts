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
        const expenses = await db.getExpenses(userId);
        const formattedExpenses = expenses.map(exp => ({
          id: exp.id,
          userId: exp.user_id,
          amount: parseFloat(exp.amount.toString()),
          category: exp.category,
          description: exp.description,
          date: exp.date,
          person: exp.person,
          walletId: exp.wallet_id,
          tags: exp.tags || [],
          isRecurring: exp.is_recurring,
          recurringType: exp.recurring_type,
          nextDue: exp.next_due,
          receiptUrl: exp.receipt_url,
          createdAt: exp.created_at,
          updatedAt: exp.updated_at
        }));
        res.status(200).json(formattedExpenses);
        break;

      case 'POST':
        const expenseData = req.body;
        const expenseToCreate = {
          user_id: userId,
          amount: expenseData.amount || 0,
          category: expenseData.category || '',
          description: expenseData.description || '',
          date: expenseData.date || new Date().toISOString().split('T')[0],
          person: expenseData.person || 'Self',
          wallet_id: expenseData.walletId,
          tags: expenseData.tags || [],
          is_recurring: expenseData.isRecurring || false,
          recurring_type: expenseData.recurringType,
          next_due: expenseData.nextDue,
          receipt_url: expenseData.receiptUrl
        };

        const dbExpense = await db.createExpense(expenseToCreate);
        const newExpense = {
          id: dbExpense.id,
          userId: dbExpense.user_id,
          amount: parseFloat(dbExpense.amount.toString()),
          category: dbExpense.category,
          description: dbExpense.description,
          date: dbExpense.date,
          person: dbExpense.person,
          walletId: dbExpense.wallet_id,
          tags: dbExpense.tags || [],
          isRecurring: dbExpense.is_recurring,
          recurringType: dbExpense.recurring_type,
          nextDue: dbExpense.next_due,
          receiptUrl: dbExpense.receipt_url,
          createdAt: dbExpense.created_at,
          updatedAt: dbExpense.updated_at
        };

        res.status(201).json(newExpense);
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Expenses API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}