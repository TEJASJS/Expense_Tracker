export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  person: string;
  walletId?: string;
  tags: string[];
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  nextDue?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  expenseId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDue: string;
  isActive: boolean;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Business',
  'Personal Care',
  'Home & Garden',
  'Gifts & Donations',
  'Other'
];

export const PEOPLE_OPTIONS = [
  'Self',
  'Family',
  'Friends',
  'Colleagues',
  'Other'
];