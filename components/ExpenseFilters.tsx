'use client';

import { useEffect, useState, useRef } from 'react';
import { PaymentMode, TransactionType } from '@/types/expense';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { X, ChevronDown, Check } from 'lucide-react';

interface ExpenseFiltersProps {
  selectedPaymentMode: PaymentMode[] | 'All';
  selectedForWhom: string[] | 'All';
  selectedTransactionType: TransactionType[] | 'All';
  forWhomOptions: string[];
  currentMonth: Date;
  onPaymentModeChange: (mode: PaymentMode[] | 'All') => void;
  onForWhomChange: (forWhom: string[] | 'All') => void;
  onTransactionTypeChange: (type: TransactionType[] | 'All') => void;
  onMonthChange: (month: Date) => void;
  isOpen: boolean;
  onClose: () => void;
}

const paymentModes: PaymentMode[] = ['Credit Card', 'Debit Card', 'UPI', 'Cash'];
const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'donation', label: 'Donation' },
  { value: 'lent', label: 'Money Lent' },
];

export default function ExpenseFilters({
  selectedPaymentMode,
  selectedForWhom,
  selectedTransactionType,
  forWhomOptions,
  currentMonth,
  onPaymentModeChange,
  onForWhomChange,
  onTransactionTypeChange,
  onMonthChange,
  isOpen,
  onClose,
}: ExpenseFiltersProps) {
  const [isTransactionTypeDropdownOpen, setIsTransactionTypeDropdownOpen] = useState(false);
  const [isPaymentModeDropdownOpen, setIsPaymentModeDropdownOpen] = useState(false);
  const [isForWhomDropdownOpen, setIsForWhomDropdownOpen] = useState(false);
  const transactionTypeDropdownRef = useRef<HTMLDivElement>(null);
  const paymentModeDropdownRef = useRef<HTMLDivElement>(null);
  const forWhomDropdownRef = useRef<HTMLDivElement>(null);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onMonthChange(date);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isTransactionTypeDropdownOpen) {
          setIsTransactionTypeDropdownOpen(false);
        } else if (isPaymentModeDropdownOpen) {
          setIsPaymentModeDropdownOpen(false);
        } else if (isForWhomDropdownOpen) {
          setIsForWhomDropdownOpen(false);
        } else {
          onClose();
        }
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
  }, [isOpen, onClose, isTransactionTypeDropdownOpen, isPaymentModeDropdownOpen, isForWhomDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        transactionTypeDropdownRef.current &&
        !transactionTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTransactionTypeDropdownOpen(false);
      }
      if (
        paymentModeDropdownRef.current &&
        !paymentModeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPaymentModeDropdownOpen(false);
      }
      if (
        forWhomDropdownRef.current &&
        !forWhomDropdownRef.current.contains(event.target as Node)
      ) {
        setIsForWhomDropdownOpen(false);
      }
    };

    if (isTransactionTypeDropdownOpen || isPaymentModeDropdownOpen || isForWhomDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTransactionTypeDropdownOpen, isPaymentModeDropdownOpen, isForWhomDropdownOpen]);

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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 pr-2">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Month
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            >
              ←
            </button>
            <input
              type="month"
              id="month"
              value={format(currentMonth, 'yyyy-MM')}
              onChange={handleMonthChange}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            >
              →
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          {selectedTransactionType === 'All' ? (
            <select
              id="transactionType"
              value="All"
              onChange={(e) => {
                if (e.target.value === 'All') {
                  onTransactionTypeChange('All');
                } else {
                  // Switch to multi-select mode with the selected type
                  onTransactionTypeChange([e.target.value as TransactionType]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative" ref={transactionTypeDropdownRef}>
              {/* Dropdown trigger button */}
              <div
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center justify-between cursor-pointer"
                onClick={() => setIsTransactionTypeDropdownOpen(!isTransactionTypeDropdownOpen)}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Select transaction types...</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${isTransactionTypeDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </div>
              
              {/* Dropdown menu */}
              {isTransactionTypeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Options list */}
                  <div>
                    <div
                      className={`px-3 py-2 cursor-pointer flex items-center ${
                        selectedTransactionType.length === transactionTypes.length
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        if (selectedTransactionType.length === transactionTypes.length) {
                          // If all are selected, switch back to "All" mode
                          onTransactionTypeChange('All');
                          setIsTransactionTypeDropdownOpen(false);
                        } else {
                          // Select all transaction types
                          onTransactionTypeChange(transactionTypes.map(t => t.value));
                        }
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {selectedTransactionType.length === transactionTypes.length && (
                          <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                        )}
                        {selectedTransactionType.length !== transactionTypes.length && (
                          <div className="w-4 mr-3" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-gray-100">All</span>
                      </div>
                    </div>
                    {transactionTypes.map((type) => {
                      const isSelected = selectedTransactionType.includes(type.value);
                      return (
                        <div
                          key={type.value}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            isSelected
                              ? 'bg-gray-50 dark:bg-gray-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              // Remove from selection
                              const newSelection = selectedTransactionType.filter(t => t !== type.value);
                              // If no types selected, switch back to "All"
                              onTransactionTypeChange(newSelection.length > 0 ? newSelection : 'All');
                            } else {
                              // Add to selection
                              onTransactionTypeChange([...selectedTransactionType, type.value]);
                            }
                          }}
                        >
                          <div className="flex items-center flex-1">
                            {isSelected && (
                              <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                            )}
                            {!isSelected && (
                              <div className="w-4 mr-3" />
                            )}
                            <span className={`text-sm ${
                              isSelected
                                ? 'text-gray-900 dark:text-gray-100 font-medium'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {type.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected tags display area */}
              {selectedTransactionType.length > 0 && (
                <div className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex flex-wrap items-center gap-2 min-h-[42px]">
                  {selectedTransactionType.map((type) => {
                    const typeLabel = transactionTypes.find(t => t.value === type)?.label;
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                      >
                        {typeLabel}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSelection = selectedTransactionType.filter(t => t !== type);
                            onTransactionTypeChange(newSelection.length > 0 ? newSelection : 'All');
                          }}
                          className="ml-0.5 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${typeLabel}`}
                        >
                          <X size={12} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Mode
          </label>
          {selectedPaymentMode === 'All' ? (
            <select
              id="paymentMode"
              value="All"
              onChange={(e) => {
                if (e.target.value === 'All') {
                  onPaymentModeChange('All');
                } else {
                  // Switch to multi-select mode with the selected mode
                  onPaymentModeChange([e.target.value as PaymentMode]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative" ref={paymentModeDropdownRef}>
              {/* Dropdown trigger button */}
              <div
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center justify-between cursor-pointer"
                onClick={() => setIsPaymentModeDropdownOpen(!isPaymentModeDropdownOpen)}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Select payment modes...</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${isPaymentModeDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </div>
              
              {/* Dropdown menu */}
              {isPaymentModeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Options list */}
                  <div>
                    <div
                      className={`px-3 py-2 cursor-pointer flex items-center ${
                        selectedPaymentMode.length === paymentModes.length
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        if (selectedPaymentMode.length === paymentModes.length) {
                          // If all are selected, switch back to "All" mode
                          onPaymentModeChange('All');
                          setIsPaymentModeDropdownOpen(false);
                        } else {
                          // Select all payment modes
                          onPaymentModeChange([...paymentModes]);
                        }
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {selectedPaymentMode.length === paymentModes.length && (
                          <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                        )}
                        {selectedPaymentMode.length !== paymentModes.length && (
                          <div className="w-4 mr-3" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-gray-100">All</span>
                      </div>
                    </div>
                    {paymentModes.map((mode) => {
                      const isSelected = selectedPaymentMode.includes(mode);
                      return (
                        <div
                          key={mode}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            isSelected
                              ? 'bg-gray-50 dark:bg-gray-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              // Remove from selection
                              const newSelection = selectedPaymentMode.filter(m => m !== mode);
                              // If no modes selected, switch back to "All"
                              onPaymentModeChange(newSelection.length > 0 ? newSelection : 'All');
                            } else {
                              // Add to selection
                              onPaymentModeChange([...selectedPaymentMode, mode]);
                            }
                          }}
                        >
                          <div className="flex items-center flex-1">
                            {isSelected && (
                              <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                            )}
                            {!isSelected && (
                              <div className="w-4 mr-3" />
                            )}
                            <span className={`text-sm ${
                              isSelected
                                ? 'text-gray-900 dark:text-gray-100 font-medium'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {mode}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected tags display area */}
              {selectedPaymentMode.length > 0 && (
                <div className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex flex-wrap items-center gap-2 min-h-[42px]">
                  {selectedPaymentMode.map((mode) => (
                    <span
                      key={mode}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {mode}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSelection = selectedPaymentMode.filter(m => m !== mode);
                          onPaymentModeChange(newSelection.length > 0 ? newSelection : 'All');
                        }}
                        className="ml-0.5 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${mode}`}
                      >
                        <X size={12} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            For/From Whom
          </label>
          {selectedForWhom === 'All' ? (
            <select
              id="forWhom"
              value="All"
              onChange={(e) => {
                if (e.target.value === 'All') {
                  onForWhomChange('All');
                } else {
                  // Switch to multi-select mode with the selected option
                  onForWhomChange([e.target.value]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {forWhomOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'self' ? 'Self' : option}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative" ref={forWhomDropdownRef}>
              {/* Dropdown trigger button */}
              <div
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center justify-between cursor-pointer"
                onClick={() => setIsForWhomDropdownOpen(!isForWhomDropdownOpen)}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Select for/from whom...</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${isForWhomDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </div>
              
              {/* Dropdown menu */}
              {isForWhomDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Options list */}
                  <div>
                    <div
                      className={`px-3 py-2 cursor-pointer flex items-center ${
                        selectedForWhom.length === forWhomOptions.length
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        if (selectedForWhom.length === forWhomOptions.length) {
                          // If all are selected, switch back to "All" mode
                          onForWhomChange('All');
                          setIsForWhomDropdownOpen(false);
                        } else {
                          // Select all options
                          onForWhomChange([...forWhomOptions]);
                        }
                      }}
                    >
                      <div className="flex items-center flex-1">
                        {selectedForWhom.length === forWhomOptions.length && (
                          <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                        )}
                        {selectedForWhom.length !== forWhomOptions.length && (
                          <div className="w-4 mr-3" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-gray-100">All</span>
                      </div>
                    </div>
                    {forWhomOptions.map((option) => {
                      const isSelected = selectedForWhom.includes(option);
                      const displayLabel = option === 'self' ? 'Self' : option;
                      return (
                        <div
                          key={option}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            isSelected
                              ? 'bg-gray-50 dark:bg-gray-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              // Remove from selection
                              const newSelection = selectedForWhom.filter(o => o !== option);
                              // If no options selected, switch back to "All"
                              onForWhomChange(newSelection.length > 0 ? newSelection : 'All');
                            } else {
                              // Add to selection
                              onForWhomChange([...selectedForWhom, option]);
                            }
                          }}
                        >
                          <div className="flex items-center flex-1">
                            {isSelected && (
                              <Check size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                            )}
                            {!isSelected && (
                              <div className="w-4 mr-3" />
                            )}
                            <span className={`text-sm ${
                              isSelected
                                ? 'text-gray-900 dark:text-gray-100 font-medium'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {displayLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected tags display area */}
              {selectedForWhom.length > 0 && (
                <div className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex flex-wrap items-center gap-2 min-h-[42px]">
                  {selectedForWhom.map((option) => {
                    const displayLabel = option === 'self' ? 'Self' : option;
                    return (
                      <span
                        key={option}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                      >
                        {displayLabel}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSelection = selectedForWhom.filter(o => o !== option);
                            onForWhomChange(newSelection.length > 0 ? newSelection : 'All');
                          }}
                          className="ml-0.5 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${displayLabel}`}
                        >
                          <X size={12} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

