import React from 'react';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { StaffMember } from '../../types';
import useCorridorStore from '../../stores/corridorStore';

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
    }
    
    // Check if dragging from corridor (corridor-staffId format)
    if (activeId.startsWith('corridor-')) {
      const staffId = activeId.replace('corridor-', '');
      
      // Find which corridor cell this staff is in
      const { assignments } = useCorridorStore.getState();
      for (const [, assignedStaff] of Object.entries(assignments)) {
        if (assignedStaff?.id === staffId) {
          setActiveStaff(assignedStaff);
          return;
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
    let fromCorridorCellId: string | null = null;
    
    if (isDraggingFromCorridor) {
      const staffId = activeId.replace('corridor-', '');
      const { assignments } = useCorridorStore.getState();
      
      // Find which corridor cell this staff is currently in
      for (const [cellId, assignedStaff] of Object.entries(assignments)) {
        if (assignedStaff?.id === staffId) {
          staffMember = assignedStaff;
          fromCorridorCellId = cellId;
          break;
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
        const { removeStaffAssignment } = useCorridorStore.getState();
        removeStaffAssignment(fromCorridorCellId);
      }
      
      assignStaffToRoom(staffMember.id, `room-${roomId}`, role);
    } else if (dropId.startsWith('op-') || dropId.startsWith('ane-')) {
      // Dropping into corridor grid cells
      const { assignStaff, getAssignedStaff, removeStaffAssignment } = useCorridorStore.getState();
      
      // Check if target cell is already occupied
      const existingStaff = getAssignedStaff(dropId);
      if (existingStaff) {
        alert('Denna position är redan upptagen!');
        return;
      }
      
      // Remove from previous corridor cell if moving within corridor
      if (isDraggingFromCorridor && fromCorridorCellId) {
        removeStaffAssignment(fromCorridorCellId);
      } else {
        // Remove from available staff if moving from there
        unassignStaff(staffMember.id);
      }
      
      // Assign to new corridor cell
      assignStaff(dropId, staffMember);
    } else if (dropId === 'available-staff-zone') {
      // Dropping back into available staff
      if (isDraggingFromCorridor && fromCorridorCellId) {
        const { removeStaffAssignment } = useCorridorStore.getState();
        removeStaffAssignment(fromCorridorCellId);
        
        // Add back to available staff
        if (currentDay && !currentDay.availableStaff.find((s: StaffMember) => s.id === staffMember.id)) {
          currentDay.availableStaff.push(staffMember);
        }
      }
    } else if (dropId.startsWith('corridor-fn-')) {
      // Legacy corridor function slot
      const functionId = dropId.replace('corridor-fn-', '');
      let fnHasStaff = false;
      for (const role of currentDay?.corridorStaff || []) {
        for (const fn of role.functions) {
          if (fn.id === functionId) {
            if (fn.staff) {
              fnHasStaff = true;
            }
          }
        }
      }
      if (fnHasStaff) {
        alert('Endast 1 personal tillåten för denna funktion!');
        return;
      }
      
      // Remove from corridor if moving from there
      if (isDraggingFromCorridor && fromCorridorCellId) {
        const { removeStaffAssignment } = useCorridorStore.getState();
        removeStaffAssignment(fromCorridorCellId);
      }
      
      assignStaffToCorridorFunction(staffMember.id, functionId);
    } else if (dropId === 'corridor-extra') {
      // Move staff to extra/blank (unassign from all functions/roles)
      if (isDraggingFromCorridor && fromCorridorCellId) {
        const { removeStaffAssignment } = useCorridorStore.getState();
        removeStaffAssignment(fromCorridorCellId);
      }
      unassignStaff(staffMember.id);
    } else if (dropId.startsWith('corridor-')) {
      // Legacy corridor role assignment
      if (isDraggingFromCorridor && fromCorridorCellId) {
        const { removeStaffAssignment } = useCorridorStore.getState();
        removeStaffAssignment(fromCorridorCellId);
      }
    }
  };
  return {
    activeStaff,
    handleDragStart,
    handleDragEnd,
    sensors
  };
}
