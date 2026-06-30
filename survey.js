const surveyData = [
    {
        id: 1,
        question: {
            en: "What kind of sweetness do you prefer in your dram?",
            kr: "어떤 종류의 단맛을 선호하시나요?"
        },
        options: [
            {
                id: "s1_1",
                title: { en: "Vanilla & Honey", kr: "바닐라 & 꿀" },
                desc: { en: "Smooth, creamy, and gentle", kr: "부드럽고 크리미한 은은한 단맛" },
                icon: "ph-flower-tulip"
            },
            {
                id: "s1_2",
                title: { en: "Dried Fruits & Chocolate", kr: "건과일 & 초콜릿" },
                desc: { en: "Rich, heavy, and sherry-infused", kr: "묵직하고 진한 셰리 베이스 단맛" },
                icon: "ph-orange-slice"
            },
            {
                id: "s1_3",
                title: { en: "Dry & Crisp", kr: "드라이 & 깔끔함" },
                desc: { en: "Minimal sweetness, clean finish", kr: "단맛이 적고 깔끔한 피니시" },
                icon: "ph-wind"
            }
        ]
    },
    {
        id: 2,
        question: {
            en: "How do you feel about smoky flavors and peat smoke?",
            kr: "스모키한 향이나 피트(이탄) 향에 대해 어떻게 생각하시나요?"
        },
        options: [
            {
                id: "s2_1",
                title: { en: "Fresh & Floral", kr: "프레시 & 플로럴" },
                desc: { en: "No smoke, clean fruit notes", kr: "연기 향 없는 깔끔한 과일 향" },
                icon: "ph-plant"
            },
            {
                id: "s2_2",
                title: { en: "Subtle Woody & Earthy", kr: "은은한 우디 & 얼씨" },
                desc: { en: "Gentle oak and mild campfire", kr: "부드러운 오크 향과 가벼운 캠프파이어" },
                icon: "ph-tree"
            },
            {
                id: "s2_3",
                title: { en: "Intense Peat & Seaweed", kr: "강렬한 피트 & 바다 내음" },
                desc: { en: "Heavy smoke, medicinal, bold character", kr: "묵직한 스모키와 소독약 같은 개성" },
                icon: "ph-campfire"
            }
        ]
    },
    {
        id: 3,
        question: {
            en: "What kind of mouthfeel and intensity are you looking for?",
            kr: "어떤 바디감과 타격감을 찾으시나요?"
        },
        options: [
            {
                id: "s3_1",
                title: { en: "Soft & Approachable", kr: "부드럽고 편안한 느낌" },
                desc: { en: "Smooth sip, lower ABV around 40%", kr: "40% 내외의 부드러운 목넘김" },
                icon: "ph-drop"
            },
            {
                id: "s3_2",
                title: { en: "Bold & High-Proof", kr: "강렬하고 높은 도수" },
                desc: { en: "Fiery punch, cask strength experience 50%+", kr: "50% 이상의 강렬한 캐스크 스트랭스" },
                icon: "ph-fire"
            }
        ]
    },
    {
        id: 4,
        question: {
            en: "What is the occasion for this bottle?",
            kr: "어떤 상황에서 드실 예정인가요?"
        },
        options: [
            {
                id: "s4_1",
                title: { en: "Daily & Highball", kr: "데일리 & 하이볼" },
                desc: { en: "Budget-friendly under 50K KRW", kr: "5만원 이하의 가성비 위스키" },
                icon: "ph-glass"
            },
            {
                id: "s4_2",
                title: { en: "Sipping & Savoring", kr: "음미하며 즐기기" },
                desc: { en: "Quality single malts 100K-200K KRW", kr: "10-20만원 대의 퀄리티 싱글몰트" },
                icon: "ph-brandy"
            },
            {
                id: "s4_3",
                title: { en: "Rare Heritage & Collecting", kr: "수집용 프리미엄" },
                desc: { en: "Premium batches, old bottles, high-end", kr: "한정판, 올드보틀 등 최고급 위스키" },
                icon: "ph-crown"
            }
        ]
    }
];

const optionValueMap = {
    "s1_1": "Vanilla", "s1_2": "Sherry", "s1_3": "Dry",
    "s2_1": "None", "s2_2": "Subtle", "s2_3": "Intense",
    "s3_1": "Soft", "s3_2": "Bold",
    "s4_1": "Daily", "s4_2": "Sipping", "s4_3": "Rare"
};

let currentStep = 0;
let userSelections = {};

const contentContainer = document.getElementById("survey-content");
const nextBtn = document.getElementById("next-btn");
const stepIndicator = document.getElementById("step-indicator");
const progressFill = document.getElementById("progress-fill");

function renderStep() {
    const data = surveyData[currentStep];
    const totalSteps = surveyData.length;
    const lang = window.currentLang || 'kr';
    
    // Update Header
    stepIndicator.textContent = `${locData[lang].question} ${currentStep + 1} ${locData[lang].of} ${totalSteps}`;
    progressFill.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
    
    // Update Button
    nextBtn.disabled = !userSelections[data.id];
    if (nextBtn.disabled) {
        nextBtn.classList.remove("active");
    } else {
        nextBtn.classList.add("active");
    }
    
    if (currentStep === totalSteps - 1) {
        nextBtn.textContent = locData[lang].revealDram;
    } else {
        nextBtn.textContent = locData[lang].nextBtn;
    }

    // Render Content
    let optionsHtml = data.options.map(opt => `
        <div class="option-card ${userSelections[data.id] === opt.id ? 'selected' : ''}" onclick="selectOption('${data.id}', '${opt.id}')">
            <div class="option-icon"><i class="ph ${opt.icon}"></i></div>
            <div class="option-text">
                <div class="option-title">${opt.title[lang]}</div>
                <div class="option-desc">${opt.desc[lang]}</div>
            </div>
        </div>
    `).join('');

    contentContainer.innerHTML = `
        <div class="question-container">
            <h2 class="survey-question">${data.question[lang]}</h2>
        </div>
        <div class="options-container">
            ${optionsHtml}
        </div>
    `;
}

window.selectOption = function(stepId, optionId) {
    userSelections[stepId] = optionId;
    renderStep(); // Re-render to show selection styling
}

nextBtn.addEventListener("click", () => {
    if (currentStep < surveyData.length - 1) {
        currentStep++;
        renderStep();
    } else {
        // Final Submission: Save to localStorage
        const resultParams = {
            param_sweetness: optionValueMap[userSelections[1]],
            param_smoky: optionValueMap[userSelections[2]],
            param_intensity: optionValueMap[userSelections[3]],
            param_purpose: optionValueMap[userSelections[4]]
        };
        localStorage.setItem("whiskySurveyParams", JSON.stringify(resultParams));
        window.location.href = "result.html";
    }
});

// Re-render when language changes
window.addEventListener('languageChanged', renderStep);

// Initial Render
renderStep();
