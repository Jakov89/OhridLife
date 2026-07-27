/**
 * Helper Script: Add lat/lng from Google Maps Share Links  (v2 — with fallbacks)
 *
 * Pass 1  — Follow each venue's googleMapsUrl, extract "@lat,lng" from the
 *            final resolved URL (most accurate: actual pin position).
 *
 * Pass 2  — For /maps/search/?…&query=<lat>,<lng> resolved URLs: the query
 *            parameter IS already coordinates — parse them directly.
 *
 * Pass 3a — For /maps/search/?…&query=<text> resolved URLs where the query
 *            is a name/address: geocode via Nominatim (OSM free API).
 *
 * Pass 3b — For /maps/place/<name> resolved URLs with no "@lat,lng" segment:
 *            geocode via Nominatim using venue name + city.
 *
 * Truly broken URLs (redirect threw, or resolved to a non-Google domain)
 * are kept in the final failure list for manual fixing.
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

// ── Constants ──────────────────────────────────────────────────────────────────

// "@lat,lng" in resolved Google Maps place URLs
//   …/place/Some+Name/@41.1183118,20.8010611,17z/…
//   Group 1 = latitude, Group 2 = longitude
const AT_COORDS_RE = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

// "lat,lng" bare pair (no "@") — used to validate query= params
const BARE_COORDS_RE = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/;

const GOOGLE_MAPS_HOSTS = new Set([
    'www.google.com', 'google.com', 'maps.google.com',
    'maps.app.goo.gl', 'goo.gl'
]);

const REQUEST_TIMEOUT_MS  = 8_000;
const MAX_REDIRECTS       = 10;
const GOOGLE_DELAY_MS     = 250;   // between Google redirect requests
const NOMINATIM_DELAY_MS  = 1_100; // Nominatim ToS: max 1 req/s

// ── Utilities ──────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function venueName(venue) {
    return typeof venue.name === 'string'
        ? venue.name
        : (venue.name?.en || `id=${venue.id}`);
}

function isGoogleMapsDomain(url) {
    try {
        const { hostname } = new URL(url);
        return GOOGLE_MAPS_HOSTS.has(hostname) ||
               hostname.endsWith('.google.com') ||
               hostname.endsWith('.goo.gl');
    } catch {
        return false;
    }
}

// ── HTTP helpers ───────────────────────────────────────────────────────────────

/**
 * Follow all HTTP(S) redirects for a URL and return the final destination URL.
 * The response body is never read.
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                              'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                              'Chrome/124.0 Safari/537.36',
                'Accept': 'text/html,*/*'
            }
        }, (res) => {
            res.resume(); // drain body — keeps the socket clean

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl;
                try {
                    nextUrl = new URL(res.headers.location, urlStr).toString();
                } catch {
                    return reject(new Error(
                        `Unparseable redirect Location: ${res.headers.location}`
                    ));
                }
                resolve(resolveUrl(nextUrl, redirectsLeft - 1));
            } else {
                resolve(urlStr);
            }
        });

        req.setTimeout(REQUEST_TIMEOUT_MS, () => {
            req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS} ms`));
        });
        req.on('error', reject);
    });
}

/**
 * Geocode a query string via Nominatim.
 * Returns { lat, lng } on success, or null if no results.
 * Throws on network/parse errors.
 */
function nominatimGeocode(query) {
    const url =
        'https://nominatim.openstreetmap.org/search?' +
        `q=${encodeURIComponent(query)}&format=json&limit=1`;

    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                // Nominatim ToS requires a descriptive User-Agent
                'User-Agent': 'OhridHub-VenueGeocoder/1.0 (github.com/Jakov89/OhridHub)',
                'Accept': 'application/json'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (Array.isArray(data) && data.length > 0) {
                        resolve({
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        });
                    } else {
                        resolve(null); // no results
                    }
                } catch (e) {
                    reject(new Error(`Nominatim parse error: ${e.message}`));
                }
            });
        });

        req.setTimeout(REQUEST_TIMEOUT_MS, () => {
            req.destroy(new Error('Nominatim request timed out'));
        });
        req.on('error', reject);
    });
}

// ── Coordinate extraction helpers ──────────────────────────────────────────────

/**
 * Pass 1: "@lat,lng" in a /maps/place/ or general Google Maps URL.
 * Returns { lat, lng } or null.
 */
function tryAtCoords(finalUrl) {
    const m = AT_COORDS_RE.exec(finalUrl);
    if (!m) return null;
    return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
}

/**
 * Pass 2: /maps/search/?…&query=<lat>,<lng> — the query param IS coords.
 * Returns { lat, lng } or null.
 */
function tryQueryCoords(finalUrl) {
    let parsed;
    try { parsed = new URL(finalUrl); } catch { return null; }

    if (!parsed.pathname.includes('/maps/search')) return null;

    const q = parsed.searchParams.get('query') || '';
    const m = BARE_COORDS_RE.exec(q.trim());
    if (!m) return null;
    return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
}

/**
 * Returns the text query from a /maps/search/?…&query=<text> URL,
 * or null if the URL doesn't match or the query looks like coordinates.
 */
function getSearchTextQuery(finalUrl) {
    let parsed;
    try { parsed = new URL(finalUrl); } catch { return null; }

    if (!parsed.pathname.includes('/maps/search')) return null;

    const q = (parsed.searchParams.get('query') || '').trim();
    if (!q) return null;
    if (BARE_COORDS_RE.test(q)) return null; // already handled by pass 2
    return q;
}

/**
 * Returns true if the final URL is a /maps/place/ URL with no "@lat,lng".
 * (These need Nominatim geocoding by venue name.)
 */
function isPlaceUrlWithoutCoords(finalUrl) {
    let parsed;
    try { parsed = new URL(finalUrl); } catch { return false; }

    return parsed.pathname.includes('/maps/place') && !AT_COORDS_RE.test(finalUrl);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀  Starting lat/lng extraction (v2 — with Nominatim fallback)…\n');

    // ── Read ──────────────────────────────────────────────────────────────────
    let raw;
    try {
        raw = fs.readFileSync(venuesPath, 'utf8');
    } catch (err) {
        console.error('❌  Cannot read venues file:', err.message);
        process.exit(1);
    }

    let venues;
    try {
        venues = JSON.parse(raw.replace(/^\uFEFF/, ''));
    } catch (err) {
        console.error('❌  Cannot parse venues JSON:', err.message);
        process.exit(1);
    }

    console.log(`📊  Found ${venues.length} venues`);

    fs.writeFileSync(backupPath, raw);
    console.log(`💾  Backup saved to: ${backupPath}\n`);

    // ── PASS 1: follow redirects, extract @lat,lng ────────────────────────────
    console.log('── Pass 1: resolving Google Maps share links ─────────────────────');

    // Entries that need further recovery: { venue, name, finalUrl, broken }
    //   finalUrl: null  → redirect threw an error (broken)
    //   broken: true    → final URL is not a Google Maps domain (also broken)
    //   otherwise       → finalUrl is a Google Maps URL without @lat,lng
    const needsRecovery = [];

    let pass1Updated = 0;
    let noUrl        = 0;

    for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];
        const name  = venueName(venue);
        const mapsUrl = venue.location?.googleMapsUrl;

        if (!mapsUrl || !mapsUrl.trim() || mapsUrl === '#') {
            noUrl++;
            continue;
        }

        process.stdout.write(
            `  [${String(i + 1).padStart(3)}/${venues.length}] ${name.slice(0, 42).padEnd(42)} … `
        );

        let finalUrl = null;
        let redirectErr = null;

        try {
            finalUrl = await resolveUrl(mapsUrl);
        } catch (err) {
            redirectErr = err.message;
        }

        if (redirectErr) {
            process.stdout.write(`❌  redirect failed: ${redirectErr}\n`);
            needsRecovery.push({ venue, name, finalUrl: null, broken: true, reason: redirectErr });
            await sleep(GOOGLE_DELAY_MS);
            continue;
        }

        if (!isGoogleMapsDomain(finalUrl)) {
            process.stdout.write(`❌  non-Google domain: ${new URL(finalUrl).hostname}\n`);
            needsRecovery.push({ venue, name, finalUrl, broken: true,
                reason: `Resolved to non-Google domain: ${new URL(finalUrl).hostname}` });
            await sleep(GOOGLE_DELAY_MS);
            continue;
        }

        const coords = tryAtCoords(finalUrl);
        if (coords) {
            if (!venue.location) venue.location = {};
            venue.location.lat = coords.lat;
            venue.location.lng = coords.lng;
            pass1Updated++;
            process.stdout.write(`✅  ${coords.lat}, ${coords.lng}\n`);
        } else {
            process.stdout.write(`⚠️   @lat,lng absent — queuing for recovery\n`);
            needsRecovery.push({ venue, name, finalUrl, broken: false });
        }

        await sleep(GOOGLE_DELAY_MS);
    }

    console.log(`\n   Pass 1 result: ${pass1Updated} updated, ${needsRecovery.length} need recovery\n`);

    // ── PASS 2: query=lat,lng shortcut ────────────────────────────────────────
    console.log('── Pass 2: query=lat,lng shortcut ────────────────────────────────');

    const stillNeedsRecovery = [];
    let pass2Updated = 0;

    for (const entry of needsRecovery) {
        if (entry.broken) {
            stillNeedsRecovery.push(entry);
            continue;
        }

        const coords = tryQueryCoords(entry.finalUrl);
        if (coords) {
            if (!entry.venue.location) entry.venue.location = {};
            entry.venue.location.lat = coords.lat;
            entry.venue.location.lng = coords.lng;
            pass2Updated++;
            console.log(`  ✅  ${entry.name.slice(0, 42)} → ${coords.lat}, ${coords.lng}  (query param)`);
        } else {
            stillNeedsRecovery.push(entry);
        }
    }

    console.log(`\n   Pass 2 result: ${pass2Updated} updated, ${stillNeedsRecovery.length} still need recovery\n`);

    // ── PASS 3: Nominatim geocoding ───────────────────────────────────────────
    console.log('── Pass 3: Nominatim geocoding fallback ──────────────────────────');

    const trulyFailed = [];   // { id, name, reason }
    let pass3Updated  = 0;
    let lastNominatimCall = 0; // timestamp of last Nominatim call

    async function callNominatim(query, label) {
        // Enforce ≥ 1 100 ms between calls
        const now = Date.now();
        const gap = now - lastNominatimCall;
        if (gap < NOMINATIM_DELAY_MS) {
            await sleep(NOMINATIM_DELAY_MS - gap);
        }
        lastNominatimCall = Date.now();

        process.stdout.write(`  🌐  Nominatim: "${query.slice(0, 60)}" … `);
        try {
            const coords = await nominatimGeocode(query);
            if (coords) {
                process.stdout.write(`✅  ${coords.lat}, ${coords.lng}\n`);
            } else {
                process.stdout.write(`⚠️   no results\n`);
            }
            return coords;
        } catch (err) {
            process.stdout.write(`❌  ${err.message}\n`);
            return null;
        }
    }

    for (const entry of stillNeedsRecovery) {
        if (entry.broken) {
            trulyFailed.push({ id: entry.venue.id, name: entry.name, reason: entry.reason });
            continue;
        }

        console.log(`\n  ${entry.name.slice(0, 55)}`);

        let query = null;
        let querySource = '';

        // 3a: /maps/search/?…&query=<text>
        const textQuery = getSearchTextQuery(entry.finalUrl);
        if (textQuery) {
            query = textQuery;
            querySource = 'search query text';
        }

        // 3b: /maps/place/<name> with no @lat,lng
        if (!query && isPlaceUrlWithoutCoords(entry.finalUrl)) {
            const city = entry.venue.location?.city || entry.venue.city || 'Ohrid';
            query = `${entry.name}, ${city}`;
            querySource = 'venue name + city';
        }

        if (!query) {
            console.log(`  ⚠️   Cannot determine geocoding query for this URL type`);
            trulyFailed.push({
                id:     entry.venue.id,
                name:   entry.name,
                reason: `Unknown URL shape — no geocoding strategy: ${entry.finalUrl.slice(0, 100)}`
            });
            continue;
        }

        const coords = await callNominatim(query, entry.name);
        if (coords) {
            if (!entry.venue.location) entry.venue.location = {};
            entry.venue.location.lat = coords.lat;
            entry.venue.location.lng = coords.lng;
            pass3Updated++;
        } else {
            trulyFailed.push({
                id:     entry.venue.id,
                name:   entry.name,
                reason: `Nominatim: no results for "${query}" (source: ${querySource})`
            });
        }
    }

    // ── Write ─────────────────────────────────────────────────────────────────
    console.log('\n\n💾  Writing updated venues_reorganized.json…');
    try {
        fs.writeFileSync(venuesPath, JSON.stringify(venues, null, 2), 'utf8');
    } catch (err) {
        console.error('❌  Error writing file:', err.message);
        console.log('💡  Restore from backup:', backupPath);
        process.exit(1);
    }
    console.log('✨  File written.\n');

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalUpdated = pass1Updated + pass2Updated + pass3Updated;
    console.log('═'.repeat(62));
    console.log('📊  Final Summary');
    console.log('═'.repeat(62));
    console.log(`   Pass 1  @lat,lng from redirect URL: ${pass1Updated} venue(s)`);
    console.log(`   Pass 2  query=lat,lng param:         ${pass2Updated} venue(s)`);
    console.log(`   Pass 3  Nominatim geocoding:         ${pass3Updated} venue(s)`);
    console.log(`   ──────────────────────────────────────────────`);
    console.log(`   Total updated:                       ${totalUpdated} venue(s)`);
    console.log(`   No googleMapsUrl (skipped):          ${noUrl} venue(s)`);
    console.log(`   ❌  True failures (manual fix needed): ${trulyFailed.length} venue(s)`);

    if (trulyFailed.length > 0) {
        console.log('\n⚠️   Venues that still need manual coordinate entry:');
        trulyFailed.forEach(v => {
            console.log(`\n   id=${v.id}  "${v.name}"`);
            console.log(`   reason: ${v.reason}`);
        });
        console.log('');
    }

    console.log('\n💡  Tips:');
    console.log('   • Spot-check a few Nominatim-geocoded venues on the map — geocoding');
    console.log('     by name can be imprecise for small local businesses.');
    console.log('   • For true failures, open the venue in Google Maps, copy a fresh');
    console.log('     share link, update googleMapsUrl, then re-run this script.');
    console.log('   • Re-running is safe: the backup is overwritten each time.\n');
}

main().catch(err => {
    console.error('❌  Unexpected top-level error:', err);
    process.exit(1);
});
