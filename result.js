// Localization is handled by lang.js

// --- Mock Databases ---
const whisky_list = [
    { id: 1, name: "Stagg Jr. (Barrel Proof)", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Vanilla", smoky: "None", intensity: "Bold", price_range: "Rare", has_batches: true, rating_expert: 92, val_sw: 75, val_sm: 5, val_in: 95 },
    { id: 2, name: "Balvenie 12Y DoubleWood", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Vanilla", smoky: "None", intensity: "Soft", price_range: "Sipping", has_batches: false, rating_expert: 86, val_sw: 80, val_sm: 0, val_in: 40 },
    { id: 3, name: "Lagavulin 16Y", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Dry", smoky: "Intense", intensity: "Soft", price_range: "Sipping", has_batches: false, rating_expert: 93, val_sw: 20, val_sm: 95, val_in: 60 },
    { id: 4, name: "Macallan 18Y Sherry Oak", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Sherry", smoky: "None", intensity: "Soft", price_range: "Rare", has_batches: false, rating_expert: 95, val_sw: 90, val_sm: 0, val_in: 50 },
    { id: 5, name: "Ardbeg Uigeadail", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Sherry", smoky: "Intense", intensity: "Bold", price_range: "Sipping", has_batches: false, rating_expert: 94, val_sw: 65, val_sm: 90, val_in: 85 },
    { id: 6, name: "Monkey Shoulder", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Vanilla", smoky: "None", intensity: "Soft", price_range: "Daily", has_batches: false, rating_expert: 82, val_sw: 70, val_sm: 0, val_in: 30 },
    { id: 7, name: "Johnnie Walker Double Black", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Vanilla", smoky: "Subtle", intensity: "Soft", price_range: "Daily", has_batches: false, rating_expert: 84, val_sw: 60, val_sm: 50, val_in: 45 },
    { id: 8, name: "Booker's Bourbon", img: "C:\\Users\\HJ\\.gemini\\antigravity\\brain\\1aee8685-af20-45bf-9761-73b82b6af4dd\\whiskey_bottle_1_1782803718662.png", sweetness: "Vanilla", smoky: "None", intensity: "Bold", price_range: "Sipping", has_batches: true, rating_expert: 91, val_sw: 80, val_sm: 10, val_in: 90 }
];

const whisky_batches = [
    { id: 101, whisky_id: 1, batch_name: "24B", abv: "65.3%", age: "NAS (approx 8-9 yrs)", rating_expert: "89/100", is_recommended: false },
    { id: 102, whisky_id: 1, batch_name: "24A", abv: "67.1%", age: "NAS", rating_expert: "91/100", is_recommended: false },
    { id: 103, whisky_id: 1, batch_name: "23B", abv: "63.9%", age: "NAS", rating_expert: "94/100", is_recommended: true },
    { id: 104, whisky_id: 1, batch_name: "23A", abv: "66.5%", age: "NAS", rating_expert: "90/100", is_recommended: false },
    { id: 105, whisky_id: 8, batch_name: "2024-01", abv: "62.4%", age: "7y 2m", rating_expert: "90/100", is_recommended: false },
    { id: 106, whisky_id: 8, batch_name: "2023-04", abv: "63.9%", age: "6y 11m", rating_expert: "93/100", is_recommended: true }
];

const default_price_reports = [
    { id: "p1", whisky_id: "1", price: 450000, location: "Costco Busan", created_at: Date.now() - 10 * 60000, desc: "Batch 23B" },
    { id: "p2", whisky_id: "1", price: 480000, location: "Wine&More Gangnam", created_at: Date.now() - 120 * 60000, desc: "Batch 24A" },
    { id: "p3", whisky_id: "1", price: 440000, location: "Namdaemun Market", created_at: Date.now() - 300 * 60000, desc: "Batch 23B" },
    { id: "p4", whisky_id: "2", price: 115000, location: "GS25 App", created_at: Date.now() - 25 * 60000, desc: "" },
    { id: "p5", whisky_id: "3", price: 155000, location: "Emart Traders", created_at: Date.now() - 60 * 60000, desc: "" },
    { id: "p6", whisky_id: "8", price: 210000, location: "DailyShot App", created_at: Date.now() - 15 * 60000, desc: "2024-01" }
];

const default_reviews = [
    { id: "r1", whisky_id: "1", user_name: "CaskHunter", user_avatar: "assets/avatar.png", rating: 5, text: "The perfect cask strength punch! Batch 23B is incredibly cherry-forward.", likes_count: 120 },
    { id: "r2", whisky_id: "1", user_name: "BourbonLover", user_avatar: "assets/avatar.png", rating: 4, text: "Too hot for me straight, but amazing with a few drops of water.", likes_count: 85 },
    { id: "r3", whisky_id: "2", user_name: "MaltExplorer", user_avatar: "assets/avatar.png", rating: 5, text: "Always a classic. The honey and vanilla notes are perfectly balanced.", likes_count: 200 }
];

// Ensure local storage is seeded
if (!localStorage.getItem("wv_price_reports")) {
    localStorage.setItem("wv_price_reports", JSON.stringify(default_price_reports));
}
if (!localStorage.getItem("wv_reviews")) {
    localStorage.setItem("wv_reviews", JSON.stringify(default_reviews));
}

// --- Matching Logic ---
let matchedWhisky = null;
let currentBatches = [];
let activeBatchId = null;

function matchWhisky(params) {
    if (!params) return whisky_list[0]; // fallback if no params

    // 1. Exact Match
    let matches = whisky_list.filter(w => 
        w.sweetness === params.param_sweetness &&
        w.smoky === params.param_smoky &&
        w.price_range === params.param_purpose
    );

    // 2. Fallback: Relax price_range, sort by expert rating
    if (matches.length === 0) {
        matches = whisky_list.filter(w => 
            w.sweetness === params.param_sweetness &&
            w.smoky === params.param_smoky
        );
        matches.sort((a, b) => b.rating_expert - a.rating_expert);
    }

    // 3. Ultimate Fallback: Just return highest rated
    if (matches.length === 0) {
        matches = [...whisky_list].sort((a, b) => b.rating_expert - a.rating_expert);
    }

    return matches[0];
}

// --- Render Logic ---
function formatPrice(krwPrice) {
    const lang = window.currentLang || 'kr';
    if (lang === 'en') {
        const usd = (krwPrice / 1300).toFixed(2); // Mock exchange rate
        return `$${usd}`; // Or "KRW " + krwPrice.toLocaleString() if preferred, but user requested "$XX.XX" or "XX,XXX KRW". Let's use $ format.
    }
    return `${krwPrice.toLocaleString()}원`;
}

function timeAgo(date) {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    const lang = window.currentLang || 'kr';
    if (mins < 60) return `${mins} ${locData[lang] && locData[lang].minsAgo ? locData[lang].minsAgo : 'mins ago'}`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ${locData[lang] && locData[lang].hrAgo ? locData[lang].hrAgo : 'hr ago'}`;
}

function renderUI() {
    if (!matchedWhisky) return;

    // 1. Hero Section
    document.getElementById('matched-name').textContent = matchedWhisky.name;
    document.getElementById('matched-bottle-img').src = matchedWhisky.img;
    document.getElementById('bar-sweetness').style.width = matchedWhisky.val_sw + "%";
    document.getElementById('bar-smoky').style.width = matchedWhisky.val_sm + "%";
    document.getElementById('bar-intensity').style.width = matchedWhisky.val_in + "%";

    // 2. Batch Section
    const batchSection = document.getElementById('batch-section');
    if (matchedWhisky.has_batches) {
        batchSection.style.display = 'block';
        currentBatches = whisky_batches.filter(b => b.whisky_id === matchedWhisky.id);
        if (currentBatches.length > 0) {
            if (!activeBatchId || !currentBatches.find(b => b.id === activeBatchId)) {
                // Select recommended or first
                const rec = currentBatches.find(b => b.is_recommended);
                activeBatchId = rec ? rec.id : currentBatches[0].id;
            }
            renderBatchTabs();
        }
    } else {
        batchSection.style.display = 'none';
    }

    // 3. Price Reports
    renderPrices();

    // 4. Reviews
    renderReviews();
}

function renderBatchTabs() {
    const tabsContainer = document.getElementById('batch-tabs');
    tabsContainer.innerHTML = currentBatches.map(b => `
        <div class="batch-tab ${b.id === activeBatchId ? 'active' : ''}" onclick="selectBatch(${b.id})">
            ${b.batch_name}
        </div>
    `).join('');
    
    const batch = currentBatches.find(b => b.id === activeBatchId);
    if (batch) {
        document.getElementById('stat-abv').textContent = batch.abv;
        document.getElementById('stat-age').textContent = batch.age;
        document.getElementById('stat-rating').textContent = batch.rating_expert;
        
        const badge = document.getElementById('batch-badge');
        badge.style.display = batch.is_recommended ? 'block' : 'none';
    }
}

window.selectBatch = function(batchId) {
    activeBatchId = batchId;
    renderBatchTabs();
}

function renderPrices() {
    const container = document.getElementById('price-container');
    const price_reports = JSON.parse(localStorage.getItem("wv_price_reports") || "[]");
    
    const reports = price_reports
        .filter(p => p.whisky_id.toString() === matchedWhisky.id.toString())
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3); // top 3

    if (reports.length === 0) {
        container.innerHTML = `<div style="padding: 16px 24px; color: var(--text-secondary);">No price reports yet.</div>`;
        return;
    }

    container.innerHTML = reports.map(r => `
        <div class="price-card">
            <div class="price-card-header">
                <h3 class="whiskey-name">${r.desc || matchedWhisky.name}</h3>
                <span class="time">${timeAgo(new Date(r.created_at))}</span>
            </div>
            <div class="price-details">
                <span class="price">${formatPrice(r.price)}</span>
                <div class="location">
                    <i class="ph-fill ph-map-pin"></i><span>${r.location}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderReviews() {
    const container = document.getElementById('review-container');
    const reviews = JSON.parse(localStorage.getItem("wv_reviews") || "[]");
    
    const revs = reviews
        .filter(r => r.whisky_id.toString() === matchedWhisky.id.toString())
        .sort((a, b) => b.likes_count - a.likes_count);

    if (revs.length === 0) {
        container.innerHTML = `<div style="padding: 16px; color: var(--text-secondary);">Be the first to review!</div>`;
        return;
    }

    container.innerHTML = revs.map(r => `
        <div style="background: var(--bg-card); padding: 16px; border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${r.user_avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                    <span style="font-size:13px; font-weight:600;">${r.user_name}</span>
                </div>
                <div class="star-rating">
                    ${Array(5).fill(0).map((_, i) => i < r.rating ? '<i class="ph-fill ph-star"></i>' : '<i class="ph ph-star"></i>').join('')}
                </div>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${r.text}</p>
        </div>
    `).join('');
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Read Params
    const paramString = localStorage.getItem("whiskySurveyParams");
    const params = paramString ? JSON.parse(paramString) : null;
    
    matchedWhisky = matchWhisky(params);
    
    // Listen for lang changes to re-render prices/times
    window.addEventListener('languageChanged', renderUI);

    // Set button click for Write Form
    const writeBtn = document.querySelector('.sticky-bottom-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', () => {
            window.location.href = 'write.html';
        });
    }

    // Give lang.js a tiny bit of time to setup locData if racing
    setTimeout(renderUI, 50); 
});
