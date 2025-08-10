export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
};

export type Category = {
  name: string;
  type: 'income' | 'expense';
};
