// write.js

let masterData = [];

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

// Variables
let currentMode = 'form-review';
let currentRating = 0;
let urlWhiskyId = null;
let urlBatchId = null;

async function initWriteForm() {
    // 1. Fetch Data
    try {
        const response = await fetch('whiskyvibe_master_dataset.csv');
        const csvText = await response.text();
        const parsedRows = parseCSV(csvText);
        masterData = transformToObjects(parsedRows);
        
        // Unique whiskies for dropdowns
        const uniqueWhiskies = [];
        const seen = new Set();
        masterData.forEach(item => {
            if (!seen.has(item.Whisky_ID)) {
                seen.add(item.Whisky_ID);
                uniqueWhiskies.push(item);
            }
        });

        populateSelect('rev-whiskey', uniqueWhiskies);
        populateSelect('pr-whiskey', uniqueWhiskies);

    } catch (e) {
        console.error("Failed to load CSV", e);
    }

    // 2. Parse URL Params
    const urlParams = new URLSearchParams(window.location.search);
    urlWhiskyId = urlParams.get('whisky_id');
    urlBatchId = urlParams.get('batch_id');
    const urlMode = urlParams.get('mode');

    if (urlMode) {
        currentMode = urlMode;
        document.querySelectorAll('.segment-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.segment-tab[data-target="${currentMode}"]`);
        if(activeTab) activeTab.classList.add('active');
        
        document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
        const activeSec = document.getElementById(currentMode);
        if(activeSec) activeSec.classList.add('active');
    }

    if (urlWhiskyId) {
        const rSelect = document.getElementById('rev-whiskey');
        if (rSelect) rSelect.value = urlWhiskyId;
        const pSelect = document.getElementById('pr-whiskey');
        if (pSelect) pSelect.value = urlWhiskyId;
    }

    validateForm();
}

function populateSelect(id, uniqueWhiskies) {
    const sel = document.getElementById(id);
    if(!sel) return;
    const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
    
    // Keep the first disabled option
    const defaultOpt = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(defaultOpt);

    uniqueWhiskies.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.Whisky_ID;
        opt.textContent = lang === 'en' ? w.Name_EN : w.Name_KO;
        sel.appendChild(opt);
    });
}

// Event Listeners setup
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    const tabs = document.querySelectorAll('.segment-tab');
    const sections = document.querySelectorAll('.form-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-target');
            currentMode = targetId;
            
            sections.forEach(sec => {
                if (sec.id === targetId) sec.classList.add('active');
                else sec.classList.remove('active');
            });
            validateForm();
        });
    });

    // Rating
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-val'));
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-val')) <= currentRating) s.classList.add('active', 'ph-fill');
                else { s.classList.remove('active', 'ph-fill'); s.classList.add('ph'); }
            });
            validateForm();
        });
    });

    // Quick Tags
    const tags = document.querySelectorAll('.tag-pill');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            validateForm();
        });
    });

    // Date
    const dateInput = document.getElementById('pr-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // Validations
    const inputs = [
        document.getElementById('rev-whiskey'), document.getElementById('rev-text'),
        document.getElementById('pr-whiskey'), document.getElementById('pr-price'), document.getElementById('pr-location')
    ];
    inputs.forEach(el => {
        if(el) { el.addEventListener('input', validateForm); el.addEventListener('change', validateForm); }
    });

    // Currency Suffix
    window.addEventListener('languageChanged', () => {
        initWriteForm(); // Re-populate selects
        const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
        const suff = document.getElementById('currency-suffix');
        if(suff) suff.textContent = lang === 'en' ? 'USD' : '원';
    });

    initWriteForm();
});

function validateForm() {
    let isValid = false;
    const revWhiskey = document.getElementById('rev-whiskey');
    const revText = document.getElementById('rev-text');
    const prWhiskey = document.getElementById('pr-whiskey');
    const prPrice = document.getElementById('pr-price');
    const prLocation = document.getElementById('pr-location');

    if (currentMode === 'form-review') {
        isValid = revWhiskey && revWhiskey.value && currentRating > 0 && revText && revText.value.trim().length > 0;
    } else {
        isValid = prWhiskey && prWhiskey.value && prPrice && prPrice.value.trim() !== '' && prLocation && prLocation.value.trim() !== '';
    }

    const btnSubmit = document.getElementById('btn-submit');
    if(btnSubmit) {
        if (isValid) {
            btnSubmit.removeAttribute('disabled');
            btnSubmit.classList.add('active');
        } else {
            btnSubmit.setAttribute('disabled', 'true');
            btnSubmit.classList.remove('active');
        }
    }
}

// Show Toast Notification
function showToast(points) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'var(--accent-amber)';
    toast.style.color = '#000';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '24px';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.textContent = `+${points} Points!`;
    document.body.appendChild(toast);
    return new Promise(resolve => setTimeout(resolve, 1500));
}

// Submit Handling
window.submitForm = async function() {
    const btnSubmit = document.getElementById('btn-submit');
    if (btnSubmit.hasAttribute('disabled')) return;
    
    // Disable button to prevent double submit
    btnSubmit.setAttribute('disabled', 'true');
    btnSubmit.textContent = 'Submitting...';

    // Update Profile
    let userProfile = JSON.parse(localStorage.getItem('wv_user_profile')) || { id: "user_777", user_points: 0, user_exp: 0 };
    
    if (currentMode === 'form-review') {
        const reviews = JSON.parse(localStorage.getItem('wv_reviews') || "[]");
        reviews.unshift({
            id: 'r_' + Date.now(),
            whisky_id: document.getElementById('rev-whiskey').value,
            batch_id: urlBatchId,
            user_id: userProfile.id,
            user_name: "Me (Mock)",
            user_avatar: "assets/avatar.png",
            rating: currentRating,
            text: document.getElementById('rev-text').value,
            likes_count: 0,
            created_at: Date.now()
        });
        localStorage.setItem('wv_reviews', JSON.stringify(reviews));
        userProfile.user_points += 15;
        userProfile.user_exp += 15;
        localStorage.setItem('wv_user_profile', JSON.stringify(userProfile));
        
        await showToast(15);
    } else {
        const prices = JSON.parse(localStorage.getItem('wv_price_reports') || "[]");
        prices.unshift({
            id: 'p_' + Date.now(),
            whisky_id: document.getElementById('pr-whiskey').value,
            batch_id: urlBatchId,
            price: document.getElementById('pr-price').value,
            location: document.getElementById('pr-location').value,
            created_at: Date.now(),
            desc: urlBatchId || ""
        });
        localStorage.setItem('wv_price_reports', JSON.stringify(prices));
        userProfile.user_points += 20;
        userProfile.user_exp += 20;
        localStorage.setItem('wv_user_profile', JSON.stringify(userProfile));
        
        await showToast(20);
    }

    // Go back
    if (urlWhiskyId) {
        window.location.href = `result.html?wid=${urlWhiskyId}`;
    } else {
        window.location.href = 'index.html';
    }
};
