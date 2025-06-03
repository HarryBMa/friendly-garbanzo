// excelParser.test.ts
import { describe, it, expect, vi } from 'vitest';
import { parseExcelFiles } from './excelParser';

// Create a mock worksheet
const createMockWorksheet = () => ({
  rowCount: 10,  getCell: vi.fn((row: number, col: number) => {    // Mock header row data (row 2 for ANE, row 3 for OP)
    if ((row === 2 && col >= 3 && col <= 7) || (row === 3 && col >= 3 && col <= 7)) {
      const days = ['Mån 240610', 'Tis 240611', 'Ons 240612', 'Tor 240613', 'Fre 240614'];
      return { value: days[col - 3] || '', toString: () => days[col - 3] || '' };
    }
      // Mock staff names in column B (row 4+)
    if (col === 2 && row >= 4) {
      const names = ['Anna Andersson', 'Björn Eriksson', 'usk', 'Carl Larsson'];
      return { value: names[row - 4] || '', toString: () => names[row - 4] || '' };
    }
    
    // Mock work hours data
    if (row >= 4 && col >= 3 && col <= 7) {
      return { value: '08:00-16:00', toString: () => '08:00-16:00' };
    }
    
    return { value: '', toString: () => '' };
  })
});

// Mock ExcelJS
vi.mock('exceljs', () => ({
  Workbook: class {
    worksheets = [createMockWorksheet()];
    xlsx = {
      async load() {
        return Promise.resolve();
      }
    };
  }
}));

describe('excelParser', () => {
  describe('parseExcelFiles', () => {
    it('should parse two Excel files correctly', async () => {
      const mockFiles = [
        { 
          name: 'op_schema.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File,
        { 
          name: 'ane_schema.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File
      ];

      const result = await parseExcelFiles(mockFiles);

      expect(result.week).toBe('v.24');
      expect(result.staff).toBeInstanceOf(Array);
      expect(result.staff.length).toBeGreaterThan(0);
    });

    it('should throw error if not exactly 2 files provided', async () => {
      const singleFile = [
        { 
          name: 'single.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File
      ];

      await expect(parseExcelFiles(singleFile)).rejects.toThrow('Exactly two Excel files are required');
    });

    it('should detect OP and ANE file types correctly', async () => {
      const mockFiles = [
        { 
          name: 'vecka48_op.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File,
        { 
          name: 'vecka48_ane.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File
      ];

      const result = await parseExcelFiles(mockFiles);
      
      // Should have staff from both OP and ANE sources
      const opStaff = result.staff.filter(s => s.sourceFile === 'op');
      const aneStaff = result.staff.filter(s => s.sourceFile === 'ane');
      
      expect(opStaff.length).toBeGreaterThan(0);
      expect(aneStaff.length).toBeGreaterThan(0);
    });

    it('should handle role switching when USK appears', async () => {
      const mockFiles = [
        { 
          name: 'op_test.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File,
        { 
          name: 'ane_test.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File
      ];

      const result = await parseExcelFiles(mockFiles);
      
      // Check that we have different roles
      const roles = new Set(result.staff.map(s => s.role));
      expect(roles.size).toBeGreaterThan(1);
    });

    it('should extract week number from date correctly', async () => {
      const mockFiles = [
        { 
          name: 'op_schema.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File,
        { 
          name: 'ane_schema.xlsx',
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } as File
      ];

      const result = await parseExcelFiles(mockFiles);
      
      expect(result.week).toBe('v.24');
    });
  });
});
