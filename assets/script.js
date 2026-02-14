// Game State
let currentLevel = 1;
let unlockedLevel = 1; // highest unlocked level (for Continue)
let hintsUsed = 0;
let soundEnabled = false;
let level2Numbers = [];
let level2UserSequence = [];
let level5Sequence = [];
let level5UserSequence = [];
let level5Symbols = ['▲', '●', '■', '◆'];
let level6Pieces = [];
let discoveredWords = [];

// Audio Elements (assigned in DOMContentLoaded)
let ambientAudio;
let condorAudio;

// Final word letters to reveal across levels
const finalWord = 'WTHBRUH';
let revealedLetters = Array(finalWord.length).fill('');

// Level Data
const levels = [
    {
        id: 1,
        title: "The Archive",
        description: "Belgium – Order",
        solution: 'MONKEY',
        hint: "Look at the first letter of each capitalized word in the riddle: Mystic, Offerings, Nazca, Knowledge, Elder, Yugas.",
        onSolve: () => {
            showSuccess("The archive reveals its first secret.");
            discoveredWords.push('MONKEY');
            showLetterReveal(1);
        }
    },
    {
        id: 2,
        title: "The Grid",
        description: "Geometric Pattern",
        solution: null, // Dynamic based on numbers
        hint: "Remember the positions of the numbers on the grid. Tap them in the order they appeared.",
        onSolve: () => {
            showSuccess("The grid transforms...");
            setTimeout(() => {
                const grid = document.getElementById('coordinate-grid');
                if (grid) {
                    grid.style.backgroundImage = 'url(image/nazca_lines_pixel.png)';
                    grid.style.backgroundSize = 'cover';
                    grid.style.backgroundPosition = 'center';
                    grid.style.opacity = '0.5';
                }
            }, 1000);
            showLetterReveal(2);
        }
    },
    {
        id: 3,
        title: "Height",
        description: "Belgium vs Peru",
        solution: 2249,
        hint: "Subtract the smaller number from the larger one — investigate first to reveal the clue.",
        onSolve: () => {
            showSuccess("The mountains call...");
            setTimeout(() => {
                const content = document.getElementById('level-3-content');
                if (content) {
                    const img = document.createElement('img');
                    img.src = 'image/machu_picchu_pixel.png';
                    img.className = 'level-background';
                    img.style.opacity = '0';
                    content.appendChild(img);
                    setTimeout(() => {
                        img.style.transition = 'opacity 2s ease';
                        img.style.opacity = '0.4';
                    }, 100);
                }
            }, 1000);
            showLetterReveal(3);
        }
    },
    {
        id: 4,
        title: "Symmetry",
        description: "Nazca Influence",
        solution: [0, 2, 4, 6, 8], // Indices of symmetrical symbols (order matters now)
        hint: "Select the symmetrical symbols in the correct sequence.",
        onSolve: () => {
            showSuccess("The lines speak of ancient patterns.");
            showLetterReveal(4);
        }
    },
    {
        id: 5,
        title: "The Sound",
        description: "Condor",
        solution: null, // Dynamic sequence
        hint: "Watch the symbols appear and listen to the music. The sequence matches the rhythm.",
        onSolve: () => {
            showSuccess("The condor's song echoes through time.");
            discoveredWords.push('SURFACE');
            showLetterReveal(5);
        }
    },
    {
        id: 6,
        title: "Merge",
        description: "Fusion",
        solution: 'fusion',
        hint: "Place the pieces in the correct positions and order.",
        onSolve: () => {
            showSuccess("Two worlds begin to merge.");
            showLetterReveal(6);
        }
    },
    {
        id: 7,
        title: "Surface",
        description: "Cliffhanger",
        solution: 'WTHBRUH',
        hint: "Assemble the letters you've uncovered across the levels to form the final word.",
        onSolve: () => {
            showSuccess("You were only looking at the surface.");
            setTimeout(() => {
                showVideoScreen();
            }, 2000);
        }
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio elements
    ambientAudio = document.getElementById('ambient-audio');
    condorAudio = document.getElementById('condor-audio');
    
    loadProgress();
    setupEventListeners();
    checkContinueButton();
    updateWordsHUD();
    
    // Set background images for levels
    setupLevelBackgrounds();
});

function setupEventListeners() {
    // Menu buttons
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('continue-btn').addEventListener('click', continueGame);
    
    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    
    // Hint button
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('close-hint').addEventListener('click', closeHint);
    
    // Level-specific handlers
    setupLevel1();
    setupLevel2();
    setupLevel3();
    setupLevel4();
    setupLevel5();
    setupLevel6();
    setupLevel7();
    
    // Navigation
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    document.getElementById('restart-btn').addEventListener('click', restartGame);

}

