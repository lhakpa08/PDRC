import { useEffect, useState } from 'react';
import { OfflineQueueItem } from '../types';

const STORAGE_KEY = 'pdrc_offline_queue_v1';

export function useOnlineStatus() {
  const [isRealOnline, setIsRealOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isOnline = isRealOnline && !simulatedOffline;

  useEffect(() => {
    const handleOnline = () => setIsRealOnline(true);
    const handleOffline = () => setIsRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save offline queue to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineQueue));
    } catch (e) {
      console.error('Failed to store offline queue:', e);
    }
  }, [offlineQueue]);

  // Sync queued items when returning online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      const timer = setTimeout(() => {
        console.log(`Auto-syncing ${offlineQueue.length} offline records...`);
        setOfflineQueue([]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineQueue.length]);

  const enqueueOfflineAction = (type: OfflineQueueItem['type'], payload: any) => {
    const newItem: OfflineQueueItem = {
      id: `off-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      timestamp: new Date().toLocaleString(),
      status: 'PENDING',
    };
    setOfflineQueue((prev) => [newItem, ...prev]);
  };

  const toggleSimulatedOffline = () => {
    setSimulatedOffline((prev) => !prev);
  };

  const clearQueue = () => {
    setOfflineQueue([]);
  };

  return {
    isOnline,
    isRealOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    offlineQueue,
    enqueueOfflineAction,
    clearQueue,
  };
}
