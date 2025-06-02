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
 * Export staff schedule to Excel file
 */
export async function exportScheduleToExcel(scheduleData: any): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Exportera schema till Excel',
      defaultPath: `schema_${new Date().toISOString().slice(0, 10)}.xlsx`,
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
    worksheet.addRow(['Dag', 'Sal', 'Roll', 'Personal', 'Arbetstid', 'Kommentarer']);

    // Process schedule data if provided
    if (scheduleData && scheduleData.days) {
      scheduleData.days.forEach((day: any) => {
        const dayName = day.name || day.id;
        
        // Export operating rooms
        if (day.operatingRooms) {
          day.operatingRooms.forEach((room: any) => {
            // Pass
            if (room.pass) {
              worksheet.addRow([dayName, room.name, 'Pass', room.pass.name, room.pass.workHours, room.pass.comments || '']);
            }
            // Op SSK
            if (room.opSSK) {
              worksheet.addRow([dayName, room.name, 'Op SSK', room.opSSK.name, room.opSSK.workHours, room.opSSK.comments || '']);
            }
            // Ane SSK
            if (room.aneSSK) {
              worksheet.addRow([dayName, room.name, 'Ane SSK', room.aneSSK.name, room.aneSSK.workHours, room.aneSSK.comments || '']);
            }
          });
        }

        // Export corridor staff
        if (day.corridorStaff) {
          day.corridorStaff.forEach((staff: any) => {
            worksheet.addRow([dayName, 'Korridor', staff.role, staff.name, staff.workHours, staff.comments || '']);
          });
        }
      });
    }

    await workbook.xlsx.writeFile(result.filePath);

    return { success: true, filePath: result.filePath };

  } catch (error) {
    return {
      success: false,
      error: `Export misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`
    };
  }
}
