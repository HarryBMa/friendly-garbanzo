import React from 'react';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { StaffMember } from '../../types';

/**
 * Custom hook for managing drag and drop operations in the Admin component.
 * Handles staff movement between available staff, operating rooms, and corridor positions.
 */
export function useDragAndDrop(
  getCurrentDay: () => any,
  assignStaffToRoom: (staffId: string, roomId: string, role: string) => void,
  assignStaffToCorridorFunction: (staffId: string, functionId: string) => void,
  unassignStaff: (staffId: string) => void
) {
  const [activeStaff, setActiveStaff] = React.useState<StaffMember | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    const currentDay = getCurrentDay();
    
    // Check if dragging from available staff
    const staffMember = currentDay?.availableStaff.find((s: StaffMember) => s.id === activeId);
    if (staffMember) {
      setActiveStaff(staffMember);
      return;
    }      // Check if dragging from corridor functions (corridor-staffId format)
    if (activeId.startsWith('corridor-')) {
      const staffId = activeId.replace('corridor-', '');
      
      // Find staff in corridor functions
      for (const role of currentDay?.corridorStaff || []) {
        for (const fn of role.functions) {
          if (fn.staff && fn.staff.id === staffId) {
            setActiveStaff(fn.staff);
            return;
          }
        }
      }
    }
    
    setActiveStaff(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStaff(null);

    if (!over) return;

    const activeId = active.id as string;
    const dropId = over.id as string;
    
    const currentDay = getCurrentDay();
    
    // Check if dragging from corridor
    const isDraggingFromCorridor = activeId.startsWith('corridor-');
    let staffMember: StaffMember | undefined;
    let fromCorridorCellId: string | null = null;      if (isDraggingFromCorridor) {
      const staffId = activeId.replace('corridor-', '');
      
      // Find staff in corridor functions
      for (const role of currentDay?.corridorStaff || []) {
        for (const fn of role.functions) {
          if (fn.staff && fn.staff.id === staffId) {
            staffMember = fn.staff;
            fromCorridorCellId = fn.id; // Use function id instead of cell id
            break;
          }
        }
      }
    } else {
      // Dragging from available staff
      const staffId = activeId;
      staffMember = currentDay?.availableStaff.find((s: StaffMember) => s.id === staffId);
    }
    
    if (!staffMember) return;

    // Handle drop target
    if (dropId.startsWith('room-')) {
      // Dropping into a room
      const [, roomId, role] = dropId.split('-');
      const room = currentDay?.rooms.find((r: any) => r.id === `room-${roomId}`);
      if (!room) return;
      
      // Enforce 1-3 staff per OR role
      let staffArr: StaffMember[] = [];
      switch (role) {
        case 'pass':
          staffArr = room.staff.pass || [];
          break;
        case 'opSSK':
          staffArr = room.staff.opSSK || [];
          break;
        case 'aneSSK':
          staffArr = room.staff.aneSSK || [];
          break;
        case 'student':
          staffArr = room.staff.students || [];
          break;
        default:
          break;
      }
      if (staffArr.length >= 3) {
        alert('Max 3 personal per roll i denna sal!');
        return;
      }
        // Remove from corridor if moving from there
      if (isDraggingFromCorridor && fromCorridorCellId) {
        unassignStaff(staffMember.id);
      }
      
      assignStaffToRoom(staffMember.id, `room-${roomId}`, role);    } else if (dropId === 'available-staff-zone') {
      // Dropping back into available staff
      if (isDraggingFromCorridor && fromCorridorCellId) {
        unassignStaff(staffMember.id);
      }
    } else if (dropId.startsWith('corridor-fn-')) {
      // Function-based corridor assignment
      const functionId = dropId.replace('corridor-fn-', '');
      let fnHasStaff = false;
      for (const role of currentDay?.corridorStaff || []) {
        for (const fn of role.functions) {
          if (fn.id === functionId && fn.staff) {
            fnHasStaff = true;
            break;
          }
        }
      }
      if (fnHasStaff) {
        alert('Endast 1 personal tillåten för denna funktion!');
        return;
      }      
      // Remove from corridor if moving from there
      if (isDraggingFromCorridor && fromCorridorCellId) {
        unassignStaff(staffMember.id);
      }
      
      assignStaffToCorridorFunction(staffMember.id, functionId);
    } else if (dropId === 'corridor-extra') {
      // Move staff to extra/blank (unassign from all functions/roles)
      if (isDraggingFromCorridor && fromCorridorCellId) {
        unassignStaff(staffMember.id);
      }
      unassignStaff(staffMember.id);
    }
  };
  return {
    activeStaff,
    handleDragStart,
    handleDragEnd,
    sensors
  };
}