function setupLevelBackgrounds() {
    const levelScreen = document.getElementById('level-screen');
    
    // Level 1: Atomium
    const bg1 = document.createElement('img');
    bg1.src = 'image/atomium_dark_pixel.png';
    bg1.className = 'level-background';
    bg1.id = 'bg-level-1';
    levelScreen.appendChild(bg1);
    
    // Level 2: Waffle grid
    const bg2 = document.createElement('img');
    bg2.src = 'image/waffle_grid_dark.jpg';
    bg2.className = 'level-background';
    bg2.id = 'bg-level-2';
    bg2.style.display = 'none';
    levelScreen.appendChild(bg2);
    
    // Level 4: Nazca lines
    const bg4 = document.createElement('img');
    bg4.src = 'image/nazca_lines_pixel.png';
    bg4.className = 'level-background';
    bg4.id = 'bg-level-4';
    bg4.style.display = 'none';
    levelScreen.appendChild(bg4);
    
    // Level 5: Condor
    const bg5 = document.createElement('img');
    bg5.src = 'image/condor_pixel.png';
    bg5.className = 'level-background';
    bg5.id = 'bg-level-5';
    bg5.style.display = 'none';
    levelScreen.appendChild(bg5);
}

// Progress Management
function saveProgress() {
    localStorage.setItem('twoWorlds_level', currentLevel);
    localStorage.setItem('twoWorlds_unlocked', unlockedLevel);
    localStorage.setItem('twoWorlds_hints', hintsUsed);
    localStorage.setItem('twoWorlds_sound', soundEnabled);
    localStorage.setItem('twoWorlds_words', JSON.stringify(discoveredWords));
    localStorage.setItem('twoWorlds_revealed', JSON.stringify(revealedLetters));
}

function loadProgress() {
    const savedLevel = localStorage.getItem('twoWorlds_level');
    const savedUnlocked = localStorage.getItem('twoWorlds_unlocked');
    const savedHints = localStorage.getItem('twoWorlds_hints');
    const savedSound = localStorage.getItem('twoWorlds_sound');
    const savedWords = localStorage.getItem('twoWorlds_words');
    const savedRevealed = localStorage.getItem('twoWorlds_revealed');
    
    if (savedLevel) currentLevel = parseInt(savedLevel, 10);
    if (savedUnlocked) unlockedLevel = parseInt(savedUnlocked, 10);
    if (savedHints) hintsUsed = parseInt(savedHints, 10);
    if (savedSound === 'true') {
        soundEnabled = true;
        enableSound();
    }
    if (savedWords) discoveredWords = JSON.parse(savedWords);
    if (savedRevealed) {
        try { revealedLetters = JSON.parse(savedRevealed); } catch(e) { revealedLetters = Array(finalWord.length).fill(''); }
    }
}

function checkContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    if (unlockedLevel > 1) {
        continueBtn.style.display = 'block';
    } else {
        continueBtn.style.display = 'none';
    }
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    currentLevel = 1;
    hintsUsed = 0;
    discoveredWords = [];
    saveProgress();
    loadLevel(1);
}

function continueGame() {
    loadLevel(unlockedLevel);
}

function loadLevel(levelNum) {
    // Hide any lingering modals/messages when changing levels
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    currentLevel = levelNum;
    showScreen('level-screen');
    
    const level = levels[levelNum - 1];
    document.getElementById('level-title').textContent = level.title;
    document.getElementById('level-description').textContent = level.description;
    document.getElementById('level-number').textContent = `Level ${levelNum}`;
    
    // Update progress bar
    const progress = (levelNum / levels.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Hide all level-specific content
    document.querySelectorAll('.level-specific').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show current level content
    const levelContent = document.getElementById(`level-${levelNum}-content`);
    if (levelContent) {
        levelContent.style.display = 'block';
    }
    
    // Update background images
    updateBackgroundImage(levelNum);
    
    // Initialize level-specific logic
    initializeLevel(levelNum);
    
    // Ensure next button is not actionable until user chooses to continue
    const nextBtn = document.getElementById('next-level-btn');
    if (nextBtn) nextBtn.disabled = false;
    
    saveProgress();
}

function updateBackgroundImage(levelNum) {
    // Hide all backgrounds
    for (let i = 1; i <= 7; i++) {
        const bg = document.getElementById(`bg-level-${i}`);
        if (bg) bg.style.display = 'none';
    }
    
    // Show current background
    const bg = document.getElementById(`bg-level-${levelNum}`);
    if (bg) bg.style.display = 'block';

    // Update decorative icons based on level
    updateLevelIcons(levelNum);
}

function updateLevelIcons(levelNum) {
    const iconContainer = document.getElementById('level-icons');
    if (!iconContainer) return;

    iconContainer.innerHTML = '';

    let icons = [];
    let iconCount = 12; // increased from ~5
    if (levelNum <= 3) {
        // Belgium icons for levels 1-3
        icons = ['bel1.png', 'bel2.png', 'bel3.png', 'bel4.png', 'bel5.png', 'bel6.png', 'bel7.png', 'bel8.png'];
    } else {
        // Peru icons for levels 4-7
        icons = ['peru1.png', 'peru2.png', 'peru3.png', 'peru4.png', 'peru5.png', 'peru6.png', 'peru7.png', 'peru8.png', 'peru9.png', 'peru10.png'];
    }

    // Scatter more icons around the screen with animation
    for (let i = 0; i < iconCount; i++) {
        const icon = document.createElement('div');
        icon.className = 'icon-sprite ' + (levelNum <= 3 ? 'icon-bel' : 'icon-peru');
        const iconFile = icons[Math.floor(Math.random() * icons.length)];
        icon.style.backgroundImage = `url(image/icons/${iconFile})`;
        const size = Math.random() * 100 + 60; // 60-160px
        icon.style.width = size + 'px';
        icon.style.height = size + 'px';
        icon.style.left = Math.random() * 100 + '%';
        icon.style.top = Math.random() * 100 + '%';
        icon.style.opacity = (Math.random() * 0.15 + 0.08).toString(); // Higher opacity (0.08-0.23)
        icon.style.animation = `float ${4 + Math.random() * 3}s ease-in-out infinite`;
        icon.style.animationDelay = (Math.random() * 2) + 's';
        iconContainer.appendChild(icon);
    }

    // Add dark fog/mist overlay
    const fog = document.createElement('div');
    fog.className = 'icon-fog';
    fog.style.position = 'absolute';
    fog.style.width = '100%';
    fog.style.height = '100%';
    fog.style.top = '0';
    fog.style.left = '0';
    fog.style.background = 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)';
    fog.style.pointerEvents = 'none';
    fog.style.zIndex = '0';
    iconContainer.appendChild(fog);
}

