'use client';

import { useState, useEffect } from 'react';
import { Expense, PaymentMode, TransactionType, SplitDetail } from '@/types/expense';
import { X, Plus, Trash2 } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  editingExpense: Expense | null;
  onCancel: () => void;
  isOpen: boolean;
  onClose: () => void;
  forWhomSuggestions?: string[];
}

const paymentModes: PaymentMode[] = ['Credit Card', 'Debit Card', 'UPI', 'Cash'];

export default function ExpenseForm({ onSubmit, editingExpense, onCancel, isOpen, onClose, forWhomSuggestions = [] }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Credit Card');
  const [forWhom, setForWhom] = useState('Self');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSplit, setIsSplit] = useState(false);
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([
    { person: 'Self', amount: 0, paymentReceived: false },
    { person: '', amount: 0, paymentReceived: false }
  ]);
  const [splitSuggestions, setSplitSuggestions] = useState<Record<number, string[]>>({});
  const [splitHighlightedIndex, setSplitHighlightedIndex] = useState<Record<number, number>>({});

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
      setTransactionType(editingExpense.transactionType || 'expense');
      setPaymentReceived(editingExpense.paymentReceived || false);
      setIsSplit(editingExpense.isSplit || false);
      if (editingExpense.isSplit && editingExpense.splitDetails) {
        setSplitDetails(editingExpense.splitDetails);
      } else {
        setSplitDetails([
          { person: 'Self', amount: 0, paymentReceived: false },
          { person: '', amount: 0, paymentReceived: false }
        ]);
      }
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
    setTransactionType('expense');
    setPaymentReceived(false);
    setIsSplit(false);
    setSplitDetails([
      { person: 'Self', amount: 0, paymentReceived: false },
      { person: '', amount: 0, paymentReceived: false }
    ]);
    setSplitSuggestions({});
    setSplitHighlightedIndex({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate split transaction if enabled
    if (isSplit && transactionType === 'expense') {
      // Check minimum 2 people
      if (splitDetails.length < 2) {
        alert('Split transaction must have at least 2 people.');
        return;
      }

      // Check all people have names
      const hasEmptyNames = splitDetails.some(s => !s.person.trim());
      if (hasEmptyNames) {
        alert('All people in split transaction must have names.');
        return;
      }

      // Check for duplicate names
      const names = splitDetails.map(s => s.person.trim().toLowerCase());
      const uniqueNames = new Set(names);
      if (uniqueNames.size !== names.length) {
        alert('Duplicate person names are not allowed in split transaction.');
        return;
      }

      // Check that Self is included
      const hasSelf = splitDetails.some(s => s.person.trim().toLowerCase() === 'self');
      if (!hasSelf) {
        alert('Split transaction must include "Self".');
        return;
      }

      // Validate total equals sum of splits
      const totalAmount = parseFloat(amount);
      const sumOfSplits = splitDetails.reduce((sum, s) => sum + (s.amount || 0), 0);
      const difference = Math.abs(totalAmount - sumOfSplits);
      if (difference > 0.01) { // Allow small floating point differences
        alert(`Total amount (₹${totalAmount.toFixed(2)}) does not match sum of splits (₹${sumOfSplits.toFixed(2)}).`);
        return;
      }
    }

    // Normalize "self" to "Self" (case-insensitive)
    const normalizedForWhom = isSplit && transactionType === 'expense' ? 'Split' : 
      (forWhom.trim().toLowerCase() === 'self' ? 'Self' : forWhom.trim());
    
    // Validate: lent transactions cannot be for "Self"
    if (transactionType === 'lent' && normalizedForWhom === 'Self') {
      alert('Money Lent transactions cannot be for "Self". Please enter a person\'s name.');
      return;
    }
    
    const expenseData: Omit<Expense, 'id'> = {
      title: title.trim(),
      amount: parseFloat(amount),
      paymentMode,
      forWhom: normalizedForWhom,
      date: new Date(date),
      transactionType,
      paymentReceived: (transactionType === 'expense' || transactionType === 'donation' || transactionType === 'lent') && normalizedForWhom !== 'Self' && !isSplit ? paymentReceived : false,
      paymentReceivedDate: (transactionType === 'expense' || transactionType === 'donation' || transactionType === 'lent') && normalizedForWhom !== 'Self' && !isSplit && paymentReceived ? new Date() : undefined,
      isSplit: isSplit && transactionType === 'expense',
      splitDetails: isSplit && transactionType === 'expense' ? splitDetails.map(s => ({
        person: s.person.trim().toLowerCase() === 'self' ? 'Self' : s.person.trim(),
        amount: s.amount,
        paymentReceived: s.paymentReceived || false,
        paymentReceivedDate: s.paymentReceived && s.paymentReceivedDate ? s.paymentReceivedDate : undefined
      })) : undefined,
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

  // Filter suggestions based on input
  // Always include "Self" in suggestions if it matches, and show all suggestions when field is empty
  const filteredSuggestions = (() => {
    const input = forWhom.trim().toLowerCase();
    if (input === '') {
      // Show all suggestions when field is empty, with "Self" first
      const allSuggestions = [...forWhomSuggestions];
      const selfIndex = allSuggestions.indexOf('Self');
      if (selfIndex > -1) {
        allSuggestions.splice(selfIndex, 1);
      }
      return ['Self', ...allSuggestions];
    }
    
    // Filter suggestions that match the input
    const matching = forWhomSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(input) &&
      suggestion.toLowerCase() !== input
    );
    
    // Always include "Self" if it matches, and put it first
    const selfMatches = input === 'self' || 'self'.includes(input);
    if (selfMatches && !matching.includes('Self')) {
      return ['Self', ...matching];
    }
    
    return matching;
  })();

  // Filter out "Self" from suggestions when transaction type is 'lent'
  const getFilteredSuggestionsForLent = () => {
    if (transactionType !== 'lent') {
      return filteredSuggestions;
    }
    return filteredSuggestions.filter(suggestion => suggestion !== 'Self');
  };

  const handleForWhomChange = (value: string) => {
    setForWhom(value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleForWhomFocus = () => {
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setForWhom(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getFilteredSuggestionsForLent();
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.for-whom-autocomplete')) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
      if (!target.closest('.split-person-autocomplete')) {
        setSplitSuggestions({});
        setSplitHighlightedIndex({});
      }
    };

    if (showSuggestions || Object.keys(splitSuggestions).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions, splitSuggestions]);

  // Auto-calculate last person's amount when split is enabled
  useEffect(() => {
    if (isSplit && transactionType === 'expense' && amount && splitDetails.length > 0) {
      const totalAmount = parseFloat(amount);
      if (!isNaN(totalAmount) && totalAmount > 0) {
        const lastIndex = splitDetails.length - 1;
        const sumOfOthers = splitDetails.slice(0, -1).reduce((sum, s) => sum + (s.amount || 0), 0);
        const lastAmount = totalAmount - sumOfOthers;
        const currentLastAmount = splitDetails[lastIndex]?.amount || 0;
        
        // Only update if the calculated amount differs significantly (avoid infinite loops)
        // Also check if we're not currently editing the last person's amount
        if (Math.abs(lastAmount - currentLastAmount) > 0.01 && lastIndex >= 0) {
          setSplitDetails(prev => {
            const updated = [...prev];
            if (updated[lastIndex]) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                amount: Math.max(0, lastAmount) // Ensure non-negative
              };
            }
            return updated;
          });
        }
      }
    }
  }, [amount, isSplit, transactionType, splitDetails.map((s, i) => i < splitDetails.length - 1 ? s.amount : null).join(',')]);

  // Handle split toggle
  const handleSplitToggle = (checked: boolean) => {
    if (checked && transactionType === 'expense') {
      setIsSplit(true);
      // Initialize with Self and one other person
      if (splitDetails.length < 2) {
        setSplitDetails([
          { person: 'Self', amount: 0, paymentReceived: false },
          { person: '', amount: 0, paymentReceived: false }
        ]);
      }
      // Pre-fill amounts if total amount is set
      if (amount) {
        const totalAmount = parseFloat(amount);
        if (!isNaN(totalAmount) && totalAmount > 0) {
          const perPerson = totalAmount / splitDetails.length;
          setSplitDetails(prev => prev.map((s, i) => ({
            ...s,
            amount: i === prev.length - 1 ? totalAmount - (perPerson * (prev.length - 1)) : perPerson
          })));
        }
      }
    } else {
      // Ask for confirmation if converting from split to regular
      if (isSplit && splitDetails.length > 0) {
        if (!confirm('Converting to regular transaction will lose split details. Continue?')) {
          return;
        }
      }
      setIsSplit(false);
      setSplitDetails([
        { person: 'Self', amount: 0, paymentReceived: false },
        { person: '', amount: 0, paymentReceived: false }
      ]);
    }
  };

  // Add person to split
  const handleAddPerson = () => {
    setSplitDetails(prev => [...prev, { person: '', amount: 0, paymentReceived: false }]);
  };

  // Remove person from split
  const handleRemovePerson = (index: number) => {
    if (splitDetails.length <= 2) {
      alert('Split transaction must have at least 2 people.');
      return;
    }
    setSplitDetails(prev => prev.filter((_, i) => i !== index));
  };

  // Update split detail
  const handleSplitDetailChange = (index: number, field: keyof SplitDetail, value: string | number | boolean) => {
    setSplitDetails(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Get suggestions for split person name
  const getSplitSuggestions = (index: number, input: string): string[] => {
    const inputLower = input.trim().toLowerCase();
    if (inputLower === '') {
      const allSuggestions = ['Self', ...forWhomSuggestions];
      // Remove names already used in other splits
      const usedNames = splitDetails
        .map((s, i) => i !== index ? s.person.trim().toLowerCase() : '')
        .filter(Boolean);
      return allSuggestions.filter(s => !usedNames.includes(s.toLowerCase()));
    }
    
    const matching = forWhomSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputLower) &&
      suggestion.toLowerCase() !== inputLower &&
      !splitDetails.some((s, i) => i !== index && s.person.trim().toLowerCase() === suggestion.toLowerCase())
    );
    
    const selfMatches = inputLower === 'self' || 'self'.includes(inputLower);
    if (selfMatches && !splitDetails.some((s, i) => i !== index && s.person.trim().toLowerCase() === 'self')) {
      return ['Self', ...matching];
    }
    
    return matching;
  };

  // Handle split person name change
  const handleSplitPersonChange = (index: number, value: string) => {
    // Prevent "Self" input if already exists
    if (value.trim().toLowerCase() === 'self' && splitDetails.some((s, i) => i !== index && s.person.trim().toLowerCase() === 'self')) {
      return;
    }
    handleSplitDetailChange(index, 'person', value);
    setSplitSuggestions(prev => ({ ...prev, [index]: getSplitSuggestions(index, value) }));
  };

  // Handle split person name focus
  const handleSplitPersonFocus = (index: number) => {
    const currentValue = splitDetails[index]?.person || '';
    setSplitSuggestions(prev => ({ ...prev, [index]: getSplitSuggestions(index, currentValue) }));
  };

  // Select split person suggestion
  const handleSelectSplitSuggestion = (index: number, suggestion: string) => {
    handleSplitDetailChange(index, 'person', suggestion);
    setSplitSuggestions(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setSplitHighlightedIndex(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-2 sm:m-0">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 pr-2">
            {editingExpense ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type *
          </label>
          <select
            id="transactionType"
            value={transactionType}
            onChange={(e) => {
              const newType = e.target.value as TransactionType;
              setTransactionType(newType);
              if (newType !== 'expense' && newType !== 'lent') {
                setPaymentReceived(false);
              }
              // If switching to 'lent' and forWhom is 'Self', clear it
              if (newType === 'lent' && forWhom === 'Self') {
                setForWhom('');
              }
              // Disable split if not expense
              if (newType !== 'expense' && isSplit) {
                setIsSplit(false);
                setSplitDetails([
                  { person: 'Self', amount: 0, paymentReceived: false },
                  { person: '', amount: 0, paymentReceived: false }
                ]);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="donation">Donation</option>
            <option value="lent">Money Lent</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {transactionType === 'income' ? 'Income Title' : transactionType === 'donation' ? 'Donation Title' : transactionType === 'lent' ? 'Money Lent Title' : 'Expense Title'} *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Electricity Bill"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Mode *
          </label>
          <select
            id="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {!isSplit && (
          <div className="for-whom-autocomplete relative">
            <label htmlFor="forWhom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {transactionType === 'income' ? 'From Whom' : transactionType === 'lent' ? 'To Whom' : 'For Whom'} *
            </label>
            <input
              type="text"
              id="forWhom"
              value={forWhom}
              onChange={(e) => {
                const value = e.target.value;
                // Prevent "Self" input for lent transactions
                if (transactionType === 'lent' && value.trim().toLowerCase() === 'self') {
                  return;
                }
                handleForWhomChange(value);
              }}
              onFocus={handleForWhomFocus}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={transactionType === 'income' ? "Person's name" : transactionType === 'donation' ? "Self, organization or person's name" : transactionType === 'lent' ? "Person's name" : "Self or person's name"}
              required
              autoComplete="off"
            />
            {showSuggestions && getFilteredSuggestionsForLent().length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {getFilteredSuggestionsForLent().map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:outline-none transition-colors ${
                      index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {suggestion === 'Self' ? (
                        <span className="font-medium text-green-700 dark:text-green-400">{suggestion}</span>
                      ) : (
                        suggestion
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {transactionType === 'expense' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSplit"
              checked={isSplit}
              onChange={(e) => handleSplitToggle(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label htmlFor="isSplit" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Split Transaction
            </label>
          </div>
        )}

        {isSplit && transactionType === 'expense' && (
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50 space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Split Details
            </div>
            {splitDetails.map((split, index) => {
              const isLast = index === splitDetails.length - 1;
              const isSelf = split.person.trim().toLowerCase() === 'self';
              return (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 split-person-autocomplete relative">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Person {index + 1} {isLast && '(Auto-calculated)'}
                      </label>
                      <input
                        type="text"
                        value={split.person}
                        onChange={(e) => handleSplitPersonChange(index, e.target.value)}
                        onFocus={() => handleSplitPersonFocus(index)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={isSelf ? "Self" : "Person's name"}
                        disabled={isSelf}
                        required
                        autoComplete="off"
                      />
                      {splitSuggestions[index] && splitSuggestions[index].length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          {splitSuggestions[index].map((suggestion, sugIndex) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => handleSelectSplitSuggestion(index, suggestion)}
                              className={`w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:outline-none transition-colors text-sm ${
                                sugIndex === splitHighlightedIndex[index] ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'
                              }`}
                            >
                              <span className={suggestion === 'Self' ? 'font-medium text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}>
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Amount {isLast && '(Auto)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={split.amount || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleSplitDetailChange(index, 'amount', value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0.00"
                        disabled={isLast}
                        required
                      />
                    </div>
                    {!isSelf && (
                      <div className="flex items-end pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemovePerson(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Remove person"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {!isSelf && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`splitPaymentReceived-${index}`}
                        checked={split.paymentReceived || false}
                        onChange={(e) => handleSplitDetailChange(index, 'paymentReceived', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      />
                      <label htmlFor={`splitPaymentReceived-${index}`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                        Payment received from {split.person || 'this person'}
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddPerson}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Plus size={16} />
              Add Person
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-300 dark:border-gray-600">
              Total: ₹{parseFloat(amount || '0').toFixed(2)} | 
              Split Sum: ₹{splitDetails.reduce((sum, s) => sum + (s.amount || 0), 0).toFixed(2)}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {((transactionType === 'expense' || transactionType === 'donation' || transactionType === 'lent') && forWhom !== 'Self' && forWhom.trim() !== '' && !isSplit) && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="paymentReceived"
              checked={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label htmlFor="paymentReceived" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {transactionType === 'lent' ? `Money received back from ${forWhom}` : `Payment received from ${forWhom}`}
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {editingExpense ? 'Update Transaction' : 'Add Transaction'}
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
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

