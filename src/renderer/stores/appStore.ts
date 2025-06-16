import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  DaySchedule, 
  WeekSchedule, 
  AppSettings, 
  StaffMember,
  OperatingRoom,
  CorridorRole,
  MultiWeekSchedule,
  MultiWeekImportResult
} from '../types';
import { SWEDISH_DAYS } from '../types';

interface AppState {
  // Current state
  currentWeekId: string;
  currentDayId: string;
  isDashboardMode: boolean;
  
  // Data
  weeks: WeekSchedule[];
  availableStaff: StaffMember[];
  
  // Multi-week support
  activeMultiWeekSchedule?: MultiWeekSchedule;
  
  // Settings
  settings: AppSettings;
  
  // Actions
  setCurrentDay: (dayId: string) => void;
  setCurrentWeek: (weekId: string) => void;
  setDashboardMode: (isEnabled: boolean) => void;
    // Staff management
  addStaff: (staff: StaffMember) => void;
  removeStaff: (staffId: string) => void;
  updateStaff: (staffId: string, updates: Partial<StaffMember>) => void;
  importStaff: (staffList: StaffMember[]) => void;
  importDualStaff: (staffList: StaffMember[], weekInfo: { week: string; opFileName: string; aneFileName: string }) => void;
  importStructuredExcel: (files: File[]) => Promise<{ success: boolean; week: string; staffCount: number; summary?: any; error?: string }>;

  // Multi-week import functions
  importMultiWeekFile: (file: File) => Promise<MultiWeekImportResult>;
  importIndependentFile: (file: File, mergeWithExisting?: boolean) => Promise<MultiWeekImportResult>;
  setActiveMultiWeek: (schedule: MultiWeekSchedule) => void;
  
  // Schedule management
  createWeek: (name: string) => WeekSchedule;
  duplicateWeek: (weekId: string, newName: string) => WeekSchedule;
  updateDaySchedule: (weekId: string, dayId: string, schedule: Partial<DaySchedule>) => void;
  setWeeks: (weeks: WeekSchedule[]) => void;
  
  // Settings management
  updateRoomSettings: (dayName: string, rooms: OperatingRoom[]) => void;
  updateCorridorSettings: (dayName: string, corridorStaff: CorridorRole[]) => void;
  
  // Staff assignment
  assignStaffToRoom: (staffId: string, roomId: string, role: string) => void;
  assignStaffToCorridor: (staffId: string, corridorRoleId: string) => void;  unassignStaff: (staffId: string) => void;
  moveStaffToAvailable: (staffId: string) => void;
  clearAvailableStaff: () => void;
  assignStaffToCorridorFunction: (staffId: string, functionId: string) => void;
  
  // Utility
  getCurrentDay: () => DaySchedule | undefined;
  getCurrentWeek: () => WeekSchedule | undefined;
  resetToDefaults: () => void;
}

const createDefaultDay = (dayName: string, index: number): DaySchedule => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1 + index); // Monday = 1
  
  return {
    id: `day-${dayName.toLowerCase()}`,
    dayName,
    date,
    rooms: [
      {
        id: 'room-1',
        name: 'Sal 1',
        staff: {}
      },
      {
        id: 'room-2', 
        name: 'Sal 2',
        staff: {}
      },
      {
        id: 'room-3',
        name: 'Sal 3', 
        staff: {}
      }
    ],    corridorStaff: [
      {
        id: 'corridor-op-ssk',
        name: 'Op SSK',
        functions: [
          { id: 'op-76821', label: 'OP-SSK', pager: '76821', staff: undefined },
          { id: 'op-76822', label: 'USK', pager: '76822', staff: undefined },
          { id: 'op-76823', label: 'OP-SSK', pager: '76823', staff: undefined },
          { id: 'op-78825', label: 'USK', pager: '78825', staff: undefined },
          { id: 'op-76824', label: 'MT', pager: '76824', staff: undefined },
          { id: 'op-74242', label: 'Allmän', pager: '74242', staff: undefined },
          { id: 'op-72618', label: 'Sterilen', pager: '72618', staff: undefined }
        ]
      },
      {
        id: 'corridor-ane-ssk',
        name: 'Ane SSK',
        functions: [
          { id: 'ane-73313', label: 'Allmän', pager: '73313', staff: undefined },
          { id: 'ane-78857', label: 'Allmän', pager: '78857', staff: undefined },
          { id: 'ane-73324', label: 'Allmän', pager: '73324', staff: undefined },
          { id: 'ane-70173', label: 'Allmän', pager: '70173', staff: undefined },
          { id: 'ane-70179', label: 'Ane USK', pager: '70179', staff: undefined },
          { id: 'ane-73740', label: 'Ane USK', pager: '73740', staff: undefined }
        ]
      },
      {
        id: 'corridor-pass',
        name: 'Pass',
        functions: [
          { id: 'pass-func-1', label: 'Beredskapsstråk', staff: undefined },
          { id: 'pass-func-2', label: 'Korridorsansvar', staff: undefined }
        ]
      }
    ],
    availableStaff: []
  };
};

