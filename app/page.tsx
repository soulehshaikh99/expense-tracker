'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, PaymentMode } from '@/types/expense';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseFilters from '@/components/ExpenseFilters';
import MonthlySummary from '@/components/MonthlySummary';
// import FirebaseStatus from '@/components/FirebaseStatus';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | 'All'>('All');
  const [selectedForWhom, setSelectedForWhom] = useState<string>('All');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, selectedPaymentMode, selectedForWhom, currentMonth]);

  const fetchExpenses = async () => {
    try {
      console.log('🔄 Attempting to fetch expenses from Firestore...');
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
          paymentReceived: data.paymentReceived || false,
          paymentReceivedDate: data.paymentReceivedDate ? data.paymentReceivedDate.toDate() : undefined,
        });
      });
      setExpenses(expensesData);
      console.log(`✅ Successfully fetched ${expensesData.length} expenses`);
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

    // Filter by payment mode
    if (selectedPaymentMode !== 'All') {
      filtered = filtered.filter((expense) => expense.paymentMode === selectedPaymentMode);
    }

    // Filter by for whom
    if (selectedForWhom !== 'All') {
      filtered = filtered.filter((expense) => expense.forWhom === selectedForWhom);
    }

    setFilteredExpenses(filtered);
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      console.log('🔄 Attempting to add expense:', expenseData);
      const expensePayload = {
        title: expenseData.title,
        amount: expenseData.amount,
        paymentMode: expenseData.paymentMode,
        forWhom: expenseData.forWhom,
        date: Timestamp.fromDate(expenseData.date),
        paymentReceived: expenseData.paymentReceived || false,
        paymentReceivedDate: expenseData.paymentReceivedDate
          ? Timestamp.fromDate(expenseData.paymentReceivedDate)
          : null,
      };
      
      await addDoc(collection(db, 'expenses'), expensePayload);
      console.log('✅ Expense added successfully');
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Expense Tracker</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your monthly expenses</p>
        </div>

        {/* <FirebaseStatus /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onMarkPaymentReceived={handleMarkPaymentReceived}
              onOpenFilterModal={handleOpenFilterModal}
              onOpenAddModal={handleOpenModal}
            />
          </div>

          <div className="lg:col-span-1">
            <MonthlySummary
              expenses={expenses}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>
        </div>

        <ExpenseForm
          onSubmit={editingExpense ? (data) => handleUpdateExpense(editingExpense.id, data) : handleAddExpense}
          editingExpense={editingExpense}
          onCancel={handleCancelEdit}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        <ExpenseFilters
          selectedPaymentMode={selectedPaymentMode}
          selectedForWhom={selectedForWhom}
          forWhomOptions={getUniqueForWhomValues()}
          currentMonth={currentMonth}
          onPaymentModeChange={setSelectedPaymentMode}
          onForWhomChange={setSelectedForWhom}
          onMonthChange={setCurrentMonth}
          isOpen={isFilterModalOpen}
          onClose={handleCloseFilterModal}
        />
      </div>
    </div>
  );
}

