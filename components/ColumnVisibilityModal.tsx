'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ColumnId, ColumnVisibility, COLUMN_LABELS, DEFAULT_COLUMN_VISIBILITY } from '@/types/columnVisibility';
import { Switch } from './ui/switch';

interface ColumnVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnVisibility: ColumnVisibility;
  onVisibilityChange: (visibility: ColumnVisibility) => void;
}

export default function ColumnVisibilityModal({
  isOpen,
  onClose,
  columnVisibility,
  onVisibilityChange,
}: ColumnVisibilityModalProps) {
  const [localVisibility, setLocalVisibility] = useState<ColumnVisibility>(columnVisibility);

  useEffect(() => {
    setLocalVisibility(columnVisibility);
  }, [columnVisibility]);

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

  const handleToggle = (columnId: ColumnId) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleReset = () => {
    setLocalVisibility(DEFAULT_COLUMN_VISIBILITY);
  };

  const handleApply = () => {
    onVisibilityChange(localVisibility);
    onClose();
  };

  const handleCancel = () => {
    setLocalVisibility(columnVisibility);
    onClose();
  };

  if (!isOpen) return null;

  const columnIds: ColumnId[] = ['date', 'title', 'amount', 'paymentMode', 'forWhom', 'paymentStatus'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-2 sm:m-0">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 pr-2">
            Column Visibility
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select which columns to display in the expense table. The Actions column is always visible.
            </p>
            
            {columnIds.map((columnId) => (
              <div
                key={columnId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {COLUMN_LABELS[columnId]}
                </span>
                <Switch
                  checked={localVisibility[columnId]}
                  onCheckedChange={() => handleToggle(columnId)}
                  aria-label={`Toggle ${COLUMN_LABELS[columnId]} column visibility`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors whitespace-nowrap"
            >
              Reset to Default
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

