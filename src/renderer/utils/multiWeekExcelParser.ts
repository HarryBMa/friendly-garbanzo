// multiWeekExcelParser.ts
// Enhanced Excel parser for multi-week schedule files with sheet-based week separation

import * as ExcelJS from 'exceljs';
import { getWeekNumber } from './dateHelpers';

export type Role = 'op_ssk' | 'op_usk' | 'ane_ssk' | 'ane_usk';
export type Source = 'op' | 'ane';

export interface ParsedStaff {
  name: string;
  role: Role;
  weekday: string;
  date: string;
  weekNumber: number;
  sheetIndex: number;
  workHours?: string;
  comments?: string;
  extraInfo?: string;
  sourceFile: Source;
}

export interface MultiWeekParseResult {
  startWeek: number;
  endWeek: number;
  weekSpan: string; // e.g., "v.22-35"
  totalWeeks: number;
  staff: ParsedStaff[];
  fileName: string;
  source: Source;
  warnings?: string[];
}

export interface CombinedImportResult {
  success: boolean;
  opData?: MultiWeekParseResult;
  aneData?: MultiWeekParseResult;
  combinedStaff: ParsedStaff[];
  mergeReport: {
    opStaffCount: number;
    aneStaffCount: number;
    totalStaffCount: number;
    weekSpan: string;
    conflicts?: string[];
    additions?: string[];
  };
  errors?: string[];
}

/**
 * Parse a single multi-week Excel file with multiple sheets
 */
