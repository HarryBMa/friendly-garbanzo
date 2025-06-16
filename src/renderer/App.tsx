import { useEffect, useState } from 'react';
import { useAppStore } from './stores/appStore';
import { useNetworkSync } from './hooks/useNetworkSync';
import { ConflictResolutionDialog, SyncStatusIndicator } from './components/shared';
import Admin from './routes/Admin';
import Dashboard from './routes/Dashboard';
import Settings from './routes/Settings';

function App() {
  const { isDashboardMode } = useAppStore();
  const [currentPage, setCurrentPage] = useState<'admin' | 'settings'>('admin');
  
  // Network synchronization
  const { 
    syncStatus, 
    saveToNetwork, 
    loadFromNetwork, 
    resolveConflict, 
    currentConflict 
  } = useNetworkSync();

  // Auto-save to network when data changes
  const weeks = useAppStore(state => state.weeks);
  useEffect(() => {
    if (syncStatus.isConnected && !syncStatus.hasConflicts) {
      // Debounce auto-save to avoid too frequent saves
      const timeoutId = setTimeout(() => {
        saveToNetwork();
      }, 2000); // Save 2 seconds after last change

      return () => clearTimeout(timeoutId);
    }
  }, [weeks, syncStatus.isConnected, syncStatus.hasConflicts, saveToNetwork]);

  // Handle manual sync
  const handleManualSync = async () => {
    try {
      await loadFromNetwork();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // Handle conflict resolution
  const handleConflictResolve = async (useLocal: boolean) => {
    await resolveConflict(useLocal);
  };

  const handleConflictCancel = () => {
    // For now, just keep working with local version
    // The conflict will be presented again on next save attempt
  };

  useEffect(() => {
    // Handle main process messages if needed
    if (window.electronAPI?.onMainProcessMessage) {
      window.electronAPI.onMainProcessMessage((message: string) => {
        console.log('Main process message:', message);
      });
    }

    // Global key handler for settings access
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        setCurrentPage('settings');
      }
      if (event.key === 'Escape' && currentPage === 'settings') {
        setCurrentPage('admin');
      }
      // Manual sync shortcut
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveToNetwork();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, saveToNetwork]);

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Sync status indicator */}
      <div className="fixed top-4 right-4 z-40">
        <SyncStatusIndicator 
          syncStatus={syncStatus} 
          onManualSync={handleManualSync}
        />
      </div>

      {/* Conflict resolution dialog */}
      {currentConflict && (
        <ConflictResolutionDialog
          conflict={currentConflict}
          onResolve={handleConflictResolve}
          onCancel={handleConflictCancel}
        />
      )}

      {/* Main content */}
      {isDashboardMode ? (
        <Dashboard />
      ) : currentPage === 'settings' ? (
        <Settings onBack={() => setCurrentPage('admin')} />
      ) : (
        <Admin onOpenSettings={() => setCurrentPage('settings')} />
      )}
    </div>
  );
}

export default App;
