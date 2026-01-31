'use client';

import { useState, useEffect } from 'react';

/**
 * Returns the current online/offline status and re-subscribes to
 * window 'online' / 'offline' events. Initial value is true (assume online)
 * so server and first client render match and hydration does not fail;
 * the real value is set in useEffect after mount.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
