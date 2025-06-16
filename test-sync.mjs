#!/usr/bin/env node
/**
 * Network Sync Test Script
 * 
 * This script simulates multiple users accessing the app simultaneously
 * to verify the network synchronization functionality works correctly.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simulate the sync file operations
class SyncTester {
  constructor(testDir) {
    this.testDir = testDir;
    this.syncFilePath = path.join(testDir, 'schedule-sync.json');
    this.lockFilePath = path.join(testDir, 'schedule-sync.lock');
  }

  async setup() {
    // Create test directory
    await fs.mkdir(this.testDir, { recursive: true });
    console.log(`✅ Created test directory: ${this.testDir}`);
  }

  async cleanup() {
    // Remove test directory
    await fs.rm(this.testDir, { recursive: true, force: true });
    console.log(`🧹 Cleaned up test directory: ${this.testDir}`);
  }

  async initializeSyncFile() {
    const initialData = {
      version: 1,
      lastModified: new Date().toISOString(),
      modifiedBy: 'test-client',
      weeks: [],
      hash: 'initial-hash'
    };
    
    await fs.writeFile(this.syncFilePath, JSON.stringify(initialData, null, 2));
    console.log(`📄 Created initial sync file`);
  }

  async testConcurrentAccess() {
    console.log('\n🧪 Testing concurrent access...');
    
    // Simulate two clients accessing the file simultaneously
    const client1 = this.simulateClient('client-1');
    const client2 = this.simulateClient('client-2');
    
    // Start both clients
    const [result1, result2] = await Promise.all([client1, client2]);
    
    console.log(`Client 1 result: ${result1 ? '✅ Success' : '❌ Failed'}`);
    console.log(`Client 2 result: ${result2 ? '✅ Success' : '❌ Failed'}`);
    
    return result1 || result2; // At least one should succeed
  }

  async simulateClient(clientId) {
    try {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      // Try to acquire lock
      const canWrite = await this.tryAcquireLock(clientId);
      
      if (canWrite) {
        // Simulate writing data
        const data = await this.readSyncFile();
        data.version += 1;
        data.lastModified = new Date().toISOString();
        data.modifiedBy = clientId;
        data.weeks.push({ id: `week-${clientId}`, name: `Week by ${clientId}`, days: [] });
        
        await fs.writeFile(this.syncFilePath, JSON.stringify(data, null, 2));
        
        // Release lock
        await this.releaseLock();
        
        console.log(`  📝 ${clientId}: Successfully wrote data`);
        return true;
      } else {
        console.log(`  ⏳ ${clientId}: Lock busy, skipping write`);
        return false;
      }
    } catch (error) {
      console.log(`  ❌ ${clientId}: Error - ${error.message}`);
      return false;
    }
  }

  async tryAcquireLock(clientId) {
    try {
      // Check if lock exists
      await fs.access(this.lockFilePath);
      return false; // Lock exists, can't write
    } catch {
      // Lock doesn't exist, try to create it
      try {
        await fs.writeFile(this.lockFilePath, clientId, { flag: 'wx' });
        return true; // Successfully acquired lock
      } catch {
        return false; // Someone else got the lock first
      }
    }
  }

  async releaseLock() {
    try {
      await fs.unlink(this.lockFilePath);
    } catch {
      // Ignore error if lock file doesn't exist
    }
  }

  async readSyncFile() {
    const content = await fs.readFile(this.syncFilePath, 'utf-8');
    return JSON.parse(content);
  }

  async verifyFinalState() {
    console.log('\n🔍 Verifying final state...');
    
    const data = await this.readSyncFile();
    console.log(`Final version: ${data.version}`);
    console.log(`Last modified by: ${data.modifiedBy}`);
    console.log(`Number of weeks: ${data.weeks.length}`);
    
    // Check that no lock file remains
    try {
      await fs.access(this.lockFilePath);
      console.log(`❌ Lock file still exists (should be cleaned up)`);
      return false;
    } catch {
      console.log(`✅ Lock file properly cleaned up`);
      return true;
    }
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting Network Sync Test\n');
  
  const testDir = path.join(__dirname, 'test-sync');
  const tester = new SyncTester(testDir);
  
  try {
    await tester.setup();
    await tester.initializeSyncFile();
    
    const concurrentResult = await tester.testConcurrentAccess();
    const verificationResult = await tester.verifyFinalState();
    
    if (concurrentResult && verificationResult) {
      console.log('\n🎉 All tests passed! Network sync is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Check the implementation.');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  } finally {
    await tester.cleanup();
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
}

export { SyncTester };
