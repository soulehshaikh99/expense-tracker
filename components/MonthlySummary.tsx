'use client';

import { Expense, PaymentMode } from '@/types/expense';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface MonthlySummaryProps {
  expenses: Expense[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export default function MonthlySummary({ expenses, currentMonth, onMonthChange }: MonthlySummaryProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthExpenses = expenses.filter((expense) =>
    isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
  );

  const selfExpenses = monthExpenses.filter((e) => e.forWhom === 'Self');
  const otherExpenses = monthExpenses.filter((e) => e.forWhom !== 'Self');
  const receivedExpenses = otherExpenses.filter((e) => e.paymentReceived);
  const pendingExpenses = otherExpenses.filter((e) => !e.paymentReceived);

  const totalSpentByMe = selfExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentForOthers = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = receivedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  const paymentModeTotals: Record<PaymentMode, number> = {
    'Credit Card': 0,
    'Debit Card': 0,
    UPI: 0,
    Cash: 0,
  };

  monthExpenses.forEach((expense) => {
    paymentModeTotals[expense.paymentMode] += expense.amount;
  });

  const netAmount = totalSpentByMe + totalPending;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4 sm:top-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
        {format(currentMonth, 'MMMM yyyy')} Summary
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Spent by Me</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-900">₹{totalSpentByMe.toFixed(2)}</div>
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Spent for Others</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-900">₹{totalSpentForOthers.toFixed(2)}</div>
          <div className="mt-2 text-xs text-gray-600">
            <div>Received: ₹{totalReceived.toFixed(2)}</div>
            <div>Pending: ₹{totalPending.toFixed(2)}</div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Net Amount (Me + Pending)</div>
          <div className="text-xl sm:text-2xl font-bold text-green-900">₹{netAmount.toFixed(2)}</div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">By Payment Mode</h3>
          <div className="space-y-2">
            {Object.entries(paymentModeTotals).map(([mode, amount]) => (
              <div key={mode} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{mode}</span>
                <span className="text-sm font-semibold text-gray-900">₹{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-semibold text-gray-900">{monthExpenses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Self Expenses</span>
              <span className="font-semibold text-gray-900">{selfExpenses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Other Expenses</span>
              <span className="font-semibold text-gray-900">{otherExpenses.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

