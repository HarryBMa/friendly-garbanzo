export interface StaffMember {
  id: string;
  name: string;
  workHours: string;
  comments: string;
  isCustom?: boolean; // For manually added staff
}

export interface RoomStaff {
  pass?: StaffMember[];
  opSSK?: StaffMember[];
  aneSSK?: StaffMember[];
  students?: StaffMember[];
}

export interface OperatingRoom {
  id: string;
  name: string;
  staff: RoomStaff;
}

export interface CorridorFunction {
  id: string;
  label: string; // e.g. "1301", "Lunch 3704"
  staff?: StaffMember; // Only one staff per function
  pager?: string;
  comments?: string;
  lunchRooms?: string[]; // ["3701", "3704"]
}

export interface CorridorRole {
  id: string;
  name: string; // Allow any string for Swedish role names
  functions: CorridorFunction[];
  staff?: StaffMember; // Add optional staff assignment
}

export interface DaySchedule {
  id: string;
  dayName: string;
  date: Date;
  rooms: OperatingRoom[];
  corridorStaff: CorridorRole[];
  availableStaff: StaffMember[];
}

export interface WeekSchedule {
  id: string;
  name: string;
  weekNumber?: number; // Add week number for multi-week support
  days: DaySchedule[];
}

// Multi-week schedule support
export interface MultiWeekSchedule {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  weekSpan: string; // e.g., "v.22-35"
  weeks: Map<number, WeekSchedule>;
}

// Import result types for multi-week
export interface MultiWeekImportResult {
  success: boolean;
  weekSpan: string;
  totalWeeks: number;
  totalStaff: number;
  opFileName?: string;
  aneFileName?: string;
  mergeReport?: {
    opStaffCount: number;
    aneStaffCount: number;
    conflicts?: string[];
    additions?: string[];
  };
  errors?: string[];
  warnings?: string[];
}

export interface AppSettings {
  currentDay: string; // Day ID
  currentWeek: string; // Week ID
  isDashboardMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
}

export interface DragItem {
  id: string;
  type: 'staff';
  staffMember: StaffMember;
}

export interface DropTarget {
  type: 'room' | 'corridor' | 'available';
  roomId?: string;
  role?: string;
  corridorRoleId?: string;
}

// Swedish day names
export const SWEDISH_DAYS = [
  'Måndag',
  'Tisdag', 
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lördag',
  'Söndag'
] as const;

export type SwedishDay = typeof SWEDISH_DAYS[number];

// Operating room roles
export const ROOM_ROLES = {
  PASS: 'Pass',
  OP_SSK: 'Op SSK',
  ANE_SSK: 'Ane SSK',
  STUDENT: 'Student'
} as const;

export type RoomRole = typeof ROOM_ROLES[keyof typeof ROOM_ROLES];

// Default corridor roles (can be customized)
export const DEFAULT_CORRIDOR_ROLES = [
  'Sök/Mottagning',
  'Korridorsansvar',
  'Beredskapsstråk'
] as const;

// Dual Excel Import Types
export interface DualExcelImportResult {
  success: boolean;
  week: string;
  opFileName: string;
  aneFileName: string;
  staff: StaffMember[];
  errors: string[];
  warnings: string[];
}

// New Excel Parser Types (for direct ExcelJS parsing)
export type Role = 'op_ssk' | 'op_usk' | 'ane_ssk' | 'ane_usk';
export type Source = 'op' | 'ane';

export interface ParsedStaff {
  name: string;
  role: Role;
  weekday: string;
  date: string;
  workHours?: string;
  comments?: string;
  extraInfo?: string;
  sourceFile: Source;
}

export interface ExcelFileInfo {
  file: File;
  fileName: string;
  type: 'OP' | 'ANE';
  isValid: boolean;
}

// Network synchronization types
export interface SyncConflict {
  local: WeekSchedule[];
  remote: WeekSchedule[];
  lastModified: string;
  modifiedBy: string;
}

export interface SyncMessage {
  type: 'conflict' | 'update' | 'error';
  data?: any;
  error?: string;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  clientId: string;
  hasConflicts: boolean;
}
