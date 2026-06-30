const fs = require('fs');
const https = require('https');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'whiskyvibe_master_dataset.csv');
const ASSETS_DIR = path.join(__dirname, 'assets', 'whisky_bottles');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Simple fetch wrapper
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return resolve(fetchUrl(res.headers.location));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status Code: ${res.statusCode} for ${url}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download image: ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
        req.on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

// Simple CSV parser
function parseCSV(text) {
    const lines = [];
    let currentLine = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (i + 1 < text.length && text[i+1] === '"') { currentVal += '"'; i++; } 
                else { inQuotes = false; }
            } else { currentVal += c; }
        } else {
            if (c === '"') { inQuotes = true; } 
            else if (c === ',') { currentLine.push(currentVal.trim()); currentVal = ''; } 
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && i + 1 < text.length && text[i+1] === '\n') { i++; }
                currentLine.push(currentVal.trim());
                if (currentLine.length > 1 || currentLine[0] !== '') lines.push(currentLine);
                currentLine = []; currentVal = '';
            } else { currentVal += c; }
        }
    }
    if (currentVal !== '' || currentLine.length > 0) { currentLine.push(currentVal.trim()); lines.push(currentLine); }
    return lines;
}

function stringifyCSV(rows) {
    return rows.map(row => 
        row.map(val => {
            const s = String(val);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }).join(',')
    ).join('\n');
}

async function scrapeImageURL(brand, name) {
    const query = encodeURIComponent(`${brand} ${name}`);
    
    // Attempt Master of Malt search
    try {
        const searchUrl = `https://www.masterofmalt.com/search/?q=${query}`;
        const html = await fetchUrl(searchUrl);
        const regex = /<img[^>]+src=["']([^"']*(?:cdn\d*\.masterofmalt\.com)[^"']+)["'][^>]*>/i;
        const match = html.match(regex);
        if (match && match[1]) {
            return match[1];
        }
    } catch (e) {
        console.log(`  -> MoM failed: ${e.message}`);
    }

    // Fallback to Wikipedia API
    try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(brand)}`;
        const wikiRes = await fetchUrl(wikiUrl);
        const wikiJson = JSON.parse(wikiRes);
        const pages = wikiJson.query.pages;
        for (let key in pages) {
            if (pages[key].original && pages[key].original.source) {
                return pages[key].original.source;
            }
        }
    } catch (e) {
        console.log(`  -> Wiki failed: ${e.message}`);
    }

    return null;
}

async function run() {
    console.log("Starting WhiskyVibe Backend Image Enrichment...");
    const startTime = Date.now();

    const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
    const rows = parseCSV(csvText);

    if (rows.length < 1) {
        console.error("Empty CSV");
        return;
    }

    const headers = rows[0];
    let imgIdx = headers.indexOf('image_url');
    if (imgIdx === -1) {
        headers.push('image_url');
        imgIdx = headers.length - 1;
        // Pad all rows
        for (let i = 1; i < rows.length; i++) {
            rows[i].push('');
        }
    }

    const brandIdx = headers.indexOf('Brand');
    const nameIdx = headers.indexOf('Name_EN');
    const idIdx = headers.indexOf('Whisky_ID');

    let successCount = 0;
    let failCount = 0;
    const processedIds = new Set();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const wid = row[idIdx];
        if (!wid) continue;

        const existingImg = row[imgIdx];
        if (existingImg && existingImg.trim() !== '') {
            processedIds.add(wid);
            continue;
        }

        // If we already downloaded for this Whisky_ID (different batch row), just copy the URL
        if (processedIds.has(wid)) {
            // find the previous row with this wid
            const prevRow = rows.slice(1, i).find(r => r[idIdx] === wid);
            if (prevRow) {
                row[imgIdx] = prevRow[imgIdx];
                successCount++;
            }
            continue;
        }

        console.log(`[Processing] ${wid} - ${row[brandIdx]} ${row[nameIdx]}`);
        const imgUrl = await scrapeImageURL(row[brandIdx], row[nameIdx]);
        
        if (imgUrl) {
            const destPath = path.join(ASSETS_DIR, `${wid}.png`);
            try {
                await downloadImage(imgUrl, destPath);
                row[imgIdx] = `assets/whisky_bottles/${wid}.png`;
                successCount++;
                console.log(`  -> Success: Saved to ${row[imgIdx]}`);
            } catch (err) {
                console.error(`  -> Download failed: ${err.message}. Using placeholder.`);
                fs.copyFileSync(path.join(__dirname, 'assets', 'whiskey_bottle.png'), destPath);
                row[imgIdx] = `assets/whisky_bottles/${wid}.png`;
                failCount++;
            }
        } else {
            console.log(`  -> No image found. Using placeholder.`);
            const destPath = path.join(ASSETS_DIR, `${wid}.png`);
            if (fs.existsSync(path.join(__dirname, 'assets', 'whiskey_bottle.png'))) {
                fs.copyFileSync(path.join(__dirname, 'assets', 'whiskey_bottle.png'), destPath);
            }
            row[imgIdx] = `assets/whisky_bottles/${wid}.png`;
            failCount++;
        }
        
        processedIds.add(wid);
        
        // Small delay to prevent rate-limiting
        await new Promise(r => setTimeout(r, 1000));
    }

    // Write back to CSV
    fs.writeFileSync(CSV_PATH, stringifyCSV(rows));

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n================================`);
    console.log(`[Summary Report]`);
    console.log(`Success: ${successCount} rows updated`);
    console.log(`Failed: ${failCount} rows`);
    console.log(`Total Execution Time: ${totalTime}s`);
    console.log(`================================`);
}

run();
