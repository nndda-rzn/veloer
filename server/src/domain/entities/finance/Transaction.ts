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
  /** The maintenance log that produced this cost, when it came from one. */
  maintenance_log_id: string | null;
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

/** A budget compared against the expense recorded in its active window. */
export interface BudgetStatus {
  category: Budget['category'];
  /** IDR limit for the period. */
  budgetAmount: number;
  /** IDR expense recorded in the period. */
  spent: number;
  /** `spent / budgetAmount * 100`, one decimal; 0 when the limit is 0. */
  percentage: number;
}
