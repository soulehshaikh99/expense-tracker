export type ColumnId = 'date' | 'title' | 'amount' | 'paymentMode' | 'forWhom' | 'paymentStatus';

export type ColumnVisibility = Record<ColumnId, boolean>;

const STORAGE_KEY = 'expense-tracker-column-visibility';

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  date: true,
  title: true,
  amount: true,
  paymentMode: true,
  forWhom: true,
  paymentStatus: true,
};

export const COLUMN_LABELS: Record<ColumnId, string> = {
  date: 'Date',
  title: 'Title',
  amount: 'Amount',
  paymentMode: 'Payment Mode',
  forWhom: 'For/From Whom',
  paymentStatus: 'Payment Status',
};

export function loadColumnVisibility(): ColumnVisibility {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMN_VISIBILITY;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new columns or missing keys
      return { ...DEFAULT_COLUMN_VISIBILITY, ...parsed };
    }
  } catch (error) {
    console.error('Error loading column visibility preferences:', error);
  }

  return DEFAULT_COLUMN_VISIBILITY;
}

export function saveColumnVisibility(visibility: ColumnVisibility): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.error('Error saving column visibility preferences:', error);
  }
}

