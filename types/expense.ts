export type PaymentMode = 'Credit Card' | 'Debit Card' | 'UPI' | 'Cash';
export type TransactionType = 'expense' | 'income' | 'donation' | 'lent';

export interface SplitDetail {
  person: string; // 'Self' or person's name
  amount: number;
  paymentReceived?: boolean;
  paymentReceivedDate?: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paymentMode: PaymentMode;
  forWhom: string; // 'self' or person's name (for expenses) / person's name (for income) / 'Split' for split transactions
  date: Date;
  transactionType?: TransactionType; // 'expense' or 'income', defaults to 'expense' for backward compatibility
  paymentReceived?: boolean; // true if payment was received from the person (only for expenses)
  paymentReceivedDate?: Date;
  isSplit?: boolean; // true if this is a split transaction
  splitDetails?: SplitDetail[]; // Array of split details when isSplit is true
}

