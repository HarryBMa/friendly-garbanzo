import type { SyncStatus } from '../../types';

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  onManualSync?: () => void;
}

export function SyncStatusIndicator({ 
  syncStatus, 
  onManualSync 
}: SyncStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (!syncStatus.isConnected) return '❌';
    if (syncStatus.hasConflicts) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (!syncStatus.isConnected) return 'Inte ansluten';
    if (syncStatus.hasConflicts) return 'Konflikt';
    if (syncStatus.lastSync) {
      const timeDiff = Date.now() - syncStatus.lastSync.getTime();
      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (seconds < 60) return `Synkad ${seconds}s sedan`;
      if (minutes < 60) return `Synkad ${minutes}m sedan`;
      return `Synkad ${Math.floor(minutes / 60)}h sedan`;
    }
    return 'Väntar på synkning...';
  };

  const getStatusColor = () => {
    if (!syncStatus.isConnected) return 'text-red-600 bg-red-50 border-red-200';
    if (syncStatus.hasConflicts) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${getStatusColor()}`}>
      <span>{getStatusIcon()}</span>
      <span className="font-medium">{getStatusText()}</span>
      {onManualSync && syncStatus.isConnected && !syncStatus.hasConflicts && (
        <button
          onClick={onManualSync}
          className="ml-1 hover:opacity-70 transition-opacity"
          title="Manuell synkning"
        >
          🔄
        </button>
      )}
    </div>
  );
}
