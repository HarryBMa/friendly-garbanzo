// integration.test.ts
// Integration test to verify the complete workflow from Excel parsing to app store import

import { describe, it, expect, vi } from 'vitest';
import { parseExcelFiles } from './excelParser';
import { convertParsedStaffToMembers } from './staffConverter';

// Mock ExcelJS with proper test data
const createMockWorksheet = () => ({
  rowCount: 10,
  getCell: vi.fn((row: number, col: number) => {
    // Mock header row data (row 2 for ANE, row 3 for OP)
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

describe('Integration Test: Excel Parser → Staff Converter → App Store', () => {
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

  it('should complete the full integration workflow', async () => {
    // Step 1: Parse Excel files
    const parseResult = await parseExcelFiles(mockFiles);
    
    expect(parseResult.week).toBe('v.24');
    expect(parseResult.staff).toBeInstanceOf(Array);
    expect(parseResult.staff.length).toBeGreaterThan(0);
    
    // Verify we have staff from both sources
    const opStaff = parseResult.staff.filter(s => s.sourceFile === 'op');
    const aneStaff = parseResult.staff.filter(s => s.sourceFile === 'ane');
    expect(opStaff.length).toBeGreaterThan(0);
    expect(aneStaff.length).toBeGreaterThan(0);
    
    // Step 2: Convert to StaffMember format
    const staffMembers = convertParsedStaffToMembers(parseResult.staff);
    
    expect(staffMembers).toBeInstanceOf(Array);
    expect(staffMembers.length).toBeGreaterThan(0);
      // Verify staff members have required properties per StaffMember interface
    staffMembers.forEach(member => {
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('name');
      expect(member).toHaveProperty('workHours');
      expect(member).toHaveProperty('comments');
      expect(member).toHaveProperty('isCustom');
      expect(typeof member.id).toBe('string');
      expect(typeof member.name).toBe('string');
      expect(typeof member.workHours).toBe('string');
      expect(typeof member.comments).toBe('string');
    });
    
    // Verify we have staff from both OP and ANE sources (check comments for source tags)
    const opMembers = staffMembers.filter(m => m.comments.includes('[OP]'));
    const aneMembers = staffMembers.filter(m => m.comments.includes('[ANE]'));
    expect(opMembers.length).toBeGreaterThan(0);
    expect(aneMembers.length).toBeGreaterThan(0);
    
    // Step 3: Verify staff members contain role information in comments
    const membersWithRoles = staffMembers.filter(m => 
      m.comments.includes('SSK') || m.comments.includes('USK')
    );
    expect(membersWithRoles.length).toBeGreaterThan(0);
  });
  it('should handle role transitions correctly', async () => {
    const parseResult = await parseExcelFiles(mockFiles);
    const staffMembers = convertParsedStaffToMembers(parseResult.staff);
    
    // Check that we have different roles in comments
    const rolesInComments = staffMembers.map(m => {
      if (m.comments.includes('SSK')) return 'SSK';
      if (m.comments.includes('USK')) return 'USK';
      return 'OTHER';
    });
    const uniqueRoles = new Set(rolesInComments);
    expect(uniqueRoles.size).toBeGreaterThan(1);
    
    // Should have both SSK and USK roles
    expect(rolesInComments.some(role => role === 'SSK')).toBe(true);
    expect(rolesInComments.some(role => role === 'USK')).toBe(true);
  });  it('should preserve week information throughout the workflow', async () => {
    const parseResult = await parseExcelFiles(mockFiles);
    
    // Week should be correctly extracted
    expect(parseResult.week).toBe('v.24');
    
    // Convert to staff members
    const staffMembers = convertParsedStaffToMembers(parseResult.staff);
    
    // Each staff member name should include the abbreviated weekday (from the parser output)
    staffMembers.forEach(member => {
      const hasWeekday = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'].some(day => 
        member.name.includes(day)
      );
      expect(hasWeekday).toBe(true);
    });
  });
  it('should handle empty or invalid data gracefully', async () => {
    // This test verifies that the integration handles edge cases
    const parseResult = await parseExcelFiles(mockFiles);
    const staffMembers = convertParsedStaffToMembers(parseResult.staff);
    
    // Should filter out empty entries
    expect(staffMembers.every(m => m.name.trim() !== '')).toBe(true);
    expect(staffMembers.every(m => m.id.trim() !== '')).toBe(true);
    
    // Should have meaningful role information in comments
    expect(staffMembers.every(m => m.comments && m.comments.trim() !== '')).toBe(true);
  });
});
