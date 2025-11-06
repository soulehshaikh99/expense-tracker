export type PaymentMode = 'Credit Card' | 'Debit Card' | 'UPI' | 'Cash';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paymentMode: PaymentMode;
  forWhom: string; // 'self' or person's name
  date: Date;
  paymentReceived?: boolean; // true if payment was received from the person
  paymentReceivedDate?: Date;
}

