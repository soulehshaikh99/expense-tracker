'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, PaymentMode, TransactionType } from '@/types/expense';
import { Budget } from '@/types/budget';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseFilters from '@/components/ExpenseFilters';
import MonthlySummary from '@/components/MonthlySummary';
import BudgetForm from '@/components/BudgetForm';
import ThemeToggle from '@/components/ThemeToggle';
// import FirebaseStatus from '@/components/FirebaseStatus';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode[] | 'All'>('All');
  const [selectedForWhom, setSelectedForWhom] = useState<string[] | 'All'>('All');
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType[] | 'All'>('All');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  useEffect(() => {
    applyFilters();
    updateCurrentBudget();
  }, [expenses, selectedPaymentMode, selectedForWhom, selectedTransactionType, currentMonth, budgets]);

  const fetchExpenses = async () => {
    try {
      setIsLoadingExpenses(true);
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const expensesData: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push({
          id: doc.id,
          title: data.title,
          amount: data.amount,
          paymentMode: data.paymentMode,
          forWhom: data.forWhom,
          date: data.date.toDate(),
          transactionType: data.transactionType || 'expense', // Default to 'expense' for backward compatibility
          paymentReceived: data.paymentReceived || false,
          paymentReceivedDate: data.paymentReceivedDate ? data.paymentReceivedDate.toDate() : undefined,
        });
      });
      setExpenses(expensesData);
    } catch (error: any) {
      console.error('❌ Error fetching expenses:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to fetch expenses. ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check Firestore security rules in Firebase Console.';
      } else if (error.code === 'failed-precondition') {
        errorMessage += 'Firestore index required. Check the console for a link to create it.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Firestore is unavailable. Please check if Firestore is enabled in Firebase Console.';
      } else if (error.message?.includes('400')) {
        errorMessage += 'Bad Request (400). This usually means:\n' +
          '1. Firestore is not enabled in Firebase Console\n' +
          '2. Firestore is in Datastore mode instead of Native mode\n' +
          '3. Security rules are blocking access\n\n' +
          'Please go to Firebase Console → Firestore Database → Create database (Native mode) → Set security rules';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Filter by current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    filtered = filtered.filter((expense) =>
      isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
    );

    // Filter by transaction type
    if (selectedTransactionType !== 'All') {
      filtered = filtered.filter((expense) => 
        selectedTransactionType.includes(expense.transactionType || 'expense')
      );
    }

    // Filter by payment mode
    if (selectedPaymentMode !== 'All') {
      filtered = filtered.filter((expense) => selectedPaymentMode.includes(expense.paymentMode));
    }

    // Filter by for whom
    if (selectedForWhom !== 'All') {
      filtered = filtered.filter((expense) => selectedForWhom.includes(expense.forWhom));
    }

    setFilteredExpenses(filtered);
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const expensePayload = {
        title: expenseData.title,
        amount: expenseData.amount,
        paymentMode: expenseData.paymentMode,
        forWhom: expenseData.forWhom,
        date: Timestamp.fromDate(expenseData.date),
        transactionType: expenseData.transactionType || 'expense',
        paymentReceived: expenseData.paymentReceived || false,
        paymentReceivedDate: expenseData.paymentReceivedDate
          ? Timestamp.fromDate(expenseData.paymentReceivedDate)
          : null,
      };
      
      await addDoc(collection(db, 'expenses'), expensePayload);
      fetchExpenses();
    } catch (error: any) {
      console.error('❌ Error adding expense:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to add expense. ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check Firestore security rules in Firebase Console.\n\n' +
          'Go to: Firebase Console → Firestore Database → Rules → Allow read/write';
      } else if (error.message?.includes('400') || error.code === 'invalid-argument') {
        errorMessage += 'Bad Request (400). This usually means:\n\n' +
          '1. Firestore is NOT enabled in Firebase Console\n' +
          '   → Go to Firebase Console → Firestore Database → Create database\n\n' +
          '2. Firestore is in Datastore mode instead of Native mode\n' +
          '   → You need to create a NEW database in Native mode\n\n' +
          '3. Security rules are blocking access\n' +
          '   → Go to Rules tab and set: allow read, write: if true;\n\n' +
          'Please check these steps and try again.';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: Omit<Expense, 'id'>) => {
    try {
      const expenseRef = doc(db, 'expenses', id);
      await updateDoc(expenseRef, {
        ...expenseData,
        date: Timestamp.fromDate(expenseData.date),
        transactionType: expenseData.transactionType || 'expense',
        paymentReceivedDate: expenseData.paymentReceivedDate
          ? Timestamp.fromDate(expenseData.paymentReceivedDate)
          : null,
      });
      fetchExpenses();
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleOpenModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedPaymentMode('All');
    setSelectedForWhom('All');
    setSelectedTransactionType('All');
    setCurrentMonth(new Date());
    setIsFilterModalOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedPaymentMode !== 'All' || 
                          selectedForWhom !== 'All' ||
                          selectedTransactionType !== 'All' ||
                          (currentMonth.getMonth() !== new Date().getMonth() || 
                           currentMonth.getFullYear() !== new Date().getFullYear());

  const handleMarkPaymentReceived = async (id: string, received: boolean) => {
    try {
      const expenseRef = doc(db, 'expenses', id);
      await updateDoc(expenseRef, {
        paymentReceived: received,
        paymentReceivedDate: received ? Timestamp.now() : null,
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getUniqueForWhomValues = () => {
    const values = expenses.map((e) => e.forWhom);
    return Array.from(new Set(values)).sort();
  };

  const fetchBudgets = async () => {
    try {
      setIsLoadingBudgets(true);
      const q = query(collection(db, 'budgets'), orderBy('month', 'desc'));
      const querySnapshot = await getDocs(q);
      const budgetsData: Budget[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        budgetsData.push({
          id: doc.id,
          month: data.month.toDate(),
          amount: data.amount,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      setBudgets(budgetsData);
    } catch (error: any) {
      console.error('❌ Error fetching budgets:', error);
      // Don't show alert for budgets as it's optional
    } finally {
      setIsLoadingBudgets(false);
    }
  };

  const updateCurrentBudget = () => {
    const monthStart = startOfMonth(currentMonth);
    const budget = budgets.find((b) => {
      const budgetMonth = startOfMonth(b.month);
      return budgetMonth.getTime() === monthStart.getTime();
    });
    setCurrentBudget(budget || null);
  };

  const handleSetBudget = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const monthStart = startOfMonth(budgetData.month);
      
      // Check if budget already exists for this month
      const existingBudget = budgets.find((b) => {
        const budgetMonth = startOfMonth(b.month);
        return budgetMonth.getTime() === monthStart.getTime();
      });

      const now = Timestamp.now();
      const monthTimestamp = Timestamp.fromDate(monthStart);

      if (existingBudget) {
        // Update existing budget
        const budgetRef = doc(db, 'budgets', existingBudget.id);
        await updateDoc(budgetRef, {
          amount: budgetData.amount,
          updatedAt: now,
        });
      } else {
        // Create new budget
        await addDoc(collection(db, 'budgets'), {
          month: monthTimestamp,
          amount: budgetData.amount,
          createdAt: now,
          updatedAt: now,
        });
      }
      fetchBudgets();
    } catch (error: any) {
      console.error('❌ Error setting budget:', error);
      alert('Failed to set budget. Please try again.');
    }
  };

  const handleOpenBudgetModal = () => {
    setEditingBudget(currentBudget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleCancelBudgetEdit = () => {
    setEditingBudget(null);
  };

  const handleDeleteBudget = async () => {
    // Use editingBudget if available (when modal is open), otherwise use currentBudget
    const budgetToDelete = editingBudget || currentBudget;
    if (!budgetToDelete) return;
    
    if (!confirm('Are you sure you want to remove the budget for this month?')) {
      return;
    }

    try {
      const budgetRef = doc(db, 'budgets', budgetToDelete.id);
      await deleteDoc(budgetRef);
      fetchBudgets();
      setIsBudgetModalOpen(false);
      setEditingBudget(null);
    } catch (error: any) {
      console.error('❌ Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are included
      });

      if (response.ok) {
        // Force a hard redirect to ensure cookie is cleared
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">Expense Tracker</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your monthly expenses</p>
            </div>
            <div className="flex justify-center sm:justify-end gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* <FirebaseStatus /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <ExpenseList
              expenses={filteredExpenses}
              allExpenses={expenses}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onMarkPaymentReceived={handleMarkPaymentReceived}
              onOpenFilterModal={handleOpenFilterModal}
              onOpenAddModal={handleOpenModal}
              isLoading={isLoadingExpenses}
              hasActiveFilters={hasActiveFilters}
              totalExpensesCount={expenses.length}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-1">
            <MonthlySummary
              expenses={expenses}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              budget={currentBudget}
              onSetBudget={handleOpenBudgetModal}
              onMarkPaymentReceived={handleMarkPaymentReceived}
              isLoading={isLoadingExpenses || isLoadingBudgets}
            />
          </div>
        </div>

        <ExpenseForm
          onSubmit={editingExpense ? (data) => handleUpdateExpense(editingExpense.id, data) : handleAddExpense}
          editingExpense={editingExpense}
          onCancel={handleCancelEdit}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          forWhomSuggestions={getUniqueForWhomValues()}
        />

        <ExpenseFilters
          selectedPaymentMode={selectedPaymentMode}
          selectedForWhom={selectedForWhom}
          selectedTransactionType={selectedTransactionType}
          forWhomOptions={getUniqueForWhomValues()}
          currentMonth={currentMonth}
          onPaymentModeChange={setSelectedPaymentMode}
          onForWhomChange={setSelectedForWhom}
          onTransactionTypeChange={setSelectedTransactionType}
          onMonthChange={setCurrentMonth}
          isOpen={isFilterModalOpen}
          onClose={handleCloseFilterModal}
        />

        <BudgetForm
          onSubmit={handleSetBudget}
          editingBudget={editingBudget}
          currentMonth={currentMonth}
          onCancel={handleCancelBudgetEdit}
          onDelete={handleDeleteBudget}
          isOpen={isBudgetModalOpen}
          onClose={handleCloseBudgetModal}
        />
      </div>
    </div>
  );
}