function initializeLevel(levelNum) {
    switch(levelNum) {
        case 1:
            // Ensure setup is done
            setupLevel1();
            resetLevel1();
            break;
        case 2:
            resetLevel2();
            break;
        case 4:
            resetLevel4();
            break;
        case 5:
            resetLevel5();
            break;
        case 6:
            resetLevel6();
            break;
    }
}

// Level 1: Word Input
let level1SetupDone = false;

function setupLevel1() {
    // Only setup once
    if (level1SetupDone) return;
    
    const submitBtn = document.getElementById('level1-submit');
    const inputField = document.getElementById('level1-input');
    
    if (submitBtn && inputField) {
        submitBtn.addEventListener('click', handleLevel1Submit);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLevel1Submit();
            }
        });
        level1SetupDone = true;
    }
}

function handleLevel1Submit() {
    const input = document.getElementById('level1-input');
    if (!input) return;
    
    const userInput = input.value.toUpperCase().trim();
    const solution = levels[0].solution;
    
    if (userInput === solution) {
        const submitBtn = document.getElementById('level1-submit');
        if (submitBtn) submitBtn.disabled = true;
        input.disabled = true;
        solveLevel(1);
    } else {
        showError();
        input.value = '';
    }
} 

function resetLevel1() {
    const input = document.getElementById('level1-input');
    const submitBtn = document.getElementById('level1-submit');
    if (input) {
        input.value = '';
        input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        // Re-setup listeners in case they weren't set up yet
        if (!level1SetupDone) {
            setupLevel1();
        }
        setTimeout(() => {
            if (input) input.focus();
        }, 100);
    }
} 

// Level 2: Grid Coordinates
function setupLevel2() {
    const startBtn = document.getElementById('level2-start');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            resetLevel2();
            // play sequence after reset
            setTimeout(() => showLevel2Numbers(), 250);
        });
    }
}

function resetLevel2() {
    level2Numbers = [];
    level2UserSequence = [];
    
    const grid = document.getElementById('coordinate-grid');
    const numberDisplay = document.getElementById('number-display');
    if (!grid) return;
    
    // Generate random numbers and positions (ensure unique positions) — make puzzle a bit harder (4 positions)
    const positions = [];
    while (positions.length < 4) {
        const pos = Math.floor(Math.random() * 9);
        if (!positions.includes(pos)) {
            positions.push(pos);
        }
    }
    
    level2Numbers = positions;
    
    grid.innerHTML = '';
    grid.style.backgroundImage = 'url(image/waffle_grid_dark.jpg)';
    grid.style.backgroundSize = 'cover';
    grid.style.backgroundPosition = 'center';
    grid.style.opacity = '0.3';
    grid.style.pointerEvents = 'none'; // Disable until numbers are shown
    if (numberDisplay) numberDisplay.textContent = 'Press Start to reveal the sequence';
    
    // Create grid cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleLevel2Tap(i));
        grid.appendChild(cell);
    }
    
    // Do NOT auto-play sequence here; player must press Start
} 