export async function parseMultiWeekExcelFile(file: File): Promise<MultiWeekParseResult> {
  try {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const sourceFile: Source = file.name.toLowerCase().includes('ane') ? 'ane' : 'op';
    const allStaff: ParsedStaff[] = [];
    const warnings: string[] = [];
    
    let startWeek: number | null = null;
    let endWeek: number | null = null;

    // Process each sheet as a separate week
    for (let sheetIndex = 0; sheetIndex < workbook.worksheets.length; sheetIndex++) {
      const sheet = workbook.worksheets[sheetIndex];
      
      try {
        const weekStaff = await parseSheetForWeek(sheet, sourceFile, sheetIndex);
        allStaff.push(...weekStaff.staff);
        
        if (weekStaff.weekNumber) {
          if (startWeek === null || weekStaff.weekNumber < startWeek) {
            startWeek = weekStaff.weekNumber;
          }
          if (endWeek === null || weekStaff.weekNumber > endWeek) {
            endWeek = weekStaff.weekNumber;
          }
        }
        
        if (weekStaff.warnings.length > 0) {
          warnings.push(...weekStaff.warnings.map(w => `Sheet ${sheetIndex + 1}: ${w}`));
        }
      } catch (sheetError) {
        warnings.push(`Sheet ${sheetIndex + 1}: ${sheetError instanceof Error ? sheetError.message : 'Parse error'}`);
      }
    }

    // Extract week range from filename if not detected from data
    if (startWeek === null || endWeek === null) {
      const weekMatch = file.name.match(/v\.?(\d+)-(\d+)/i);
      if (weekMatch) {
        startWeek = parseInt(weekMatch[1]);
        endWeek = parseInt(weekMatch[2]);
      }
    }

    return {
      startWeek: startWeek || 1,
      endWeek: endWeek || 1,
      weekSpan: `v.${startWeek || 1}-${endWeek || 1}`,
      totalWeeks: workbook.worksheets.length,
      staff: allStaff,
      fileName: file.name,
      source: sourceFile,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    throw new Error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a single sheet for one week's data
 */
async function parseSheetForWeek(
  sheet: ExcelJS.Worksheet, 
  sourceFile: Source, 
  sheetIndex: number
): Promise<{ staff: ParsedStaff[]; weekNumber: number | null; warnings: string[] }> {
  const isAne = sourceFile === 'ane';
  const dayHeaderRow = isAne ? 2 : 3;
  const dayStartCol = 3; // Column C
  let currentRole: Role = sourceFile === 'op' ? 'op_ssk' : 'ane_ssk';
  
  const warnings: string[] = [];
  const staff: ParsedStaff[] = [];
  let weekNumber: number | null = null;

  // Extract weekdays + dates from header
  const weekdays: { col: number; name: string; date: string }[] = [];
  for (let col = dayStartCol; col < dayStartCol + 5; col++) {
    const raw = sheet.getCell(dayHeaderRow, col).value?.toString().trim() || '';
    const [weekday, date] = raw.split(' ');
    
    if (!weekNumber && date) {
      // Parse date YYMMDD format and calculate week number
      try {
        const year = 2000 + parseInt(date.slice(0, 2));
        const month = parseInt(date.slice(2, 4)) - 1; // JS months are 0-based
        const day = parseInt(date.slice(4, 6));
        const dateObj = new Date(year, month, day);
        weekNumber = getWeekNumber(dateObj);
      } catch (dateError) {
        warnings.push(`Could not parse date: ${date}`);
      }
    }
    weekdays.push({ col, name: weekday, date });
  }

  // Iterate through rows to find staff
  for (let row = dayHeaderRow + 1; row < sheet.rowCount; row++) {
    const nameCell = sheet.getCell(row, 2).value?.toString().trim();
    if (!nameCell) continue;

    // Detect role shift
    const lower = nameCell.toLowerCase();
    if (lower.includes('usk')) {
      currentRole = isAne ? 'ane_usk' : 'op_usk';
      continue;
    }
    if (['käk', 'antal', 'vakant'].some((k) => lower.includes(k))) continue;

    for (const { col, name: weekday, date } of weekdays) {
      const workHours = sheet.getCell(row, col).value?.toString().trim() || '';
      const comment = sheet.getCell(row + 1, col).value?.toString().trim() || '';
      const extra = sheet.getCell(row + 2, col).value?.toString().trim() || '';

      // Skip empty schedule cells
      if (!workHours && !comment && !extra) continue;

      staff.push({
        name: nameCell,
        role: currentRole,
        weekday,
        date,
        weekNumber: weekNumber || sheetIndex + 1, // Fallback to sheet index
        sheetIndex,
        workHours,
        comments: comment || undefined,
        extraInfo: extra || undefined,
        sourceFile,
      });
    }
  }

  return { staff, weekNumber, warnings };
}

/**
 * Combine OP and ANE data with smart merging
 */
export function combineMultiWeekData(
  opData?: MultiWeekParseResult,
  aneData?: MultiWeekParseResult,
  existingStaff: ParsedStaff[] = []
): CombinedImportResult {
  const combinedStaff: ParsedStaff[] = [...existingStaff];
  const conflicts: string[] = [];
  const additions: string[] = [];
  
  let opStaffCount = 0;
  let aneStaffCount = 0;
  let weekSpan = '';

  // Process OP data
  if (opData) {
    opStaffCount = opData.staff.length;
    weekSpan = opData.weekSpan;
    
    for (const staff of opData.staff) {
      const existingIndex = combinedStaff.findIndex(
        existing => existing.name === staff.name && 
                   existing.weekday === staff.weekday && 
                   existing.weekNumber === staff.weekNumber
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        const existing = combinedStaff[existingIndex];
        if (existing.sourceFile !== staff.sourceFile) {
          conflicts.push(`Updated ${staff.name} (Week ${staff.weekNumber}, ${staff.weekday})`);
        }
        combinedStaff[existingIndex] = { ...existing, ...staff };
      } else {
        // Add new entry
        combinedStaff.push(staff);
        additions.push(`Added OP: ${staff.name} (Week ${staff.weekNumber}, ${staff.weekday})`);
      }
    }
  }

  // Process ANE data
  if (aneData) {
    aneStaffCount = aneData.staff.length;
    weekSpan = weekSpan || aneData.weekSpan;
    
    for (const staff of aneData.staff) {
      const existingIndex = combinedStaff.findIndex(
        existing => existing.name === staff.name && 
                   existing.weekday === staff.weekday && 
                   existing.weekNumber === staff.weekNumber
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        const existing = combinedStaff[existingIndex];
        if (existing.sourceFile !== staff.sourceFile) {
          conflicts.push(`Updated ${staff.name} (Week ${staff.weekNumber}, ${staff.weekday})`);
        }
        combinedStaff[existingIndex] = { ...existing, ...staff };
      } else {
        // Add new entry
        combinedStaff.push(staff);
        additions.push(`Added ANE: ${staff.name} (Week ${staff.weekNumber}, ${staff.weekday})`);
      }
    }
  }

  return {
    success: true,
    opData,
    aneData,
    combinedStaff,
    mergeReport: {
      opStaffCount,
      aneStaffCount,
      totalStaffCount: combinedStaff.length,
      weekSpan,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      additions: additions.length > 0 ? additions : undefined
    }
  };
}
