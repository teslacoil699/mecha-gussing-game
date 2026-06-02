// Game Logic Controller for Gundam Guessing Game

const API_URL = './gundams.json';
let allGundams = [];

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================

const gameState = {
    currentScreen: 'modeSelect', // modeSelect | setup | playing | turnBarrier | results | leaderboard
    gameMode: null, // 'singlePlayer' | 'multiplayer'
    currentPlayer: 'P1',
    players: {
        P1: { name: '', score: 0, currentRound: 0 },
        P2: { name: '', score: 0, currentRound: 0 }
    },
    gameState: 'setup', // setup | playing | finished
    currentGundam: null,
    gundamsPool: [],
    totalRounds: 10,
    hasGuessed: false
};

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    loadGundamsData();
    setupEventListeners();
});

async function loadGundamsData() {
    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load ${API_URL}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            allGundams = data;
        } else if (data && Array.isArray(data.gundams)) {
            allGundams = data.gundams;
        } else if (data && typeof data === 'object') {
            allGundams = Object.values(data).flat();
        } else {
            allGundams = [];
        }

        console.log(`Loaded ${allGundams.length} Gundams`);
    } catch (error) {
        console.error('Error loading gundams data:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Mode selection buttons
    const btnSinglePlayer = document.querySelector('#btn-single-player');
    const btnMultiplayer = document.querySelector('#btn-multiplayer');
    
    if (btnSinglePlayer) {
        btnSinglePlayer.addEventListener('click', () => handleModeSelect('singlePlayer'));
    }
    
    if (btnMultiplayer) {
        btnMultiplayer.addEventListener('click', () => handleModeSelect('multiplayer'));
    }

    // Setup form
    const setupForm = document.querySelector('#setup-form');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetupSubmit);
    }

    // Guess form
    const guessForm = document.querySelector('#guess-form');
    if (guessForm) {
        guessForm.addEventListener('submit', handleGuessSubmit);
    }

    // Next button
    const nextButton = document.querySelector('#next-button');
    if (nextButton) {
        nextButton.addEventListener('click', handleNextRound);
    }

    // Turn barrier button
    const turnBarrierButton = document.querySelector('#turn-barrier-button');
    if (turnBarrierButton) {
        turnBarrierButton.addEventListener('click', handleTurnBarrierAck);
    }

    // Play again button
    const playAgainBtn = document.querySelector('#play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', handlePlayAgain);
    }
}

