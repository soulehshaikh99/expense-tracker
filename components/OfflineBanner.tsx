'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 left-0 right-0 w-full z-50 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-50 text-sm font-medium shadow-md"
    >
      <WifiOff className="h-5 w-5 shrink-0" aria-hidden />
      <span>No internet connection. Some features may be unavailable. Data will refresh when you’re back online.</span>
    </div>
  );
}
