import type { StaffMember } from '../types';

export interface ExcelParseResult {
  success: boolean;
  staff: StaffMember[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse Excel data from the main process
 * Expected format: Name, Work hours, Comments
 */
export function parseExcelData(rawData: any[]): ExcelParseResult {
  const staff: StaffMember[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(rawData) || rawData.length === 0) {
    errors.push('Ingen data att importera');
    return { success: false, staff, errors, warnings };
  }

  rawData.forEach((row, index) => {
    const rowNumber = index + 1;
    
    if (!row || typeof row !== 'object') {
      errors.push(`Rad ${rowNumber}: Ogiltig dataformat`);
      return;
    }

    const name = sanitizeName(row.name || row.Name || '');
    const workHours = sanitizeWorkHours(row.workHours || row['Work hours'] || row.arbetstid || '');
    const comments = sanitizeComments(row.comments || row.Comments || row.kommentarer || '');

    // Validation
    if (!name.trim()) {
      errors.push(`Rad ${rowNumber}: Namn saknas`);
      return;
    }

    if (!workHours.trim()) {
      warnings.push(`Rad ${rowNumber}: Arbetstid saknas för ${name}`);
    }

    // Check for duplicates
    if (staff.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      warnings.push(`Rad ${rowNumber}: Dublett av ${name} ignorerad`);
      return;
    }

    staff.push({
      id: `staff-${Date.now()}-${index}`,
      name,
      workHours,
      comments,
      isCustom: false
    });
  });

  return {
    success: errors.length === 0,
    staff,
    errors,
    warnings
  };
}

/**
 * Sanitize name field - handle Swedish characters properly
 */
function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[^\w\såäöÅÄÖ\-\.']/g, '') // Keep only valid characters
    .slice(0, 100); // Reasonable length limit
}

/**
 * Sanitize work hours field
 * Accept formats like: "08:00-16:00", "8-16", "Heldag", "Natt", etc.
 */
function sanitizeWorkHours(workHours: string): string {
  if (typeof workHours !== 'string') return '';
  
  const cleaned = workHours.trim();
  
  // Common Swedish work hour patterns
  const validPatterns = [
    /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/, // 08:00-16:00
    /^\d{1,2}-\d{1,2}$/, // 8-16
    /^[Hh]eldag$/, // Heldag
    /^[Nn]att$/, // Natt
    /^[Dd]ag$/, // Dag
    /^[Kk]väll$/, // Kväll
    /^[Bb]eredskap$/, // Beredskap
    /^[Jj]our$/ // Jour
  ];

  // If it matches a known pattern, return as-is
  if (validPatterns.some(pattern => pattern.test(cleaned))) {
    return cleaned;
  }

  // Try to normalize time formats
  const timeMatch = cleaned.match(/(\d{1,2}).*?(\d{1,2})/);
  if (timeMatch) {
    const [, start, end] = timeMatch;
    return `${start.padStart(2, '0')}:00-${end.padStart(2, '0')}:00`;
  }

  return cleaned.slice(0, 50); // Return original if no pattern matches
}

/**
 * Sanitize comments field
 */
function sanitizeComments(comments: string): string {
  if (typeof comments !== 'string') return '';
  
  return comments
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .slice(0, 500); // Reasonable length limit
}

/**
 * Validate staff member data
 */
export function validateStaffMember(staff: Partial<StaffMember>): string[] {
  const errors: string[] = [];

  if (!staff.name?.trim()) {
    errors.push('Namn krävs');
  }

  if (staff.name && staff.name.length > 100) {
    errors.push('Namn för långt (max 100 tecken)');
  }

  if (staff.workHours && staff.workHours.length > 50) {
    errors.push('Arbetstid för lång (max 50 tecken)');
  }

  if (staff.comments && staff.comments.length > 500) {
    errors.push('Kommentarer för långa (max 500 tecken)');
  }

  return errors;
}

/**
 * Create a new staff member with default values
 */
export function createStaffMember(
  name: string, 
  workHours: string = '', 
  comments: string = '',
  isCustom: boolean = true
): StaffMember {
  return {
    id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: sanitizeName(name),
    workHours: sanitizeWorkHours(workHours),
    comments: sanitizeComments(comments),
    isCustom
  };
}