function showLevel2Numbers() {
    const grid = document.getElementById('coordinate-grid');
    const numberDisplay = document.getElementById('number-display');
    const startBtn = document.getElementById('level2-start');
    const cells = grid.querySelectorAll('.grid-cell');

    if (startBtn) startBtn.disabled = true;
    if (numberDisplay) numberDisplay.textContent = 'Memorize the sequence...';

    level2Numbers.forEach((pos, index) => {
        setTimeout(() => {
            cells[pos].textContent = index + 1;
            cells[pos].style.background = 'var(--accent-gold)';
            cells[pos].style.color = 'var(--bg-primary)';

            setTimeout(() => {
                cells[pos].textContent = '';
                cells[pos].style.background = '';
                cells[pos].style.color = '';
            }, 1300);
        }, index * 1400);
    });

    // Enable input after showing all numbers and give visual hint
    const enableDelay = level2Numbers.length * 1400 + 600;
    setTimeout(() => {
        grid.style.pointerEvents = 'auto';
        if (numberDisplay) numberDisplay.textContent = 'Tap the positions now';
        grid.classList.add('ready');
        setTimeout(() => grid.classList.remove('ready'), 800);
        // re-enable start button after a short cooldown so player can't spam
        if (startBtn) {
            setTimeout(() => { startBtn.disabled = false; startBtn.textContent = 'Replay'; }, 1200);
        }
    }, enableDelay);
} 

function handleLevel2Tap(index) {
    if (level2UserSequence.length < level2Numbers.length) {
        level2UserSequence.push(index);
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) cell.classList.add('selected');

        // Immediate prefix check — instant feedback if a wrong cell is tapped
        for (let i = 0; i < level2UserSequence.length; i++) {
            if (level2UserSequence[i] !== level2Numbers[i]) {
                showError();
                setTimeout(() => resetLevel2(), 1200);
                return;
            }
        }
        
        if (level2UserSequence.length === level2Numbers.length) {
            checkLevel2();
        }
    }
} 

function checkLevel2() {
    if (JSON.stringify(level2UserSequence) === JSON.stringify(level2Numbers)) {
        solveLevel(2);
    } else {
        showError();
        setTimeout(() => resetLevel2(), 1500);
    }
}

// Level 3: Height Calculation
function setupLevel3() {
    const submitBtn = document.getElementById('height-submit');
    const inputEl = document.getElementById('height-input');
    const investigateBtn = document.getElementById('level3-investigate');
    const machuEl = document.getElementById('machu-picchu-value');

    // Lock input until player investigates (adds suspense)
    if (inputEl) inputEl.disabled = true;

    if (investigateBtn && machuEl) {
        investigateBtn.addEventListener('click', () => {
            investigateBtn.disabled = true;
            // reveal digits slowly for suspense
            const reveal = ['2', '24', '243', '2430m'];
            machuEl.textContent = '';
            reveal.forEach((partial, i) => {
                setTimeout(() => {
                    machuEl.textContent = partial;
                    // subtle highlight
                    machuEl.classList.add('glitch-effect');
                    setTimeout(() => machuEl.classList.remove('glitch-effect'), 250);
                    if (i === reveal.length - 1) {
                        // enable input once fully revealed
                        if (inputEl) inputEl.disabled = false;
                        investigateBtn.textContent = 'Investigated';
                        // reveal a small background element for atmosphere
                        const content = document.getElementById('level-3-content');
                        if (content && !content.querySelector('.mystery-veil')) {
                            const veil = document.createElement('div');
                            veil.className = 'mystery-veil';
                            veil.textContent = '';
                            veil.style.position = 'absolute';
                            veil.style.inset = '0';
                            veil.style.background = 'radial-gradient(ellipse at center, rgba(0,0,0,0.0), rgba(0,0,0,0.6))';
                            veil.style.pointerEvents = 'none';
                            content.appendChild(veil);
                        }
                    }
                }, i * 600);
            });
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const val = parseInt(document.getElementById('height-input').value, 10);
            if (val === levels[2].solution) {
                solveLevel(3);
            } else {
                showError();
                if (inputEl) inputEl.value = '';
            }
        });
    }
}

// Level 4: Symmetry
function setupLevel4() {
    // Symbols will be created dynamically
}

let level4Step = 0;
function resetLevel4() {
    level4Step = 0;
    const symbols = ['◐', '◑', '◒', '◓', '▲', '▼', '◄', '►', '●'];
    const symmetrical = [0, 2, 4, 6, 8]; // Indices of symmetrical symbols
    
    const grid = document.getElementById('symbol-grid');
    grid.innerHTML = '';
    
    symbols.forEach((symbol, index) => {
        const item = document.createElement('div');
        item.className = 'symbol-item';
        item.textContent = symbol;
        item.dataset.index = index;
        item.dataset.symmetrical = symmetrical.includes(index);
        item.addEventListener('click', () => handleLevel4Select(item));
        grid.appendChild(item);
    });
}