// ============================================================================
// SCREEN MANAGEMENT
// ============================================================================

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.querySelector(`#screen-${screenName}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    gameState.currentScreen = screenName;
}

// ============================================================================
// SETUP SCREEN - PLAYER NAME ENTRY
// ============================================================================

function handleModeSelect(mode) {
    gameState.gameMode = mode;

    // Update setup form based on mode
    const setupTitle = document.querySelector('#setup-title');
    const setupSubtitle = document.querySelector('#setup-subtitle');
    const player2Group = document.querySelector('#player2-group');
    const player2Input = document.querySelector('#player2-name');

    if (mode === 'singlePlayer') {
        setupTitle.textContent = 'Single Player Game';
        setupSubtitle.textContent = 'Enter your name';
        player2Group.style.display = 'none';
        player2Input.removeAttribute('required');
    } else {
        setupTitle.textContent = 'Multiplayer Game';
        setupSubtitle.textContent = 'Enter both player names';
        player2Group.style.display = 'block';
        player2Input.setAttribute('required', '');
    }

    showScreen('setup');
}

function handleSetupSubmit(e) {
    e.preventDefault();

    const p1Name = document.querySelector('#player1-name').value.trim();
    const p2Name = document.querySelector('#player2-name').value.trim();

    if (!p1Name) {
        alert('Please enter your name');
        return;
    }

    if (gameState.gameMode === 'multiplayer' && !p2Name) {
        alert('Please enter both player names');
        return;
    }

    // Initialize game
    gameState.players.P1.name = p1Name;
    gameState.players.P2.name = gameState.gameMode === 'singlePlayer' ? '' : p2Name;
    gameState.gameState = 'playing';
    gameState.currentPlayer = 'P1';
    gameState.players.P1.currentRound = 1;
    gameState.players.P2.currentRound = gameState.gameMode === 'multiplayer' ? 0 : -1;

    // Initialize gundam pool
    initializeGundamPool();

    // Start first round
    startNewRound();
    showScreen('playing');
}

// ============================================================================
// GUNDAM RANDOMIZATION
// ============================================================================

function initializeGundamPool() {
    // Fisher-Yates shuffle
    gameState.gundamsPool = [...allGundams].sort(() => Math.random() - 0.5);
}

function getNextGundam() {
    if (gameState.gundamsPool.length === 0) {
        // Refill pool if depleted
        initializeGundamPool();
    }
    return gameState.gundamsPool.shift();
}

// ============================================================================
// PLAYING SCREEN - GUESSING SYSTEM
// ============================================================================

function startNewRound() {
    gameState.hasGuessed = false;

    // Get next gundam
    gameState.currentGundam = getNextGundam();

    // Display image
    const gundamImage = document.querySelector('#gundam-image');
    if (gundamImage && gameState.currentGundam) {
        gundamImage.src = gameState.currentGundam.image || 'https://placehold.co/600x400/111a27/ffffff?text=No+Image';
        gundamImage.alt = gameState.currentGundam.name || 'Gundam';
    }

    // Clear input and re-enable for next guess
    const guessInput = document.querySelector('#guess-input');
    if (guessInput) {
        guessInput.value = '';
        guessInput.disabled = false;
        guessInput.focus();
    }

    // Hide feedback
    const feedbackArea = document.querySelector('#feedback-area');
    if (feedbackArea) {
        feedbackArea.classList.add('hidden');
    }

    // Update UI
    updatePlayingUI();
}

function updatePlayingUI() {
    const p1Data = gameState.players.P1;
    const p2Data = gameState.players.P2;
    const currentRound = gameState.currentPlayer === 'P1' ? p1Data.currentRound : p2Data.currentRound;

    document.querySelector('#current-player-name').textContent = 
        gameState.currentPlayer === 'P1' ? p1Data.name : p2Data.name;
    
    document.querySelector('#round-counter').textContent = 
        `Round ${currentRound} of ${gameState.totalRounds}`;

    document.querySelector('#p1-label').textContent = p1Data.name;
    document.querySelector('#p1-score').textContent = p1Data.score;

    document.querySelector('#p2-label').textContent = p2Data.name;
    document.querySelector('#p2-score').textContent = p2Data.score;
}

function handleGuessSubmit(e) {
    e.preventDefault();

    if (gameState.hasGuessed || !gameState.currentGundam) {
        return;
    }

    const guessInput = document.querySelector('#guess-input');
    const playerGuess = guessInput.value.trim();

    if (!playerGuess) {
        alert('Please enter a guess');
        return;
    }

    // Validate guess
    const isCorrect = validateGuess(playerGuess, gameState.currentGundam.name);

    // Update score
    if (isCorrect) {
        const currentPlayer = gameState.currentPlayer;
        gameState.players[currentPlayer].score += 1;
    }

    gameState.hasGuessed = true;

    // Display feedback
    displayFeedback(isCorrect, gameState.currentGundam.name);
}

function validateGuess(playerGuess, correctName) {
    // Normalize both strings: lowercase, trim, remove extra spaces
    const normalized = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');

    return normalized(playerGuess) === normalized(correctName);
}

function displayFeedback(isCorrect, correctName) {
    const feedbackArea = document.querySelector('#feedback-area');
    const feedbackMessage = document.querySelector('#feedback-message');
    const correctAnswerDiv = document.querySelector('#correct-answer');
    const answerText = document.querySelector('#answer-text');
    const guessInput = document.querySelector('#guess-input');

    // Show/hide elements
    feedbackArea.classList.remove('hidden');
    guessInput.disabled = true;

    if (isCorrect) {
        feedbackMessage.textContent = '✅ Correct!';
        feedbackMessage.className = 'feedback-message correct';
        correctAnswerDiv.classList.add('hidden');
    } else {
        feedbackMessage.textContent = '❌ Incorrect';
        feedbackMessage.className = 'feedback-message incorrect';
        correctAnswerDiv.classList.remove('hidden');
        answerText.textContent = correctName;
    }
}

function handleNextRound() {
    const p1 = gameState.players.P1;
    const p2 = gameState.players.P2;

    if (gameState.currentPlayer === 'P1') {
        p1.currentRound += 1;

        if (p1.currentRound > gameState.totalRounds) {
            // P1 finished
            if (gameState.gameMode === 'singlePlayer') {
                // Single player mode: game over
                endGame();
            } else {
                // Multiplayer mode: switch to P2
                gameState.currentPlayer = 'P2';
                p2.currentRound = 1;
                showScreen('turnBarrier');
            }
        } else {
            // Next round for P1
            startNewRound();
        }
    } else {
        p2.currentRound += 1;

        if (p2.currentRound > gameState.totalRounds) {
            // P2 finished, game over
            endGame();
        } else {
            // Next round for P2
            startNewRound();
        }
    }
}

// ============================================================================
// TURN BARRIER SCREEN
// ============================================================================

function handleTurnBarrierAck() {
    showScreen('playing');
    startNewRound();
}

// ============================================================================
// GAME END
// ============================================================================

function endGame() {
    const p1 = gameState.players.P1;
    const p2 = gameState.players.P2;

    // Save high scores
    saveHighScore(p1.name, p1.score);
    if (gameState.gameMode === 'multiplayer') {
        saveHighScore(p2.name, p2.score);
    }

    // Display results
    showResults(p1, p2);
    showScreen('results');
}

function showResults(p1, p2) {
    document.querySelector('#result-p1-name').textContent = p1.name;
    document.querySelector('#result-p1-score').textContent = p1.score;

    document.querySelector('#result-p2-name').textContent = p2.name;
    document.querySelector('#result-p2-score').textContent = p2.score;

    // Determine winner or display single player result
    const resultWinner = document.querySelector('#result-winner');
    const resultP1Item = document.querySelector('#result-p1');
    const resultP2Item = document.querySelector('#result-p2');

    resultP1Item.classList.remove('winner');
    resultP2Item.classList.remove('winner');
    resultWinner.classList.add('hidden');

    if (gameState.gameMode === 'singlePlayer') {
        // Single player mode: just show the score
        resultP1Item.classList.add('winner');
        resultWinner.innerHTML = `<span class="winner-badge">Final Score</span>`;
        resultWinner.classList.remove('hidden');
    } else {
        // Multiplayer mode: compare scores
        if (p1.score > p2.score) {
            resultP1Item.classList.add('winner');
            resultWinner.innerHTML = `<span class="winner-badge">Winner</span>`;
            resultWinner.classList.remove('hidden');
        } else if (p2.score > p1.score) {
            resultP2Item.classList.add('winner');
            resultWinner.innerHTML = `<span class="winner-badge">Winner</span>`;
            resultWinner.classList.remove('hidden');
        } else {
            resultWinner.innerHTML = `<span class="winner-badge">Tie</span>`;
            resultWinner.classList.remove('hidden');
        }
    }
}

function handlePlayAgain() {
    // Reset game state
    gameState.currentPlayer = 'P1';
    gameState.players = {
        P1: { name: gameState.players.P1.name, score: 0, currentRound: 0 },
        P2: { name: gameState.players.P2.name, score: 0, currentRound: 0 }
    };
    gameState.gameState = 'playing';
    gameState.players.P1.currentRound = 1;

    initializeGundamPool();
    startNewRound();
    showScreen('playing');
}

// ============================================================================
// HIGH SCORE PERSISTENCE
// ============================================================================

const LEADERBOARD_KEY = 'gundamGameLeaderboard';
const MAX_SCORES = 50;

function saveHighScore(playerName, score) {
    const leaderboard = getHighScores();

    leaderboard.push({
        playerName: playerName,
        score: score,
        timestamp: new Date().toISOString()
    });

    // Sort by score (descending), keep top MAX_SCORES
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(MAX_SCORES);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function getHighScores() {
    try {
        const stored = localStorage.getItem(LEADERBOARD_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading high scores:', error);
        return [];
    }
}

function displayLeaderboard() {
    const leaderboard = getHighScores();
    const tbody = document.querySelector('#leaderboard-body');

    if (leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No scores yet. Be the first to play!</td></tr>';
        return;
    }

    const html = leaderboard.map((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        return `
            <tr>
                <td>#${index + 1}</td>
                <td>${entry.playerName}</td>
                <td class="score">${entry.score}</td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}
