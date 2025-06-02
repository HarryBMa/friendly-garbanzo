import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  importExcel: (filePath: string) => ipcRenderer.invoke('import-excel', filePath),
  exportExcel: (data: any) => ipcRenderer.invoke('export-excel', data),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  onMainProcessMessage: (callback: (value: string) => void) => 
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
});
