'use client';

import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { Pencil, Trash2, Plus, Filter } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ShimmerLoader from './ShimmerLoader';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onMarkPaymentReceived: (id: string, received: boolean) => void;
  onOpenFilterModal: () => void;
  onOpenAddModal: () => void;
  isLoading?: boolean;
}

function ExpenseListSkeleton() {
  const headerContent = (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-0">
        <ShimmerLoader width="120px" height="28px" className="sm:h-8" />
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <ShimmerLoader width="60px" height="32px" className="sm:w-24" rounded="md" />
          <ShimmerLoader width="80px" height="32px" className="sm:w-32" rounded="md" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {headerContent}
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '640px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Payment Mode
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                For Whom
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Payment Status
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(6)].map((_, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <ShimmerLoader width="90px" height="16px" className="sm:h-5" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <ShimmerLoader width="120px" height="16px" className="sm:h-5 sm:w-40" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <ShimmerLoader width="70px" height="16px" className="sm:h-5" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden md:table-cell">
                  <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <ShimmerLoader width="50px" height="20px" className="sm:h-6 sm:w-16" rounded="full" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden lg:table-cell">
                  <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <ShimmerLoader width="16px" height="16px" rounded="sm" />
                    <ShimmerLoader width="16px" height="16px" rounded="sm" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <ShimmerLoader width="100px" height="16px" className="sm:h-5" />
          <ShimmerLoader width="80px" height="20px" className="sm:h-6 sm:w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses, onEdit, onDelete, onMarkPaymentReceived, onOpenFilterModal, onOpenAddModal, isLoading = false }: ExpenseListProps) {
  if (isLoading) {
    return <ExpenseListSkeleton />;
  }

  const headerContent = (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex-shrink-0">Expenses</h2>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onOpenFilterModal}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gray-600 text-white px-2.5 sm:px-3.5 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
            aria-label="Filters"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.25 sm:gap-1.5 bg-blue-600 text-white px-2.5 sm:px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
            aria-label="Add Expense"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {headerContent}
        <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
          <p>No expenses found for the selected filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {headerContent}
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '640px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Payment Mode
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                For Whom
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Payment Status
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  {format(expense.date, 'MMM dd, yyyy')}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none truncate sm:truncate-none">
                  {expense.title}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                  ₹{formatNumber(expense.amount)}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                  {expense.paymentMode}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {expense.forWhom === 'Self' ? (
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Self
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.forWhom}
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                  {expense.forWhom !== 'Self' ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={expense.paymentReceived || false}
                        onChange={(e) => onMarkPaymentReceived(expense.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        {expense.paymentReceived ? 'Received' : 'Pending'}
                      </span>
                    </label>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Edit"
                      aria-label="Edit expense"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this expense?')) {
                          onDelete(expense.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 focus:outline-none p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Total Expenses:</span>
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            ₹{formatNumber(expenses.reduce((sum, e) => sum + e.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

