import ExcelJS from 'exceljs';
import { dialog } from 'electron';

export interface StaffMember {
  name: string;
  workHours: string;
  comments: string;
}

export interface ExcelImportResult {
  success: boolean;
  data: StaffMember[];
  errors?: string[];
}

export interface DualExcelImportResult {
  success: boolean;
  week: string;
  opFileName: string;
  aneFileName: string;
  data: StaffMember[];
  errors?: string[];
  warnings?: string[];
}

export interface ExcelExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Import staff data from Excel file
 * Expected columns: Name, Work hours, Comments
 */
export async function importStaffFromExcel(filePath?: string): Promise<ExcelImportResult> {
  try {
    let targetPath = filePath;
    
    if (!targetPath) {
      const result = await dialog.showOpenDialog({
        title: 'Importera personal från Excel',
        filters: [
          { name: 'Excel-filer', extensions: ['xlsx', 'xls'] },
          { name: 'Alla filer', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false, data: [], errors: ['Import avbruten'] };
      }

      targetPath = result.filePaths[0];
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(targetPath);
    
    const worksheet = workbook.getWorksheet(1); // First worksheet
    if (!worksheet) {
      return { success: false, data: [], errors: ['Kunde inte läsa arbetsblad'] };
    }

    const staff: StaffMember[] = [];
    const errors: string[] = [];

    // Expect headers in row 1: Name, Work hours, Comments
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const name = row.getCell(1).text?.trim();
      const workHours = row.getCell(2).text?.trim();
      const comments = row.getCell(3).text?.trim() || '';

      if (!name) {
        errors.push(`Rad ${rowNumber}: Namn saknas`);
        return;
      }

      if (!workHours) {
        errors.push(`Rad ${rowNumber}: Arbetstid saknas för ${name}`);
        return;
      }

      staff.push({
        name,
        workHours,
        comments
      });
    });

    return {
      success: true,
      data: staff,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Import misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`]
    };
  }
}

/**
 * Import both OP and ANE Excel files together
 */
export async function importDualExcelFiles(): Promise<DualExcelImportResult> {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Importera OP- och ANE-filer (.xlsx)',
      filters: [
        { name: 'Excel-filer', extensions: ['xlsx', 'xls'] },
        { name: 'Alla filer', extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (result.canceled || !result.filePaths.length) {
      return { 
        success: false, 
        week: '', 
        opFileName: '', 
        aneFileName: '', 
        data: [], 
        errors: ['Import avbruten'] 
      };
    }

    if (result.filePaths.length !== 2) {
      return {
        success: false,
        week: '',
        opFileName: '',
        aneFileName: '',
        data: [],
        errors: ['Ladda upp exakt 2 filer: en OP-fil och en ANE-fil']
      };
    }

    // Detect file types
    const files = result.filePaths.map(path => ({
      path,
      name: path.split('\\').pop() || path.split('/').pop() || '',
      type: detectFileTypeFromName(path)
    }));

    const opFile = files.find(f => f.type === 'OP');
    const aneFile = files.find(f => f.type === 'ANE');

    if (!opFile || !aneFile) {
      return {
        success: false,
        week: '',
        opFileName: '',
        aneFileName: '',
        data: [],
        errors: ['Kunde inte identifiera OP- och ANE-filer. Kontrollera att filnamnen innehåller "OP" respektive "ANE"']
      };
    }

    // Read both Excel files
    const [opData, aneData] = await Promise.all([
      readExcelFile(opFile.path),
      readExcelFile(aneFile.path)
    ]);

    if (!opData.success || !aneData.success) {
      return {
        success: false,
        week: '',
        opFileName: opFile.name,
        aneFileName: aneFile.name,
        data: [],
        errors: [
          ...(opData.errors || []).map(e => `OP-fil: ${e}`),
          ...(aneData.errors || []).map(e => `ANE-fil: ${e}`)
        ]
      };
    }    // Combine staff data
    const combinedStaff: StaffMember[] = [];
    const warnings: string[] = [];

    // Add OP staff
    combinedStaff.push(...opData.data.map(staff => ({
      ...staff,
      comments: staff.comments ? `[OP] ${staff.comments}` : '[OP]'
    })));

    // Add ANE staff
    combinedStaff.push(...aneData.data.map(staff => ({
      ...staff,
      comments: staff.comments ? `[ANE] ${staff.comments}` : '[ANE]'
    })));

    // Check for duplicates
    const nameCount = new Map<string, number>();
    combinedStaff.forEach(staff => {
      const name = staff.name.toLowerCase();
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });

    nameCount.forEach((count, name) => {
      if (count > 1) {
        warnings.push(`Dublett hittad: "${name}" finns i både OP- och ANE-filen`);
      }
    });

    // Extract week number
    const week = extractWeekFromFileName(opFile.name) || extractWeekFromFileName(aneFile.name);

    return {
      success: true,
      week,
      opFileName: opFile.name,
      aneFileName: aneFile.name,
      data: combinedStaff,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      success: false,
      week: '',
      opFileName: '',
      aneFileName: '',
      data: [],
      errors: [`Import misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`]
    };
  }
}

/**
 * Helper function to read an Excel file
 */
async function readExcelFile(filePath: string): Promise<ExcelImportResult> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return { success: false, data: [], errors: ['Kunde inte läsa arbetsblad'] };
    }

    const staff: StaffMember[] = [];
    const errors: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const name = row.getCell(1).text?.trim();
      const workHours = row.getCell(2).text?.trim();
      const comments = row.getCell(3).text?.trim() || '';

      if (!name) {
        errors.push(`Rad ${rowNumber}: Namn saknas`);
        return;
      }

      if (!workHours) {
        errors.push(`Rad ${rowNumber}: Arbetstid saknas för ${name}`);
        return;
      }

      staff.push({
        name,
        workHours,
        comments
      });
    });

    return {
      success: true,
      data: staff,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Läsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`]
    };
  }
}

