'use client';

import { useState, useEffect } from 'react';
import { Budget } from '@/types/budget';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingBudget: Budget | null;
  currentMonth: Date;
  onCancel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetForm({ onSubmit, editingBudget, currentMonth, onCancel, isOpen, onClose }: BudgetFormProps) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (editingBudget) {
      setAmount(editingBudget.amount.toString());
    } else {
      resetForm();
    }
  }, [editingBudget]);

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
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || parseFloat(amount) <= 0) {
      alert('Please enter a valid budget amount (greater than 0)');
      return;
    }

    const budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> = {
      month: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), // First day of month
      amount: parseFloat(amount),
    };

    onSubmit(budgetData);
    if (!editingBudget) {
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
            {editingBudget ? 'Edit Budget' : 'Set Budget'}
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
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="text"
                id="month"
                value={format(currentMonth, 'MMMM yyyy')}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount *
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This budget applies to your net spending (personal expenses + pending payments from others)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {editingBudget ? 'Update Budget' : 'Set Budget'}
              </button>
              {editingBudget && (
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

