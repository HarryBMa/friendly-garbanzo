import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import type { SyncStatus, SyncConflict } from '../types';

interface UseNetworkSyncReturn {
  syncStatus: SyncStatus;
  saveToNetwork: () => Promise<void>;
  loadFromNetwork: () => Promise<void>;
  resolveConflict: (useLocal: boolean) => Promise<void>;
  currentConflict: SyncConflict | null;
}

export function useNetworkSync(): UseNetworkSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    clientId: '',
    hasConflicts: false
  });
  const [currentConflict, setCurrentConflict] = useState<SyncConflict | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const weeks = useAppStore(state => state.weeks);
  const setWeeks = useAppStore(state => state.setWeeks); // We'll need to add this action

  // Initialize sync system
  useEffect(() => {
    const initializeSync = async () => {
      try {
        const result = await window.electronAPI.syncInit();
        if (result.success) {
          setSyncStatus(prev => ({
            ...prev,
            isConnected: true,
            clientId: result.clientId
          }));
          setIsInitialized(true);
          
          // Load initial data from network
          await loadFromNetwork();
        } else {
          console.error('Failed to initialize sync:', result.error);
        }
      } catch (error) {
        console.error('Sync initialization error:', error);
      }
    };

    initializeSync();
  }, []);

  // Listen for file changes from other clients
  useEffect(() => {
    if (!isInitialized) return;

    const handleFileChanged = async () => {
      console.log('Sync file changed by another client, checking for updates...');
      await checkForUpdates();
    };

    window.electronAPI.onSyncFileChanged(handleFileChanged);

    return () => {
      window.electronAPI.removeSyncFileChangedListener(handleFileChanged);
    };
  }, [isInitialized]);

  // Periodic check for changes (fallback if file watching fails)
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(async () => {
      await checkForUpdates();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  const checkForUpdates = useCallback(async () => {
    try {
      const result = await window.electronAPI.syncCheckChanges();
      if (result.hasChanges && result.weeks) {
        console.log('Remote changes detected, updating local state...');
        setWeeks(result.weeks);
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date()
        }));
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [setWeeks]);

  const saveToNetwork = useCallback(async () => {
    try {
      const result = await window.electronAPI.syncSave({ weeks });
      
      if (result.success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(),
          hasConflicts: false
        }));
        setCurrentConflict(null);
      } else if (result.conflict) {
        console.log('Conflict detected during save');
        setCurrentConflict(result.conflict);
        setSyncStatus(prev => ({
          ...prev,
          hasConflicts: true
        }));
      } else {
        console.error('Failed to save to network:', result.error);
      }
    } catch (error) {
      console.error('Network save error:', error);
    }
  }, [weeks]);

  const loadFromNetwork = useCallback(async () => {
    try {
      const result = await window.electronAPI.syncLoad();
      
      if (result.success && result.weeks) {
        setWeeks(result.weeks);
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date()
        }));
      } else {
        console.error('Failed to load from network:', result.error);
      }
    } catch (error) {
      console.error('Network load error:', error);
    }
  }, [setWeeks]);

  const resolveConflict = useCallback(async (useLocal: boolean) => {
    if (!currentConflict) return;

    try {
      const weeksToSave = useLocal ? currentConflict.local : currentConflict.remote;
      
      // Force save the chosen version
      setWeeks(weeksToSave);
      
      // Clear conflict state
      setCurrentConflict(null);
      setSyncStatus(prev => ({
        ...prev,
        hasConflicts: false
      }));

      // Save to network
      await saveToNetwork();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  }, [currentConflict, setWeeks, saveToNetwork]);

  return {
    syncStatus,
    saveToNetwork,
    loadFromNetwork,
    resolveConflict,
    currentConflict
  };
}
