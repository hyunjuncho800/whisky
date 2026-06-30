// search.js

let masterData = []; // Array of JS objects parsed from CSV
let groupedData = {}; // Grouped by Whisky_ID

// A simple CSV parser that respects quoted commas
function parseCSV(text) {
    const lines = [];
    let currentLine = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (i + 1 < text.length && text[i+1] === '"') {
                    currentVal += '"';
                    i++; // skip escaped quote
                } else {
                    inQuotes = false;
                }
            } else {
                currentVal += c;
            }
        } else {
            if (c === '"') {
                inQuotes = true;
            } else if (c === ',') {
                currentLine.push(currentVal.trim());
                currentVal = '';
            } else if (c === '\n' || c === '\r') {
                if (c === '\r' && i + 1 < text.length && text[i+1] === '\n') {
                    i++; // skip \n
                }
                currentLine.push(currentVal.trim());
                if (currentLine.length > 1 || currentLine[0] !== '') {
                    lines.push(currentLine);
                }
                currentLine = [];
                currentVal = '';
            } else {
                currentVal += c;
            }
        }
    }
    if (currentVal !== '' || currentLine.length > 0) {
        currentLine.push(currentVal.trim());
        lines.push(currentLine);
    }
    return lines;
}

// Convert Array of arrays to Array of objects using Headers
function transformToObjects(rows) {
    if (rows.length < 2) return [];
    const headers = rows[0];
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = rows[i][j] || '';
        }
        data.push(obj);
    }
    return data;
}

// Initialize and Fetch CSV
async function initSearch() {
    try {
        const response = await fetch('whiskyvibe_master_dataset.csv');
        if (!response.ok) throw new Error("Failed to fetch CSV");
        const csvText = await response.text();
        
        const parsedRows = parseCSV(csvText);
        masterData = transformToObjects(parsedRows);
        
        // Group by Whisky_ID
        masterData.forEach(item => {
            const wid = item.Whisky_ID;
            if (!groupedData[wid]) groupedData[wid] = { info: item, batches: [] };
            groupedData[wid].batches.push(item);
        });

        // Initial render: show all unique whiskies
        renderResults("");
    } catch (error) {
        console.error("CSV Load Error: ", error);
        document.getElementById('results-container').innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--text-muted);">
                Data could not be loaded. Are you running on a local web server?
            </div>
        `;
    }
}

function renderResults(query) {
    const container = document.getElementById('results-container');
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    
    container.innerHTML = '';
    query = query.toLowerCase();

    // Filter unique whiskies
    const results = Object.values(groupedData).filter(group => {
        const info = group.info;
        const nameEn = info.Name_EN ? info.Name_EN.toLowerCase() : '';
        const nameKo = info.Name_KO ? info.Name_KO.toLowerCase() : '';
        const brand = info.Brand ? info.Brand.toLowerCase() : '';
        return nameEn.includes(query) || nameKo.includes(query) || brand.includes(query);
    });

    if (results.length === 0) {
        container.innerHTML = `<div style="text-align:center; margin-top:40px; color:var(--text-muted);" data-loc="noResults">${locData[lang].noResults}</div>`;
        return;
    }

    results.forEach(group => {
        const info = group.info;
        const displayName = lang === 'en' ? info.Name_EN : info.Name_KO;
        
        // We just use the placeholder image since real images aren't in CSV
        const imgUrl = "assets/whiskey_bottle.png"; 

        const card = document.createElement('div');
        card.className = 'result-card';
        card.onclick = () => openDetail(info.Whisky_ID);
        card.innerHTML = `
            <div class="result-img-wrap">
                <img src="${imgUrl}" alt="${displayName}" class="result-img">
            </div>
            <div class="result-info">
                <div class="result-name">${displayName}</div>
                <div class="result-meta">${info.Category} · <span data-loc="abvLabel">${locData[lang].abvLabel}</span>: ${info.ABV_Pct.split('(')[0].trim()}</div>
            </div>
            <div class="result-price">${info.Price_Range}</div>
        `;
        container.appendChild(card);
    });
}

function openDetail(whiskyId) {
    const group = groupedData[whiskyId];
    if (!group) return;

    const info = group.info;
    document.getElementById('detail-name-en').textContent = info.Name_EN;
    document.getElementById('detail-name-ko').textContent = info.Name_KO;
    
    // Setup Link
    const link = document.getElementById('link-live-prices');
    link.onclick = () => {
        window.location.href = `result.html?wid=${whiskyId}`;
    };

    // Render Batch Tabs
    const tabsContainer = document.getElementById('batch-tabs');
    tabsContainer.innerHTML = '';
    
    group.batches.forEach((batch, idx) => {
        const tab = document.createElement('div');
        tab.className = `batch-tab ${idx === 0 ? 'active' : ''}`;
        tab.textContent = batch.Batch_Identifier;
        tab.onclick = () => {
            // Update active state
            document.querySelectorAll('.batch-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderBatchDetail(batch);
        };
        tabsContainer.appendChild(tab);
    });

    // Render the first batch by default
    if (group.batches.length > 0) {
        renderBatchDetail(group.batches[0]);
    }

    // Show Overlay
    document.getElementById('detail-overlay').classList.add('active');
}

function renderBatchDetail(batch) {
    // ABV
    document.getElementById('info-proof').textContent = batch.ABV_Pct || '-';
    // Maturation
    document.getElementById('info-maturation').textContent = batch.Batch_Details || '-';
    
    // Ratings string parsing "브레이킹버번: 4.5 | 위스키베이스: 89.8"
    const ratingsContainer = document.getElementById('info-ratings');
    ratingsContainer.innerHTML = '';
    if (batch.Expert_Ratings && batch.Expert_Ratings !== '미출시') {
        const ratings = batch.Expert_Ratings.split('|');
        ratings.forEach(r => {
            const li = document.createElement('li');
            li.textContent = r.trim();
            ratingsContainer.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = '-';
        ratingsContainer.appendChild(li);
    }

    // Recommendation Badge
    const badge = document.getElementById('rec-badge');
    if (batch.Is_Recommended && batch.Is_Recommended.trim().toLowerCase() === 'true') {
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function closeDetail() {
    document.getElementById('detail-overlay').classList.remove('active');
}

// Search Input Listener
document.addEventListener("DOMContentLoaded", () => {
    initSearch();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderResults(e.target.value);
        });
    }

    // Re-render when language changes
    window.addEventListener('languageChanged', () => {
        const query = document.getElementById('search-input') ? document.getElementById('search-input').value : '';
        renderResults(query);
    });
});
