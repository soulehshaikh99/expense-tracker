export type ColumnId = 'date' | 'title' | 'amount' | 'paymentMode' | 'forWhom' | 'paymentStatus' | 'category';

export type ColumnVisibility = Record<ColumnId, boolean>;

export type ColumnWidths = Record<ColumnId, number>;

const STORAGE_KEY = 'expense-tracker-column-visibility';
const WIDTH_STORAGE_KEY = 'expense-tracker-column-widths';

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  date: true,
  title: true,
  amount: true,
  paymentMode: true,
  forWhom: true,
  paymentStatus: true,
  category: true,
};

export const COLUMN_LABELS: Record<ColumnId, string> = {
  date: 'Date',
  title: 'Title',
  amount: 'Amount',
  paymentMode: 'Payment Mode',
  forWhom: 'For/From Whom',
  paymentStatus: 'Payment Status',
  category: 'Category',
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

export const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  date: 140,
  title: 200,
  amount: 120,
  paymentMode: 140,
  forWhom: 180,
  paymentStatus: 150,
  category: 150,
};

export function loadColumnWidths(): ColumnWidths {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMN_WIDTHS;
  }

  try {
    const stored = localStorage.getItem(WIDTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new columns or missing keys
      return { ...DEFAULT_COLUMN_WIDTHS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading column width preferences:', error);
  }

  return DEFAULT_COLUMN_WIDTHS;
}

export function saveColumnWidths(widths: ColumnWidths): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(WIDTH_STORAGE_KEY, JSON.stringify(widths));
  } catch (error) {
    console.error('Error saving column width preferences:', error);
  }
}

