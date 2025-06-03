// staffConverter.test.ts
import { describe, it, expect } from 'vitest';
import { 
  convertParsedStaffToMembers, 
  groupParsedStaffByWeekday, 
  getParsedStaffSummary 
} from './staffConverter';
import type { ParsedStaff } from '../types';

describe('staffConverter', () => {
  const mockParsedStaff: ParsedStaff[] = [
    {
      name: 'Anna Andersson',
      role: 'op_ssk',
      weekday: 'Måndag',
      date: '2024-11-25',
      workHours: '08:00-16:00',
      comments: 'Normal shift',
      sourceFile: 'op'
    },
    {
      name: 'Björn Bergström',
      role: 'ane_ssk',
      weekday: 'Måndag',
      date: '2024-11-25',
      workHours: '06:00-14:00',
      comments: 'Early shift',
      extraInfo: 'Backup available',
      sourceFile: 'ane'
    },
    {
      name: 'Anna Andersson',
      role: 'op_usk',
      weekday: 'Tisdag',
      date: '2024-11-26',
      workHours: '14:00-22:00',
      sourceFile: 'op'
    }
  ];

  describe('convertParsedStaffToMembers', () => {
    it('should convert parsed staff to staff members correctly', () => {
      const result = convertParsedStaffToMembers(mockParsedStaff);
      
      expect(result).toHaveLength(3);
      
      // Check Anna Andersson Monday entry
      const annaMonday = result.find(s => s.name.includes('Anna') && s.name.includes('Måndag'));
      expect(annaMonday).toBeDefined();
      expect(annaMonday!.workHours).toBe('08:00-16:00');
      expect(annaMonday!.comments).toContain('[OP] SSK');
      expect(annaMonday!.comments).toContain('Normal shift');
      expect(annaMonday!.isCustom).toBe(false);
      expect(annaMonday!.id).toBeDefined();
      
      // Check Björn entry
      const bjorn = result.find(s => s.name.includes('Björn'));
      expect(bjorn).toBeDefined();
      expect(bjorn!.workHours).toBe('06:00-14:00');
      expect(bjorn!.comments).toContain('[ANE] SSK');
      expect(bjorn!.comments).toContain('Early shift');
      expect(bjorn!.comments).toContain('Extra: Backup available');
      
      // Check Anna Tuesday entry
      const annaTuesday = result.find(s => s.name.includes('Anna') && s.name.includes('Tisdag'));
      expect(annaTuesday).toBeDefined();
      expect(annaTuesday!.workHours).toBe('14:00-22:00');
      expect(annaTuesday!.comments).toBe('[OP] USK');
    });

    it('should handle staff member with no work hours or comments', () => {
      const minimalStaff: ParsedStaff[] = [{
        name: 'Test Person',
        role: 'op_ssk',
        weekday: 'Onsdag',
        date: '2024-11-27',
        sourceFile: 'op'
      }];
      
      const result = convertParsedStaffToMembers(minimalStaff);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Person (Onsdag)');
      expect(result[0].workHours).toBe('');
      expect(result[0].comments).toBe('[OP] SSK');
    });

    it('should combine duplicate entries for same person same day', () => {
      const duplicateStaff: ParsedStaff[] = [
        {
          name: 'Test Person',
          role: 'op_ssk',
          weekday: 'Måndag',
          date: '2024-11-25',
          workHours: '08:00-16:00',
          comments: 'OP comment',
          sourceFile: 'op'
        },
        {
          name: 'Test Person',
          role: 'ane_ssk',
          weekday: 'Måndag',
          date: '2024-11-25',
          workHours: '06:00-14:00',
          comments: 'ANE comment',
          sourceFile: 'ane'
        }
      ];
      
      const result = convertParsedStaffToMembers(duplicateStaff);
      
      expect(result).toHaveLength(1);
      expect(result[0].workHours).toContain('08:00-16:00');
      expect(result[0].workHours).toContain('[ANE] 06:00-14:00');
      expect(result[0].comments).toContain('[OP] SSK | OP comment');
      expect(result[0].comments).toContain('[ANE] SSK | ANE comment');
    });
  });

  describe('groupParsedStaffByWeekday', () => {
    it('should group staff by weekday correctly', () => {
      const grouped = groupParsedStaffByWeekday(mockParsedStaff);
      
      expect(Object.keys(grouped)).toEqual(expect.arrayContaining(['Måndag', 'Tisdag']));
      expect(grouped['Måndag']).toHaveLength(2);
      expect(grouped['Tisdag']).toHaveLength(1);
      
      expect(grouped['Måndag'][0].name).toBe('Anna Andersson');
      expect(grouped['Måndag'][1].name).toBe('Björn Bergström');
      expect(grouped['Tisdag'][0].name).toBe('Anna Andersson');
    });

    it('should handle empty array', () => {
      const grouped = groupParsedStaffByWeekday([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });

  describe('getParsedStaffSummary', () => {
    it('should generate correct summary statistics', () => {
      const summary = getParsedStaffSummary(mockParsedStaff);
      
      expect(summary.totalEntries).toBe(3);
      expect(summary.uniqueStaff).toBe(2); // Anna and Björn
      
      expect(summary.bySource.op).toBe(2);
      expect(summary.bySource.ane).toBe(1);
      
      expect(summary.byRole.op_ssk).toBe(1);
      expect(summary.byRole.op_usk).toBe(1);
      expect(summary.byRole.ane_ssk).toBe(1);
      expect(summary.byRole.ane_usk).toBe(0);
      
      expect(summary.weekdays).toEqual(expect.arrayContaining(['Måndag', 'Tisdag']));
    });

    it('should handle empty data', () => {
      const summary = getParsedStaffSummary([]);
      
      expect(summary.totalEntries).toBe(0);
      expect(summary.uniqueStaff).toBe(0);
      expect(summary.bySource.op).toBe(0);
      expect(summary.bySource.ane).toBe(0);
      expect(summary.weekdays).toHaveLength(0);
    });
  });
});
