import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import { importStaffFromExcel, exportScheduleToExcel, importDualExcelFiles } from './fileHandler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));



// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.cjs
// │ │ └── preload.cjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;



process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(process.env.VITE_PUBLIC || __dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    // For dashboard mode on wall displays
    fullscreen: false,
    resizable: true,
    minimizable: true,
    maximizable: true,
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// Handle file operations for Excel import/export
ipcMain.handle('import-excel', async (_event, filePath?: string) => {
  return await importStaffFromExcel(filePath);
});

ipcMain.handle('import-dual-excel', async () => {
  return await importDualExcelFiles();
});

ipcMain.handle('export-excel', async (_event, data: any) => {
  return await exportScheduleToExcel(data);
});

// Handle fullscreen toggle for dashboard mode
ipcMain.handle('toggle-fullscreen', async () => {
  if (win) {
    win.setFullScreen(!win.isFullScreen());
    return win.isFullScreen();
  }
  return false;
});
