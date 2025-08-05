export interface Budget {
  isActive?: boolean;
  id: string;
  userId: string;

  category: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  message: string;
  type: 'warning' | 'exceeded';
  triggeredAt: string;
  isRead: boolean;
}