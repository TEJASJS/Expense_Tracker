export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Car Purchase',
  'Home Down Payment',
  'Education',
  'Investment',
  'Debt Payoff',
  'Other'
];