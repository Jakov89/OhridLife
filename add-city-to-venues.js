/**
 * Helper Script: Add City Field to Venues
 * 
 * This script adds a "city" field to all venues in venues_reorganized.json.
 * By default, it sets all venues to "Ohrid". You can then manually update
 * Struga venues or modify this script to set them automatically.
 * 
 * Usage: node add-city-to-venues.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const venuesPath = path.join(__dirname, 'data', 'venues_reorganized.json');
const backupPath = path.join(__dirname, 'data', 'venues_reorganized.json.backup');

console.log('🚀 Starting city field addition to venues...\n');

// Read the venues file
fs.readFile(venuesPath, 'utf8', (err, data) => {
    if (err) {
        console.error('❌ Error reading venues file:', err);
        process.exit(1);
    }

    try {
        // Parse the JSON
        const venues = JSON.parse(data);
        console.log(`📊 Found ${venues.length} venues\n`);

        // Create backup before modifying
        fs.writeFileSync(backupPath, data);
        console.log('💾 Backup created at:', backupPath, '\n');

        // Add city field to each venue
        let updatedCount = 0;
        let alreadyHasCity = 0;

        venues.forEach(venue => {
            if (!venue.city) {
                // Set default city to Ohrid
                venue.city = 'Ohrid';
                updatedCount++;
            } else {
                alreadyHasCity++;
            }
        });

        console.log(`✅ Updated ${updatedCount} venues with city field`);
        console.log(`ℹ️  ${alreadyHasCity} venues already had city field\n`);

        // Write the updated data back to the file
        const updatedData = JSON.stringify(venues, null, 2);
        fs.writeFile(venuesPath, updatedData, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('❌ Error writing updated venues file:', writeErr);
                console.log('💡 You can restore from backup at:', backupPath);
                process.exit(1);
            }

            console.log('✨ Successfully updated venues file!\n');
            console.log('📝 Next steps:');
            console.log('   1. Review the changes in venues_reorganized.json');
            console.log('   2. Manually update venues that should be in "Struga"');
            console.log('   3. Or modify this script to automatically set Struga venues');
            console.log('\n💡 Tip: Search for venue names or locations to identify Struga venues\n');
            
            // Show some statistics
            const cities = venues.reduce((acc, venue) => {
                acc[venue.city] = (acc[venue.city] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📊 Venue distribution by city:');
            Object.entries(cities).forEach(([city, count]) => {
                console.log(`   ${city}: ${count} venues`);
            });
        });

    } catch (parseErr) {
        console.error('❌ Error parsing venues JSON:', parseErr);
        process.exit(1);
    }
});
































