import { describe, it, expect } from 'vitest';
import { parseExcelData, validateStaffMember, createStaffMember } from '../utils/excelParser';

describe('excelParser', () => {
  describe('parseExcelData', () => {
    it('should parse valid Excel data correctly', () => {
      const input = [
        { name: 'Anna Andersson', workHours: '08:00-16:00', comments: 'Erfaren SSK' },
        { name: 'Björn Eriksson', workHours: 'Heldag', comments: '' }
      ];

      const result = parseExcelData(input);

      expect(result.success).toBe(true);
      expect(result.staff).toHaveLength(2);
      expect(result.staff[0].name).toBe('Anna Andersson');
      expect(result.staff[0].workHours).toBe('08:00-16:00');
      expect(result.staff[1].name).toBe('Björn Eriksson');
      expect(result.staff[1].workHours).toBe('Heldag');
    });

    it('should handle empty data', () => {
      const result = parseExcelData([]);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Ingen data att importera');
    });

    it('should validate required fields', () => {
      const input = [
        { name: '', workHours: '08:00-16:00', comments: '' },
        { name: 'Test Person', workHours: '', comments: '' }
      ];

      const result = parseExcelData(input);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1); // Missing name error
      expect(result.warnings).toHaveLength(1); // Missing work hours warning
    });
  });

  describe('validateStaffMember', () => {
    it('should validate correct staff member', () => {
      const staff = {
        name: 'Anna Andersson',
        workHours: '08:00-16:00',
        comments: 'Test comment'
      };

      const errors = validateStaffMember(staff);
      expect(errors).toHaveLength(0);
    });

    it('should catch validation errors', () => {
      const staff = {
        name: '',
        workHours: 'A'.repeat(100), // Too long
        comments: 'B'.repeat(600) // Too long
      };

      const errors = validateStaffMember(staff);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Namn krävs');
    });
  });

  describe('createStaffMember', () => {
    it('should create staff member with default values', () => {
      const staff = createStaffMember('Test Person');

      expect(staff.name).toBe('Test Person');
      expect(staff.workHours).toBe('');
      expect(staff.comments).toBe('');
      expect(staff.isCustom).toBe(true);
      expect(staff.id).toBeDefined();
    });

    it('should create staff member with provided values', () => {
      const staff = createStaffMember('Test Person', '08:00-16:00', 'Test comment', false);

      expect(staff.name).toBe('Test Person');
      expect(staff.workHours).toBe('08:00-16:00');
      expect(staff.comments).toBe('Test comment');
      expect(staff.isCustom).toBe(false);
    });
  });
});