function handleLevel4Select(element) {
    const expected = levels[3].solution[level4Step];
    const clicked = parseInt(element.dataset.index, 10);

    // require correct order selection for more challenge
    if (clicked === expected) {
        element.classList.add('selected');
        level4Step++;
        if (level4Step === levels[3].solution.length) {
            solveLevel(4);
        }
    } else {
        element.classList.add('incorrect');
        showError();
        // reset selection after short delay
        setTimeout(() => {
            document.querySelectorAll('.symbol-item.selected').forEach(n => n.classList.remove('selected'));
            element.classList.remove('incorrect');
            level4Step = 0;
        }, 900);
    }
}

// Level 5: Memory Sequence
let level5LastInput = 0;
function setupLevel5() {
    const startBtn = document.getElementById('level5-start');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            resetLevel5();
            setTimeout(() => showLevel5Sequence(), 250);
        });
    }
}

function resetLevel5() {
    level5Sequence = [];
    level5UserSequence = [];
    
    // Generate random sequence of 5 symbols (harder)
    for (let i = 0; i < 5; i++) {
        level5Sequence.push(Math.floor(Math.random() * level5Symbols.length));
    }
    
    const memorySymbols = document.getElementById('memory-symbols');
    memorySymbols.innerHTML = '';
    
    const memoryInput = document.getElementById('memory-input');
    memoryInput.innerHTML = '';
    memoryInput.style.pointerEvents = 'none';
    
    // Create input buttons
    level5Symbols.forEach((symbol, index) => {
        const btn = document.createElement('div');
        btn.className = 'memory-input-btn';
        btn.textContent = symbol;
        btn.dataset.index = index;
        btn.addEventListener('click', () => handleLevel5Input(index, btn));
        memoryInput.appendChild(btn);
    });
    
    // Start audio when player chooses to start (handled in setupLevel5)
    if (soundEnabled && level5Sequence.length > 0) {
        // do not auto-fade here; fade when sequence actually plays
    }
}

function fadeToCondor() {
    if (ambientAudio.volume > 0) {
        const fadeOut = setInterval(() => {
            ambientAudio.volume = Math.max(0, ambientAudio.volume - 0.1);
            if (ambientAudio.volume === 0) {
                clearInterval(fadeOut);
                ambientAudio.pause();
                condorAudio.volume = 0;
                condorAudio.play();
                const fadeIn = setInterval(() => {
                    condorAudio.volume = Math.min(1, condorAudio.volume + 0.1);
                    if (condorAudio.volume === 1) {
                        clearInterval(fadeIn);
                    }
                }, 100);
            }
        }, 100);
    } else {
        condorAudio.volume = 0;
        condorAudio.play();
        const fadeIn = setInterval(() => {
            condorAudio.volume = Math.min(1, condorAudio.volume + 0.1);
            if (condorAudio.volume === 1) {
                clearInterval(fadeIn);
            }
        }, 100);
    }
}

function showLevel5Sequence() {
    const memorySymbols = document.getElementById('memory-symbols');
    const memoryInput = document.getElementById('memory-input');
    const startBtn = document.getElementById('level5-start');
    memorySymbols.innerHTML = '';
    memoryInput.style.pointerEvents = 'none';
    if (startBtn) startBtn.disabled = true;

    // Play condor audio fade-in if enabled
    if (soundEnabled) fadeToCondor();

    level5Sequence.forEach((symbolIndex, sequenceIndex) => {
        setTimeout(() => {
            const symbol = document.createElement('div');
            symbol.className = 'memory-symbol active';
            symbol.textContent = level5Symbols[symbolIndex];
            memorySymbols.appendChild(symbol);

            setTimeout(() => {
                symbol.classList.remove('active');
            }, 900);
        }, sequenceIndex * 1400);
    });

    // Enable input after sequence
    const enableDelay = level5Sequence.length * 1400 + 600;
    setTimeout(() => {
        memoryInput.style.pointerEvents = 'auto';
        if (startBtn) { startBtn.disabled = false; startBtn.textContent = 'Replay'; }
    }, enableDelay);
}

function handleLevel5Input(index, element) {
    // Prevent spam / instant presses
    const now = Date.now();
    if (now - level5LastInput < 350) return; // ignore too-fast taps
    level5LastInput = now;

    level5UserSequence.push(index);
    element.classList.add('selected');

    setTimeout(() => {
        element.classList.remove('selected');
    }, 300);

    if (level5UserSequence.length === level5Sequence.length) {
        checkLevel5();
    }
}

function checkLevel5() {
    if (JSON.stringify(level5UserSequence) === JSON.stringify(level5Sequence)) {
        solveLevel(5);
        // Fade back to ambient
        fadeToAmbient();
    } else {
        showError();
        setTimeout(() => resetLevel5(), 1500);
    }
}

function fadeToAmbient() {
    const fadeOut = setInterval(() => {
        condorAudio.volume = Math.max(0, condorAudio.volume - 0.1);
        if (condorAudio.volume === 0) {
            clearInterval(fadeOut);
            condorAudio.pause();
            ambientAudio.volume = 0;
            ambientAudio.play();
            const fadeIn = setInterval(() => {
                ambientAudio.volume = Math.min(1, ambientAudio.volume + 0.1);
                if (ambientAudio.volume === 1) {
                    clearInterval(fadeIn);
                }
            }, 100);
        }
    }, 100);
}

