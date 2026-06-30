// Shared Localization Data
const locData = {
    kr: {
        langToggle: "KR | EN",
        
        // index.html
        homeHeroTitle: "당신의 완벽한 위스키 🥃",
        homeHeroSub: "30초 만에 당신의 위스키 취향을 발견하세요.",
        startTasteTest: "취향 테스트 시작",
        livePriceReports: "실시간 시세 제보 📍",
        seeAll: "전체보기",
        tonightsBottles: "오늘 밤의 바틀 🥃",
        navHome: "홈",
        navSearch: "검색",
        navMyBar: "내 바",

        // survey.html
        nextBtn: "다음",
        revealDram: "내 완벽한 위스키 확인하기",
        
        // result.html
        perfectDram: "당신의 완벽한 위스키",
        batchInfo: "마니아 배치 정보",
        livePrice: "실시간 시세 제보",
        userReviews: "유저 한 줄 평",
        sweetness: "단맛 (Sweet)",
        smoky: "스모키 (Smoky)",
        intensity: "바디감 (Intensity)",
        bestBatch: "추천배치",
        ageLabel: "숙성",
        expertRating: "전문가 평점",
        reportPrice: "+ 시세 제보하기",
        writeReview: "리뷰 쓰기",

        // write.html
        shareDram: "글쓰기",
        tasteReview: "리뷰 작성",
        priceReport: "시세 제보",
        selectWhiskey: "위스키 선택",
        selectBatch: "배치/숙성 연도 선택",
        submitBtn: "등록하기",
        reviewPlaceholder: "이 위스키의 맛과 향은 어땠나요? 한 줄 평을 남겨보세요.",
        priceLabel: "구매 가격",
        locationLabel: "구매처 (예: 코스트코 부산)",
        dateLabel: "구매 일자",
        attachPhoto: "영수증 또는 보틀 사진 첨부",
        tagSweet: "달콤함",
        tagVanilla: "바닐라",
        tagSmoky: "스모키",
        tagPeat: "피트",
        tagWoody: "우디",
        tagSpicy: "스파이시",
        tagCitrus: "시트러스",
        tagChocolate: "초콜릿",
        toastSuccess: "성공적으로 등록되었습니다!",
        toastLevelUp: "레벨 업! 새로운 뱃지를 획득했습니다: ",

        // mybar.html
        myBarTitle: "내 바",
        myVirtualCabinet: "나의 가상 장식장",
        unlockedBadges: "언락 뱃지",
        levelText: "레벨",
        addFirstWhiskey: "첫 위스키 추가하기",
        badgeSherry: "셰리 러버",
        badgePeat: "피트 몬스터",
        badgePrice: "시세왕",
        badgeFirst: "첫 모금",
        levelUpModalTitle: "레벨 업 축하합니다!",

        // search.html
        searchPlaceholder: "위스키 이름, 브랜드 검색...",
        categoryLabel: "카테고리",
        abvLabel: "도수",
        recommendedBadge: "★ 추천 배치",
        viewLivePrices: "이 위스키의 실시간 커뮤니티 시세 보기",
        noResults: "검색 결과가 없습니다.",
        proofLabel: "도수 (Proof/ABV)",
        maturationLabel: "숙성 정보",
        ratingsLabel: "전문가 평점"
    },
    en: {
        langToggle: "EN | KR",

        // index.html
        homeHeroTitle: "Find Your Perfect Dram 🥃",
        homeHeroSub: "Discover your whiskey taste profile in 30 seconds.",
        startTasteTest: "Start Taste Test",
        livePriceReports: "Live Price Reports 📍",
        seeAll: "See All",
        tonightsBottles: "Tonight's Bottles 🥃",
        navHome: "Home",
        navSearch: "Search",
        navMyBar: "My Bar",

        // survey.html
        nextBtn: "Next",
        revealDram: "Reveal My Perfect Dram",

        // result.html
        perfectDram: "Your Perfect Dram",
        batchInfo: "Premium Batch Info",
        livePrice: "Live Price Reports",
        userReviews: "User Reviews",
        sweetness: "Sweetness",
        smoky: "Smokiness",
        intensity: "Intensity",
        bestBatch: "Best Batch",
        ageLabel: "Age",
        expertRating: "Expert Rating",
        reportPrice: "+ Report Price",
        writeReview: "Write a Review",

        // write.html
        shareDram: "Share Your Dram",
        tasteReview: "Taste Review",
        priceReport: "Price Report",
        selectWhiskey: "Select Whiskey",
        selectBatch: "Select Batch/Age",
        submitBtn: "Submit",
        reviewPlaceholder: "How was the dram? Leave your tasting notes here.",
        priceLabel: "Purchase Price",
        locationLabel: "Purchase Location (e.g., Costco)",
        dateLabel: "Purchase Date",
        attachPhoto: "Attach Receipt or Bottle Photo",
        tagSweet: "Sweet",
        tagVanilla: "Vanilla",
        tagSmoky: "Smoky",
        tagPeat: "Peat",
        tagWoody: "Woody",
        tagSpicy: "Spicy",
        tagCitrus: "Citrus",
        tagChocolate: "Chocolate",
        toastSuccess: "Successfully submitted!",
        toastLevelUp: "Level Up! New badge acquired: ",

        // mybar.html
        myBarTitle: "My Bar",
        myVirtualCabinet: "My Virtual Cabinet",
        unlockedBadges: "Unlocked Badges",
        levelText: "Level",
        addFirstWhiskey: "Add First Whiskey",
        badgeSherry: "Sherry Lover",
        badgePeat: "Peat Monster",
        badgePrice: "Price King",
        badgeFirst: "First Sip",
        levelUpModalTitle: "Congratulations on Level Up!",

        // search.html
        searchPlaceholder: "Search whiskey, brand...",
        categoryLabel: "Category",
        abvLabel: "ABV",
        recommendedBadge: "★ Recommended",
        viewLivePrices: "View live community prices for this dram",
        noResults: "No results found.",
        proofLabel: "Proof / ABV",
        maturationLabel: "Maturation Details",
        ratingsLabel: "Expert Ratings"
    }
};

let currentLang = localStorage.getItem('whiskyLang') || 'kr';

function applyLanguage() {
    // Update all elements with data-loc attribute
    document.querySelectorAll('[data-loc]').forEach(el => {
        const key = el.getAttribute('data-loc');
        if (locData[currentLang] && locData[currentLang][key]) {
            // For buttons containing icons, we only want to replace the text node
            // But for simplicity, if it's the start taste test button, we need to preserve the icon.
            // Let's handle startTasteTest specially if it has an icon child.
            if (key === 'startTasteTest') {
                el.innerHTML = `${locData[currentLang][key]} <i class="ph-bold ph-arrow-right"></i>`;
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = locData[currentLang][key];
            } else {
                el.textContent = locData[currentLang][key];
            }
        }
    });

    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = locData[currentLang].langToggle;
    }

    // Dispatch event so other scripts (like survey.js) can update dynamic content
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: currentLang }));
}

function toggleLanguage() {
    currentLang = currentLang === 'kr' ? 'en' : 'kr';
    localStorage.setItem('whiskyLang', currentLang);
    applyLanguage();
}

document.addEventListener("DOMContentLoaded", applyLanguage);
