'use client';

import { Expense, PaymentMode } from '@/types/expense';
import { Budget } from '@/types/budget';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatNumber } from '@/lib/utils';

interface MonthlySummaryProps {
  expenses: Expense[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  budget: Budget | null;
  onSetBudget: () => void;
}

export default function MonthlySummary({ expenses, currentMonth, onMonthChange, budget, onSetBudget }: MonthlySummaryProps) {
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

  // Budget calculations
  const budgetAmount = budget?.amount || null;
  const actualSpending = netAmount;
  const remainingBudget = budgetAmount !== null ? budgetAmount - actualSpending : null;
  const budgetPercentage = budgetAmount !== null && budgetAmount > 0 
    ? (actualSpending / budgetAmount) * 100
    : null;
  const budgetPercentageForBar = budgetPercentage !== null ? Math.min(budgetPercentage, 100) : null;
  
  // Determine color based on budget percentage
  const getBudgetColor = () => {
    if (budgetPercentage === null) return 'gray';
    if (budgetPercentage < 80) return 'green';
    if (budgetPercentage < 100) return 'yellow';
    return 'red';
  };

  const budgetColor = getBudgetColor();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4 sm:top-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')} Summary
        </h2>
        <button
          onClick={onSetBudget}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {budget ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Budget Section */}
        {budgetAmount !== null ? (
          <div className={`p-3 sm:p-4 rounded-lg ${
            budgetColor === 'green' ? 'bg-green-50' :
            budgetColor === 'yellow' ? 'bg-yellow-50' :
            budgetColor === 'red' ? 'bg-red-50' :
            'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs sm:text-sm text-gray-600">Monthly Budget</div>
              <div className={`text-lg sm:text-xl font-bold ${
                budgetColor === 'green' ? 'text-green-900' :
                budgetColor === 'yellow' ? 'text-yellow-900' :
                budgetColor === 'red' ? 'text-red-900' :
                'text-gray-900'
              }`}>
                ₹{formatNumber(budgetAmount)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-2">
              <div
                className={`h-2.5 sm:h-3 rounded-full transition-all ${
                  budgetColor === 'green' ? 'bg-green-600' :
                  budgetColor === 'yellow' ? 'bg-yellow-500' :
                  budgetColor === 'red' ? 'bg-red-600' :
                  'bg-gray-400'
                }`}
                style={{ width: `${budgetPercentageForBar || 0}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600">
                Spent: ₹{formatNumber(actualSpending)}
                {budgetPercentage !== null && (
                  <span className="ml-1">({budgetPercentage.toFixed(1)}%)</span>
                )}
              </span>
              {remainingBudget !== null && (
                <span className={`font-semibold text-right ${
                  remainingBudget >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {remainingBudget >= 0 
                    ? `Remaining: ₹${formatNumber(remainingBudget)}`
                    : `Over by: ₹${formatNumber(Math.abs(remainingBudget))}`
                  }
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">No budget set for this month</div>
            <button
              onClick={onSetBudget}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Set Budget
            </button>
          </div>
        )}
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Spent by Me</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-900">₹{formatNumber(totalSpentByMe)}</div>
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Spent for Others</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-900">₹{formatNumber(totalSpentForOthers)}</div>
          <div className="mt-2 text-xs text-gray-600">
            <div>Received: ₹{formatNumber(totalReceived)}</div>
            <div>Pending: ₹{formatNumber(totalPending)}</div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Net Amount (Me + Pending)</div>
          <div className="text-xl sm:text-2xl font-bold text-green-900">₹{formatNumber(netAmount)}</div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">By Payment Mode</h3>
          <div className="space-y-2">
            {Object.entries(paymentModeTotals).map(([mode, amount]) => (
              <div key={mode} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{mode}</span>
                <span className="text-sm font-semibold text-gray-900">₹{formatNumber(amount)}</span>
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

