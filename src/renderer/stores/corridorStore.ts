import { create } from 'zustand';
import type { StaffMember } from '../types';

interface CorridorState {
  // Staff assignments: { cellId: staffMember }
  assignments: Record<string, StaffMember>;
  
  // Extra corridor staff counts
  opExtraStaffCount: number; // OP always has at least 1 extra row
  aneExtraStaffCount: number; // ANE starts with 0
  
  // Actions
  assignStaff: (cellId: string, staffMember: StaffMember) => void;
  removeStaffAssignment: (cellId: string) => void;
  addOpExtraStaff: () => void;
  removeOpExtraStaff: () => void;
  addAneExtraStaff: () => void;
  removeAneExtraStaff: () => void;
  clearAllAssignments: () => void;
  getAssignedStaff: (cellId: string) => StaffMember | null;
  isStaffAssigned: (staffMember: StaffMember) => boolean;
  moveStaff: (fromCellId: string, toCellId: string) => void;
}

const useCorridorStore = create<CorridorState>((set, get) => ({
  // Staff assignments: { cellId: staffMember }
  assignments: {},
  
  // Extra corridor staff counts
  opExtraStaffCount: 1, // OP always has at least 1 extra row
  aneExtraStaffCount: 0, // ANE starts with 0
  
  // Actions
  assignStaff: (cellId: string, staffMember: StaffMember) =>
    set((state) => ({
      assignments: {
        ...state.assignments,
        [cellId]: staffMember,
      },
    })),
  
  removeStaffAssignment: (cellId: string) =>
    set((state) => {
      const newAssignments = { ...state.assignments };
      delete newAssignments[cellId];
      return { assignments: newAssignments };
    }),
  
  addOpExtraStaff: () =>
    set((state) => ({
      opExtraStaffCount: state.opExtraStaffCount + 1,
    })),
  
  removeOpExtraStaff: () =>
    set((state) => ({
      opExtraStaffCount: Math.max(1, state.opExtraStaffCount - 1), // Keep at least 1
    })),
  
  addAneExtraStaff: () =>
    set((state) => ({
      aneExtraStaffCount: state.aneExtraStaffCount + 1,
    })),
  
  removeAneExtraStaff: () =>
    set((state) => ({
      aneExtraStaffCount: Math.max(0, state.aneExtraStaffCount - 1),
    })),
  
  // Clear all assignments
  clearAllAssignments: () =>
    set(() => ({
      assignments: {},
    })),
  
  // Get assigned staff for a cell
  getAssignedStaff: (cellId: string) => {
    const state = get();
    return state.assignments[cellId] || null;
  },
  
  // Check if staff member is already assigned somewhere
  isStaffAssigned: (staffMember: StaffMember) => {
    const state = get();
    return Object.values(state.assignments).some(
      (assigned) => assigned?.id === staffMember?.id
    );
  },
  
  // Move staff from one cell to another
  moveStaff: (fromCellId: string, toCellId: string) =>
    set((state) => {
      const staffMember = state.assignments[fromCellId];
      if (!staffMember) return state;
      
      const newAssignments = { ...state.assignments };
      delete newAssignments[fromCellId];
      newAssignments[toCellId] = staffMember;
      
      return { assignments: newAssignments };
    }),
}));

export default useCorridorStore;
