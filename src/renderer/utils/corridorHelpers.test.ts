import { describe, it, expect } from 'vitest';
import {
  createCorridorFunction,
  createCorridorRole,
  validateCorridorFunction,
  validateCorridorRole,
  countAssignedStaff,
  getLunchRoomsCovered,
  findFunctionByLabel
} from './corridorHelpers';
import type { CorridorRole, CorridorFunction } from '../types';

describe('corridorHelpers', () => {
  describe('createCorridorFunction', () => {
    // ✅ Normal case
    it('should create a corridor function with default values', () => {
      const func = createCorridorFunction('1301');

      expect(func.label).toBe('1301');
      expect(func.id).toBeDefined();
      expect(func.id).toMatch(/^function-/);
      expect(func.staff).toBeUndefined();
    });

    // 🧪 Edge case
    it('should create a corridor function with custom ID', () => {
      const customId = 'custom-function-id';
      const func = createCorridorFunction('Lunch 3704', customId);

      expect(func.label).toBe('Lunch 3704');
      expect(func.id).toBe(customId);
      expect(func.staff).toBeUndefined();
    });

    // ❌ Invalid case
    it('should handle empty label gracefully', () => {
      const func = createCorridorFunction('');
      
      expect(func.label).toBe('');
      expect(func.id).toBeDefined();
    });
  });

  describe('createCorridorRole', () => {
    // ✅ Normal case
    it('should create a corridor role with empty functions array', () => {
      const role = createCorridorRole('Op SSK');

      expect(role.name).toBe('Op SSK');
      expect(role.id).toBeDefined();
      expect(role.id).toMatch(/^role-/);
      expect(role.functions).toEqual([]);
    });

    // 🧪 Edge case
    it('should create all valid role types', () => {
      const opRole = createCorridorRole('Op SSK');
      const aneRole = createCorridorRole('Ane SSK');
      const passRole = createCorridorRole('Pass');

      expect(opRole.name).toBe('Op SSK');
      expect(aneRole.name).toBe('Ane SSK');
      expect(passRole.name).toBe('Pass');
    });

    // ✅ Normal case with custom ID
    it('should create a corridor role with custom ID', () => {
      const customId = 'custom-role-id';
      const role = createCorridorRole('Ane SSK', customId);

      expect(role.name).toBe('Ane SSK');
      expect(role.id).toBe(customId);
    });
  });
  describe('validateCorridorFunction', () => {
    // ✅ Normal case
    it('should validate a correct corridor function', () => {
      const validFunction: CorridorFunction = {
        id: 'test-id',
        label: '1301',
        pager: '1234',
        comments: 'Erfaren SSK',
        lunchRooms: ['3701', '3704'],
        staff: {
          id: 'staff-1',
          name: 'Anna Andersson',
          workHours: '08:00-16:00',
          comments: 'Erfaren SSK'
        }
      };

      const errors = validateCorridorFunction(validFunction);
      expect(errors).toHaveLength(0);
    });

    // ❌ Invalid case - missing label
    it('should catch missing label', () => {
      const invalidFunction: CorridorFunction = {
        id: 'test-id',
        label: '',
        staff: undefined
      };

      const errors = validateCorridorFunction(invalidFunction);
      expect(errors).toContain('Funktionsetikett krävs');
    });

    // ❌ Invalid case - too long label
    it('should catch label that is too long', () => {
      const invalidFunction: CorridorFunction = {
        id: 'test-id',
        label: 'A'.repeat(51),
        staff: undefined
      };

      const errors = validateCorridorFunction(invalidFunction);
      expect(errors).toContain('Funktionsetikett får inte vara längre än 50 tecken');
    });    // ❌ Invalid case - staff validation errors
    it('should validate staff data when present', () => {
      const invalidFunction: CorridorFunction = {
        id: 'test-id',
        label: '1301',
        pager: 'P'.repeat(21),
        lunchRooms: ['', 'A'.repeat(11)],
        staff: {
          id: 'staff-1',
          name: '',
          workHours: '',
          comments: 'C'.repeat(501)
        }
      };

      const errors = validateCorridorFunction(invalidFunction);
      expect(errors).toContain('Personalnamn krävs om personal är tilldelad');
      expect(errors).toContain('Arbetstider krävs om personal är tilldelad');
      expect(errors).toContain('Kommentarer får inte vara längre än 500 tecken');
      expect(errors).toContain('Sökarnummer får inte vara längre än 20 tecken');
      expect(errors).toContain('Lunch rum 1 får inte vara tomt');
      expect(errors).toContain('Lunch rum 2 får inte vara längre än 10 tecken');
    });

    // 🧪 Edge case - function without staff
    it('should validate function without staff assignment', () => {
      const functionWithoutStaff: CorridorFunction = {
        id: 'test-id',
        label: 'Beredskapsstråk',
        staff: undefined
      };

      const errors = validateCorridorFunction(functionWithoutStaff);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateCorridorRole', () => {    // ✅ Normal case
    it('should validate a correct corridor role', () => {
      const validRole: CorridorRole = {
        id: 'test-role-id',
        name: 'Op SSK',
        functions: [
          {
            id: 'func-1',
            label: '1301',
            staff: {
              id: 'staff-1',
              name: 'Anna Andersson',
              workHours: '08:00-16:00',
              comments: 'Erfaren SSK'
            }
          }
        ]
      };

      const errors = validateCorridorRole(validRole);
      expect(errors).toHaveLength(0);
    });// ❌ Invalid case - missing name
    it('should catch missing role name', () => {
      const invalidRole = {
        id: 'test-role-id',
        name: '',
        functions: []
      } as unknown as CorridorRole;

      const errors = validateCorridorRole(invalidRole);
      expect(errors).toContain('Rollnamn krävs');
    });

    // ✅ Valid case - any role name is now allowed
    it('should accept any valid role name', () => {
      const validRole = {
        id: 'test-role-id',
        name: 'Custom Role Name',
        functions: []
      } as CorridorRole;

      const errors = validateCorridorRole(validRole);
      expect(errors).toHaveLength(0);
    });

    // ❌ Invalid case - missing functions array
    it('should catch missing functions array', () => {
      const invalidRole = {
        id: 'test-role-id',
        name: 'Op SSK',
        functions: null
      } as unknown as CorridorRole;

      const errors = validateCorridorRole(invalidRole);
      expect(errors).toContain('Funktioner måste vara en array');
    });

    // 🧪 Edge case - role with function validation errors
    it('should propagate function validation errors', () => {
      const roleWithInvalidFunction: CorridorRole = {
        id: 'test-role-id',
        name: 'Op SSK',
        functions: [
          {
            id: 'func-1',
            label: '', // Invalid
            staff: undefined
          }
        ]
      };

      const errors = validateCorridorRole(roleWithInvalidFunction);
      expect(errors).toContain('Funktion 1: Funktionsetikett krävs');
    });
  });
  describe('countAssignedStaff', () => {
    // ✅ Normal case
    it('should count assigned staff correctly', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Op SSK',
        functions: [
          {
            id: 'func-1',
            label: '1301',
            staff: { 
              id: 'staff-1',
              name: 'Anna', 
              workHours: '08:00-16:00',
              comments: ''
            }
          },
          {
            id: 'func-2',
            label: '1302',
            staff: { 
              id: 'staff-2',
              name: 'Björn', 
              workHours: '08:00-16:00',
              comments: ''
            }
          },
          {
            id: 'func-3',
            label: '1303',
            staff: undefined
          }
        ]
      };

      const count = countAssignedStaff(role);
      expect(count).toBe(2);
    });

    // 🧪 Edge case - no assigned staff
    it('should return 0 for role with no assigned staff', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Pass',
        functions: [
          { id: 'func-1', label: 'Beredskapsstråk', staff: undefined },
          { id: 'func-2', label: 'Korridorsansvar', staff: undefined }
        ]
      };

      const count = countAssignedStaff(role);
      expect(count).toBe(0);
    });

    // ❌ Edge case - empty functions array
    it('should return 0 for role with empty functions array', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Ane SSK',
        functions: []
      };

      const count = countAssignedStaff(role);
      expect(count).toBe(0);
    });
  });
  describe('getLunchRoomsCovered', () => {
    // ✅ Normal case
    it('should get all lunch rooms covered by a role', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Op SSK',
        functions: [
          {
            id: 'func-1',
            label: '1301',
            lunchRooms: ['3701', '3704'],
            staff: {
              id: 'staff-1',
              name: 'Anna',
              workHours: '08:00-16:00',
              comments: ''
            }
          },
          {
            id: 'func-2',
            label: '1302',
            lunchRooms: ['3702', '3701'], // Duplicate 3701
            staff: {
              id: 'staff-2',
              name: 'Björn',
              workHours: '08:00-16:00',
              comments: ''
            }
          }
        ]
      };

      const rooms = getLunchRoomsCovered(role);
      expect(rooms).toEqual(['3701', '3702', '3704']); // Sorted and deduplicated
    });    // 🧪 Edge case - no lunch rooms
    it('should return empty array when no lunch rooms covered', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Pass',
        functions: [
          {
            id: 'func-1',
            label: 'Beredskapsstråk',
            staff: { 
              id: 'staff-1',
              name: 'Carl', 
              workHours: '08:00-16:00',
              comments: ''
            }
          }
        ]
      };

      const rooms = getLunchRoomsCovered(role);
      expect(rooms).toEqual([]);
    });

    // ❌ Edge case - no assigned staff
    it('should return empty array when no staff assigned', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Ane SSK',
        functions: [
          { id: 'func-1', label: '1301', staff: undefined }
        ]
      };

      const rooms = getLunchRoomsCovered(role);
      expect(rooms).toEqual([]);
    });
  });

  describe('findFunctionByLabel', () => {
    // ✅ Normal case
    it('should find function by label', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Op SSK',
        functions: [
          { id: 'func-1', label: '1301', staff: undefined },
          { id: 'func-2', label: 'Lunch 3704', staff: undefined },
          { id: 'func-3', label: 'Beredskapsstråk', staff: undefined }
        ]
      };

      const func = findFunctionByLabel(role, 'Lunch 3704');
      expect(func).toBeDefined();
      expect(func?.id).toBe('func-2');
      expect(func?.label).toBe('Lunch 3704');
    });

    // 🧪 Edge case - function not found
    it('should return undefined when function not found', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Pass',
        functions: [
          { id: 'func-1', label: '1301', staff: undefined }
        ]
      };

      const func = findFunctionByLabel(role, 'Nonexistent Label');
      expect(func).toBeUndefined();
    });

    // ❌ Edge case - empty functions array
    it('should return undefined for empty functions array', () => {
      const role: CorridorRole = {
        id: 'test-role',
        name: 'Ane SSK',
        functions: []
      };

      const func = findFunctionByLabel(role, '1301');
      expect(func).toBeUndefined();
    });
  });
});
