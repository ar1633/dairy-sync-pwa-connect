
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const SyncStatusIndicator = () => {
  const { syncStatus, isOnline, lastChange } = useRealTimeSync();

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    
    const allSynced = Object.values(syncStatus).every(status => status);
    if (allSynced) return <CheckCircle className="w-4 h-4 text-green-500" />;
    
    const anySyncing = Object.values(syncStatus).some(status => status);
    if (anySyncing) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getSyncStatus = () => {
    if (!isOnline) return 'Offline';
    
    const syncedCount = Object.values(syncStatus).filter(status => status).length;
    const totalCount = Object.keys(syncStatus).length;
    
    if (syncedCount === totalCount) return 'All Synced';
    if (syncedCount > 0) return `${syncedCount}/${totalCount} Synced`;
    
    return 'Not Synced';
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border">
      {getSyncIcon()}
      <div className="flex flex-col">
        <Badge variant={isOnline ? "default" : "secondary"}>
          {getSyncStatus()}
        </Badge>
        {lastChange && (
          <span className="text-xs text-gray-500">
            Last update: {lastChange.timestamp.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
