/**
 * Helper Script: Add lat/lng Coordinates to Venues
 *
 * Parses each venue's location.mapIframe Google Maps embed URL for the
 * "!2d<longitude>!3d<latitude>!" pattern and writes the extracted numbers
 * back as location.lat and location.lng.
 *
 * Usage: node add-latlng-to-venues.js
 */

const fs = require('fs');
const path = require('path');

const venuesPath = path.join(__dirname, 'data', 'venues_reorganized.json');
const backupPath = path.join(__dirname, 'data', 'venues_reorganized.json.backup');

// Matches "!2d<lng>!3d<lat>!" embedded in a Google Maps embed URL.
// Group 1 = longitude (!2d), Group 2 = latitude (!3d).
const COORDS_RE = /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/;

console.log('🚀 Starting lat/lng extraction for venues...\n');

fs.readFile(venuesPath, 'utf8', (err, data) => {
    if (err) {
        console.error('❌ Error reading venues file:', err);
        process.exit(1);
    }

    try {
        // Strip BOM if present
        const clean = data.replace(/^\uFEFF/, '');
        const venues = JSON.parse(clean);
        console.log(`📊 Found ${venues.length} venues\n`);

        // Backup before any modification
        fs.writeFileSync(backupPath, data);
        console.log('💾 Backup created at:', backupPath, '\n');

        let updated = 0;
        let alreadyHad = 0;
        const missing = [];   // venues with no parseable iframe

        venues.forEach(venue => {
            // Skip if coordinates already present
            if (venue.location && venue.location.lat != null && venue.location.lng != null) {
                alreadyHad++;
                return;
            }

            const iframe = venue.location && venue.location.mapIframe;
            if (!iframe) {
                missing.push({ id: venue.id, name: venue.name, reason: 'no mapIframe' });
                return;
            }

            const match = COORDS_RE.exec(iframe);
            if (!match) {
                missing.push({ id: venue.id, name: venue.name, reason: 'regex did not match' });
                return;
            }

            const lng = parseFloat(match[1]);
            const lat = parseFloat(match[2]);

            if (!venue.location) venue.location = {};
            venue.location.lat = lat;
            venue.location.lng = lng;
            updated++;
        });

        console.log(`✅ Extracted coordinates for ${updated} venue(s)`);
        if (alreadyHad > 0) {
            console.log(`ℹ️  ${alreadyHad} venue(s) already had lat/lng — left unchanged`);
        }
        if (missing.length > 0) {
            console.log(`\n⚠️  ${missing.length} venue(s) could not get coordinates (fix manually):`);
            missing.forEach(v => {
                console.log(`   id=${v.id}  name="${v.name}"  reason: ${v.reason}`);
            });
        }
        console.log('');

        const updatedData = JSON.stringify(venues, null, 2);
        fs.writeFile(venuesPath, updatedData, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('❌ Error writing updated venues file:', writeErr);
                console.log('💡 Restore from backup at:', backupPath);
                process.exit(1);
            }

            console.log('✨ Successfully wrote updated venues_reorganized.json\n');
            console.log('📝 Next steps:');
            console.log('   1. Review a few entries in venues_reorganized.json to spot-check coordinates');
            console.log('   2. For the venues listed above, add mapIframe manually then re-run, or');
            console.log('      set location.lat / location.lng directly in the JSON\n');
        });

    } catch (parseErr) {
        console.error('❌ Error parsing venues JSON:', parseErr);
        process.exit(1);
    }
});
