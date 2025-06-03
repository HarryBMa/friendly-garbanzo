const { readExcelFile } = require('./dist-electron/main.cjs');
const path = require('path');

async function testExcelImport() {
    console.log('Testing Excel import fix...\n');
    
    // Test files
    const testFiles = [
        'test-files/OP_v.48.xlsx',
        'test-files/ANE_v.48.xlsx'
    ];
    
    for (const filePath of testFiles) {
        console.log(`\n=== Testing ${filePath} ===`);
        
        try {
            const fullPath = path.join(__dirname, filePath);
            console.log(`Reading file: ${fullPath}`);
            
            // This would be called from the main process
            const result = await readExcelFile(fullPath);
            
            if (result.success && result.data) {
                console.log(`✅ Successfully imported ${result.data.length} staff members`);
                
                // Group by weekday to verify sorting
                const weekdayGroups = {};
                result.data.forEach(staff => {
                    // Extract weekday from name (format: "Name (Weekday)")
                    const match = staff.name.match(/\(([^)]+)\)$/);
                    if (match) {
                        const weekday = match[1];
                        if (!weekdayGroups[weekday]) {
                            weekdayGroups[weekday] = [];
                        }
                        weekdayGroups[weekday].push(staff.name);
                    }
                });
                
                console.log('\n📊 Staff distribution by weekday:');
                Object.keys(weekdayGroups).sort().forEach(weekday => {
                    console.log(`  ${weekday}: ${weekdayGroups[weekday].length} staff`);
                    // Show first few names as examples
                    weekdayGroups[weekday].slice(0, 3).forEach(name => {
                        console.log(`    - ${name}`);
                    });
                    if (weekdayGroups[weekday].length > 3) {
                        console.log(`    ... and ${weekdayGroups[weekday].length - 3} more`);
                    }
                });
                
                // Verify we have full Swedish weekday names
                const swedishDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
                const foundDays = Object.keys(weekdayGroups);
                const hasFullNames = foundDays.every(day => swedishDays.includes(day));
                
                if (hasFullNames) {
                    console.log('\n✅ SUCCESS: All weekdays are using full Swedish names!');
                } else {
                    console.log('\n❌ ISSUE: Found abbreviated weekday names:', foundDays.filter(day => !swedishDays.includes(day)));
                }
                
            } else {
                console.log('❌ Import failed:', result.error);
            }
            
        } catch (error) {
            console.log('❌ Error during import:', error.message);
        }
    }
}

// Note: This test would need to be run in the context of the Electron main process
// since readExcelFile is a main process function
console.log('This test script shows the intended verification logic.');
console.log('The actual fix has been implemented in fileHandler.ts');
console.log('Manual testing should be done through the Electron application UI.');
