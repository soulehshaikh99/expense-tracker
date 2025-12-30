export type PaymentMode = 'Credit Card' | 'Debit Card' | 'UPI' | 'Cash';
export type TransactionType = 'expense' | 'income' | 'donation' | 'lent';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paymentMode: PaymentMode;
  forWhom: string; // 'self' or person's name (for expenses) / person's name (for income)
  date: Date;
  transactionType?: TransactionType; // 'expense' or 'income', defaults to 'expense' for backward compatibility
  paymentReceived?: boolean; // true if payment was received from the person (only for expenses)
  paymentReceivedDate?: Date;
}

