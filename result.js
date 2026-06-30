// result.js

let masterData = [];
let groupedData = {};
let matchedWhisky = null; // The selected group object
let currentBatches = [];
let activeBatchId = null;

// Parse CSV (supports quoted commas)
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
                    currentVal += '"'; i++;
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
                if (c === '\r' && i + 1 < text.length && text[i+1] === '\n') { i++; }
                currentLine.push(currentVal.trim());
                if (currentLine.length > 1 || currentLine[0] !== '') lines.push(currentLine);
                currentLine = []; currentVal = '';
            } else {
                currentVal += c;
            }
        }
    }
    if (currentVal !== '' || currentLine.length > 0) {
        currentLine.push(currentVal.trim()); lines.push(currentLine);
    }
    return lines;
}

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

// Initial Mock Data Seeding for LocalStorage
const default_price_reports = [
    { id: "p1", whisky_id: "GTS", price: 450000, location: "Costco Busan", created_at: Date.now() - 10 * 60000, desc: "2023" },
    { id: "p2", whisky_id: "SB", price: 115000, location: "GS25 App", created_at: Date.now() - 25 * 60000, desc: "" }
];
const default_reviews = [
    { id: "r1", whisky_id: "GTS", batch_id: "2023", user_id: "user_777", user_name: "CaskHunter", user_avatar: "assets/avatar.png", rating: 5, text: "The perfect cask strength punch!", likes_count: 120 }
];
if (!localStorage.getItem("wv_price_reports")) localStorage.setItem("wv_price_reports", JSON.stringify(default_price_reports));
if (!localStorage.getItem("wv_reviews")) localStorage.setItem("wv_reviews", JSON.stringify(default_reviews));
if (!localStorage.getItem("wv_user_profile")) localStorage.setItem("wv_user_profile", JSON.stringify({ id: "user_777", user_points: 0, user_exp: 340, user_badge: "Single Malt Master" }));


async function initResult() {
    try {
        const response = await fetch('whiskyvibe_master_dataset.csv');
        const csvText = await response.text();
        const parsedRows = parseCSV(csvText);
        masterData = transformToObjects(parsedRows);
        
        // Group by Whisky_ID
        masterData.forEach(item => {
            const wid = item.Whisky_ID;
            if (!groupedData[wid]) groupedData[wid] = { info: item, batches: [] };
            groupedData[wid].batches.push(item);
        });

        // Determine matched whisky based on URL params
        const urlParams = new URLSearchParams(window.location.search);
        const qWid = urlParams.get('wid');
        const qSweet = urlParams.get('sweet');
        const qSmoke = urlParams.get('smoke');
        const qAbv = urlParams.get('abv');
        const qBudget = urlParams.get('budget');

        if (qWid && groupedData[qWid]) {
            matchedWhisky = groupedData[qWid];
        } else if (qSweet) {
            matchedWhisky = findBestMatch(qSweet, qSmoke, qAbv, qBudget);
        } else {
            // Fallback default
            matchedWhisky = Object.values(groupedData)[0];
        }

        if (matchedWhisky) {
            currentBatches = matchedWhisky.batches;
            if (currentBatches.length > 0) {
                const rec = currentBatches.find(b => b.Is_Recommended && b.Is_Recommended.trim().toLowerCase() === 'true');
                activeBatchId = rec ? rec.Batch_Identifier : currentBatches[0].Batch_Identifier;
            }
            renderUI();
        }

    } catch (e) {
        console.error("Failed to load DB", e);
    }
}

function findBestMatch(sweet, smoke, abv, budget) {
    const groups = Object.values(groupedData);
    
    // 1. Exact Match
    let matches = groups.filter(g => g.info.Sweetness === sweet && g.info.Smoky === smoke && g.info.Price_Range === budget);
    
    // 2. Fallback: Relax Budget
    if (matches.length === 0) {
        matches = groups.filter(g => g.info.Sweetness === sweet && g.info.Smoky === smoke);
    }
    
    // 3. Fallback: Relax Smoke
    if (matches.length === 0) {
        matches = groups.filter(g => g.info.Sweetness === sweet);
    }

    if (matches.length > 0) return matches[0];
    return groups[0];
}

// Generate synthesized profile bars based on keywords
function getSynthesizedProfile(info) {
    let sw = 50, sm = 10, int = 50;
    if (info.Sweetness === 'Vanilla') sw = 75;
    if (info.Sweetness === 'Sherry') sw = 90;
    if (info.Sweetness === 'Dry') sw = 20;

    if (info.Smoky === 'None') sm = 5;
    if (info.Smoky === 'Subtle') sm = 40;
    if (info.Smoky === 'Intense') sm = 90;

    return { sw, sm, int };
}

function formatPrice(krwPrice) {
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    if (lang === 'en') {
        const usd = (krwPrice / 1300).toFixed(2);
        return `$${usd}`;
    }
    return `${parseInt(krwPrice).toLocaleString()}원`;
}

