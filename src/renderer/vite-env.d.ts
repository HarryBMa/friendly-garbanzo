/// <reference types="vite/client" />

interface ElectronAPI {
  importExcel: (filePath?: string) => Promise<{
    success: boolean;
    data: Array<{
      name: string;
      workHours: string;
      comments: string;
    }>;
    errors?: string[];
  }>;
  exportExcel: (data: any) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  toggleFullscreen: () => Promise<boolean>;
  onMainProcessMessage: (callback: (value: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Electron API declarations
interface ElectronAPI {
  importExcel: (filePath?: string) => Promise<any>;
  exportExcel: (data: any) => Promise<any>;
  toggleFullscreen: () => Promise<boolean>;
  onMainProcessMessage: (callback: (value: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
