'use client';

import { useState } from 'react';
import { Expense, PaymentMode, TransactionType } from '@/types/expense';
import { Budget } from '@/types/budget';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatNumber } from '@/lib/utils';
import ShimmerLoader from './ShimmerLoader';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MonthlySummaryProps {
  expenses: Expense[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  budget: Budget | null;
  onSetBudget: () => void;
  onMarkPaymentReceived?: (id: string, received: boolean) => void;
  isLoading?: boolean;
}

function MonthlySummarySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-4 sm:top-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <ShimmerLoader width="180px" height="28px" className="sm:h-8" />
        <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Budget Section Skeleton */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <ShimmerLoader width="100px" height="14px" className="sm:h-4" />
            <ShimmerLoader width="80px" height="20px" className="sm:h-6 sm:w-32" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 sm:h-3 mb-2">
            <ShimmerLoader width="60%" height="100%" rounded="full" />
          </div>
          <div className="flex justify-between items-center">
            <ShimmerLoader width="120px" height="14px" className="sm:h-4" />
            <ShimmerLoader width="100px" height="14px" className="sm:h-4" />
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <ShimmerLoader width="120px" height="14px" className="sm:h-4 mb-1" />
          <ShimmerLoader width="100px" height="24px" className="sm:h-8 sm:w-40 mt-2" />
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <ShimmerLoader width="110px" height="14px" className="sm:h-4 mb-1" />
          <ShimmerLoader width="100px" height="24px" className="sm:h-8 sm:w-40 mt-2" />
          <div className="mt-2 space-y-1">
            <ShimmerLoader width="80px" height="12px" className="sm:h-3" />
            <ShimmerLoader width="80px" height="12px" className="sm:h-3" />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <ShimmerLoader width="160px" height="14px" className="sm:h-4 mb-1" />
          <ShimmerLoader width="100px" height="24px" className="sm:h-8 sm:w-40 mt-2" />
        </div>

        {/* Money to Collect Section Skeleton */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <ShimmerLoader width="140px" height="16px" className="sm:h-5 mb-3" />
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <ShimmerLoader width="16px" height="16px" />
                      <div className="flex-1">
                        <ShimmerLoader width="100px" height="14px" className="sm:h-4 mb-1" />
                        <ShimmerLoader width="80px" height="12px" className="sm:h-3" />
                      </div>
                    </div>
                    <ShimmerLoader width="80px" height="16px" className="sm:h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MonthlySummary({ expenses, currentMonth, onMonthChange, budget, onSetBudget, onMarkPaymentReceived, isLoading = false }: MonthlySummaryProps) {
  const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());
  if (isLoading) {
    return <MonthlySummarySkeleton />;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthExpenses = expenses.filter((expense) =>
    isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
  );

  // Separate expenses, income, donations, and lent transactions
  const expenseTransactions = monthExpenses.filter((e) => (e.transactionType || 'expense') === 'expense');
  const incomeTransactions = monthExpenses.filter((e) => e.transactionType === 'income');
  const donationTransactions = monthExpenses.filter((e) => e.transactionType === 'donation');
  const lentTransactions = monthExpenses.filter((e) => e.transactionType === 'lent');
  const totalDonations = donationTransactions.reduce((sum, e) => sum + e.amount, 0);

  const selfExpenses = expenseTransactions.filter((e) => e.forWhom === 'Self');
  const otherExpenses = expenseTransactions.filter((e) => e.forWhom !== 'Self');
  const receivedExpenses = otherExpenses.filter((e) => e.paymentReceived);
  const pendingExpenses = otherExpenses.filter((e) => !e.paymentReceived);

  const totalSpentByMe = selfExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentForOthers = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = receivedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomeTransactions.reduce((sum, e) => sum + e.amount, 0);

  // Calculate lent transaction totals
  const totalLent = lentTransactions.reduce((sum, e) => sum + e.amount, 0);
  const receivedLent = lentTransactions.filter((e) => e.paymentReceived).reduce((sum, e) => sum + e.amount, 0);
  const pendingLent = lentTransactions.filter((e) => !e.paymentReceived).reduce((sum, e) => sum + e.amount, 0);

  // Calculate money to collect from each person with transaction details
  // Combine pending expenses, donations, and lent transactions
  const pendingTransactionsByPerson: Record<string, Expense[]> = {};
  
  // Add pending expenses (expenses for others that haven't been paid)
  pendingExpenses.forEach((expense) => {
    const person = expense.forWhom;
    if (!pendingTransactionsByPerson[person]) {
      pendingTransactionsByPerson[person] = [];
    }
    pendingTransactionsByPerson[person].push(expense);
  });
  
  // Add pending donations (donations for others that haven't been paid)
  const pendingDonations = donationTransactions.filter((e) => e.forWhom !== 'Self' && !e.paymentReceived);
  pendingDonations.forEach((expense) => {
    const person = expense.forWhom;
    if (!pendingTransactionsByPerson[person]) {
      pendingTransactionsByPerson[person] = [];
    }
    pendingTransactionsByPerson[person].push(expense);
  });
  
  // Add pending lent transactions
  const pendingLentTransactions = lentTransactions.filter((e) => !e.paymentReceived);
  pendingLentTransactions.forEach((expense) => {
    const person = expense.forWhom;
    if (!pendingTransactionsByPerson[person]) {
      pendingTransactionsByPerson[person] = [];
    }
    pendingTransactionsByPerson[person].push(expense);
  });
  
  // Calculate totals and sort by amount (descending)
  const moneyToCollect = Object.entries(pendingTransactionsByPerson)
    .map(([person, transactions]) => ({
      person,
      amount: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions: transactions.sort((a, b) => b.date.getTime() - a.date.getTime()), // Sort by date, newest first
      count: transactions.length,
    }))
    .sort((a, b) => b.amount - a.amount);

  const togglePerson = (person: string) => {
    setExpandedPersons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(person)) {
        newSet.delete(person);
      } else {
        newSet.add(person);
      }
      return newSet;
    });
  };

  const getTransactionTypeLabel = (type?: TransactionType): string => {
    switch (type) {
      case 'expense': return 'Expense';
      case 'donation': return 'Donation';
      case 'lent': return 'Lent';
      default: return 'Expense';
    }
  };

  const getTransactionTypeColor = (type?: TransactionType): string => {
    switch (type) {
      case 'expense': return 'text-blue-600 dark:text-blue-400';
      case 'donation': return 'text-pink-600 dark:text-pink-400';
      case 'lent': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Net amount = expenses + pending + lent pending - income (income reduces net spending)
  const netAmount = totalSpentByMe + totalPending + pendingLent - totalIncome;

  // Budget calculations
  const budgetAmount = budget?.amount || null;
  const actualSpending = netAmount;
  const remainingBudget = budgetAmount !== null ? budgetAmount - actualSpending : null;
  const budgetPercentage = budgetAmount !== null && budgetAmount > 0 
    ? (actualSpending / budgetAmount) * 100
    : null;
  const budgetPercentageForBar = budgetPercentage !== null ? Math.min(budgetPercentage, 100) : null;
  
  // Determine color based on budget percentage
  // Green: < 80% (safe zone)
  // Yellow/Warning: >= 80% and < 100% (warning zone)
  // Red: >= 100% (exceeded budget)
  const getBudgetColor = () => {
    if (budgetPercentage === null) return 'gray';
    if (budgetPercentage >= 100) return 'red';
    if (budgetPercentage >= 80) return 'yellow';
    return 'green';
  };

  const budgetColor = getBudgetColor();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-4 sm:top-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {format(currentMonth, 'MMMM yyyy')} Summary
        </h2>
        <button
          onClick={onSetBudget}
          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          {budget ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Budget Section */}
        {budgetAmount !== null ? (
          <div className={`p-3 sm:p-4 rounded-lg ${
            budgetColor === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
            budgetColor === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
            budgetColor === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
            'bg-gray-50 dark:bg-gray-700'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Budget</div>
              <div className={`text-lg sm:text-xl font-bold ${
                budgetColor === 'green' ? 'text-green-900 dark:text-green-300' :
                budgetColor === 'yellow' ? 'text-yellow-900 dark:text-yellow-300' :
                budgetColor === 'red' ? 'text-red-900 dark:text-red-300' :
                'text-gray-900 dark:text-gray-100'
              }`}>
                ₹{formatNumber(budgetAmount)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 sm:h-3 mb-2">
              <div
                className={`h-2.5 sm:h-3 rounded-full transition-all ${
                  budgetColor === 'green' ? 'bg-green-600 dark:bg-green-500' :
                  budgetColor === 'yellow' ? 'bg-yellow-500 dark:bg-yellow-400' :
                  budgetColor === 'red' ? 'bg-red-600 dark:bg-red-500' :
                  'bg-gray-400 dark:bg-gray-500'
                }`}
                style={{ width: `${budgetPercentageForBar || 0}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Spent: ₹{formatNumber(actualSpending)}
                {budgetPercentage !== null && (
                  <span className="ml-1">({budgetPercentage.toFixed(1)}%)</span>
                )}
              </span>
              {remainingBudget !== null && (
                <span className={`font-semibold text-right ${
                  remainingBudget < 0 ? 'text-red-700 dark:text-red-400' :
                  budgetColor === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                  'text-green-700 dark:text-green-400'
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
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">No budget set for this month</div>
            <button
              onClick={onSetBudget}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Set Budget
            </button>
          </div>
        )}
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent by Me</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300">₹{formatNumber(totalSpentByMe)}</div>
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Spent for Others</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-300">₹{formatNumber(totalSpentForOthers)}</div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Received: ₹{formatNumber(totalReceived)}</div>
            <div>Pending: ₹{formatNumber(totalPending)}</div>
          </div>
        </div>

        {incomeTransactions.length > 0 && (
          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Money Received</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-300">₹{formatNumber(totalIncome)}</div>
          </div>
        )}

        {donationTransactions.length > 0 && totalDonations > 0 && (
          <div className="p-3 sm:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Donated</div>
            <div className="text-xl sm:text-2xl font-bold text-pink-900 dark:text-pink-300">₹{formatNumber(totalDonations)}</div>
          </div>
        )}

        {lentTransactions.length > 0 && totalLent > 0 && (
          <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Money Lent</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-300">₹{formatNumber(totalLent)}</div>
            {totalLent > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div>Received: ₹{formatNumber(receivedLent)}</div>
                <div>Pending: ₹{formatNumber(pendingLent)}</div>
              </div>
            )}
          </div>
        )}

        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Net Amount (Me + Pending + Lent Pending - Income)</div>
          <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-300">₹{formatNumber(netAmount)}</div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Money to Collect</h3>
          {moneyToCollect.length > 0 ? (
            <div className="space-y-3">
              {moneyToCollect.map(({ person, amount, transactions, count }) => {
                const isExpanded = expandedPersons.has(person);
                return (
                  <div key={person} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Person Header */}
                    <div
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => togglePerson(person)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {person === 'Self' ? 'Self' : person}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {count} {count === 1 ? 'transaction' : 'transactions'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ₹{formatNumber(amount)}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    {isExpanded && (
                      <div className="p-3 bg-white dark:bg-gray-800 space-y-2 border-t border-gray-200 dark:border-gray-700">
                        {transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-start justify-between gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium ${getTransactionTypeColor(transaction.transactionType)}`}>
                                  {getTransactionTypeLabel(transaction.transactionType)}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(transaction.date, 'MMM dd, yyyy')}
                                </span>
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate">
                                {transaction.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {transaction.paymentMode}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  ₹{formatNumber(transaction.amount)}
                                </div>
                              </div>
                              {onMarkPaymentReceived && (
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={transaction.paymentReceived || false}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onMarkPaymentReceived(transaction.id, e.target.checked);
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">No pending payments</div>
          )}
        </div>

      </div>
    </div>
  );
}