function timeAgo(date) {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    if (mins < 60) return `${mins} ${lang === 'en' ? 'mins ago' : '분 전'}`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ${lang === 'en' ? 'hrs ago' : '시간 전'}`;
}

function renderUI() {
    if (!matchedWhisky) return;
    const info = matchedWhisky.info;
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    
    const displayName = lang === 'en' ? info.Name_EN : info.Name_KO;
    document.getElementById('matched-name').textContent = displayName;
    
    const imgUrl = "assets/whiskey_bottle.png"; // Placeholder mapping
    document.getElementById('matched-bottle-img').src = imgUrl;

    const profile = getSynthesizedProfile(info);
    document.getElementById('bar-sweetness').style.width = profile.sw + "%";
    document.getElementById('bar-smoky').style.width = profile.sm + "%";
    document.getElementById('bar-intensity').style.width = profile.int + "%";

    // Setup CTA Navigation Links
    const btnWriteReview = document.querySelector('.sticky-bottom-btn');
    if (btnWriteReview) {
        btnWriteReview.onclick = () => {
            window.location.href = `write.html?whisky_id=${info.Whisky_ID}&batch_id=${activeBatchId}&mode=form-review`;
        };
    }
    
    const linkReportPrice = document.getElementById('link-report-price');
    if (linkReportPrice) {
        linkReportPrice.onclick = () => {
            window.location.href = `write.html?whisky_id=${info.Whisky_ID}&batch_id=${activeBatchId}&mode=form-price`;
        };
    }

    renderBatchTabs();
    renderPrices();
    renderReviews();
}

function renderBatchTabs() {
    const tabsContainer = document.getElementById('batch-tabs');
    if (!tabsContainer || currentBatches.length === 0) return;

    tabsContainer.innerHTML = currentBatches.map(b => `
        <div class="batch-tab ${b.Batch_Identifier === activeBatchId ? 'active' : ''}" onclick="selectBatch('${b.Batch_Identifier}')">
            ${b.Batch_Identifier}
        </div>
    `).join('');
    
    const batch = currentBatches.find(b => b.Batch_Identifier === activeBatchId);
    if (batch) {
        document.getElementById('stat-abv').textContent = batch.ABV_Pct || '-';
        document.getElementById('stat-age').textContent = batch.Batch_Details || '-';
        
        let ratingStr = "-";
        if (batch.Expert_Ratings && batch.Expert_Ratings !== '미출시') {
            ratingStr = batch.Expert_Ratings.split('|')[0].trim();
        }
        document.getElementById('stat-rating').textContent = ratingStr;
        
        const badge = document.getElementById('batch-badge');
        if (badge) {
            badge.style.display = (batch.Is_Recommended && batch.Is_Recommended.trim().toLowerCase() === 'true') ? 'block' : 'none';
        }
    }
}

window.selectBatch = function(bId) {
    activeBatchId = bId;
    renderBatchTabs();
    renderPrices(); // Filter to batch
}

function renderPrices() {
    const container = document.getElementById('price-container');
    if(!container) return;
    
    const price_reports = JSON.parse(localStorage.getItem("wv_price_reports") || "[]");
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';

    // Optional: filter by batch as well, but usually price reports are sparse. Let's just filter by whisky_id
    const reports = price_reports
        .filter(p => p.whisky_id === matchedWhisky.info.Whisky_ID)
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3);
        
    if (reports.length === 0) {
        container.innerHTML = `<div class="price-empty" data-loc="noPriceData">${locData[lang]?.noPriceData || '데이터가 없습니다.'}</div>`;
        return;
    }

    container.innerHTML = reports.map(r => `
        <div class="price-row">
            <div class="price-col">
                <div class="price-value">${formatPrice(r.price)}</div>
                <div class="price-meta">${r.desc || 'General'}</div>
            </div>
            <div class="price-col" style="text-align: right;">
                <div class="price-location">${r.location}</div>
                <div class="price-time">${timeAgo(new Date(r.created_at))}</div>
            </div>
        </div>
    `).join('');
}

function renderReviews() {
    const container = document.getElementById('review-container');
    if(!container) return;
    
    const reviews = JSON.parse(localStorage.getItem("wv_reviews") || "[]");
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';

    const itemReviews = reviews.filter(r => r.whisky_id === matchedWhisky.info.Whisky_ID)
                               .sort((a,b) => (b.created_at||0) - (a.created_at||0));

    if (itemReviews.length === 0) {
        container.innerHTML = `<div class="price-empty" data-loc="noReviews">${locData[lang]?.noReviews || '첫 리뷰를 작성해 보세요!'}</div>`;
        return;
    }

    container.innerHTML = itemReviews.map(r => {
        const starsHtml = Array(5).fill(0).map((_, idx) => idx < r.rating ? '<i class="ph-fill ph-star"></i>' : '<i class="ph ph-star"></i>').join('');
        return `
        <div class="review-card">
            <div class="review-header">
                <img src="${r.user_avatar || 'assets/avatar.png'}" class="review-avatar" alt="User">
                <div class="review-meta">
                    <div class="review-user">${r.user_name} <span class="review-badge">Pro</span></div>
                    <div class="review-stars">${starsHtml}</div>
                </div>
            </div>
            <p class="review-text">${r.text}</p>
            <div class="review-actions">
                <button class="action-btn"><i class="ph ph-heart"></i> ${r.likes_count || 0}</button>
                <button class="action-btn"><i class="ph ph-chat-circle"></i> 0</button>
            </div>
        </div>
    `}).join('');
}

// Initializer
document.addEventListener("DOMContentLoaded", () => {
    initResult();
    window.addEventListener('languageChanged', renderUI);
});
