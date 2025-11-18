/**
 * Helper Script: Update Struga Venues
 * 
 * This script identifies and updates venues that should be in Struga
 * based on keywords in their names, descriptions, or locations.
 * 
 * Usage: node update-struga-venues.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// File paths
const venuesPath = path.join(__dirname, 'data', 'venues_reorganized.json');
const backupPath = path.join(__dirname, 'data', 'venues_reorganized_struga.json.backup');

// Keywords that might indicate a Struga venue
const strugaKeywords = [
    'struga',
    'струга',
    // Add more Struga-specific location keywords here
];

console.log('🔍 Starting Struga venue identification...\n');

// Read the venues file
fs.readFile(venuesPath, 'utf8', async (err, data) => {
    if (err) {
        console.error('❌ Error reading venues file:', err);
        process.exit(1);
    }

    try {
        // Parse the JSON
        const venues = JSON.parse(data);
        console.log(`📊 Analyzing ${venues.length} venues\n`);

        // Create backup before modifying
        fs.writeFileSync(backupPath, data);
        console.log('💾 Backup created at:', backupPath, '\n');

        // Find potential Struga venues
        const potentialStrugaVenues = [];

        venues.forEach((venue, index) => {
            const venueName = (venue.name || '').toLowerCase();
            const venueDescription = (venue.description || '').toLowerCase();
            const venueAddress = (venue.location?.address || '').toLowerCase();
            
            const searchText = `${venueName} ${venueDescription} ${venueAddress}`;
            
            // Check if any Struga keyword is present
            const hasStrugaKeyword = strugaKeywords.some(keyword => 
                searchText.includes(keyword.toLowerCase())
            );
            
            if (hasStrugaKeyword) {
                potentialStrugaVenues.push({
                    index,
                    id: venue.id,
                    name: venue.name,
                    currentCity: venue.city || 'Not set',
                    address: venue.location?.address || 'No address'
                });
            }
        });

        if (potentialStrugaVenues.length === 0) {
            console.log('ℹ️  No venues found with Struga keywords');
            console.log('💡 You may need to manually identify Struga venues');
            console.log('   or add more keywords to the strugaKeywords array in this script\n');
            return;
        }

        console.log(`🎯 Found ${potentialStrugaVenues.length} potential Struga venues:\n`);
        
        // Display potential Struga venues
        potentialStrugaVenues.forEach((venue, idx) => {
            console.log(`${idx + 1}. ${venue.name} (ID: ${venue.id})`);
            console.log(`   Current City: ${venue.currentCity}`);
            console.log(`   Address: ${venue.address}\n`);
        });

        // Ask user for confirmation
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Do you want to update these venues to Struga? (yes/no): ', (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                // Update the venues
                potentialStrugaVenues.forEach(venueInfo => {
                    venues[venueInfo.index].city = 'Struga';
                });

                // Write the updated data back
                const updatedData = JSON.stringify(venues, null, 2);
                fs.writeFile(venuesPath, updatedData, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error('❌ Error writing updated venues file:', writeErr);
                        console.log('💡 You can restore from backup at:', backupPath);
                        process.exit(1);
                    }

                    console.log(`\n✨ Successfully updated ${potentialStrugaVenues.length} venues to Struga!\n`);
                    
                    // Show statistics
                    const cities = venues.reduce((acc, venue) => {
                        acc[venue.city || 'Not set'] = (acc[venue.city || 'Not set'] || 0) + 1;
                        return acc;
                    }, {});
                    
                    console.log('📊 Venue distribution by city:');
                    Object.entries(cities).forEach(([city, count]) => {
                        console.log(`   ${city}: ${count} venues`);
                    });
                    
                    rl.close();
                });
            } else {
                console.log('\n❌ Update cancelled. No changes made.');
                rl.close();
            }
        });

    } catch (parseErr) {
        console.error('❌ Error parsing venues JSON:', parseErr);
        process.exit(1);
    }
});




































