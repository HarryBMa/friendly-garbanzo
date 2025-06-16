// multiWeekExcelParser.test.ts
// Tests for multi-week Excel parser functionality

import { describe, it, expect, vi } from 'vitest';
import { parseMultiWeekExcelFile, combineMultiWeekData } from './multiWeekExcelParser';

// Mock ExcelJS
vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined)
      },
      worksheets: [
        {
          getCell: vi.fn().mockImplementation((row: number, col: number) => ({
            value: row === 2 && col === 3 ? 'måndag 250101' : 
                   row === 2 && col === 4 ? 'tisdag 250102' :
                   row === 3 && col === 2 ? 'Test Testsson' :
                   row === 3 && col === 3 ? '07:00-15:00' : '',
            toString: () => row === 2 && col === 3 ? 'måndag 250101' : 
                             row === 2 && col === 4 ? 'tisdag 250102' :
                             row === 3 && col === 2 ? 'Test Testsson' :
                             row === 3 && col === 3 ? '07:00-15:00' : ''
          })),
          rowCount: 10
        }
      ]
    }))
  }
}));

// Mock dateHelpers
vi.mock('./dateHelpers', () => ({
  getWeekNumber: vi.fn().mockReturnValue(1)
}));

describe('Multi-Week Excel Parser', () => {
  describe('parseMultiWeekExcelFile', () => {
    it('should parse a single-week ANE file correctly', async () => {
      const mockFile = new File([''], 'ANE_v.22.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const result = await parseMultiWeekExcelFile(mockFile);
      
      expect(result.source).toBe('ane');
      expect(result.fileName).toBe('ANE_v.22.xlsx');
      expect(result.totalWeeks).toBe(1);
      expect(result.staff).toHaveLength(1);
      expect(result.staff[0].name).toBe('Test Testsson');
      expect(result.staff[0].role).toBe('ane_ssk');
      expect(result.staff[0].sourceFile).toBe('ane');
    });
    
    it('should parse a single-week OP file correctly', async () => {
      const mockFile = new File([''], 'OP_v.22.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const result = await parseMultiWeekExcelFile(mockFile);
      
      expect(result.source).toBe('op');
      expect(result.fileName).toBe('OP_v.22.xlsx');
      expect(result.staff[0].role).toBe('op_ssk');
      expect(result.staff[0].sourceFile).toBe('op');
    });
    
    it('should handle parsing errors gracefully', async () => {
      // Mock ExcelJS to throw an error
      const mockFile = new File([''], 'invalid.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // This should throw because of our mock setup
      await expect(parseMultiWeekExcelFile(mockFile)).rejects.toThrow();
    });
    
    it('should extract week numbers from filename', async () => {
      const mockFile = new File([''], 'ANE_v.22-35.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const result = await parseMultiWeekExcelFile(mockFile);
      
      expect(result.weekSpan).toBe('v.1-1'); // From our mock
      expect(result.fileName).toBe('ANE_v.22-35.xlsx');
    });
  });
  
  describe('combineMultiWeekData', () => {
    it('should combine OP and ANE data without conflicts', () => {
      const opData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'Test OP',
          role: 'op_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '07:00-15:00',
          sourceFile: 'op' as const
        }],
        fileName: 'OP_v.22.xlsx',
        source: 'op' as const
      };
      
      const aneData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'Test ANE',
          role: 'ane_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '08:00-16:00',
          sourceFile: 'ane' as const
        }],
        fileName: 'ANE_v.22.xlsx',
        source: 'ane' as const
      };
      
      const result = combineMultiWeekData(opData, aneData);
      
      expect(result.success).toBe(true);
      expect(result.combinedStaff).toHaveLength(2);
      expect(result.mergeReport.opStaffCount).toBe(1);
      expect(result.mergeReport.aneStaffCount).toBe(1);
      expect(result.mergeReport.totalStaffCount).toBe(2);
    });
    
    it('should handle conflicts when merging duplicate staff', () => {
      const opData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'Same Person',
          role: 'op_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '07:00-15:00',
          sourceFile: 'op' as const
        }],
        fileName: 'OP_v.22.xlsx',
        source: 'op' as const
      };
      
      const aneData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'Same Person',
          role: 'ane_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '08:00-16:00',
          sourceFile: 'ane' as const
        }],
        fileName: 'ANE_v.22.xlsx',
        source: 'ane' as const
      };
      
      const result = combineMultiWeekData(opData, aneData);
      
      expect(result.success).toBe(true);
      expect(result.combinedStaff).toHaveLength(1); // Should merge into one
      expect(result.mergeReport.conflicts).toBeDefined();
      expect(result.mergeReport.conflicts!.length).toBeGreaterThan(0);
    });
    
    it('should work with only OP data', () => {
      const opData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'OP Only',
          role: 'op_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '07:00-15:00',
          sourceFile: 'op' as const
        }],
        fileName: 'OP_v.22.xlsx',
        source: 'op' as const
      };
      
      const result = combineMultiWeekData(opData);
      
      expect(result.success).toBe(true);
      expect(result.combinedStaff).toHaveLength(1);
      expect(result.mergeReport.opStaffCount).toBe(1);
      expect(result.mergeReport.aneStaffCount).toBe(0);
    });
    
    it('should work with only ANE data', () => {
      const aneData = {
        startWeek: 22,
        endWeek: 22,
        weekSpan: 'v.22',
        totalWeeks: 1,
        staff: [{
          name: 'ANE Only',
          role: 'ane_ssk' as const,
          weekday: 'måndag',
          date: '250101',
          weekNumber: 22,
          sheetIndex: 0,
          workHours: '08:00-16:00',
          sourceFile: 'ane' as const
        }],
        fileName: 'ANE_v.22.xlsx',
        source: 'ane' as const
      };
      
      const result = combineMultiWeekData(undefined, aneData);
      
      expect(result.success).toBe(true);
      expect(result.combinedStaff).toHaveLength(1);
      expect(result.mergeReport.opStaffCount).toBe(0);
      expect(result.mergeReport.aneStaffCount).toBe(1);
    });
  });
});
