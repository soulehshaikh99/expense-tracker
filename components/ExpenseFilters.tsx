'use client';

import { useEffect } from 'react';
import { PaymentMode, TransactionType } from '@/types/expense';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { X } from 'lucide-react';

interface ExpenseFiltersProps {
  selectedPaymentMode: PaymentMode | 'All';
  selectedForWhom: string;
  selectedTransactionType: TransactionType | 'All';
  forWhomOptions: string[];
  currentMonth: Date;
  onPaymentModeChange: (mode: PaymentMode | 'All') => void;
  onForWhomChange: (forWhom: string) => void;
  onTransactionTypeChange: (type: TransactionType | 'All') => void;
  onMonthChange: (month: Date) => void;
  isOpen: boolean;
  onClose: () => void;
}

const paymentModes: PaymentMode[] = ['Credit Card', 'Debit Card', 'UPI', 'Cash'];

export default function ExpenseFilters({
  selectedPaymentMode,
  selectedForWhom,
  selectedTransactionType,
  forWhomOptions,
  currentMonth,
  onPaymentModeChange,
  onForWhomChange,
  onTransactionTypeChange,
  onMonthChange,
  isOpen,
  onClose,
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-2 sm:m-0">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pr-2">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
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
          <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            id="transactionType"
            value={selectedTransactionType}
            onChange={(e) => onTransactionTypeChange(e.target.value as TransactionType | 'All')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
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
            For/From Whom
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
      </div>
    </div>
  );
}

