'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { format, startOfMonth } from 'date-fns';
import { Pencil, Trash2, Plus, Filter, Search, Eye } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ShimmerLoader from './ShimmerLoader';
import ColumnVisibilityModal from './ColumnVisibilityModal';
import { ColumnId, ColumnVisibility, loadColumnVisibility, saveColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/types/columnVisibility';

interface ExpenseListProps {
  expenses: Expense[];
  allExpenses: Expense[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onMarkPaymentReceived: (id: string, received: boolean) => void;
  onOpenFilterModal: () => void;
  onOpenAddModal: () => void;
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  totalExpensesCount?: number;
  onClearFilters?: () => void;
}

function ExpenseListSkeleton({ columnVisibility }: { columnVisibility: ColumnVisibility }) {
  const headerContent = (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-0">
        <ShimmerLoader width="150px" height="28px" className="sm:h-8" />
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <ShimmerLoader width="32px" height="32px" rounded="md" />
          <ShimmerLoader width="32px" height="32px" rounded="md" />
          <ShimmerLoader width="80px" height="32px" className="sm:w-32" rounded="md" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {headerContent}
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '640px' }}>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columnVisibility.date && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              )}
              {columnVisibility.title && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
              )}
              {columnVisibility.amount && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              )}
              {columnVisibility.paymentMode && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Payment Mode
                </th>
              )}
              {columnVisibility.forWhom && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  For/From Whom
                </th>
              )}
              {columnVisibility.paymentStatus && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Payment Status
                </th>
              )}
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(6)].map((_, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columnVisibility.date && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <ShimmerLoader width="90px" height="16px" className="sm:h-5" />
                  </td>
                )}
                {columnVisibility.title && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <ShimmerLoader width="120px" height="16px" className="sm:h-5 sm:w-40" />
                  </td>
                )}
                {columnVisibility.amount && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <ShimmerLoader width="70px" height="16px" className="sm:h-5" />
                  </td>
                )}
                {columnVisibility.paymentMode && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden md:table-cell">
                    <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
                  </td>
                )}
                {columnVisibility.forWhom && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <ShimmerLoader width="50px" height="20px" className="sm:h-6 sm:w-16" rounded="full" />
                  </td>
                )}
                {columnVisibility.paymentStatus && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden lg:table-cell">
                    <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
                  </td>
                )}
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
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex justify-between items-center">
          <ShimmerLoader width="100px" height="16px" className="sm:h-5" />
          <ShimmerLoader width="80px" height="20px" className="sm:h-6 sm:w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses, allExpenses, currentMonth, onMonthChange, onEdit, onDelete, onMarkPaymentReceived, onOpenFilterModal, onOpenAddModal, isLoading = false, hasActiveFilters = false, totalExpensesCount = 0, onClearFilters }: ExpenseListProps) {
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  useEffect(() => {
    setColumnVisibility(loadColumnVisibility());
  }, []);

  const handleVisibilityChange = (visibility: ColumnVisibility) => {
    setColumnVisibility(visibility);
    saveColumnVisibility(visibility);
  };

  if (isLoading) {
    return <ExpenseListSkeleton columnVisibility={columnVisibility} />;
  }

  // Get unique months from expenses
  const getAvailableMonths = () => {
    const monthSet = new Set<string>();
    const now = new Date();
    const currentMonthKey = format(startOfMonth(now), 'yyyy-MM');
    monthSet.add(currentMonthKey);

    // Add months that have expenses
    allExpenses.forEach((expense) => {
      const monthKey = format(startOfMonth(expense.date), 'yyyy-MM');
      monthSet.add(monthKey);
    });

    // Convert to array and sort descending (most recent first)
    const months = Array.from(monthSet)
      .map((key) => {
        const [year, month] = key.split('-').map(Number);
        return new Date(year, month - 1, 1);
      })
      .sort((a, b) => b.getTime() - a.getTime());

    return months;
  };

  const availableMonths = getAvailableMonths();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = new Date(e.target.value);
    onMonthChange(selectedDate);
  };

  const headerContent = (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="relative flex-shrink-0">
          <select
            value={format(startOfMonth(currentMonth), 'yyyy-MM')}
            onChange={handleMonthChange}
            className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md outline-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors px-2 sm:px-3 py-1.5 sm:py-2 pr-8 sm:pr-10 appearance-none"
            aria-label="Select month"
          >
            {availableMonths.map((month) => (
              <option key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                {format(month, 'MMMM yyyy')}
              </option>
            ))}
          </select>
          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onOpenFilterModal}
            className="flex items-center justify-center bg-gray-600 dark:bg-gray-700 text-white p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            aria-label="Filters"
            title="Filters"
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="flex items-center justify-center bg-gray-600 dark:bg-gray-700 text-white p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            aria-label="Column Visibility"
            title="Column Visibility"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.25 sm:gap-1.5 bg-blue-600 text-white px-2.5 sm:px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
            aria-label="Add"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (expenses.length === 0) {
    const hasFilters = hasActiveFilters ?? false;
    const hasAnyExpenses = (totalExpensesCount ?? 0) > 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {headerContent}
        <div className="py-12 sm:py-16 px-4 text-center">
          {hasFilters && hasAnyExpenses ? (
            <>
              <Search 
                className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4" 
                aria-hidden="true"
              />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No expenses match your filters
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your filters or select a different month to see more expenses.
              </p>
              {onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </>
          ) : (
            <>
              <img 
                src="/icons/empty-expenses-state.svg" 
                alt="" 
                className="w-24 h-24 sm:w-36 sm:h-36 mx-auto mb-4" 
                aria-hidden="true"
              />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No expenses yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start tracking your expenses by adding your first expense entry.
              </p>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Plus size={18} />
                <span>Add Your First Expense</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {headerContent}
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '640px' }}>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columnVisibility.date && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              )}
              {columnVisibility.title && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
              )}
              {columnVisibility.amount && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              )}
              {columnVisibility.paymentMode && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Payment Mode
                </th>
              )}
              {columnVisibility.forWhom && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  For/From Whom
                </th>
              )}
              {columnVisibility.paymentStatus && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Payment Status
                </th>
              )}
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columnVisibility.date && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {format(expense.date, 'MMM dd, yyyy')}
                  </td>
                )}
                {columnVisibility.title && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100 max-w-[120px] sm:max-w-none truncate sm:truncate-none">
                    {expense.title}
                  </td>
                )}
                {columnVisibility.amount && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ₹{formatNumber(expense.amount)}
                  </td>
                )}
                {columnVisibility.paymentMode && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {expense.paymentMode}
                  </td>
                )}
                {columnVisibility.forWhom && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {expense.forWhom === 'Self' ? (
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Self
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {expense.forWhom}
                      </span>
                    )}
                    {(expense.transactionType || 'expense') === 'income' && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        Income
                      </span>
                    )}
                    {expense.transactionType === 'donation' && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                        Donation
                      </span>
                    )}
                    {expense.transactionType === 'lent' && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                        Money Lent
                      </span>
                    )}
                  </td>
                )}
                {columnVisibility.paymentStatus && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                    {((expense.transactionType || 'expense') === 'expense' || expense.transactionType === 'donation' || expense.transactionType === 'lent') && expense.forWhom !== 'Self' ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={expense.paymentReceived || false}
                          onChange={(e) => onMarkPaymentReceived(expense.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {expense.paymentReceived ? 'Received' : 'Pending'}
                        </span>
                      </label>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                )}
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 focus:outline-none p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
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
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total:</span>
          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{formatNumber(
              expenses.filter((e) => (e.transactionType || 'expense') === 'expense').reduce((sum, e) => sum + e.amount, 0) +
              expenses.filter((e) => e.transactionType === 'lent').reduce((sum, e) => sum + e.amount, 0) -
              expenses.filter((e) => e.transactionType === 'income').reduce((sum, e) => sum + e.amount, 0)
              // Donations are excluded from totals, lent is included like expenses
            )}
          </span>
        </div>
      </div>

      <ColumnVisibilityModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columnVisibility={columnVisibility}
        onVisibilityChange={handleVisibilityChange}
      />
    </div>
  );
}