// Level 6: Merge/Drag
function setupLevel6() {
    // Drag functionality
}

function resetLevel6() {
    const target = document.getElementById('merge-target');
    const pieces = document.getElementById('merge-pieces');
    
    target.innerHTML = '';
    pieces.innerHTML = '';
    
    // Create draggable pieces
    const pieceSymbols = ['◐', '◑', '◒', '◓'];
    pieceSymbols.forEach((symbol, index) => {
        const piece = document.createElement('div');
        piece.className = 'merge-piece';
        piece.textContent = symbol;
        piece.dataset.index = index;
        piece.draggable = true;
        
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            piece.classList.add('dragging');
        });
        
        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
        });
        
        // Touch support
        let touchStartX, touchStartY;
        piece.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            piece.classList.add('dragging');
        });
        
        piece.addEventListener('touchend', (e) => {
            piece.classList.remove('dragging');
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const targetRect = target.getBoundingClientRect();
            if (touchEndX >= targetRect.left && touchEndX <= targetRect.right &&
                touchEndY >= targetRect.top && touchEndY <= targetRect.bottom) {
                placePiece(piece, target);
            }
        });
        
        pieces.appendChild(piece);
    });
    
    target.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    target.addEventListener('drop', (e) => {
        e.preventDefault();
        const index = e.dataTransfer.getData('text/plain');
        const piece = document.querySelector(`.merge-piece[data-index="${index}"]`);
        if (piece && !piece.classList.contains('placed')) {
            placePiece(piece, target);
        }
    });
}

function placePiece(piece, target) {
    if (target.children.length < 4) {
        const clone = piece.cloneNode(true);
        clone.classList.add('placed');
        clone.style.position = 'absolute';
        clone.style.left = (target.children.length % 2) * 100 + 'px';
        clone.style.top = Math.floor(target.children.length / 2) * 100 + 'px';
        clone.draggable = false;
        target.appendChild(clone);
        
        if (target.children.length === 4) {
            checkLevel6();
        }
    }
}

function resetLevel6() {
    const targetTL = document.getElementById('merge-target-tl');
    const targetTR = document.getElementById('merge-target-tr');
    const targetBL = document.getElementById('merge-target-bl');
    const targetBR = document.getElementById('merge-target-br');
    const pieces = document.getElementById('merge-pieces');

    if (!targetTL || !pieces) return;

    // Clear targets and add labels for visual guidance
    [targetTL, targetTR, targetBL, targetBR].forEach((t, idx) => {
        if (t) {
            t.innerHTML = ['<span style="font-size:0.7rem; opacity:0.5;">TOP-LEFT</span>', '<span style="font-size:0.7rem; opacity:0.5;">TOP-RIGHT</span>', '<span style="font-size:0.7rem; opacity:0.5;">BOTTOM-LEFT</span>', '<span style="font-size:0.7rem; opacity:0.5;">BOTTOM-RIGHT</span>'][idx];
            t.style.backgroundImage = 'none';
            t.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
            t.removeAttribute('data-filled');
            t.removeAttribute('data-index');
        }
    });
    pieces.innerHTML = '';

    // Create draggable pieces for each plano image
    const planosImages = ['image/planos.png', 'image/planos2.png', 'image/planos3.png', 'image/planos4.png'];
    
    // Shuffle the order so pieces are randomized
    const shuffledOrder = [...planosImages].sort(() => Math.random() - 0.5);
    
    shuffledOrder.forEach((src, displayPos) => {
        const actualIndex = planosImages.indexOf(src);
        const piece = document.createElement('div');
        piece.className = 'merge-piece';
        piece.dataset.index = actualIndex;
        piece.draggable = true;
        piece.style.backgroundImage = `url(${src})`;
        piece.title = `Piece ${actualIndex}: ${['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'][actualIndex]}`;
        piece.textContent = ''; // no symbol, just image

        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', actualIndex);
            piece.classList.add('dragging');
            piece.style.opacity = '0.6';
        });

        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
            piece.style.opacity = '1';
        });

        // Touch support
        let touchOffsetX = 0, touchOffsetY = 0;
        piece.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = piece.getBoundingClientRect();
            touchOffsetX = touch.clientX - rect.left;
            touchOffsetY = touch.clientY - rect.top;
            piece.classList.add('dragging');
            piece.style.opacity = '0.6';
        });

        piece.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        piece.addEventListener('touchend', (e) => {
            piece.classList.remove('dragging');
            piece.style.opacity = '1';
            const touch = e.changedTouches[0];
            
            const targets = [targetTL, targetTR, targetBL, targetBR];
            for (let target of targets) {
                if (!target) continue;
                const rect = target.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    placePieceInTarget(actualIndex, target);
                    return;
                }
            }
        });

        pieces.appendChild(piece);
    });

    // Set up drop zones
    const targetMap = [targetTL, targetTR, targetBL, targetBR];
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    targetMap.forEach((target, pos) => {
        if (target) {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                target.style.boxShadow = '0 0 20px rgba(184, 134, 11, 0.4), inset 0 0 10px rgba(184, 134, 11, 0.2)';
                target.style.background = 'rgba(184, 134, 11, 0.15)';
            });

            target.addEventListener('dragleave', (e) => {
                target.style.background = target.getAttribute('data-filled') ? 'rgba(184, 134, 11, 0.08)' : 'rgba(184, 134, 11, 0.02)';
                target.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.style.background = 'rgba(184, 134, 11, 0.08)';
                target.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
                const index = parseInt(e.dataTransfer.getData('text/plain'), 10);
                placePieceInTarget(index, target);
            });
        }
    });
}

