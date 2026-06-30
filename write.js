document.addEventListener("DOMContentLoaded", () => {
    // --- Segment Controller ---
    const tabs = document.querySelectorAll('.segment-tab');
    const sections = document.querySelectorAll('.form-section');
    let currentMode = 'form-review';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-target');
            currentMode = targetId;
            
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });
            validateForm();
        });
    });

    // --- Star Rating ---
    const stars = document.querySelectorAll('#star-rating i');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-val'));
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-val')) <= currentRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            validateForm();
        });
    });

    // --- Quick Tags ---
    const tags = document.querySelectorAll('.tag-pill');
    let selectedTags = [];

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            validateForm();
        });
    });

    // --- Date Default ---
    const dateInput = document.getElementById('pr-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // --- Validation Logic ---
    const btnSubmit = document.getElementById('btn-submit');
    const revWhiskey = document.getElementById('rev-whiskey');
    const revText = document.getElementById('rev-text');
    
    const prWhiskey = document.getElementById('pr-whiskey');
    const prPrice = document.getElementById('pr-price');
    const prLocation = document.getElementById('pr-location');

    function validateForm() {
        let isValid = false;
        if (currentMode === 'form-review') {
            isValid = revWhiskey.value && currentRating > 0 && revText.value.trim().length > 0;
        } else {
            isValid = prWhiskey.value && prPrice.value.trim() !== '' && prLocation.value.trim() !== '';
        }

        if (isValid) {
            btnSubmit.removeAttribute('disabled');
            btnSubmit.classList.add('active');
        } else {
            btnSubmit.setAttribute('disabled', 'true');
            btnSubmit.classList.remove('active');
        }
    }

    [revWhiskey, revText, prWhiskey, prPrice, prLocation].forEach(el => {
        if(el) {
            el.addEventListener('input', validateForm);
            el.addEventListener('change', validateForm);
        }
    });

    // --- Language Dynamics ---
    const currencySuffix = document.getElementById('currency-suffix');
    
    function updateCurrency() {
        const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
        if (currencySuffix) {
            currencySuffix.textContent = lang === 'en' ? 'USD' : '원';
        }
    }

    window.addEventListener('languageChanged', updateCurrency);
    updateCurrency();

    // --- Mock User Profile ---
    const currentUserId = "user_777";
    if (!localStorage.getItem("wv_user_profile")) {
        localStorage.setItem("wv_user_profile", JSON.stringify({
            id: currentUserId,
            user_points: 0,
            user_exp: 0,
            user_badge: "Novice"
        }));
    }

    // --- Toast Notification ---
    function showToast(message) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.innerHTML = `
            <div class="toast">
                <i class="ph-fill ph-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(container);
    }

    // --- Submission ---
    btnSubmit.addEventListener('click', () => {
        if (btnSubmit.disabled) return;

        const lang = window.currentLang || localStorage.getItem('whiskyLang') || 'kr';
        const userProfile = JSON.parse(localStorage.getItem("wv_user_profile"));
        let expGained = 0;
        let pointsGained = 0;

        if (currentMode === 'form-review') {
            // Branch 1: Review
            const reviews = JSON.parse(localStorage.getItem("wv_reviews") || "[]");
            const newReview = {
                id: 'rev_' + Date.now().toString(),
                user_id: currentUserId,
                whisky_id: revWhiskey.value,
                batch_id: document.getElementById('rev-batch').value || null,
                user_name: "MyProfile",
                user_avatar: "assets/avatar.png",
                rating: currentRating,
                tags: Array.from(document.querySelectorAll('.tag-pill.active')).map(t => t.textContent),
                text: revText.value.trim(),
                image_url: null, // Mock
                created_at: Date.now(),
                likes_count: 0
            };
            reviews.push(newReview);
            localStorage.setItem("wv_reviews", JSON.stringify(reviews));

            expGained = 15;
            pointsGained = 15;

            // Clear fields
            revWhiskey.value = "";
            document.getElementById('rev-batch').value = "";
            revText.value = "";
            stars.forEach(s => s.classList.remove('active'));
            currentRating = 0;
            document.querySelectorAll('.tag-pill.active').forEach(t => t.classList.remove('active'));

        } else {
            // Branch 2: Price
            const priceReports = JSON.parse(localStorage.getItem("wv_price_reports") || "[]");
            const newReport = {
                id: 'pr_' + Date.now().toString(),
                user_id: currentUserId,
                whisky_id: prWhiskey.value,
                price: parseInt(prPrice.value, 10),
                location: prLocation.value.trim(),
                created_at: prDate.value ? new Date(prDate.value).getTime() : Date.now(),
                receipt_image_url: null, // Mock
                desc: "" // Assuming generic for now
            };
            priceReports.push(newReport);
            localStorage.setItem("wv_price_reports", JSON.stringify(priceReports));

            expGained = 20;
            pointsGained = 20;

            // Clear fields
            prWhiskey.value = "";
            prPrice.value = "";
            prLocation.value = "";
            prDate.valueAsDate = new Date();
        }

        // Gamification Logic
        const oldExp = userProfile.user_exp;
        userProfile.user_exp += expGained;
        userProfile.user_points += pointsGained;

        let levelUpMessage = "";
        if (oldExp < 100 && userProfile.user_exp >= 100) {
            userProfile.user_badge = "Blended Master";
            levelUpMessage = locData[lang].toastLevelUp + "Blended Master";
        } else if (oldExp < 500 && userProfile.user_exp >= 500) {
            userProfile.user_badge = "Single Malt Master";
            levelUpMessage = locData[lang].toastLevelUp + "Single Malt Master";
        }
        localStorage.setItem("wv_user_profile", JSON.stringify(userProfile));

        // UI Feedback & Navigation
        validateForm(); // Re-disable button since fields are cleared

        const successMsg = locData[lang].toastSuccess;
        const pointMsg = `+${pointsGained} ${locData[lang].toastPoints}`;
        showToast(`${successMsg} ${pointMsg}`);

        if (levelUpMessage) {
            setTimeout(() => showToast(levelUpMessage), 500);
        }

        // Delay navigation to let user see the toast
        setTimeout(() => {
            window.location.href = 'result.html';
        }, 2000);
    });
});
