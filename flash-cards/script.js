let cards = [];
let currentCardIndex = 0;
let currentMode = 'study';
let stats = {
    learned: 0,
    totalAttempts: 0,
    correctAttempts: 0
};

// DOM Elements
const flashCard = document.querySelector('.flash-card');
const cardFront = document.querySelector('.card-front .content');
const cardBack = document.querySelector('.card-back .romanization');
const cardBackDefinition = document.querySelector('.card-back .definition');
const prevButton = document.getElementById('prevCard');
const nextButton = document.getElementById('nextCard');
const cardCount = document.getElementById('cardCount');
const importFileInput = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const modeButtons = document.querySelectorAll('.mode-btn');
const answerSection = document.querySelector('.answer-section');
const userAnswerInput = document.getElementById('userAnswer');
const checkAnswerButton = document.getElementById('checkAnswer');
const feedbackDiv = document.querySelector('.feedback');
const progressBar = document.querySelector('.progress');
const learnedCountElement = document.getElementById('learnedCount');
const accuracyRateElement = document.getElementById('accuracyRate');

// Load initial data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        cards = data.cards;
        updateCard();
    })
    .catch(error => console.error('Error loading cards:', error));

// Mode switching
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentMode = button.dataset.mode;
        resetCard();
    });
});

// Update card content
function updateCard() {
    cardFront.textContent = cards[currentCardIndex].front;
    cardBack.textContent = cards[currentCardIndex].back.romanization;
    cardBackDefinition.textContent = cards[currentCardIndex].back.definition;
    cardCount.textContent = `${currentCardIndex + 1} / ${cards.length}`;
    
    // Update navigation buttons
    prevButton.disabled = currentCardIndex === 0;
    nextButton.disabled = currentCardIndex === cards.length - 1;

    // Update progress bar
    const progress = ((currentCardIndex + 1) / cards.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Show/hide answer section based on mode
    answerSection.style.display = currentMode === 'test' ? 'block' : 'none';
    
    // Reset user input and feedback
    if (userAnswerInput) {
        userAnswerInput.value = '';
        feedbackDiv.textContent = '';
    }

    updateStats();
}

function resetCard() {
    flashCard.classList.remove('flipped');
    updateCard();
}

function updateStats() {
    learnedCountElement.textContent = stats.learned;
    const accuracy = stats.totalAttempts === 0 ? 0 : 
        Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
    accuracyRateElement.textContent = `${accuracy}%`;
}

// Check answer
checkAnswerButton.addEventListener('click', () => {
    const userAnswer = userAnswerInput.value.trim().toLowerCase();
    const correctAnswer = cards[currentCardIndex].back.romanization.toLowerCase();
    
    stats.totalAttempts++;
    
    if (userAnswer === correctAnswer) {
        feedbackDiv.textContent = '答對了！';
        feedbackDiv.className = 'feedback correct';
        stats.correctAttempts++;
        if (!cards[currentCardIndex].learned) {
            cards[currentCardIndex].learned = true;
            stats.learned++;
        }
    } else {
        feedbackDiv.textContent = `答錯了。正確答案是：${correctAnswer}`;
        feedbackDiv.className = 'feedback incorrect';
    }
    
    updateStats();
});

// Event Listeners
flashCard.addEventListener('click', () => {
    if (currentMode !== 'test') {
        flashCard.classList.toggle('flipped');
        if (!cards[currentCardIndex].learned) {
            cards[currentCardIndex].learned = true;
            stats.learned++;
            updateStats();
        }
    }
});

prevButton.addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        resetCard();
    }
});

nextButton.addEventListener('click', () => {
    if (currentCardIndex < cards.length - 1) {
        currentCardIndex++;
        flashCard.classList.remove('flipped');
        updateCard();
    }
});

// Import functionality
importBtn.addEventListener('click', () => {
    importFileInput.click();
});

importFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.cards && Array.isArray(data.cards)) {
                    cards = data.cards;
                    currentCardIndex = 0;
                    updateCard();
                    alert('單詞匯入成功！');
                } else {
                    alert('檔案格式不正確！');
                }
            } catch (error) {
                alert('無法讀取檔案！');
            }
        };
        reader.readAsText(file);
    }
});

// Export functionality
exportBtn.addEventListener('click', () => {
    const data = JSON.stringify({ cards }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flash-cards.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});