function placePieceInTarget(index, target) {
    if (target.hasAttribute('data-filled')) {
        // Replace existing piece
        const oldIndex = parseInt(target.getAttribute('data-index'), 10);
        const oldPiece = document.querySelector(`.merge-piece[data-index="${oldIndex}"]`);
        if (oldPiece && !oldPiece.classList.contains('placed')) {
            // piece returned to pool, do nothing
        }
    }

    // Check if piece already placed elsewhere
    const allTargets = [
        document.getElementById('merge-target-tl'),
        document.getElementById('merge-target-tr'),
        document.getElementById('merge-target-bl'),
        document.getElementById('merge-target-br')
    ];

    for (let t of allTargets) {
        if (t && t !== target && t.hasAttribute('data-filled') && t.getAttribute('data-index') == index) {
            t.removeAttribute('data-filled');
            t.removeAttribute('data-index');
            t.innerHTML = '';
            t.style.backgroundImage = 'none';
            t.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
        }
    }

    const src = ['image/planos.png', 'image/planos2.png', 'image/planos3.png', 'image/planos4.png'][index];

    target.setAttribute('data-filled', 'true');
    target.setAttribute('data-index', index);
    target.style.backgroundImage = `url(${src})`;
    target.innerHTML = '';
    target.style.boxShadow = '0 0 15px rgba(184, 134, 11, 0.3), inset 0 0 10px rgba(0,0,0,0.5)';

    // Check if solution is correct
    checkLevel6();
}

function checkLevel6() {
    const targetTL = document.getElementById('merge-target-tl');
    const targetTR = document.getElementById('merge-target-tr');
    const targetBL = document.getElementById('merge-target-bl');
    const targetBR = document.getElementById('merge-target-br');

    const targets = [targetTL, targetTR, targetBL, targetBR];
    const filled = targets.map(t => t && t.getAttribute('data-index') ? parseInt(t.getAttribute('data-index'), 10) : -1);

    if (filled.every(f => f > -1)) {
        // All filled - check order: TL=0, TR=1, BL=2, BR=3
        if (filled[0] === 0 && filled[1] === 1 && filled[2] === 2 && filled[3] === 3) {
            solveLevel(6);
        } else {
            showError();
            // Reset on wrong order
            setTimeout(() => resetLevel6(), 900);
        }
    }
}

// Level 7: Final Phrase
function setupLevel7() {
    const submitBtn = document.getElementById('final-submit');
    const inputEl = document.getElementById('final-input');
    const showHintsBtn = document.getElementById('show-hints-btn');
    const resetBtn = document.getElementById('reset-attempt-btn');

    if (submitBtn && inputEl) {
        submitBtn.addEventListener('click', () => {
            const input = inputEl.value.toUpperCase().trim();
            if (input === levels[6].solution) {
                solveLevel(7);
            } else {
                showError();
                inputEl.value = '';
            }
        });

        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }

    if (showHintsBtn) {
        showHintsBtn.addEventListener('click', () => {
            // Show discovered letters in a simple toast/alert
            const lettersFound = revealedLetters.map((l, i) => l ? l : '_').join(' ');
            const wordsFound = discoveredWords.join(', ');
            alert(`Letters found: ${lettersFound}\n\nWords found: ${wordsFound || 'None yet'}`);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset to Level 1? All progress will be lost.')) {
                localStorage.clear();
                currentLevel = 1;
                unlockedLevel = 1;
                hintsUsed = 0;
                discoveredWords = [];
                revealedLetters = Array(finalWord.length).fill('');
                updateWordsHUD();
                startGame();
            }
        });
    }
}

