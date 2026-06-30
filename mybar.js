// mybar.js

// Mock whisky catalog for resolving names and images
const whisky_catalog = {
    "1": { name: "Stagg Jr.", nameEn: "Stagg Jr.", img: "assets/whiskey_bottle.png" },
    "2": { name: "발베니 12년 더블우드", nameEn: "Balvenie 12Y", img: "assets/whiskey_bottle.png" },
    "3": { name: "라가불린 16년", nameEn: "Lagavulin 16Y", img: "assets/whiskey_bottle.png" },
    "8": { name: "부커스 버번", nameEn: "Booker's Bourbon", img: "assets/whiskey_bottle.png" }
};

// All available badges in the system
const all_badges = [
    { id: "sherry", locKey: "badgeSherry", icon: "ph-drop" },
    { id: "peat", locKey: "badgePeat", icon: "ph-fire" },
    { id: "price", locKey: "badgePrice", icon: "ph-chart-line-up" },
    { id: "first", locKey: "badgeFirst", icon: "ph-brandy" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderMyBar();
    window.addEventListener('languageChanged', renderMyBar);
});

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

    document.getElementById('profile-badge').textContent = userProfile.user_badge;
    document.getElementById('profile-level-num').textContent = currentLevel;
    document.getElementById('profile-exp-text').textContent = `${expRemainder} / 100 EXP`;
    document.getElementById('profile-exp-bar').style.width = `${progressPercent}%`;

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
                <span data-loc="addFirstWhiskey">${locData[lang].addFirstWhiskey}</span>
                <button class="btn-add-whiskey" onclick="window.location.href='index.html'">+ Explore</button>
            </div>
        `;
    } else {
        // Render shelves (3 items per row)
        let html = '';
        for (let i = 0; i < whiskyIds.length; i++) {
            const wid = whiskyIds[i];
            const data = whisky_catalog[wid] || { name: "Unknown", nameEn: "Unknown", img: "" };
            const rating = cabinetMap[wid].rating;
            const displayName = lang === 'en' ? data.nameEn : data.name;

            // Add a shelf background every 3 items starting at row 1
            if (i % 3 === 0) {
                const topPos = Math.floor(i / 3) * 160 + 130; // Approx positioning
                html += `<div class="cabinet-shelf-row" style="top: ${topPos}px;"></div>`;
            }

            let starsHtml = Array(5).fill(0).map((_, idx) => idx < rating ? '<i class="ph-fill ph-star"></i>' : '<i class="ph ph-star"></i>').join('');

            html += `
                <div class="cabinet-item">
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
    if (totalExp >= 100) unlockedSet.add("sherry"); // Mock trigger for Blended Master
    if (totalExp >= 500) unlockedSet.add("peat"); // Mock trigger for Single Malt Master

    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = all_badges.map(b => {
        const isUnlocked = unlockedSet.has(b.id);
        const name = locData[lang][b.locKey];
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon-wrap">
                    <i class="${isUnlocked ? 'ph-fill' : 'ph'} ${b.icon}"></i>
                    ${!isUnlocked ? '<div class="lock-overlay"><i class="ph-bold ph-lock-key"></i></div>' : ''}
                </div>
                <div class="badge-name">${name}</div>
            </div>
        `;
    }).join('');

    // 4. Level Up Modal Check
    // We check if we need to show a modal. To prevent showing it every time, we save 'lastSeenLevel' in localStorage.
    const lastSeenLevel = parseInt(localStorage.getItem("wv_last_seen_level") || "1");
    if (currentLevel > lastSeenLevel) {
        setTimeout(() => {
            document.getElementById('modal-level-text').textContent = `Level ${currentLevel}`;
            document.getElementById('levelup-modal').classList.add('active');
            localStorage.setItem("wv_last_seen_level", currentLevel.toString());
        }, 500); // slight delay for effect
    }
}

window.closeLevelModal = function() {
    document.getElementById('levelup-modal').classList.remove('active');
}
