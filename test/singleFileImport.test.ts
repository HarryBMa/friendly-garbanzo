// singleFileImport.test.ts
// Unit test to verify that single file import works with structured OP/ANE format

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importStaffFromExcel } from '../src/main/fileHandler';

// Mock ExcelJS
const mockWorkbook = {
  xlsx: {
    readFile: vi.fn()
  },
  getWorksheet: vi.fn()
};

const mockWorksheet = {
  name: 'OP_v.48',
  rowCount: 10,
  columnCount: 8,
  getCell: vi.fn()
};

vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn(() => mockWorkbook)
  }
}));

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn()
  }
}));

describe('Single File Import - Structured Format Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkbook.getWorksheet.mockReturnValue(mockWorksheet);
  });

  it('should handle structured OP file format successfully', async () => {
    // Mock structured OP file parsing
    mockWorksheet.getCell.mockImplementation((row: number, col: number) => {
      // Header row (row 3 for OP)
      if (row === 3) {
        const headers = ['', '', 'Måndag 241202', 'Tisdag 241203', 'Onsdag 241204', 'Torsdag 241205', 'Fredag 241206'];
        return { value: headers[col] || '', toString: () => headers[col] || '' };
      }
      
      // Staff name in column 2
      if (col === 2 && row >= 4) {
        const names = ['Anna Andersson', 'Björn Eriksson', 'USK', 'Carl Larsson'];
        const name = names[row - 4] || '';
        return { value: name, toString: () => name };
      }
      
      // Work hours in columns 3-7
      if (row >= 4 && col >= 3 && col <= 7 && row !== 6) { // Skip USK row
        return { value: '08:00-16:00', toString: () => '08:00-16:00' };
      }
      
      return { value: '', toString: () => '' };
    });

    const result = await importStaffFromExcel('/test/OP_v.48.xlsx');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);
    
    // Should have staff entries with weekday appended to names
    const hasWeekdayNames = result.data.some(staff => 
      staff.name.includes('(Måndag)') || staff.name.includes('(Tisdag)')
    );
    expect(hasWeekdayNames).toBe(true);
  });

  it('should handle structured ANE file format successfully', async () => {
    // Mock structured ANE file parsing (header on row 2)
    mockWorksheet.getCell.mockImplementation((row: number, col: number) => {
      // Header row (row 2 for ANE)
      if (row === 2) {
        const headers = ['', '', 'Måndag 241202', 'Tisdag 241203', 'Onsdag 241204', 'Torsdag 241205', 'Fredag 241206'];
        return { value: headers[col] || '', toString: () => headers[col] || '' };
      }
      
      // Staff name in column 2
      if (col === 2 && row >= 3) {
        const names = ['Eva Lindström', 'Fredrik Nilsson', 'USK', 'Gustav Persson'];
        const name = names[row - 3] || '';
        return { value: name, toString: () => name };
      }
      
      // Work hours in columns 3-7
      if (row >= 3 && col >= 3 && col <= 7 && row !== 5) { // Skip USK row
        return { value: '07:00-15:30', toString: () => '07:00-15:30' };
      }
      
      return { value: '', toString: () => '' };
    });

    const result = await importStaffFromExcel('/test/ANE_v.48.xlsx');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);
    
    // Should have ANE role in comments
    const hasAneRole = result.data.some(staff => 
      staff.comments.includes('ANE SSK')
    );
    expect(hasAneRole).toBe(true);
  });

  it('should fallback to simple format when structured parsing fails', async () => {
    // Mock simple 3-column format
    const mockSimpleWorksheet = {
      eachRow: vi.fn((callback) => {
        // Header row
        callback({ getCell: () => ({ text: 'Name' }) }, 1);
        // Data rows
        callback({
          getCell: (col: number) => {
            if (col === 1) return { text: 'Test Staff' };
            if (col === 2) return { text: '08:00-16:00' };
            if (col === 3) return { text: 'Test comments' };
            return { text: '' };
          }
        }, 2);
      })
    };

    // First call (structured parsing) should fail, second call (simple parsing) should succeed
    mockWorkbook.getWorksheet
      .mockReturnValueOnce(null) // Structured parsing fails
      .mockReturnValueOnce(mockSimpleWorksheet); // Simple parsing succeeds

    const result = await importStaffFromExcel('/test/simple.xlsx');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Test Staff');
    expect(result.data[0].workHours).toBe('08:00-16:00');
    expect(result.data[0].comments).toBe('Test comments');
  });

  it('should return error when both parsing methods fail', async () => {
    mockWorkbook.getWorksheet.mockReturnValue(null);

    const result = await importStaffFromExcel('/test/invalid.xlsx');

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
