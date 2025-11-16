'use client';

import { Expense } from '@/types/expense';
import { Budget } from '@/types/budget';
import { format, startOfMonth } from 'date-fns';
import { formatNumber, getMonthsWithData, groupExpensesByMonth } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from 'next/image';

interface MonthlyTrendChartProps {
  expenses: Expense[];
  budgets: Budget[];
}

interface MonthlyData {
  month: string;
  monthKey: string;
  totalSpentByMe: number;
  netAmount: number;
  budget: number | null;
  totalSpentForOthers: number;
  totalReceived: number;
  totalPending: number;
}

export default function MonthlyTrendChart({ expenses, budgets }: MonthlyTrendChartProps) {
  // Get unique months with data
  const monthsWithData = getMonthsWithData(expenses);
  
  // Only show chart if there's data for 2+ months
  if (monthsWithData.length < 2) {
    const monthsNeeded = 2 - monthsWithData.length;
    const hasOneMonth = monthsWithData.length === 1;
    const progress = (monthsWithData.length / 2) * 100;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Spending Trends
        </h2>
        
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <img 
            src="/icons/empty-chart-state.svg" 
            alt="" 
            className="w-24 h-24 sm:w-36 sm:h-36 mx-auto mb-4" 
            aria-hidden="true"
          />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            {monthsWithData.length === 0 
              ? "Start tracking to see trends"
              : "Almost there!"}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md text-center">
            {monthsWithData.length === 0
              ? "Track expenses for 2 or more months to visualize your spending trends and patterns over time."
              : `You've tracked ${monthsWithData.length} month${monthsWithData.length > 1 ? 's' : ''}. Track ${monthsNeeded} more month${monthsNeeded > 1 ? 's' : ''} to unlock spending trends.`}
          </p>
          
          {hasOneMonth && (
            <div className="w-full max-w-xs mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Progress</span>
                <span>{monthsWithData.length} of 2 months</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group expenses by month
  const groupedExpenses = groupExpensesByMonth(expenses);
  
  // Create a map of budgets by month
  const budgetsByMonth = new Map<string, Budget>();
  budgets.forEach((budget) => {
    const monthKey = `${budget.month.getFullYear()}-${String(budget.month.getMonth() + 1).padStart(2, '0')}`;
    budgetsByMonth.set(monthKey, budget);
  });

  // Calculate monthly statistics
  const monthlyData: MonthlyData[] = monthsWithData.map((monthKey) => {
    const monthExpenses = groupedExpenses.get(monthKey) || [];
    
    const selfExpenses = monthExpenses.filter((e) => e.forWhom === 'Self');
    const otherExpenses = monthExpenses.filter((e) => e.forWhom !== 'Self');
    const receivedExpenses = otherExpenses.filter((e) => e.paymentReceived);
    const pendingExpenses = otherExpenses.filter((e) => !e.paymentReceived);

    const totalSpentByMe = selfExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSpentForOthers = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalReceived = receivedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netAmount = totalSpentByMe + totalPending;

    const budget = budgetsByMonth.get(monthKey);
    const budgetAmount = budget ? budget.amount : null;

    // Format month for display (e.g., "Jan 2024")
    const [year, month] = monthKey.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthDisplay = format(monthDate, 'MMM yyyy');

    return {
      month: monthDisplay,
      monthKey,
      totalSpentByMe,
      netAmount,
      budget: budgetAmount,
      totalSpentForOthers,
      totalReceived,
      totalPending,
    };
  });

  // Check if we have budgets for multiple months
  const hasMultipleBudgets = budgetsByMonth.size >= 2;

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">₹{formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Spending Trends</h2>
      
      {/* Primary Chart: Monthly Spending Trend */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3">Monthly Spending Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="totalSpentByMe" 
              name="Spent by Me" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="netAmount" 
              name="Net Amount (Me + Pending)" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {hasMultipleBudgets && (
              <Line 
                type="monotone" 
                dataKey="budget" 
                name="Budget" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary Chart: Budget vs Actual (if budgets exist) */}
      {hasMultipleBudgets && (
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3">Budget vs Actual Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Bar 
                dataKey="budget" 
                name="Budget" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="netAmount" 
                name="Actual Spending" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

