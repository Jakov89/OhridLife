/**
 * Helper Script: Add lat/lng from Google Maps Share Links
 *
 * Resolves each venue's location.googleMapsUrl by following HTTP redirects
 * and extracts the accurate pin coordinates from the "@lat,lng" pattern in
 * the final resolved Google Maps URL.
 *
 * This is more accurate than add-latlng-to-venues.js, which used the map
 * viewport centre ("!2d/!3d") rather than the actual marker position.
 *
 * Note on coordinate order:
 *   !2d = longitude, !3d = latitude   (old script, iframe viewpoint)
 *   @lat,lng                           (this script, pin position — lat first)
 *
 * Usage: node add-latlng-from-share-links.js
 */

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');

const venuesPath = path.join(__dirname, 'data', 'venues_reorganized.json');
const backupPath = path.join(__dirname, 'data', 'venues_reorganized.json.backup');

// "@lat,lng" that appears in resolved Google Maps place URLs:
//   .../place/Some+Name/@41.1183118,20.8010611,17z/...
// Group 1 = latitude, Group 2 = longitude.
const AT_COORDS_RE = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

const REQUEST_TIMEOUT_MS  = 8000;
const DELAY_BETWEEN_MS    = 250;
const MAX_REDIRECTS       = 10;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Follows all HTTP(S) redirects starting from urlStr and returns the
 * final destination URL string.  The response body is never read.
 */
function resolveUrl(urlStr, redirectsLeft = MAX_REDIRECTS) {
    return new Promise((resolve, reject) => {
        if (redirectsLeft === 0) {
            return reject(new Error('Too many redirects'));
        }

        let parsed;
        try {
            parsed = new URL(urlStr);
        } catch {
            return reject(new Error(`Invalid URL: ${urlStr}`));
        }

        const lib = parsed.protocol === 'https:' ? https : http;

        const req = lib.get(urlStr, {
            headers: {
                // A realistic UA avoids some bot-blocking redirects on Google
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                              'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                              'Chrome/124.0 Safari/537.36',
                'Accept': 'text/html,*/*'
            }
        }, (res) => {
            // Always drain the body so the socket is reused cleanly
            res.resume();

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl;
                try {
                    // Resolve relative redirects against the current URL
                    nextUrl = new URL(res.headers.location, urlStr).toString();
                } catch {
                    return reject(new Error(
                        `Unparseable redirect Location: ${res.headers.location}`
                    ));
                }
                resolve(resolveUrl(nextUrl, redirectsLeft - 1));
            } else {
                resolve(urlStr); // non-redirect: this is the final URL
            }
        });

        // Destroy the request if it takes too long; the error event fires next
        req.setTimeout(REQUEST_TIMEOUT_MS, () => {
            req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS} ms`));
        });

        req.on('error', reject);
    });
}

async function main() {
    console.log('🚀 Starting lat/lng extraction from Google Maps share links…\n');

    // ── Read ──────────────────────────────────────────────────────────────────
    let raw;
    try {
        raw = fs.readFileSync(venuesPath, 'utf8');
    } catch (err) {
        console.error('❌ Cannot read venues file:', err.message);
        process.exit(1);
    }

    let venues;
    try {
        venues = JSON.parse(raw.replace(/^\uFEFF/, '')); // strip BOM if present
    } catch (err) {
        console.error('❌ Cannot parse venues JSON:', err.message);
        process.exit(1);
    }

    console.log(`📊 Found ${venues.length} venues`);

    // ── Backup ────────────────────────────────────────────────────────────────
    fs.writeFileSync(backupPath, raw);
    console.log(`💾 Backup saved to: ${backupPath}\n`);

    // ── Process ───────────────────────────────────────────────────────────────
    let updated = 0;
    let noUrl   = 0;        // venues without a googleMapsUrl — not logged verbosely
    const failed = [];      // { id, name, reason } — old coords kept as fallback

    for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];
        const name   = typeof venue.name === 'string'
            ? venue.name
            : (venue.name?.en || `id=${venue.id}`);
        const mapsUrl = venue.location?.googleMapsUrl;

        if (!mapsUrl || !mapsUrl.trim()) {
            noUrl++;
            continue;
        }

        process.stdout.write(`  [${String(i + 1).padStart(3)}/${venues.length}] ${name.slice(0, 45).padEnd(45)} … `);

        try {
            const finalUrl = await resolveUrl(mapsUrl);
            const match    = AT_COORDS_RE.exec(finalUrl);

            if (!match) {
                process.stdout.write(`⚠️  @lat,lng not found in final URL\n`);
                failed.push({
                    id:     venue.id,
                    name,
                    reason: `@lat,lng absent — final URL: ${finalUrl.slice(0, 100)}`
                });
            } else {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);

                if (!venue.location) venue.location = {};
                venue.location.lat = lat;
                venue.location.lng = lng;
                updated++;
                process.stdout.write(`✅  ${lat}, ${lng}\n`);
            }
        } catch (err) {
            process.stdout.write(`❌  ${err.message}\n`);
            failed.push({ id: venue.id, name, reason: err.message });
        }

        // Polite delay between requests (skip after the last one)
        if (i < venues.length - 1) {
            await sleep(DELAY_BETWEEN_MS);
        }
    }

    // ── Write ─────────────────────────────────────────────────────────────────
    console.log('\n💾 Writing updated venues_reorganized.json…');
    try {
        fs.writeFileSync(venuesPath, JSON.stringify(venues, null, 2), 'utf8');
    } catch (err) {
        console.error('❌ Error writing file:', err.message);
        console.log('💡 Restore from backup:', backupPath);
        process.exit(1);
    }
    console.log('✨ File written.\n');

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('─'.repeat(60));
    console.log('📊 Summary');
    console.log('─'.repeat(60));
    console.log(`   ✅  Updated:         ${updated} venue(s) with accurate pin coordinates`);
    console.log(`   ⏭️   No googleMapsUrl: ${noUrl} venue(s) — untouched`);
    console.log(`   ❌  Failed:           ${failed.length} venue(s) — old coordinates (if any) left as fallback`);

    if (failed.length > 0) {
        console.log('\n⚠️  Failed venues — check / fix googleMapsUrl manually:');
        failed.forEach(v => {
            console.log(`\n   id=${v.id}  "${v.name}"`);
            console.log(`   reason: ${v.reason}`);
        });
        console.log('');
    }

    console.log('\n💡 Tips:');
    console.log('   • For failed venues, open the venue in Google Maps,');
    console.log('     copy a fresh share link, update googleMapsUrl, then re-run.');
    console.log('   • Venues with no googleMapsUrl still have the iframe-derived');
    console.log('     coords from add-latlng-to-venues.js (if that was run first).\n');
}

main().catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
