import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  importExcel: (filePath: string) => ipcRenderer.invoke('import-excel', filePath),
  importDualExcel: () => ipcRenderer.invoke('import-dual-excel'),
  exportExcel: (data: any) => ipcRenderer.invoke('export-excel', data),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  onMainProcessMessage: (callback: (value: string) => void) => 
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
    
  // Network sync methods
  syncInit: () => ipcRenderer.invoke('sync:init'),
  syncSave: (data: any) => ipcRenderer.invoke('sync:save', data),
  syncLoad: () => ipcRenderer.invoke('sync:load'),
  syncCheckChanges: () => ipcRenderer.invoke('sync:check-changes'),
  onSyncFileChanged: (callback: () => void) => 
    ipcRenderer.on('sync:file-changed', callback),
  removeSyncFileChangedListener: (callback: () => void) => 
    ipcRenderer.removeListener('sync:file-changed', callback),
});
