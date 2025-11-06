'use client';

import { PaymentMode } from '@/types/expense';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseFiltersProps {
  selectedPaymentMode: PaymentMode | 'All';
  selectedForWhom: string;
  forWhomOptions: string[];
  currentMonth: Date;
  onPaymentModeChange: (mode: PaymentMode | 'All') => void;
  onForWhomChange: (forWhom: string) => void;
  onMonthChange: (month: Date) => void;
}

const paymentModes: PaymentMode[] = ['Credit Card', 'Debit Card', 'UPI', 'Cash'];

export default function ExpenseFilters({
  selectedPaymentMode,
  selectedForWhom,
  forWhomOptions,
  currentMonth,
  onPaymentModeChange,
  onForWhomChange,
  onMonthChange,
}: ExpenseFiltersProps) {
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onMonthChange(date);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
            >
              ←
            </button>
            <input
              type="month"
              id="month"
              value={format(currentMonth, 'yyyy-MM')}
              onChange={handleMonthChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
            >
              →
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Mode
          </label>
          <select
            id="paymentMode"
            value={selectedPaymentMode}
            onChange={(e) => onPaymentModeChange(e.target.value as PaymentMode | 'All')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="forWhom" className="block text-sm font-medium text-gray-700 mb-2">
            For Whom
          </label>
          <select
            id="forWhom"
            value={selectedForWhom}
            onChange={(e) => onForWhomChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {forWhomOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'self' ? 'Self' : option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

