/**
 * Unified import handler that intelligently detects and handles both multi-week and independent file imports.
 * Combines the functionality of multi-week import and independent file upload into a single interface.
 */

export const handleUnifiedExcelImport = async (
  importMultiWeekFile: (file: File) => Promise<any>,
  importIndependentFile: (file: File, merge?: boolean) => Promise<any>
) => {
  console.log('📥 Starting unified Excel import...');
  
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
        console.log('📄 Processing file:', fileName);
        
        // Detect file type and import strategy
        const isOpOrAne = fileName.toLowerCase().includes('op') || fileName.toLowerCase().includes('ane');
        const hasWeekRange = /v\.?\d+-\d+/i.test(fileName); // Matches v.22-35, v22-35, etc.
        const isSingleWeek = /v\.?\d+(?!-)/i.test(fileName); // Matches v.22 but not v.22-35
        
        console.log('🔍 File analysis:', {
          fileName,
          isOpOrAne,
          hasWeekRange,
          isSingleWeek,
          strategy: hasWeekRange ? 'multi-week' : (isOpOrAne ? 'independent' : 'multi-week-fallback')
        });
        
        let importResult;
        
        if (hasWeekRange) {
          // Multi-week file (v.22-35)
          console.log('📅 Using multi-week import strategy');
          importResult = await importMultiWeekFile(file);
          
          if (importResult.success) {
            let message = `Importerade ${importResult.totalStaff} personal för ${importResult.weekSpan}`;
            
            if (importResult.warnings && importResult.warnings.length > 0) {
              message += `\n\nVarningar: ${importResult.warnings.length} problem upptäckta`;
            }
            
            alert(message);
          } else {
            throw new Error(importResult.errors?.join(', ') || 'Multi-week import failed');
          }
          
        } else if (isOpOrAne || isSingleWeek) {
          // Independent file (OP/ANE specific or single week)
          console.log('🔄 Using independent file import strategy with merging');
          importResult = await importIndependentFile(file, true);
          
          if (importResult.success) {
            const fileType = fileName.toLowerCase().includes('ane') ? 'ANE' : 
                            fileName.toLowerCase().includes('op') ? 'OP' : 'Schema';
            
            let message = `Importerade ${fileType}: ${importResult.totalStaff} personal för ${importResult.weekSpan}`;
            
            if (importResult.mergeReport) {
              const { mergeReport } = importResult;
              if (mergeReport.conflicts && mergeReport.conflicts.length > 0) {
                message += `\n\nUppdateringar: ${mergeReport.conflicts.length} konflikter lösta`;
              }
              if (mergeReport.additions && mergeReport.additions.length > 0) {
                message += `\nLade till: ${mergeReport.additions.length} nya poster`;
              }
            }
            
            if (importResult.warnings && importResult.warnings.length > 0) {
              message += `\n\nVarningar: ${importResult.warnings.length} problem`;
            }
            
            alert(message);
          } else {
            throw new Error(importResult.errors?.join(', ') || 'Independent import failed');
          }
          
        } else {
          // Fallback: Try multi-week import for unknown file types
          console.log('🔄 Using multi-week fallback strategy');
          importResult = await importMultiWeekFile(file);
          
          if (importResult.success) {
            let message = `Importerade schema: ${importResult.totalStaff} personal för ${importResult.weekSpan}`;
            
            if (importResult.warnings && importResult.warnings.length > 0) {
              message += `\n\nVarningar: ${importResult.warnings.length} problem`;
            }
            
            alert(message);
          } else {
            throw new Error(importResult.errors?.join(', ') || 'Import failed');
          }
        }
        
      } catch (error) {
        console.error('❌ Unified import error:', error);
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