// Level Solving
function solveLevel(levelNum) {
    const level = levels[levelNum - 1];
    if (level.onSolve) {
        level.onSolve();
    }

    // Unlock next level (saved separately from currentLevel)
    if (levelNum + 1 > unlockedLevel) {
        unlockedLevel = levelNum + 1;
    }

    document.getElementById('success-text').textContent = level.title + " solved.";
    document.getElementById('success-message').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';

    if (levelNum < levels.length) {
        document.getElementById('next-level-btn').textContent = 'Next Level';
    } else {
        document.getElementById('next-level-btn').textContent = 'Finish';
    }

    // Update HUD and persist progress
    updateWordsHUD();
    saveProgress();
    checkContinueButton();


} 

function nextLevel() {
    document.getElementById('success-message').style.display = 'none';

    // Prevent skipping ahead — require that next level is unlocked
    if (unlockedLevel < currentLevel + 1) {
        showError();
        return;
    }

    if (currentLevel < levels.length) {
        loadLevel(currentLevel + 1);
    } else {
        showVideoScreen();
    }
}

function showError() {
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('success-message').style.display = 'none';
    
    // Vibration effect (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    // Shake animation
    document.body.classList.add('error-vibrate');
    setTimeout(() => {
        document.body.classList.remove('error-vibrate');
    }, 500);
}

// Generic success helper used by level onSolve callbacks
function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const errorEl = document.getElementById('error-message');

    if (successText && message) successText.textContent = message;
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'block';

    // small success vibration & visual cue
    if (navigator.vibrate) navigator.vibrate([50, 30]);
    document.body.classList.add('success-glow');
    setTimeout(() => document.body.classList.remove('success-glow'), 700);
}

/* UI helpers */
function updateWordsHUD() {
    let hud = document.getElementById('words-hud');
    if (!hud) {
        const container = document.querySelector('.progress-indicator');
        hud = document.createElement('div');
        hud.id = 'words-hud';
        hud.style.fontSize = '0.8rem';
        hud.style.color = 'var(--text-secondary)';
        hud.style.marginTop = '6px';
        container.appendChild(hud);
    }
    const wordsText = discoveredWords.length ? 'Words: ' + discoveredWords.join(', ') : '';
    const lettersText = 'Letters: ' + revealedLetters.map(l => l || '_').join(' ');
    hud.innerHTML = `${wordsText}<div style="margin-top:6px; font-size:0.85rem;">${lettersText}</div>`;

    // also update final blanks UI
    updateFinalBlanks();
}

function updateFinalBlanks() {
    const container = document.getElementById('final-blanks');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < finalWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'final-slot';
        if (revealedLetters[i]) {
            slot.classList.add('revealed');
            slot.textContent = revealedLetters[i];
        } else {
            slot.textContent = '';
        }
        container.appendChild(slot);
    }
}

function showLetterReveal(levelNum) {
    // levelNum is 1-based
    const idx = levelNum - 1;
    if (revealedLetters[idx]) {
        return; // already revealed, skip toast
    }

    const letter = finalWord.charAt(idx).toUpperCase();
    revealedLetters[idx] = letter;

    // Show simple toast animation
    const toast = document.getElementById('letter-toast');
    const toastChar = document.getElementById('letter-toast-char');
    if (toast && toastChar) {
        toastChar.textContent = letter;
        toast.style.display = 'block';
        toast.style.animation = 'toastPop 0.6s ease-out';

        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 500);
        }, 1400);
    }

    updateWordsHUD();
    saveProgress();
}
 

// Audio Management
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-toggle');
    
    if (soundEnabled) {
        enableSound();
        btn.textContent = '🔊';
    } else {
        disableSound();
        btn.textContent = '🔇';
    }
    
    saveProgress();
}

function enableSound() {
    ambientAudio.volume = 0.3;
    if (currentLevel !== 5) {
        ambientAudio.play().catch(e => console.log('Audio autoplay prevented'));
    }
}

function disableSound() {
    ambientAudio.pause();
    condorAudio.pause();
    ambientAudio.currentTime = 0;
    condorAudio.currentTime = 0;
}

// Hint System
function showHint() {
    if (hintsUsed >= 3) {
        alert('You have used all available hints.');
        return;
    }
    
    const level = levels[currentLevel - 1];
    document.getElementById('hint-text').textContent = level.hint;
    document.getElementById('hints-used').textContent = hintsUsed + 1;
    document.getElementById('hint-modal').style.display = 'flex';
    
    hintsUsed++;
    saveProgress();
}

function closeHint() {
    document.getElementById('hint-modal').style.display = 'none';
}

// Video Screen
function showVideoScreen() {
    showScreen('video-screen');
    const video = document.getElementById('final-video');
    video.play().catch(e => console.log('Video autoplay prevented'));
    
    // Fade back to ambient audio
    if (soundEnabled) {
        fadeToAmbient();
    }
}

function restartGame() {
    if (confirm('Are you sure you want to restart? All progress will be lost.')) {
        localStorage.clear();
        currentLevel = 1;
        unlockedLevel = 1;
        hintsUsed = 0;
        discoveredWords = [];
        updateWordsHUD();
        showScreen('menu-screen');
        document.getElementById('continue-btn').style.display = 'none';
    }
}


