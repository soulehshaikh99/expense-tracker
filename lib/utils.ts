import { Expense } from '@/types/expense';

/**
 * Format a number with commas and fixed decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Remove .00 at the end if present
  return formatted.replace(/\.00$/, '');
}

/**
 * Get unique months from expenses
 * @param expenses - Array of expenses
 * @returns Array of month keys in format "YYYY-MM"
 */
export function getMonthsWithData(expenses: { date: Date }[]): string[] {
  const monthSet = new Set<string>();
  expenses.forEach((expense) => {
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(monthKey);
  });
  return Array.from(monthSet).sort();
}

/**
 * Group expenses by month
 * @param expenses - Array of expenses
 * @returns Map of month keys to expenses
 */
export function groupExpensesByMonth(expenses: Expense[]): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();
  expenses.forEach((expense) => {
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(expense);
  });
  return grouped;
}

