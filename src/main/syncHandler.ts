import { app, ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { watch } from 'fs';
import type { WeekSchedule, SyncConflict } from '../renderer/types';

export class NetworkSyncHandler {
  private syncFilePath: string;
  private lockFilePath: string;
  private isWatching = false;
  private watcherCleanup?: () => void;
  private lastKnownHash: string = '';
  private clientId: string;

  constructor() {
    // Use the app directory (where the portable exe is located) for sync files
    const appPath = path.dirname(app.getPath('exe'));
    this.syncFilePath = path.join(appPath, 'schedule-sync.json');
    this.lockFilePath = path.join(appPath, 'schedule-sync.lock');
    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    // Initialize sync system
    ipcMain.handle('sync:init', async () => {
      try {
        await this.initializeSyncFile();
        this.startWatching();
        return { success: true, clientId: this.clientId };
      } catch (error) {
        console.error('Failed to initialize sync:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Save schedule to sync file
    ipcMain.handle('sync:save', async (_event, data: { weeks: WeekSchedule[] }) => {
      return await this.saveSchedule(data.weeks);
    });

    // Load schedule from sync file
    ipcMain.handle('sync:load', async () => {
      return await this.loadSchedule();
    });

    // Check if sync file has changed
    ipcMain.handle('sync:check-changes', async () => {
      return await this.checkForChanges();
    });

    // Cleanup when app is closing
    app.on('before-quit', () => {
      this.stopWatching();
    });
  }

  private async initializeSyncFile(): Promise<void> {
    try {
      // Check if sync file exists
      await fs.access(this.syncFilePath);
    } catch {
      // Create initial sync file if it doesn't exist
      const initialData = {
        version: 1,
        lastModified: new Date().toISOString(),
        modifiedBy: this.clientId,
        weeks: [],
        hash: this.generateHash([])
      };
      
      await fs.writeFile(this.syncFilePath, JSON.stringify(initialData, null, 2));
      this.lastKnownHash = initialData.hash;
    }
  }

  private async saveSchedule(weeks: WeekSchedule[]): Promise<{ success: boolean; conflict?: SyncConflict; error?: string }> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Check for lock file (another process is writing)
        await this.waitForLockRelease();

        // Create lock file
        await fs.writeFile(this.lockFilePath, this.clientId);

        try {
          // Read current state
          const currentData = await this.loadSyncFile();
          
          // Check for conflicts (someone else modified while we were working)
          if (currentData.hash !== this.lastKnownHash && currentData.modifiedBy !== this.clientId) {
            // Release lock
            await this.releaseLock();
            
            return {
              success: false,
              conflict: {
                local: weeks,
                remote: currentData.weeks,
                lastModified: currentData.lastModified,
                modifiedBy: currentData.modifiedBy
              }
            };
          }

          // No conflict, save our changes
          const newHash = this.generateHash(weeks);
          const syncData = {
            version: currentData.version + 1,
            lastModified: new Date().toISOString(),
            modifiedBy: this.clientId,
            weeks,
            hash: newHash
          };

          await fs.writeFile(this.syncFilePath, JSON.stringify(syncData, null, 2));
          this.lastKnownHash = newHash;

          // Release lock
          await this.releaseLock();

          return { success: true };

        } catch (error) {
          // Release lock on error
          await this.releaseLock();
          throw error;
        }

      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save after multiple retries'
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }

    return { success: false, error: 'Maximum retries exceeded' };
  }

  private async loadSchedule(): Promise<{ success: boolean; weeks?: WeekSchedule[]; error?: string }> {
    try {
      const data = await this.loadSyncFile();
      this.lastKnownHash = data.hash;
      return { success: true, weeks: data.weeks };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load schedule'
      };
    }
  }

  private async checkForChanges(): Promise<{ hasChanges: boolean; weeks?: WeekSchedule[] }> {
    try {
      const data = await this.loadSyncFile();
      
      if (data.hash !== this.lastKnownHash && data.modifiedBy !== this.clientId) {
        this.lastKnownHash = data.hash;
        return { hasChanges: true, weeks: data.weeks };
      }
      
      return { hasChanges: false };
    } catch (error) {
      console.error('Error checking for changes:', error);
      return { hasChanges: false };
    }
  }

  private async loadSyncFile(): Promise<{
    version: number;
    lastModified: string;
    modifiedBy: string;
    weeks: WeekSchedule[];
    hash: string;
  }> {
    const fileContent = await fs.readFile(this.syncFilePath, 'utf-8');
    return JSON.parse(fileContent);
  }

  private async waitForLockRelease(maxWaitMs = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      try {
        await fs.access(this.lockFilePath);
        // Lock exists, wait a bit
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch {
        // Lock doesn't exist, we can proceed
        return;
      }
    }
    
    // Lock has been there too long, force remove it
    try {
      await fs.unlink(this.lockFilePath);
    } catch {
      // Ignore error if lock file doesn't exist
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
    } catch {
      // Ignore error if lock file doesn't exist
    }
  }

  private generateHash(weeks: WeekSchedule[]): string {
    // Simple hash function for detecting changes
    const content = JSON.stringify(weeks, null, 0);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private startWatching(): void {
    if (this.isWatching) return;

    try {
      const watcher = watch(this.syncFilePath, { persistent: false }, (eventType: string) => {
        if (eventType === 'change') {          // Notify renderer process that file has changed
          const { BrowserWindow } = require('electron');
          const windows = BrowserWindow.getAllWindows();
          windows.forEach((window: any) => {
            window.webContents.send('sync:file-changed');
          });
        }
      });

      this.watcherCleanup = () => {
        if (typeof watcher.close === 'function') {
          watcher.close();
        }
      };

      this.isWatching = true;
    } catch (error) {
      console.error('Failed to start file watching:', error);
    }
  }

  private stopWatching(): void {
    if (this.watcherCleanup) {
      this.watcherCleanup();
      this.watcherCleanup = undefined;
    }
    this.isWatching = false;
  }
}

// Export singleton instance
export const networkSyncHandler = new NetworkSyncHandler();
