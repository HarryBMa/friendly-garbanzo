// excelParser.ts
// This file parses two Excel files (OP and ANE) into structured staff schedule data.

import * as ExcelJS from 'exceljs';
import { getWeekNumber } from './dateHelpers';

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

export async function parseExcelFiles(files: File[]): Promise<{ week: string; staff: ParsedStaff[] }> {
  if (files.length !== 2) throw new Error('Exactly two Excel files are required (OP + ANE).');

  let week = '';
  const allStaff: ParsedStaff[] = [];

  for (const file of files) {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    const sourceFile: Source = file.name.toLowerCase().includes('ane') ? 'ane' : 'op';    const isAne = sourceFile === 'ane';
    const dayHeaderRow = isAne ? 2 : 3;
    const dayStartCol = 3; // Column C
    let currentRole: Role = sourceFile === 'op' ? 'op_ssk' : 'ane_ssk';

    // Extract weekdays + dates from header
    const weekdays: { col: number; name: string; date: string }[] = [];
    for (let col = dayStartCol; col < dayStartCol + 5; col++) {
      const raw = sheet.getCell(dayHeaderRow, col).value?.toString().trim() || '';      const [weekday, date] = raw.split(' ');
      if (!week && date) {
        // Parse date YYMMDD format and calculate week number
        const year = 2000 + parseInt(date.slice(0, 2));
        const month = parseInt(date.slice(2, 4)) - 1; // JS months are 0-based
        const day = parseInt(date.slice(4, 6));
        const dateObj = new Date(year, month, day);
        week = `v.${getWeekNumber(dateObj).toString().padStart(2, '0')}`;
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

        allStaff.push({
          name: nameCell,
          role: currentRole,
          weekday,
          date,
          workHours,
          comments: comment || undefined,
          extraInfo: extra || undefined,
          sourceFile,
        });
      }
    }
  }

  return { week, staff: allStaff };
}
