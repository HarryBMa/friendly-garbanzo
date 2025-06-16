// staffConverter.ts
// Utility functions to convert ParsedStaff data from ExcelJS parser to StaffMember format

import type { ParsedStaff as OriginalParsedStaff, Role, StaffMember } from '../types';
import type { ParsedStaff as MultiWeekParsedStaff } from './multiWeekExcelParser';

// Support both original and multi-week parsed staff formats
type ParsedStaff = OriginalParsedStaff | MultiWeekParsedStaff;

/**
 * Convert ParsedStaff array from new Excel parser to StaffMember array for app store
 */
export function convertParsedStaffToMembers(parsedStaff: ParsedStaff[]): StaffMember[] {
  const staffMap = new Map<string, StaffMember>();

  parsedStaff.forEach(parsed => {
    // Convert abbreviated weekday to full Swedish day name
    const fullSwedishDay = convertToFullSwedishDay(parsed.weekday);
    const key = `${parsed.name.toLowerCase()}-${fullSwedishDay}`;
    
    if (staffMap.has(key)) {
      // If staff member already exists for this day, combine the info
      const existing = staffMap.get(key)!;
      
      // Combine work hours from multiple sources (OP/ANE)
      const existingHours = existing.workHours || '';
      const newHours = parsed.workHours || '';
      
      let combinedHours = '';
      if (existingHours && newHours && existingHours !== newHours) {
        combinedHours = `${existingHours} | ${getSourceTag(parsed.sourceFile)} ${newHours}`;
      } else {
        combinedHours = existingHours || newHours;
      }
      
      // Combine comments
      const existingComments = existing.comments || '';
      const newComments = buildCommentsString(parsed);
      
      let combinedComments = '';
      if (existingComments && newComments) {
        combinedComments = `${existingComments} | ${newComments}`;
      } else {
        combinedComments = existingComments || newComments;
      }
      
      existing.workHours = combinedHours;
      existing.comments = combinedComments;
    } else {
      // Create new staff member with full Swedish day name
      const staffMember: StaffMember = {
        id: generateStaffId(parsed),
        name: `${parsed.name} (${fullSwedishDay})`,
        workHours: parsed.workHours || '',
        comments: buildCommentsString(parsed),
        isCustom: false // These are from official Excel files
      };
      
      staffMap.set(key, staffMember);
    }
  });

  return Array.from(staffMap.values());
}

/**
 * Convert abbreviated weekday to full Swedish day name
 */
function convertToFullSwedishDay(abbreviatedDay: string): string {
  const dayMapping: Record<string, string> = {
    'Mån': 'Måndag',
    'Tis': 'Tisdag', 
    'Ons': 'Onsdag',
    'Tor': 'Torsdag',
    'Fre': 'Fredag',
    'Lör': 'Lördag',
    'Sön': 'Söndag'
  };
  
  return dayMapping[abbreviatedDay] || abbreviatedDay;
}

/**
 * Generate unique ID for staff member based on parsed data
 */
