/**
 * Enhanced import handlers for multi-week Excel file processing.
 * Supports independent OP/ANE file uploads with smart merging.
 */

export const handleMultiWeekImport = async (
  importMultiWeekFile: (file: File) => Promise<any>
) => {
  console.log('📥 Starting multi-week Excel import...');
  
  // Create file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.style.display = 'none';
  
  return new Promise<void>((resolve) => {
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        console.log('❌ No file selected');
        resolve();
        return;
      }

      try {
        console.log('📄 Processing file:', file.name);
        
        const importResult = await importMultiWeekFile(file);
        console.log('📊 Multi-week import result:', importResult);
        
        if (importResult.success) {
          console.log(`✅ Imported ${importResult.totalStaff} staff across ${importResult.totalWeeks} weeks`);
          
          let message = `Importerade ${importResult.totalStaff} personal för ${importResult.weekSpan}`;
          
          if (importResult.warnings && importResult.warnings.length > 0) {
            message += `\n\nVarningar:\n${importResult.warnings.slice(0, 3).join('\n')}`;
            if (importResult.warnings.length > 3) {
              message += `\n... och ${importResult.warnings.length - 3} till`;
            }
          }
          
          alert(message);
        } else {
          console.warn('⚠️ Multi-week import failed');
          const errorMsg = importResult.errors?.join(', ') || 'Okänt fel';
          alert(`Import misslyckades: ${errorMsg}`);
        }
      } catch (error) {
        console.error('❌ Multi-week import error:', error);
        alert(`Import fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      }
      
      document.body.removeChild(input);
      resolve();
    };
    
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve();
    };
    
    document.body.appendChild(input);
    input.click();
  });
};

export const handleIndependentFileImport = async (
  importIndependentFile: (file: File, merge?: boolean) => Promise<any>,
  mergeWithExisting = true
) => {
  console.log('📥 Starting independent file import...');
  
  // Create file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.style.display = 'none';
  
  return new Promise<void>((resolve) => {
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        console.log('❌ No file selected');
        resolve();
        return;
      }

      try {
        const fileName = file.name;
        const fileType = fileName.toLowerCase().includes('ane') ? 'ANE' : 
                        fileName.toLowerCase().includes('op') ? 'OP' : 'Okänd';
        
        console.log(`📄 Processing ${fileType} file:`, fileName);
        
        const importResult = await importIndependentFile(file, mergeWithExisting);
        console.log('📊 Independent import result:', importResult);
        
        if (importResult.success) {
          console.log(`✅ Imported ${importResult.totalStaff} staff from ${fileType} file`);
          
          let message = `Importerade ${fileType}-schema: ${importResult.totalStaff} personal för ${importResult.weekSpan}`;
          
          if (importResult.mergeReport) {
            const { mergeReport } = importResult;
            if (mergeReport.conflicts && mergeReport.conflicts.length > 0) {
              message += `\n\nUppdateringar: ${mergeReport.conflicts.length} konflikter lösta`;
            }
            if (mergeReport.additions && mergeReport.additions.length > 0) {
              message += `\n\nLade till: ${mergeReport.additions.length} nya poster`;
            }
          }
          
          if (importResult.warnings && importResult.warnings.length > 0) {
            message += `\n\nVarningar: ${importResult.warnings.length} varningar`;
          }
          
          alert(message);
        } else {
          console.warn('⚠️ Independent import failed');
          const errorMsg = importResult.errors?.join(', ') || 'Okänt fel';
          alert(`Import misslyckades: ${errorMsg}`);
        }
      } catch (error) {
        console.error('❌ Independent import error:', error);
        alert(`Import fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      }
      
      document.body.removeChild(input);
      resolve();
    };
    
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve();
    };
    
    document.body.appendChild(input);
    input.click();
  });
};

// Legacy import handlers (keep for backward compatibility)
export const handleImportExcel = async (
  importStaff: (staff: any[]) => void,
  getCurrentDay: () => any
) => {
  console.log('📥 Starting legacy Excel import...');
  
  if (!window.electronAPI?.importExcel) {
    console.error('❌ ElectronAPI not available');
    alert('Filhantering inte tillgänglig');
    return;
  }

  try {
    const result = await window.electronAPI.importExcel();
    console.log('📄 Import result:', result);
    
    if (result.success && result.data) {
      console.log(`✅ Imported ${result.data.length} staff members`);
      importStaff(result.data);
      
      const currentDay = getCurrentDay();
      if (currentDay) {
        console.log('📅 Current day updated with imported staff');
        alert(`Importerade ${result.data.length} personal`);
      }
    } else {
      console.warn('⚠️ Import cancelled or failed');
      if (result.errors && result.errors.length > 0) {
        alert(`Import misslyckades: ${result.errors.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('❌ Excel import error:', error);
    alert(`Import fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
  }
};

export const handleImportDualExcel = async (
  importDualStaff: (opData: any[], aneData: any[]) => void,
  getCurrentDay: () => any
) => {
  console.log('📥📥 Starting dual Excel import...');
  
  if (!window.electronAPI?.importDualExcel) {
    console.error('❌ ElectronAPI not available for dual import');
    alert('Dubbel filhantering inte tillgänglig');
    return;
  }

  try {
    const result = await window.electronAPI.importDualExcel();
    console.log('📄📄 Dual import result:', result);
    
    if (result.success && result.data) {
      console.log(`✅ Dual import successful: OP=${result.opFileName}, ANE=${result.aneFileName}, Week=${result.week}`);
      console.log(`📊 Total staff imported: ${result.data.length}`);
      
      // For dual import, we'll pass all data as both opData since they're combined in the API
      importDualStaff(result.data, []);
      
      const currentDay = getCurrentDay();
      if (currentDay) {
        console.log('📅 Current day updated with dual imported staff');
        alert(`Importerade ${result.data.length} personal från ${result.opFileName} och ${result.aneFileName} (${result.week})`);
      }
    } else {
      console.warn('⚠️ Dual import cancelled or failed');
      if (result.errors && result.errors.length > 0) {
        alert(`Dual import misslyckades: ${result.errors.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('❌ Dual Excel import error:', error);
    alert(`Dual import fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
  }
};