const createDefaultWeek = (): WeekSchedule => ({
  id: 'week-default',
  name: 'Aktuell vecka',
  days: SWEDISH_DAYS.map((dayName, index) => createDefaultDay(dayName, index))
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({      // Initial state
      currentWeekId: 'week-default',
      currentDayId: 'day-måndag',
      isDashboardMode: false,
      weeks: [createDefaultWeek()],
      availableStaff: [],
      activeMultiWeekSchedule: undefined,
      settings: {
        currentDay: 'day-måndag',
        currentWeek: 'week-default',
        isDashboardMode: false,
        autoRefresh: false,
        refreshInterval: 30000 // 30 seconds
      },

      // Actions
      setCurrentDay: (dayId: string) => 
        set((state) => ({ 
          currentDayId: dayId,
          settings: { ...state.settings, currentDay: dayId }
        })),

      setCurrentWeek: (weekId: string) =>
        set((state) => ({ 
          currentWeekId: weekId,
          settings: { ...state.settings, currentWeek: weekId }
        })),

      setDashboardMode: (isEnabled: boolean) =>
        set((state) => ({ 
          isDashboardMode: isEnabled,
          settings: { ...state.settings, isDashboardMode: isEnabled }
        })),

      // Staff management

      addStaff: (staff: StaffMember) =>
        set((state) => ({
          availableStaff: [...state.availableStaff, staff]
        })),

      removeStaff: (staffId: string) =>
        set((state) => ({
          availableStaff: state.availableStaff.filter(s => s.id !== staffId)
        })),

      updateStaff: (staffId: string, updates: Partial<StaffMember>) =>
        set((state) => ({
          // Update global availableStaff (if used anywhere)
          availableStaff: state.availableStaff.map(s =>
            s.id === staffId ? { ...s, ...updates } : s
          ),
          // Update all days' availableStaff
          weeks: state.weeks.map(week => ({
            ...week,
            days: week.days.map(day => ({
              ...day,
              availableStaff: day.availableStaff.map(s =>
                s.id === staffId ? { ...s, ...updates } : s
              )
            }))
          }))
        })),      importStaff: (staffList: StaffMember[]) =>
  set((state) => ({
    weeks: state.weeks.map(week =>
      week.id === state.currentWeekId
        ? {
            ...week,
            days: week.days.map(day => ({
              ...day,
              availableStaff: [
                ...day.availableStaff,
                ...staffList.filter(staff => staff.name.endsWith(`(${day.dayName})`))
              ]
            }))
          }
        : week
    )
  })),

importDualStaff: (staffList: StaffMember[], weekInfo: { week: string; opFileName: string; aneFileName: string }) =>
  set((state) => ({
    weeks: state.weeks.map(week =>
      week.id === state.currentWeekId
        ? {
            ...week,
            name: `${weekInfo.week} (${weekInfo.opFileName} + ${weekInfo.aneFileName})`,
            days: week.days.map(day => ({
              ...day,
              availableStaff: [
                ...day.availableStaff,
                ...staffList.filter(staff => staff.name.endsWith(`(${day.dayName})`))
              ]
            }))
          }
        : week
    )
  })),


      importStructuredExcel: async (files: File[]) => {
  try {
    const { parseExcelFiles } = await import('../utils/excelParser');
    const { convertParsedStaffToMembers, getParsedStaffSummary } = await import('../utils/staffConverter');

    const parseResult = await parseExcelFiles(files);
    const staffMembers = convertParsedStaffToMembers(parseResult.staff);
    const summary = getParsedStaffSummary(parseResult.staff);

    set((state) => ({
      weeks: state.weeks.map(week =>
        week.id === state.currentWeekId
          ? {
              ...week,
              name: `${parseResult.week} (Structured Import)`,
              days: week.days.map(day => ({
                ...day,
                availableStaff: [
                  ...day.availableStaff,
                  ...staffMembers.filter(staff => staff.name.endsWith(`(${day.dayName})`))
                ]
              }))
            }
          : week
      )
    }));

    return {
      success: true,
      week: parseResult.week,
      staffCount: staffMembers.length,
      summary
    };
  } catch (error) {
    console.error('Structured Excel import error:', error);
    return {
      success: false,
      week: '',
      staffCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
},

      // Schedule management
      createWeek: (name: string) => {
        const newWeek: WeekSchedule = {
          id: `week-${Date.now()}`,
          name,
          days: SWEDISH_DAYS.map((dayName, index) => createDefaultDay(dayName, index))
        };
        
        set((state) => ({
          weeks: [...state.weeks, newWeek]
        }));
        
        return newWeek;
      },

      duplicateWeek: (weekId: string, newName: string) => {
        const { weeks } = get();
        const sourceWeek = weeks.find(w => w.id === weekId);
        
        if (!sourceWeek) {
          throw new Error(`Week with id ${weekId} not found`);
        }

        const newWeek: WeekSchedule = {
          id: `week-${Date.now()}`,
          name: newName,
          days: sourceWeek.days.map(day => ({ ...day, id: `${day.id}-${Date.now()}` }))
        };
        
        set((state) => ({
          weeks: [...state.weeks, newWeek]
        }));
        
        return newWeek;
      },      setWeeks: (weeks: WeekSchedule[]) =>
        set(() => ({ weeks })),

      updateDaySchedule: (weekId: string, dayId: string, schedule: Partial<DaySchedule>) =>
        set((state) => ({
          weeks: state.weeks.map(week =>
            week.id === weekId
              ? {
                  ...week,
                  days: week.days.map(day =>
                    day.id === dayId ? { ...day, ...schedule } : day
                  )
                }
              : week
          )
        })),

      // Settings management
      updateRoomSettings: (dayName: string, rooms: OperatingRoom[]) =>
        set((state) => ({
          weeks: state.weeks.map(week =>
            week.id === state.currentWeekId
              ? {
                  ...week,
                  days: week.days.map(day =>
                    day.dayName === dayName ? { ...day, rooms } : day
                  )
                }
              : week
          )
        })),

      updateCorridorSettings: (dayName: string, corridorStaff: CorridorRole[]) =>
        set((state) => ({
          weeks: state.weeks.map(week =>
            week.id === state.currentWeekId
              ? {
                  ...week,
                  days: week.days.map(day =>
                    day.dayName === dayName ? { ...day, corridorStaff } : day
                  )
                }
              : week
          )
        })),      // Staff assignment
      assignStaffToRoom: (staffId: string, roomId: string, role: string) =>
        set((state) => {
          const currentDay = state.weeks
            .find(w => w.id === state.currentWeekId)
            ?.days.find(d => d.id === state.currentDayId);
          if (!currentDay) return state;

          // Find the staff member from available staff, rooms, or corridor assignments
          let staffMember: StaffMember | undefined;
          
          // Check available staff first
          staffMember = currentDay.availableStaff.find(s => s.id === staffId);
          
          // If not in available, search in room assignments
          if (!staffMember) {
            for (const room of currentDay.rooms) {
              const staffAssignments = room.staff;
              if (staffAssignments.pass?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.pass.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.opSSK?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.opSSK.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.aneSSK?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.aneSSK.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.students?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.students.find(s => s.id === staffId);
                break;
              }
              if (staffMember) break;
            }
          }
          
          // If not found in rooms, search in corridor assignments
          if (!staffMember) {
            for (const corridorRole of currentDay.corridorStaff) {
              if (corridorRole.staff?.id === staffId) {
                staffMember = corridorRole.staff;
                break;
              }
              for (const fn of corridorRole.functions) {
                if (fn.staff?.id === staffId) {
                  staffMember = fn.staff;
                  break;
                }
              }
              if (staffMember) break;
            }
          }
          
          if (!staffMember) return state;

          // Remove from available staff
          const updatedAvailableStaff = currentDay.availableStaff.filter(s => s.id !== staffId);

          // Remove staff from all room assignments
          const cleanedRooms = currentDay.rooms.map(room => {
            const updatedStaff = { ...room.staff };
            if (updatedStaff.pass) {
              updatedStaff.pass = updatedStaff.pass.filter(s => s.id !== staffId);
              if (updatedStaff.pass.length === 0) delete updatedStaff.pass;
            }
            if (updatedStaff.opSSK) {
              updatedStaff.opSSK = updatedStaff.opSSK.filter(s => s.id !== staffId);
              if (updatedStaff.opSSK.length === 0) delete updatedStaff.opSSK;
            }
            if (updatedStaff.aneSSK) {
              updatedStaff.aneSSK = updatedStaff.aneSSK.filter(s => s.id !== staffId);
              if (updatedStaff.aneSSK.length === 0) delete updatedStaff.aneSSK;
            }
            if (updatedStaff.students) {
              updatedStaff.students = updatedStaff.students.filter(s => s.id !== staffId);
              if (updatedStaff.students.length === 0) delete updatedStaff.students;
            }
            return { ...room, staff: updatedStaff };
          });

          // Remove staff from all corridor assignments (both legacy and function-based)
          const cleanedCorridorStaff = currentDay.corridorStaff.map(corridorRole => ({
            ...corridorRole,
            staff: corridorRole.staff?.id === staffId ? undefined : corridorRole.staff,
            functions: corridorRole.functions.map(fn => {
              if (fn.staff && fn.staff.id === staffId) {
                return { ...fn, staff: undefined };
              }
              return fn;
            })
          }));

          // Now assign staff to the target room and role
          const updatedRooms = cleanedRooms.map(room => {
            if (room.id === roomId) {
              const updatedStaff = { ...room.staff };
              if (role === 'pass') {
                updatedStaff.pass = [...(updatedStaff.pass || []), staffMember].slice(0, 3);
              } else if (role === 'opSSK') {
                updatedStaff.opSSK = [...(updatedStaff.opSSK || []), staffMember].slice(0, 3);
              } else if (role === 'aneSSK') {
                updatedStaff.aneSSK = [...(updatedStaff.aneSSK || []), staffMember].slice(0, 3);
              } else if (role === 'student') {
                updatedStaff.students = [...(updatedStaff.students || []), staffMember].slice(0, 3);
              }
              return { ...room, staff: updatedStaff };
            }
            return room;
          });

          return {
            ...state,
            weeks: state.weeks.map(week =>
              week.id === state.currentWeekId
                ? {
                    ...week,
                    days: week.days.map(day =>
                      day.id === state.currentDayId
                        ? { 
                            ...day, 
                            rooms: updatedRooms, 
                            corridorStaff: cleanedCorridorStaff,
                            availableStaff: updatedAvailableStaff 
                          }
                        : day
                    )
                  }
                : week
            )
          };
        }),

      assignStaffToCorridor: (staffId: string, corridorRoleId: string) =>
        set((state) => {
          const currentDay = state.weeks
            .find(w => w.id === state.currentWeekId)
            ?.days.find(d => d.id === state.currentDayId);
          
          if (!currentDay) return state;

          // Find the staff member
          const staffMember = currentDay.availableStaff.find(s => s.id === staffId);
          if (!staffMember) return state;

          // Remove from available staff
          const updatedAvailableStaff = currentDay.availableStaff.filter(s => s.id !== staffId);
          
          // Update corridor staff
          const updatedCorridorStaff = currentDay.corridorStaff.map(role => 
            role.id === corridorRoleId 
              ? { ...role, staff: staffMember }
              : role
          );

          return {
            ...state,
            weeks: state.weeks.map(week =>
              week.id === state.currentWeekId
                ? {
                    ...week,
                    days: week.days.map(day =>
                      day.id === state.currentDayId
                        ? { ...day, corridorStaff: updatedCorridorStaff, availableStaff: updatedAvailableStaff }
                        : day
                    )
                  }
                : week
            )
          };
        }),      assignStaffToCorridorFunction: (staffId: string, functionId: string) =>
        set((state) => {
          const currentDay = state.weeks
            .find(w => w.id === state.currentWeekId)
            ?.days.find(d => d.id === state.currentDayId);
          if (!currentDay) return state;

          // Find the staff member from available staff, rooms, or corridor assignments
          let staffMember: StaffMember | undefined;
          
          // Check available staff first
          staffMember = currentDay.availableStaff.find(s => s.id === staffId);
          
          // If not in available, search in room assignments
          if (!staffMember) {
            for (const room of currentDay.rooms) {
              const staffAssignments = room.staff;
              if (staffAssignments.pass?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.pass.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.opSSK?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.opSSK.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.aneSSK?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.aneSSK.find(s => s.id === staffId);
                break;
              }
              if (staffAssignments.students?.some(s => s.id === staffId)) {
                staffMember = staffAssignments.students.find(s => s.id === staffId);
                break;
              }
              if (staffMember) break;
            }
          }
          
          // If not found in rooms, search in corridor assignments
          if (!staffMember) {
            for (const corridorRole of currentDay.corridorStaff) {
              if (corridorRole.staff?.id === staffId) {
                staffMember = corridorRole.staff;
                break;
              }
              for (const fn of corridorRole.functions) {
                if (fn.staff?.id === staffId) {
                  staffMember = fn.staff;
                  break;
                }
              }
              if (staffMember) break;
            }
          }
          
          if (!staffMember) return state;

          // Remove from available staff
          const updatedAvailableStaff = currentDay.availableStaff.filter(s => s.id !== staffId);

          // Remove staff from all room assignments
          const updatedRooms = currentDay.rooms.map(room => {
            const updatedStaff = { ...room.staff };
            if (updatedStaff.pass) {
              updatedStaff.pass = updatedStaff.pass.filter(s => s.id !== staffId);
              if (updatedStaff.pass.length === 0) delete updatedStaff.pass;
            }
            if (updatedStaff.opSSK) {
              updatedStaff.opSSK = updatedStaff.opSSK.filter(s => s.id !== staffId);
              if (updatedStaff.opSSK.length === 0) delete updatedStaff.opSSK;
            }
            if (updatedStaff.aneSSK) {
              updatedStaff.aneSSK = updatedStaff.aneSSK.filter(s => s.id !== staffId);
              if (updatedStaff.aneSSK.length === 0) delete updatedStaff.aneSSK;
            }
            if (updatedStaff.students) {
              updatedStaff.students = updatedStaff.students.filter(s => s.id !== staffId);
              if (updatedStaff.students.length === 0) delete updatedStaff.students;
            }
            return { ...room, staff: updatedStaff };
          });

          // Remove staff from all corridor assignments (both legacy and function-based)
          const cleanedCorridorStaff = currentDay.corridorStaff.map(corridorRole => ({
            ...corridorRole,
            staff: corridorRole.staff?.id === staffId ? undefined : corridorRole.staff,
            functions: corridorRole.functions.map(fn => {
              if (fn.staff && fn.staff.id === staffId) {
                return { ...fn, staff: undefined };
              }
              return fn;
            })
          }));

          // Assign staff to the target function
          const updatedCorridorStaff = cleanedCorridorStaff.map(corridorRole => ({
            ...corridorRole,
            functions: corridorRole.functions.map(fn => {
              if (fn.id === functionId) {
                return { ...fn, staff: { ...staffMember } };
              }
              return fn;
            })
          }));

          return {
            ...state,
            weeks: state.weeks.map(week =>
              week.id === state.currentWeekId
                ? {
                    ...week,
                    days: week.days.map(day =>
                      day.id === state.currentDayId
                        ? { 
                            ...day, 
                            rooms: updatedRooms,
                            corridorStaff: updatedCorridorStaff, 
                            availableStaff: updatedAvailableStaff 
                          }
                        : day
                    )
                  }
                : week
            )
          };
        }),

      unassignStaff: (staffId: string) =>
        set((state) => {
          const currentDay = state.weeks
            .find(w => w.id === state.currentWeekId)
            ?.days.find(d => d.id === state.currentDayId);
          
          if (!currentDay) return state;

          let staffMember: StaffMember | undefined;
            // Find and remove from rooms
          const updatedRooms = currentDay.rooms.map(room => {
            const updatedStaff = { ...room.staff };
            if (Array.isArray(updatedStaff.pass)) {
              if (updatedStaff.pass.some(s => s.id === staffId)) {
                staffMember = updatedStaff.pass.find(s => s.id === staffId) || staffMember;
                updatedStaff.pass = updatedStaff.pass.filter(s => s.id !== staffId);
                if (updatedStaff.pass.length === 0) delete updatedStaff.pass;
              }
            }
            if (Array.isArray(updatedStaff.opSSK)) {
              if (updatedStaff.opSSK.some(s => s.id === staffId)) {
                staffMember = updatedStaff.opSSK.find(s => s.id === staffId) || staffMember;
                updatedStaff.opSSK = updatedStaff.opSSK.filter(s => s.id !== staffId);
                if (updatedStaff.opSSK.length === 0) delete updatedStaff.opSSK;
              }
            }
            if (Array.isArray(updatedStaff.aneSSK)) {
              if (updatedStaff.aneSSK.some(s => s.id === staffId)) {
                staffMember = updatedStaff.aneSSK.find(s => s.id === staffId) || staffMember;
                updatedStaff.aneSSK = updatedStaff.aneSSK.filter(s => s.id !== staffId);
                if (updatedStaff.aneSSK.length === 0) delete updatedStaff.aneSSK;
              }
            }
            if (updatedStaff.students) {
              const studentIndex = updatedStaff.students.findIndex(s => s.id === staffId);
              if (studentIndex >= 0) {
                staffMember = updatedStaff.students[studentIndex];
                updatedStaff.students = updatedStaff.students.filter(s => s.id !== staffId);
              }
            }
            return { ...room, staff: updatedStaff };
          });// Find and remove from corridor staff (both legacy role.staff and function assignments)
          const updatedCorridorStaff = currentDay.corridorStaff.map(role => {
            let updatedRole = { ...role };
            
            // Check legacy role staff assignment
            if (role.staff?.id === staffId) {
              staffMember = role.staff;
              updatedRole.staff = undefined;
            }
            
            // Check function assignments
            updatedRole.functions = role.functions.map(fn => {
              if (fn.staff?.id === staffId) {
                staffMember = fn.staff;
                return { ...fn, staff: undefined };
              }
              return fn;
            });
            
            return updatedRole;
          });

          // Add back to available staff if found
          const updatedAvailableStaff = staffMember 
            ? [...currentDay.availableStaff, staffMember]
            : currentDay.availableStaff;

          return {
            ...state,
            weeks: state.weeks.map(week =>
              week.id === state.currentWeekId
                ? {
                    ...week,
                    days: week.days.map(day =>
                      day.id === state.currentDayId
                        ? { 
                            ...day, 
                            rooms: updatedRooms, 
                            corridorStaff: updatedCorridorStaff,
                            availableStaff: updatedAvailableStaff 
                          }
                        : day
                    )
                  }
                : week
            )
          };
        }),      moveStaffToAvailable: (staffId: string) => {
        // This is just an alias for unassignStaff for clarity
        get().unassignStaff(staffId);
      },

      clearAvailableStaff: () => 
        set((state) => ({
          weeks: state.weeks.map(week =>
            week.id === state.currentWeekId
              ? {
                  ...week,
                  days: week.days.map(day =>
                    day.id === state.currentDayId
                      ? { ...day, availableStaff: [] }
                      : day
                  )
                }
              : week
          )
        })),

      // Utility
      getCurrentDay: () => {
        const { weeks, currentWeekId, currentDayId } = get();
        const currentWeek = weeks.find(w => w.id === currentWeekId);
        return currentWeek?.days.find(d => d.id === currentDayId);
      },      getCurrentWeek: () => {
        const { weeks, currentWeekId } = get();
        return weeks.find(w => w.id === currentWeekId);
      },

      // Multi-week import functions
      importMultiWeekFile: async (file: File) => {
        try {
          const { parseMultiWeekExcelFile } = await import('../utils/multiWeekExcelParser');
          const { convertMultiWeekStaffToWeeks } = await import('../utils/staffConverter');          const parseResult = await parseMultiWeekExcelFile(file);
          const weekStaffMap = convertMultiWeekStaffToWeeks(parseResult.staff);

          // Create multi-week schedule
          const multiWeekSchedule: MultiWeekSchedule = {
            id: `multi-week-${Date.now()}`,
            name: `${parseResult.weekSpan} (${parseResult.fileName})`,
            startWeek: parseResult.startWeek,
            endWeek: parseResult.endWeek,
            weekSpan: parseResult.weekSpan,
            weeks: new Map()
          };

          // Convert each week's data to WeekSchedule
          weekStaffMap.forEach((dayMap, weekNum) => {
            const weekSchedule: WeekSchedule = {
              id: `week-${weekNum}`,
              name: `v.${weekNum}`,
              weekNumber: weekNum,
              days: SWEDISH_DAYS.map((dayName, index) => {
                const dayStaff = dayMap.get(dayName) || [];
                return {
                  ...createDefaultDay(dayName, index),
                  availableStaff: dayStaff
                };
              })
            };
            multiWeekSchedule.weeks.set(weekNum, weekSchedule);
          });          // Update store with multi-week schedule
          set(() => ({
            activeMultiWeekSchedule: multiWeekSchedule,
            weeks: Array.from(multiWeekSchedule.weeks.values())
          }));

          return {
            success: true,
            weekSpan: parseResult.weekSpan,
            totalWeeks: parseResult.totalWeeks,
            totalStaff: parseResult.staff.length,
            [parseResult.source === 'op' ? 'opFileName' : 'aneFileName']: parseResult.fileName,
            warnings: parseResult.warnings
          };
        } catch (error) {
          console.error('Multi-week import error:', error);
          return {
            success: false,
            weekSpan: '',
            totalWeeks: 0,
            totalStaff: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error occurred']
          };
        }
      },

      importIndependentFile: async (file: File, mergeWithExisting = true) => {
        try {
          const { parseMultiWeekExcelFile, combineMultiWeekData } = await import('../utils/multiWeekExcelParser');
          const { convertMultiWeekStaffToWeeks } = await import('../utils/staffConverter');

          const parseResult = await parseMultiWeekExcelFile(file);
          const { activeMultiWeekSchedule } = get();
          
          let combinedResult;
          let existingStaff: any[] = [];
          
          // If merging with existing data, extract current staff
          if (mergeWithExisting && activeMultiWeekSchedule) {
            activeMultiWeekSchedule.weeks.forEach(week => {
              week.days.forEach(day => {
                existingStaff.push(...day.availableStaff.map(staff => ({
                  ...staff,
                  weekNumber: week.weekNumber || 1,
                  weekday: day.dayName,
                  sourceFile: staff.comments?.includes('[OP]') ? 'op' : 'ane'
                })));
              });
            });
            
            // Combine new data with existing
            if (parseResult.source === 'op') {
              combinedResult = combineMultiWeekData(parseResult, undefined, existingStaff);
            } else {
              combinedResult = combineMultiWeekData(undefined, parseResult, existingStaff);
            }
          } else {
            // Create new schedule from this file only
            if (parseResult.source === 'op') {
              combinedResult = combineMultiWeekData(parseResult);
            } else {
              combinedResult = combineMultiWeekData(undefined, parseResult);
            }
          }

          const weekStaffMap = convertMultiWeekStaffToWeeks(combinedResult.combinedStaff);
          
          // Create/update multi-week schedule
          const multiWeekSchedule: MultiWeekSchedule = {
            id: activeMultiWeekSchedule?.id || `multi-week-${Date.now()}`,
            name: `${parseResult.weekSpan} (${parseResult.fileName}${activeMultiWeekSchedule ? ' + existing' : ''})`,
            startWeek: parseResult.startWeek,
            endWeek: parseResult.endWeek,
            weekSpan: parseResult.weekSpan,
            weeks: new Map()
          };

          // Convert combined data to WeekSchedule
          weekStaffMap.forEach((dayMap, weekNum) => {
            const weekSchedule: WeekSchedule = {
              id: `week-${weekNum}`,
              name: `v.${weekNum}`,
              weekNumber: weekNum,
              days: SWEDISH_DAYS.map((dayName, index) => {
                const dayStaff = dayMap.get(dayName) || [];
                return {
                  ...createDefaultDay(dayName, index),
                  availableStaff: dayStaff
                };
              })
            };
            multiWeekSchedule.weeks.set(weekNum, weekSchedule);
          });          // Update store
          set(() => ({
            activeMultiWeekSchedule: multiWeekSchedule,
            weeks: Array.from(multiWeekSchedule.weeks.values())
          }));

          return {
            success: true,
            weekSpan: parseResult.weekSpan,
            totalWeeks: parseResult.totalWeeks,
            totalStaff: combinedResult.combinedStaff.length,
            [parseResult.source === 'op' ? 'opFileName' : 'aneFileName']: parseResult.fileName,
            mergeReport: combinedResult.mergeReport,
            warnings: parseResult.warnings
          };
        } catch (error) {
          console.error('Independent file import error:', error);
          return {
            success: false,
            weekSpan: '',
            totalWeeks: 0,
            totalStaff: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error occurred']
          };
        }
      },

      setActiveMultiWeek: (schedule: MultiWeekSchedule) => 
        set(() => ({
          activeMultiWeekSchedule: schedule,
          weeks: Array.from(schedule.weeks.values())
        })),

      resetToDefaults: () =>
        set({
          currentWeekId: 'week-default',
          currentDayId: 'day-måndag',
          isDashboardMode: false,
          weeks: [createDefaultWeek()],
          availableStaff: [],
          settings: {
            currentDay: 'day-måndag',
            currentWeek: 'week-default',
            isDashboardMode: false,
            autoRefresh: false,
            refreshInterval: 30000
          }
        })
    }),    {
      name: 'or-scheduling-app-storage',
      partialize: (state) => ({
        weeks: state.weeks,
        availableStaff: state.availableStaff,
        settings: state.settings
      }),
      onRehydrateStorage: () => (state) => {
        // Fix Date objects after rehydration
        if (state?.weeks) {
          state.weeks = state.weeks.map(week => ({
            ...week,
            days: week.days.map(day => ({
              ...day,
              date: typeof day.date === 'string' ? new Date(day.date) : day.date
            }))
          }));
        }
      }
    }
  )
);
