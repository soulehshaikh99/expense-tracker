'use client';

import { useState, useEffect } from 'react';
import { Expense, PaymentMode } from '@/types/expense';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  editingExpense: Expense | null;
  onCancel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const paymentModes: PaymentMode[] = ['Credit Card', 'Debit Card', 'UPI', 'Cash'];

export default function ExpenseForm({ onSubmit, editingExpense, onCancel, isOpen, onClose }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Credit Card');
  const [forWhom, setForWhom] = useState('Self');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReceived, setPaymentReceived] = useState(false);

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setPaymentMode(editingExpense.paymentMode);
      setForWhom(editingExpense.forWhom);
      setDate(formatDateForInput(editingExpense.date));
      setPaymentReceived(editingExpense.paymentReceived || false);
    } else {
      resetForm();
    }
  }, [editingExpense]);

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

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setPaymentMode('Credit Card');
    setForWhom('Self');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentReceived(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Normalize "self" to "Self" (case-insensitive)
    const normalizedForWhom = forWhom.trim().toLowerCase() === 'self' ? 'Self' : forWhom.trim();
    
    const expenseData: Omit<Expense, 'id'> = {
      title: title.trim(),
      amount: parseFloat(amount),
      paymentMode,
      forWhom: normalizedForWhom,
      date: new Date(date),
      paymentReceived: normalizedForWhom !== 'Self' ? paymentReceived : false,
      paymentReceivedDate: normalizedForWhom !== 'Self' && paymentReceived ? new Date() : undefined,
    };

    onSubmit(expenseData);
    if (!editingExpense) {
      resetForm();
    }
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

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
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 pr-2">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Expense Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Electricity Bill"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode *
          </label>
          <select
            id="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="forWhom" className="block text-sm font-medium text-gray-700 mb-1">
            For Whom *
          </label>
          <input
            type="text"
            id="forWhom"
            value={forWhom}
            onChange={(e) => setForWhom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Self or person's name"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {forWhom !== 'Self' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="paymentReceived"
              checked={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="paymentReceived" className="ml-2 block text-sm text-gray-700">
              Payment received from {forWhom}
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}

