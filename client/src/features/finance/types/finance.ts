export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: 'gear' | 'maintenance' | 'event' | 'nutrition' | 'other';
  amount: number; // IDR
  date: string;
  description: string | null;
  bike_id: string | null;
  component_id: string | null;
  event_id: string | null;
  activity_id: string | null;
  payment_method: string | null;
  merchant: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: 'gear' | 'maintenance' | 'event' | 'nutrition' | 'total' | 'other';
  amount: number; // IDR
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  byCategory: Record<string, number>;
}

export interface TransactionFormData {
  type: Transaction['type'];
  category: Transaction['category'];
  amount: number;
  date: string;
  description?: string | null;
  payment_method?: string | null;
  merchant?: string | null;
}

export interface BudgetFormData {
  category: Budget['category'];
  amount: number;
  period: Budget['period'];
  start_date: string;
  end_date?: string | null;
}
