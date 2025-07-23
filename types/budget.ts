export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
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