/**
 * Detect file type from filename
 */
function detectFileTypeFromName(fileName: string): 'OP' | 'ANE' | 'UNKNOWN' {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('op') && !lowerName.includes('ane')) {
    return 'OP';
  }
  if (lowerName.includes('ane') || lowerName.includes('anestesi')) {
    return 'ANE';
  }
  
  return 'UNKNOWN';
}

/**
 * Extract week number from filename
 */
function extractWeekFromFileName(fileName: string): string {
  const weekMatch = fileName.toLowerCase().match(/(?:vecka|v|week)\.?(\d{1,2})/);
  if (weekMatch) {
    return `v.${weekMatch[1]}`;
  }
  
  // Fallback to current week
  const now = new Date();
  const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `v.${weekNumber}`;
}

/**
 * Export schedule to Excel file
 */
export async function exportScheduleToExcel(scheduleData: any): Promise<ExcelExportResult> {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Exportera schema till Excel',
      defaultPath: 'schema.xlsx',
      filters: [
        { name: 'Excel-filer', extensions: ['xlsx'] },
        { name: 'Alla filer', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Export avbruten' };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schema');

    // Add headers
    worksheet.columns = [
      { header: 'Dag', key: 'day', width: 15 },
      { header: 'Sal', key: 'room', width: 20 },
      { header: 'Pass', key: 'pass', width: 20 },
      { header: 'OP SSK', key: 'opSSK', width: 20 },
      { header: 'ANE SSK', key: 'aneSSK', width: 20 },
      { header: 'Korridor', key: 'corridor', width: 25 }
    ];

    // Add data rows
    if (scheduleData?.days) {
      scheduleData.days.forEach((day: any) => {
        // Add room data
        if (day.operatingRooms) {
          day.operatingRooms.forEach((room: any) => {
            worksheet.addRow({
              day: day.name || day.id,
              room: room.name,
              pass: room.pass?.name || '',
              opSSK: room.opSSK?.name || '',
              aneSSK: room.aneSSK?.name || ''
            });
          });
        }

        // Add corridor staff
        if (day.corridorStaff) {
          day.corridorStaff.forEach((staff: any) => {
            worksheet.addRow({
              day: day.name || day.id,
              room: '',
              pass: '',
              opSSK: '',
              aneSSK: '',
              corridor: `${staff.role}: ${staff.staff?.name || ''}`
            });
          });
        }
      });
    }

    // Save file
    await workbook.xlsx.writeFile(result.filePath);

    return {
      success: true,
      filePath: result.filePath
    };

  } catch (error) {
    return {
      success: false,
      error: `Export misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`
    };
  }
}
