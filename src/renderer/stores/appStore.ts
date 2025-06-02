import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  DaySchedule, 
  WeekSchedule, 
  AppSettings, 
  StaffMember
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
    // Schedule management
  createWeek: (name: string) => WeekSchedule;
  duplicateWeek: (weekId: string, newName: string) => WeekSchedule;
  updateDaySchedule: (weekId: string, dayId: string, schedule: Partial<DaySchedule>) => void;
  
  // Staff assignment
  assignStaffToRoom: (staffId: string, roomId: string, role: string) => void;
  assignStaffToCorridor: (staffId: string, corridorRoleId: string) => void;
  unassignStaff: (staffId: string) => void;
  moveStaffToAvailable: (staffId: string) => void;
  
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
    ],
    corridorStaff: [
      {
        id: 'corridor-search',
        name: 'Sök/Mottagning'
      },
      {
        id: 'corridor-responsibility',
        name: 'Korridorsansvar'
      },
      {
        id: 'corridor-standby',
        name: 'Beredskapsstråk'
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
    (set, get) => ({
      // Initial state
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
          availableStaff: state.availableStaff.map(s => 
            s.id === staffId ? { ...s, ...updates } : s
          )
        })),

      importStaff: (staffList: StaffMember[]) =>
        set((state) => ({
          availableStaff: [...state.availableStaff, ...staffList]
        })),

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
      },      updateDaySchedule: (weekId: string, dayId: string, schedule: Partial<DaySchedule>) =>
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

      // Staff assignment
      assignStaffToRoom: (staffId: string, roomId: string, role: string) =>
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
          
          // Update room staff
          const updatedRooms = currentDay.rooms.map(room => {
            if (room.id === roomId) {
              const updatedStaff = { ...room.staff };
              if (role === 'pass') updatedStaff.pass = staffMember;
              else if (role === 'opSSK') updatedStaff.opSSK = staffMember;
              else if (role === 'aneSSK') updatedStaff.aneSSK = staffMember;
              else if (role === 'student') {
                updatedStaff.students = [...(updatedStaff.students || []), staffMember];
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
                        ? { ...day, rooms: updatedRooms, availableStaff: updatedAvailableStaff }
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
            
            if (updatedStaff.pass?.id === staffId) {
              staffMember = updatedStaff.pass;
              delete updatedStaff.pass;
            }
            if (updatedStaff.opSSK?.id === staffId) {
              staffMember = updatedStaff.opSSK;
              delete updatedStaff.opSSK;
            }
            if (updatedStaff.aneSSK?.id === staffId) {
              staffMember = updatedStaff.aneSSK;
              delete updatedStaff.aneSSK;
            }
            if (updatedStaff.students) {
              const studentIndex = updatedStaff.students.findIndex(s => s.id === staffId);
              if (studentIndex >= 0) {
                staffMember = updatedStaff.students[studentIndex];
                updatedStaff.students = updatedStaff.students.filter(s => s.id !== staffId);
              }
            }
            
            return { ...room, staff: updatedStaff };
          });

          // Find and remove from corridor staff
          const updatedCorridorStaff = currentDay.corridorStaff.map(role => {
            if (role.staff?.id === staffId) {
              staffMember = role.staff;
              return { ...role, staff: undefined };
            }
            return role;
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

      // Utility
      getCurrentDay: () => {
        const { weeks, currentWeekId, currentDayId } = get();
        const currentWeek = weeks.find(w => w.id === currentWeekId);
        return currentWeek?.days.find(d => d.id === currentDayId);
      },

      getCurrentWeek: () => {
        const { weeks, currentWeekId } = get();
        return weeks.find(w => w.id === currentWeekId);
      },

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
    }),
    {
      name: 'or-scheduling-app-storage',
      partialize: (state) => ({
        weeks: state.weeks,
        availableStaff: state.availableStaff,
        settings: state.settings
      })
    }
  )
);
