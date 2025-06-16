import '@testing-library/jest-dom';

// Mock Electron API for tests
global.window.electronAPI = {
  importExcel: async () => ({ success: true, data: [] }),
  importDualExcel: async () => ({ 
    success: true, 
    week: 'Vecka 1', 
    opFileName: 'test-op.xlsx', 
    aneFileName: 'test-ane.xlsx', 
    data: [] 
  }),
  exportExcel: async () => ({ success: true, filePath: '' }),
  toggleFullscreen: async () => false,
  onMainProcessMessage: () => {},
  
  // Network sync mocks
  syncInit: async () => ({ success: true, clientId: 'test-client' }),
  syncSave: async () => ({ success: true }),
  syncLoad: async () => ({ success: true, weeks: [] }),
  syncCheckChanges: async () => ({ hasChanges: false }),
  onSyncFileChanged: () => {},
  removeSyncFileChangedListener: () => {},
};
