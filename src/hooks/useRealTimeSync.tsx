
import { useEffect, useState } from 'react';

interface SyncStatus {
  [database: string]: boolean;
}

interface DataChange {
  database: string;
  action: string;
  data: any;
  timestamp: Date;
}

export const useRealTimeSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});
  const [lastChange, setLastChange] = useState<DataChange | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for data changes from other devices
    const handleDataChange = (event: CustomEvent<DataChange>) => {
      setLastChange(event.detail);
      console.log('Real-time data change received:', event.detail);
    };

    // Listen for sync status updates
    const handleDataSync = (event: CustomEvent<any>) => {
      console.log('Sync status update:', event.detail);
      // Update sync status
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('dataChange', handleDataChange as EventListener);
    window.addEventListener('dataSync', handleDataSync as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('dataChange', handleDataChange as EventListener);
      window.removeEventListener('dataSync', handleDataSync as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    syncStatus,
    lastChange,
    isOnline,
    refreshData: () => {
      // Trigger data refresh in components
      window.dispatchEvent(new CustomEvent('refreshData'));
    }
  };
};
