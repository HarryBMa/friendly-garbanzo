import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../renderer/stores/appStore';
import type { StaffMember } from '../renderer/types';

describe('Corridor Assignment Integration', () => {
  const mockStaff: StaffMember[] = [
    { id: 'staff-1', name: 'Anna Andersson', workHours: '08:00-16:00', comments: '' },
    { id: 'staff-2', name: 'Björn Eriksson', workHours: '08:00-16:00', comments: '' },
    { id: 'staff-3', name: 'Carl Larsson', workHours: '08:00-16:00', comments: '' },
  ];

  beforeEach(() => {
    // Reset the store state before each test
    useAppStore.setState({
      currentWeekId: 'week-test',
      currentDayId: 'day-måndag',
      weeks: [{
        id: 'week-test',
        name: 'Test Week',
        days: [{
          id: 'day-måndag',
          dayName: 'Måndag',
          date: new Date(),
          rooms: [
            { id: 'room-1', name: 'Sal 1', staff: {} },
            { id: 'room-2', name: 'Sal 2', staff: {} },
          ],
          corridorStaff: [
            {
              id: 'corridor-op-ssk',
              name: 'Op SSK',
              functions: [
                { id: 'op-76821', label: 'OP-SSK', pager: '76821', staff: undefined },
                { id: 'op-76822', label: 'USK', pager: '76822', staff: undefined },
                { id: 'op-76823', label: 'OP-SSK', pager: '76823', staff: undefined },
              ]
            },
            {
              id: 'corridor-ane-ssk',
              name: 'Ane SSK',
              functions: [
                { id: 'ane-76831', label: 'ANE-SSK', pager: '76831', staff: undefined },
                { id: 'ane-76832', label: 'USK', pager: '76832', staff: undefined },
              ]
            }
          ],
          availableStaff: [...mockStaff]
        }]
      }],
      availableStaff: [...mockStaff],
      settings: {
        currentDay: 'day-måndag',
        currentWeek: 'week-test',
        rooms: [],
        corridorStaff: []
      }
    });
  });

  describe('Staff Assignment to Corridor Functions', () => {
    it('should assign staff to corridor function successfully', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];
      const functionId = 'op-76821';

      // Assign staff to corridor function
      store.assignStaffToCorridorFunction(staffMember.id, functionId);

      // Get updated state
      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Find the corridor function and verify assignment
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      expect(opRole).toBeTruthy();
      
      const targetFunction = opRole!.functions.find(fn => fn.id === functionId);
      expect(targetFunction).toBeTruthy();
      expect(targetFunction!.staff).toEqual(staffMember);

      // Verify staff is removed from available staff
      expect(currentDay!.availableStaff).not.toContain(staffMember);
      expect(currentDay!.availableStaff.length).toBe(2);
    });

    it('should handle reassignment between corridor functions', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];

      // First assignment
      store.assignStaffToCorridorFunction(staffMember.id, 'op-76821');

      // Reassign to different function
      store.assignStaffToCorridorFunction(staffMember.id, 'ane-76831');

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify old assignment is cleared
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      const oldFunction = opRole!.functions.find(fn => fn.id === 'op-76821');
      expect(oldFunction!.staff).toBeUndefined();

      // Verify new assignment
      const aneRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-ane-ssk');
      const newFunction = aneRole!.functions.find(fn => fn.id === 'ane-76831');
      expect(newFunction!.staff).toEqual(staffMember);

      // Staff should still not be in available pool
      expect(currentDay!.availableStaff).not.toContain(staffMember);
      expect(currentDay!.availableStaff.length).toBe(2);
    });
  });

  describe('Staff Unassignment', () => {
    it('should unassign staff from corridor function and return to available pool', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];
      const functionId = 'op-76821';

      // First assign staff
      store.assignStaffToCorridorFunction(staffMember.id, functionId);

      // Then unassign
      store.unassignStaff(staffMember.id);

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify function assignment is cleared
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      const targetFunction = opRole!.functions.find(fn => fn.id === functionId);
      expect(targetFunction!.staff).toBeUndefined();

      // Verify staff is back in available pool
      expect(currentDay!.availableStaff.some(s => s.id === staffMember.id)).toBe(true);
      expect(currentDay!.availableStaff.length).toBe(3);
    });

    it('should handle unassignment of staff from room assignments', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];

      // Assign to room first
      store.assignStaffToRoom(staffMember.id, 'room-1', 'opSSK');

      // Then unassign
      store.unassignStaff(staffMember.id);

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify room assignment is cleared
      const room = currentDay!.rooms.find(r => r.id === 'room-1');
      expect(room!.staff.opSSK).toBeUndefined();

      // Verify staff is back in available pool
      expect(currentDay!.availableStaff.some(s => s.id === staffMember.id)).toBe(true);
      expect(currentDay!.availableStaff.length).toBe(3);
    });
  });
  describe('Cross-System Assignments', () => {
    it('should handle staff movement from room to corridor function', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];

      // First assign to room (using valid role 'opSSK')
      store.assignStaffToRoom(staffMember.id, 'room-1', 'opSSK');

      // Then reassign to corridor function
      store.assignStaffToCorridorFunction(staffMember.id, 'op-76821');

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify room assignment is cleared
      const room = currentDay!.rooms.find(r => r.id === 'room-1');
      expect(room!.staff.opSSK).toBeUndefined();

      // Verify corridor function assignment
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      const targetFunction = opRole!.functions.find(fn => fn.id === 'op-76821');
      expect(targetFunction!.staff).toEqual(staffMember);

      // Staff should not be in available pool
      expect(currentDay!.availableStaff).not.toContain(staffMember);
      expect(currentDay!.availableStaff.length).toBe(2);
    });

    it('should handle staff movement from corridor function to room', () => {
      const store = useAppStore.getState();
      const staffMember = mockStaff[0];

      // First assign to corridor function
      store.assignStaffToCorridorFunction(staffMember.id, 'op-76821');

      // Then reassign to room (using valid role 'opSSK')
      store.assignStaffToRoom(staffMember.id, 'room-1', 'opSSK');

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify corridor function assignment is cleared
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      const targetFunction = opRole!.functions.find(fn => fn.id === 'op-76821');
      expect(targetFunction!.staff).toBeUndefined();

      // Verify room assignment
      const room = currentDay!.rooms.find(r => r.id === 'room-1');
      expect(room!.staff.opSSK && room!.staff.opSSK.some(s => s.id === staffMember.id)).toBe(true);

      // Staff should not be in available pool
      expect(currentDay!.availableStaff).not.toContain(staffMember);
      expect(currentDay!.availableStaff.length).toBe(2);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across multiple assignments', () => {
      const store = useAppStore.getState();

      // Assign different staff to different functions
      store.assignStaffToCorridorFunction(mockStaff[0].id, 'op-76821');
      store.assignStaffToCorridorFunction(mockStaff[1].id, 'ane-76831');
      store.assignStaffToRoom(mockStaff[2].id, 'room-1', 'opSSK');

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify all assignments
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      const opFunction = opRole!.functions.find(fn => fn.id === 'op-76821');
      expect(opFunction!.staff).toEqual(mockStaff[0]);

      const aneRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-ane-ssk');
      const aneFunction = aneRole!.functions.find(fn => fn.id === 'ane-76831');
      expect(aneFunction!.staff).toEqual(mockStaff[1]);

      const room = currentDay!.rooms.find(r => r.id === 'room-1');
      expect(room!.staff.opSSK).toContain(mockStaff[2]);

      // No staff should be in available pool
      expect(currentDay!.availableStaff.length).toBe(0);
    });

    it('should handle complex reassignment scenarios without data corruption', () => {
      const store = useAppStore.getState();

      // Initial assignments
      store.assignStaffToCorridorFunction(mockStaff[0].id, 'op-76821');
      store.assignStaffToCorridorFunction(mockStaff[1].id, 'ane-76831');

      // Reassign staff[0] to different corridor function
      store.assignStaffToCorridorFunction(mockStaff[0].id, 'op-76822');

      // Unassign staff[1]
      store.unassignStaff(mockStaff[1].id);

      const currentDay = store.getCurrentDay();
      expect(currentDay).toBeTruthy();

      // Verify final state
      const opRole = currentDay!.corridorStaff.find(role => role.id === 'corridor-op-ssk');
      // Original assignment should be cleared
      const oldFunction = opRole!.functions.find(fn => fn.id === 'op-76821');
      expect(oldFunction!.staff).toBeUndefined();
      // New assignment should be active
      const newFunction = opRole!.functions.find(fn => fn.id === 'op-76822');
      expect(newFunction!.staff).toEqual(mockStaff[0]);
      // Unassigned staff should be back in available pool
      expect(currentDay!.availableStaff.some(s => s.id === mockStaff[1].id)).toBe(true);
      expect(currentDay!.availableStaff.length).toBe(2); // staff[1] and staff[2]
    });
  });
});
