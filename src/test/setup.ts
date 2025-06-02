import '@testing-library/jest-dom';

// Mock Electron API for tests
global.window.electronAPI = {
  importExcel: async () => ({ success: true, data: [] }),
  exportExcel: async () => ({ success: true, filePath: '' }),
  toggleFullscreen: async () => false,
  onMainProcessMessage: () => {}
};