function generateStaffId(parsed: ParsedStaff): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const nameHash = parsed.name.toLowerCase().replace(/[^a-z]/g, '').substr(0, 4);
  return `staff-${nameHash}-${parsed.weekday.toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Build comments string from parsed staff data
 */
function buildCommentsString(parsed: ParsedStaff): string {
  const parts: string[] = [];
  
  // Add source and role tag
  const sourceTag = getSourceTag(parsed.sourceFile);
  const roleTag = getRoleTag(parsed.role);
  parts.push(`${sourceTag} ${roleTag}`);
  
  // Add original comments if present
  if (parsed.comments) {
    parts.push(parsed.comments);
  }
  
  // Add extra info if present
  if (parsed.extraInfo) {
    parts.push(`Extra: ${parsed.extraInfo}`);
  }
  
  return parts.join(' | ');
}

/**
 * Get source tag for display
 */
function getSourceTag(source: 'op' | 'ane'): string {
  return source === 'op' ? '[OP]' : '[ANE]';
}

/**
 * Get role tag for display
 */
function getRoleTag(role: Role): string {
  switch (role) {
    case 'op_ssk': return 'SSK';
    case 'op_usk': return 'USK';
    case 'ane_ssk': return 'SSK';
    case 'ane_usk': return 'USK';
    default: return '';
  }
}

/**
 * Group parsed staff by weekday for easier processing
 */
export function groupParsedStaffByWeekday(parsedStaff: ParsedStaff[]): Record<string, ParsedStaff[]> {
  const grouped: Record<string, ParsedStaff[]> = {};
  
  parsedStaff.forEach(staff => {
    if (!grouped[staff.weekday]) {
      grouped[staff.weekday] = [];
    }
    grouped[staff.weekday].push(staff);
  });
  
  return grouped;
}

/**
 * Get summary statistics from parsed staff data
 */
export function getParsedStaffSummary(parsedStaff: ParsedStaff[]) {
  const summary = {
    totalEntries: parsedStaff.length,
    uniqueStaff: new Set(parsedStaff.map(s => s.name)).size,
    bySource: {
      op: parsedStaff.filter(s => s.sourceFile === 'op').length,
      ane: parsedStaff.filter(s => s.sourceFile === 'ane').length
    },
    byRole: {
      op_ssk: parsedStaff.filter(s => s.role === 'op_ssk').length,
      op_usk: parsedStaff.filter(s => s.role === 'op_usk').length,
      ane_ssk: parsedStaff.filter(s => s.role === 'ane_ssk').length,
      ane_usk: parsedStaff.filter(s => s.role === 'ane_usk').length
    },
    weekdays: Object.keys(groupParsedStaffByWeekday(parsedStaff))
  };
  
  return summary;
}

/**
 * Convert multi-week parsed staff to organized week structure
 */
export function convertMultiWeekStaffToWeeks(parsedStaff: MultiWeekParsedStaff[]): Map<number, Map<string, StaffMember[]>> {
  const weekMap = new Map<number, Map<string, StaffMember[]>>();
  
  // Group by week number first
  const staffByWeek = parsedStaff.reduce((acc, staff) => {
    const weekNum = staff.weekNumber;
    if (!acc[weekNum]) {
      acc[weekNum] = [];
    }
    acc[weekNum].push(staff);
    return acc;
  }, {} as Record<number, MultiWeekParsedStaff[]>);
  
  // Convert each week's staff to StaffMembers organized by day
  Object.entries(staffByWeek).forEach(([weekNumStr, weekStaff]) => {
    const weekNum = parseInt(weekNumStr);
    const dayMap = new Map<string, StaffMember[]>();
    
    // Convert this week's staff using existing conversion logic
    const staffMembers = convertParsedStaffToMembers(weekStaff);
    
    // Group by day
    staffMembers.forEach(member => {
      // Extract day from name format "Name (Weekday)"
      const dayMatch = member.name.match(/\(([^)]+)\)$/);
      if (dayMatch) {
        const day = dayMatch[1];
        if (!dayMap.has(day)) {
          dayMap.set(day, []);
        }
        dayMap.get(day)!.push(member);
      }
    });
    
    weekMap.set(weekNum, dayMap);
  });
  
  return weekMap;
}

/**
 * Get multi-week summary statistics
 */
export function getMultiWeekSummary(parsedStaff: MultiWeekParsedStaff[]) {
  const weekNumbers = [...new Set(parsedStaff.map(s => s.weekNumber))].sort((a, b) => a - b);
  const summary = {
    ...getParsedStaffSummary(parsedStaff),
    weekSpan: weekNumbers.length > 0 ? `v.${weekNumbers[0]}-${weekNumbers[weekNumbers.length - 1]}` : '',
    totalWeeks: weekNumbers.length,
    weeks: weekNumbers,
    staffPerWeek: weekNumbers.reduce((acc, weekNum) => {
      acc[weekNum] = parsedStaff.filter(s => s.weekNumber === weekNum).length;
      return acc;
    }, {} as Record<number, number>)
  };
  
  return summary;
}
