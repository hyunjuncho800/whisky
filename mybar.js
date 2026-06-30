// mybar.js

let masterData = [];
let whisky_catalog = {};

// All available badges in the system
const all_badges = [
    { id: "sherry", locKey: "badgeSherry", icon: "ph-drop" },
    { id: "peat", locKey: "badgePeat", icon: "ph-fire" },
    { id: "price", locKey: "badgePrice", icon: "ph-chart-line-up" },
    { id: "first", locKey: "badgeFirst", icon: "ph-brandy" }
];

// Parse CSV
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

function transformToObjects(rows) {
    if (rows.length < 2) return [];
    const headers = rows[0];
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) { obj[headers[j]] = rows[i][j] || ''; }
        data.push(obj);
    }
    return data;
}

async function initMyBar() {
    try {
        const response = await fetch('whiskyvibe_master_dataset.csv');
        const csvText = await response.text();
        const parsedRows = parseCSV(csvText);
        masterData = transformToObjects(parsedRows);
        
        masterData.forEach(item => {
            if (!whisky_catalog[item.Whisky_ID]) {
                whisky_catalog[item.Whisky_ID] = {
                    name: item.Name_KO,
                    nameEn: item.Name_EN,
                    img: item.image_url || "assets/whiskey_bottle.png"
                };
            }
        });
    } catch (e) {
        console.error("Failed to load CSV", e);
    }

    renderMyBar();
}

function renderMyBar() {
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    
    // 1. Load User Profile
    let userProfile = JSON.parse(localStorage.getItem("wv_user_profile"));
    if (!userProfile) {
        userProfile = { id: "user_777", user_points: 0, user_exp: 0, user_badge: "Novice" };
    }

    // EXP & Level Calculation
    const totalExp = userProfile.user_exp;
    const currentLevel = Math.floor(totalExp / 100) + 1;
    const expRemainder = totalExp % 100;
    const progressPercent = expRemainder; // since threshold is 100

    const bBadge = document.getElementById('profile-badge');
    if (bBadge) bBadge.textContent = userProfile.user_badge;
    const lNum = document.getElementById('profile-level-num');
    if (lNum) lNum.textContent = currentLevel;
    const eText = document.getElementById('profile-exp-text');
    if (eText) eText.textContent = `${expRemainder} / 100 EXP`;
    const eBar = document.getElementById('profile-exp-bar');
    if (eBar) eBar.style.width = `${progressPercent}%`;

    // 2. Virtual Cabinet (Aggregate from reviews)
    const reviews = JSON.parse(localStorage.getItem("wv_reviews") || "[]");
    const myReviews = reviews.filter(r => r.user_id === userProfile.id);
    
    // Get unique whiskies and max rating per whisky
    const cabinetMap = {};
    myReviews.forEach(r => {
        if (!cabinetMap[r.whisky_id] || r.rating > cabinetMap[r.whisky_id].rating) {
            cabinetMap[r.whisky_id] = { rating: r.rating };
        }
    });

    const cabinetGrid = document.getElementById('cabinet-grid');
    const whiskyIds = Object.keys(cabinetMap);

    if (whiskyIds.length === 0) {
        cabinetGrid.innerHTML = `
            <div class="cabinet-empty">
                <i class="ph ph-brandy cabinet-empty-icon"></i>
                <span data-loc="addFirstWhiskey">${locData[lang]?.addFirstWhiskey || '첫 위스키를 장식장에 추가해보세요!'}</span>
                <button class="btn-add-whiskey" onclick="window.location.href='search.html'">+ Explore</button>
            </div>
        `;
    } else {
        // Render shelves (3 items per row)
        let html = '';
        for (let i = 0; i < whiskyIds.length; i++) {
            const wid = whiskyIds[i];
            const data = whisky_catalog[wid] || { name: "Unknown", nameEn: "Unknown", img: "assets/whiskey_bottle.png" };
            const rating = cabinetMap[wid].rating;
            const displayName = lang === 'en' ? data.nameEn : data.name;

            // Add a shelf background every 3 items starting at row 1
            if (i % 3 === 0) {
                const topPos = Math.floor(i / 3) * 160 + 130; // Approx positioning
                html += `<div class="cabinet-shelf-row" style="top: ${topPos}px;"></div>`;
            }

            let starsHtml = Array(5).fill(0).map((_, idx) => idx < rating ? '<i class="ph-fill ph-star"></i>' : '<i class="ph ph-star"></i>').join('');

            html += `
                <div class="cabinet-item" onclick="window.location.href='result.html?wid=${wid}'">
                    <img src="${data.img}" class="cabinet-bottle" alt="${displayName}">
                    <div class="cabinet-item-name">${displayName}</div>
                    <div class="cabinet-item-rating">${starsHtml}</div>
                </div>
            `;
        }
        cabinetGrid.innerHTML = html;
    }

    // 3. Badges Evaluation
    // Mock logic: First Sip unlocked if review count > 0. Price King if price_reports count > 0.
    const priceReports = JSON.parse(localStorage.getItem("wv_price_reports") || "[]");
    const myPrices = priceReports.filter(p => p.user_id === userProfile.id);

    const unlockedSet = new Set();
    if (myReviews.length > 0) unlockedSet.add("first");
    if (myPrices.length > 0) unlockedSet.add("price");
    if (myReviews.length > 5) unlockedSet.add("sherry"); // mock unlock conditions
    if (myPrices.length > 5) unlockedSet.add("peat");

    const badgeGrid = document.getElementById('badge-grid');
    badgeGrid.innerHTML = all_badges.map(b => {
        const isUnlocked = unlockedSet.has(b.id);
        const name = locData[lang] && locData[lang][b.locKey] ? locData[lang][b.locKey] : b.id;
        return `
            <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="badge-icon"><i class="${b.icon}"></i></div>
                <div class="badge-name">${name}</div>
            </div>
        `;
    }).join('');

    // Level up check
    checkLevelUp(userProfile.user_exp);
}

let lastNotifiedLevel = parseInt(localStorage.getItem("wv_last_level") || "1");

function checkLevelUp(exp) {
    const currentLevel = Math.floor(exp / 100) + 1;
    if (currentLevel > lastNotifiedLevel) {
        showLevelUpModal(currentLevel);
        lastNotifiedLevel = currentLevel;
        localStorage.setItem("wv_last_level", lastNotifiedLevel);
    }
}

function showLevelUpModal(level) {
    const modal = document.getElementById('levelup-modal');
    document.getElementById('modal-level-num').textContent = level;
    modal.classList.add('active');
}

window.closeModal = function() {
    document.getElementById('levelup-modal').classList.remove('active');
}

document.addEventListener("DOMContentLoaded", () => {
    initMyBar();
    window.addEventListener('languageChanged', renderMyBar);
});
