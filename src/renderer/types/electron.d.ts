// Electron API types for renderer process
export interface ElectronAPI {
  importExcel: (filePath?: string) => Promise<{
    success: boolean;
    data: Array<{
      name: string;
      workHours: string;
      comments: string;
    }>;
    errors?: string[];
  }>;
  importDualExcel: () => Promise<{
    success: boolean;
    week: string;
    opFileName: string;
    aneFileName: string;
    data: Array<{
      name: string;
      workHours: string;
      comments: string;
    }>;
    errors?: string[];
    warnings?: string[];
  }>;
  exportExcel: (data: any) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  toggleFullscreen: () => Promise<boolean>;
  onMainProcessMessage: (callback: (value: string) => void) => void;

  // Network sync API
  syncInit: () => Promise<{ success: boolean; clientId: string; error?: string }>;
  syncSave: (data: { weeks: import('./index').WeekSchedule[] }) => Promise<{
    success: boolean;
    conflict?: import('./index').SyncConflict;
    error?: string;
  }>;
  syncLoad: () => Promise<{
    success: boolean;
    weeks?: import('./index').WeekSchedule[];
    error?: string;
  }>;
  syncCheckChanges: () => Promise<{
    hasChanges: boolean;
    weeks?: import('./index').WeekSchedule[];
  }>;
  onSyncFileChanged: (callback: () => void) => void;
  removeSyncFileChangedListener: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
