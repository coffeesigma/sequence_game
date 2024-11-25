const grid = document.getElementById('game-grid');
const startButton = document.getElementById('start-game-button');
const levelIndicator = document.getElementById('level-indicator');
const message = document.getElementById('message');
const inputMessage = document.getElementById('input-message');
const userInfoForm = document.getElementById('user-info');
const submitUserInfoButton = document.getElementById('submit-user-info');
const infoMessage = document.getElementById('info-message');
const gameModeInput = document.getElementById('mode-input');
const gameModeSelect = document.getElementById('game-mode');
let gridSize = 3;
let totalSteps = 1;
let currentStep = 0;
let sequence = [];
let userSequence = [];
let testData = [];
let userInfo = {};
let currentTime = 0;
let gameMode = 1;

// Create grid
function createGrid(size) {
    grid.innerHTML = ''; // Clear previous grid
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }
}

// Start new level
function startLevel() {
    sequence = [];
    userSequence = [];
    currentStep = 0;

    // Update level indicator
    levelIndicator.textContent = `Level ${totalSteps}`;
    levelIndicator.style.display = 'block';
    message.style.visibility = 'hidden';
    grid.style.pointerEvents = 'none'; // Disable clicks during sequence display
    gameModeInput.style.display = 'none';
    infoMessage.style.display = 'none';

    // Generate random sequence
    const totalCells = gridSize * gridSize;
    while (sequence.length < totalSteps) {
        const randomIndex = Math.floor(Math.random() * totalCells);
        if (!sequence.includes(randomIndex)) {
            sequence.push(randomIndex);
        }
        else if (sequence.length === 9 && totalSteps === 10) {
            sequence.push(randomIndex);
        }
    }

    setTimeout(() => {
        showSequence();
    }, 1000); // Add delay before showing sequence
}

// Show the sequence to memorize
function showSequence() {
    sequence.forEach((num, idx) => {
        setTimeout(() => {
            grid.children[num].classList.add('highlight');
            setTimeout(() => grid.children[num].classList.remove('highlight'), 500);
            setTimeout(() => {
                if (idx === sequence.length - 1) {
                    inputMessage.style.visibility = 'visible';
                    setTimeout(() => {
                        inputMessage.style.visibility = 'hidden';
                    }, 1000);
                    currentTime = new Date().getTime();
                }
            }, 1000);
        }, idx * 800);
    });

    setTimeout(() => {
        grid.style.pointerEvents = 'auto'; // Enable clicks after sequence display
    }, sequence.length * 800);
}

// Handle user input
grid.addEventListener('click', (e) => {
    const index = Array.from(grid.children).indexOf(e.target);
    if (index === -1) return;

    setTimeout(() => {
        grid.children[index].classList.add('highlight');
        setTimeout(() => grid.children[index].classList.remove('highlight'), 500);
    }, 0);

    if (sequence[currentStep] === index) {
        currentStep++;
        if (currentStep === sequence.length) {
            grid.style.pointerEvents = 'none'; // Disable clicks after completing the level
            const runningTime = new Date().getTime() - currentTime;
            testData.push({ grid_size: gridSize, level: totalSteps, error_rate: 0, user_name: userInfo, run_time: runningTime });
            setTimeout(nextStep, 1000); // Add delay before next step
        }
    } else {
        // User got it wrong
        grid.style.pointerEvents = 'none'; // Disable further clicks
        const errorRate = 1 - currentStep / totalSteps;
        const runningTime = new Date().getTime() - currentTime;
        testData.push({ grid_size: gridSize, level: totalSteps, error_rate: errorRate, user_name: userInfo, run_time: runningTime });
        message.style.visibility = 'visible';
        setTimeout(nextStep, 2000); // Add delay before next step
    }
});

// Proceed to next step
function nextStep() {
    totalSteps++;
    if (totalSteps > 10) {
        if (gameMode === 1) {
            if (gridSize === 3) {
                gridSize = 4; // Move to 4x4
                totalSteps = 1;
            } else if (gridSize === 4) {
                gridSize = 5; // Move to 5x5
                totalSteps = 1;
            } else {
                sendTestData();
                return;
            }
        } else if (gameMode === 2) {
            if (gridSize === 5) {
                gridSize = 4; // Move to 4x4
                totalSteps = 1;
            } else if (gridSize === 4) {
                gridSize = 3; // Move to 3x3
                totalSteps = 1;
            } else {
                sendTestData();
                return;
            }
        }
    }
    createGrid(gridSize);
    startLevel();
}

// Send test data to server
function sendTestData() {
    fetch('http://3.133.191.166:8080/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
    })
        .then(response => response.json())
        .then(data => {
            alert('Test completed and data sent successfully!');
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });
}

// Start game
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    createGrid(gridSize);
    startLevel();
});

// Handle user info submission
submitUserInfoButton.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
        userInfo = username;
        userInfoForm.style.display = 'none';
        startButton.style.display = 'block';
        gameMode = parseInt(gameModeSelect.value);
        gridSize = gameMode === 1 ? 3 : 5; // Set grid size based on game mode
    } else {
        alert('Please enter your name.');
    }
});