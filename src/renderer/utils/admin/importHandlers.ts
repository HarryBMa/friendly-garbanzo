/**
 * Import handlers for Excel file processing in Admin component.
 * Handles both single file imports and dual file imports with electron API integration.
 */

export const handleImportExcel = async (
  importStaff: (staff: any[]) => void,
  getCurrentDay: () => any
) => {
  console.log('📥 Starting Excel import...');
  
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
