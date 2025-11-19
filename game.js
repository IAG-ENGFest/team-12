// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const LANE_WIDTH = 150;
const SPRITE_SIZE = 64; // Increased from 32
const PLAYER_LANES = 3;
const PASSENGER_LANE = 3;
const LANE_TRANSITION_TIME = 300; // ms
const COLLISION_MARGIN = 0.8; // 80% of sprite
const TICKET_ALIGNMENT_MARGIN = 30; // pixels (increased for larger sprites)
const INVINCIBILITY_TIME = 1000; // ms
const DIFFICULTY_INTERVAL = 30000; // 30 seconds

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let canvas, ctx;
let player;
let obstacles = [];
let passengers = [];
let tickets = [];
let score = 0;
let lives = 3;
let gameTime = 0;
let difficultyLevel = 1;
let lastDifficultyIncrease = 0;
let keys = {};

// Sprite images
let playerImage = new Image();
let suitcaseObstacle = new Image();
let passengerManImage = new Image();
let passengerWomanImage = new Image();
let ticketCanvas;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Load images
    playerImage.src = 'checkin-agent.png';
    suitcaseObstacle.src = 'suitcase-obstacle.png';
    passengerManImage.src = 'passenger-man.png';
    passengerWomanImage.src = 'passenger-woman.png';

    // Create programmatic sprites
    createTicketSprite();

    // Initialize player
    player = new Player();

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Prepare background music element
    const bgMusic = document.getElementById('bg-music');
    // Ensure audioContext is resumed on first user gesture
    function resumeAudio() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        document.removeEventListener('keydown', resumeAudio);
        document.removeEventListener('click', resumeAudio);
    }
    document.addEventListener('keydown', resumeAudio);
    document.addEventListener('click', resumeAudio);

    // Start game loop
    gameLoop();
}

// Create ticket sprite programmatically
function createTicketSprite() {
    ticketCanvas = document.createElement('canvas');
    ticketCanvas.width = 32;
    ticketCanvas.height = 24;
    const tCtx = ticketCanvas.getContext('2d');

    // Draw 8-bit ticket - scaled 2x
    tCtx.fillStyle = '#FFFFFF';
    tCtx.fillRect(0, 0, 32, 24);
    tCtx.strokeStyle = '#000000';
    tCtx.lineWidth = 2;
    tCtx.strokeRect(0, 0, 32, 24);

    // Ticket details
    tCtx.fillStyle = '#FF0000';
    tCtx.fillRect(4, 4, 24, 4);
    tCtx.fillStyle = '#0000FF';
    tCtx.fillRect(4, 10, 24, 4);
    tCtx.fillRect(4, 16, 12, 4);
}

// Player class
class Player {
    constructor() {
        this.lane = 1; // 0, 1, 2
        this.targetLane = 1;
        this.x = this.getLaneX(1);
        // Increase visual height by ~10% while keeping logical base alignment
        this.height = Math.round(SPRITE_SIZE * 1.1);
        this.width = SPRITE_SIZE;
        this.y = CANVAS_HEIGHT - this.height - 50; // Bottom of screen adjusted for new height
        this.targetX = this.x;
        this.transitionStart = 0;
        this.invincible = false;
        this.invincibleUntil = 0;
    }

    getLaneX(lane) {
        return 100 + lane * LANE_WIDTH;
    }

    update(deltaTime) {
        // Smooth lane transition (horizontal movement)
        if (this.lane !== this.targetLane) {
            const elapsed = Date.now() - this.transitionStart;
            const progress = Math.min(elapsed / LANE_TRANSITION_TIME, 1);
            const startX = this.getLaneX(this.lane);
            const endX = this.getLaneX(this.targetLane);
            this.x = startX + (endX - startX) * easeInOutQuad(progress);

            if (progress >= 1) {
                this.lane = this.targetLane;
                this.x = this.getLaneX(this.lane);
            }
        }

        // Update invincibility
        if (this.invincible && Date.now() > this.invincibleUntil) {
            this.invincible = false;
        }
    }

    moveLane(direction) {
        if (this.lane === this.targetLane) {
            this.targetLane = Math.max(0, Math.min(PLAYER_LANES - 1, this.lane + direction));
            if (this.targetLane !== this.lane) {
                this.transitionStart = Date.now();
            }
        }
    }

    throwTicket() {
        tickets.push(new Ticket(this.x + this.width, this.y + this.height / 2));
        // Play sound (will implement later)
    }

    hit() {
        if (!this.invincible) {
            lives--;
            this.invincible = true;
            this.invincibleUntil = Date.now() + INVINCIBILITY_TIME;
            playCollisionSound();

            if (lives <= 0) {
                gameState = 'gameOver';
                document.getElementById('final-score-value').textContent = score;
                document.getElementById('game-over-screen').classList.remove('hidden');
            }
        }
    }

    draw() {
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            return; // Flashing effect
        }
        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
    }
}

// Obstacle class
class Obstacle {
    constructor(lane) {
        this.lane = lane;
        this.x = 100 + lane * LANE_WIDTH;
        this.y = -SPRITE_SIZE;
        this.width = SPRITE_SIZE;
        this.height = SPRITE_SIZE;
        this.speed = 2 + difficultyLevel * 0.5;
        this.sprite = suitcaseObstacle;
    }

    update(deltaTime) {
        this.y += this.speed;
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }

    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}

// Passenger class
class Passenger {
    constructor() {
        this.x = 100 + PASSENGER_LANE * LANE_WIDTH;
        this.y = -SPRITE_SIZE;
        this.width = SPRITE_SIZE;
        this.height = SPRITE_SIZE;
        this.speed = 1.5 + difficultyLevel * 0.3;
        this.hasTicket = false;
        this.sprite = Math.random() > 0.5 ? passengerManImage : passengerWomanImage;
    }

    update(deltaTime) {
        this.y += this.speed;
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }

    receiveTicket() {
        this.hasTicket = true;
        score += 10;
        playDeliverySound();
    }

    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        if (this.hasTicket) {
            // Draw checkmark
            ctx.fillStyle = '#00FF00';
            ctx.font = '32px Arial';
            ctx.fillText('✓', this.x + 10, this.y - 10);
        }
    }
}

// Ticket class
class Ticket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 24;
        this.speed = 6;
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.speed; // Move horizontally to the right
    }

    isOffScreen() {
        return this.x > CANVAS_WIDTH; // Off right side of screen
    }

    draw() {
        ctx.drawImage(ticketCanvas, this.x, this.y - this.height / 2, this.width, this.height);
    }
}

// Collision detection
function checkCollisions() {
    // Player vs obstacles
    obstacles.forEach(obstacle => {
        if (player.lane === obstacle.lane && !player.invincible) {
            if (rectCollision(
                player.x, player.y, player.width * COLLISION_MARGIN, player.height * COLLISION_MARGIN,
                obstacle.x, obstacle.y, obstacle.width * COLLISION_MARGIN, obstacle.height * COLLISION_MARGIN
            )) {
                player.hit();
            }
        }
    });

    // Tickets vs passengers
    tickets.forEach(ticket => {
        if (!ticket.active) return;

        passengers.forEach(passenger => {
            if (passenger.hasTicket) return;

            // Check Y alignment with margin (vertical alignment for horizontal throw)
            const yDiff = Math.abs((ticket.y) - (passenger.y + passenger.height / 2));

            if (yDiff < TICKET_ALIGNMENT_MARGIN) {
                if (rectCollision(
                    ticket.x, ticket.y - ticket.height / 2, ticket.width, ticket.height,
                    passenger.x, passenger.y, passenger.width, passenger.height
                )) {
                    passenger.receiveTicket();
                    ticket.active = false;
                }
            }
        });
    });
}

function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Spawning
let lastObstacleSpawn = 0;
let lastPassengerSpawn = 0;

function spawnObstacle() {
    const now = Date.now();
    const spawnInterval = Math.max(800, 2000 - difficultyLevel * 200);

    if (now - lastObstacleSpawn > spawnInterval) {
        const lane = Math.floor(Math.random() * PLAYER_LANES);
        obstacles.push(new Obstacle(lane));
        lastObstacleSpawn = now;
    }
}

function spawnPassenger() {
    const now = Date.now();
    const spawnInterval = Math.max(2000, 4000 - difficultyLevel * 300);

    if (now - lastPassengerSpawn > spawnInterval) {
        passengers.push(new Passenger());
        lastPassengerSpawn = now;
    }
}

// Difficulty progression
function updateDifficulty() {
    if (gameTime - lastDifficultyIncrease >= DIFFICULTY_INTERVAL) {
        difficultyLevel++;
        lastDifficultyIncrease = gameTime;
    }
}

// Input handling
function handleKeyDown(e) {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();

        if (gameState === 'start') {
            startGame();
        } else if (gameState === 'playing') {
            player.throwTicket();
        } else if (gameState === 'gameOver') {
            resetGame();
        }
    }

    if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') {
            player.moveLane(-1);
        } else if (e.key === 'ArrowRight') {
            player.moveLane(1);
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// Game flow
function startGame() {
    gameState = 'playing';
    document.getElementById('start-screen').classList.add('hidden');
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && bgMusic.paused) {
        bgMusic.volume = 0.35;
        bgMusic.play().catch(() => { });
    }
}

function resetGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    gameTime = 0;
    difficultyLevel = 1;
    lastDifficultyIncrease = 0;
    obstacles = [];
    passengers = [];
    tickets = [];
    player = new Player();
    document.getElementById('game-over-screen').classList.add('hidden');
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && bgMusic.paused) {
        bgMusic.currentTime = 0;
        bgMusic.volume = 0.35;
        bgMusic.play().catch(() => { });
    }
}

// Easing function
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Sound effects (basic Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playDeliverySound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playCollisionSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 150;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Game loop
let lastTime = 0;

function gameLoop(currentTime = 0) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw lanes
    drawLanes();

    if (gameState === 'playing') {
        gameTime += deltaTime;

        // Update
        player.update(deltaTime);

        obstacles.forEach(obs => obs.update(deltaTime));
        passengers.forEach(pass => pass.update(deltaTime));
        tickets.forEach(ticket => ticket.update(deltaTime));

        // Remove off-screen entities
        obstacles = obstacles.filter(obs => !obs.isOffScreen());
        passengers = passengers.filter(pass => !pass.isOffScreen());
        tickets = tickets.filter(ticket => ticket.active && !ticket.isOffScreen());

        // Spawn
        spawnObstacle();
        spawnPassenger();

        // Collision
        checkCollisions();

        // Difficulty
        updateDifficulty();

        // Draw entities
        player.draw();
        obstacles.forEach(obs => obs.draw());
        passengers.forEach(pass => pass.draw());
        tickets.forEach(ticket => ticket.draw());

        // Draw HUD
        drawHUD();
    }

    requestAnimationFrame(gameLoop);
}

function drawLanes() {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    for (let i = 0; i <= PLAYER_LANES; i++) {
        const x = 100 + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

function drawHUD() {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px monospace';

    // Score
    ctx.fillText(`Score: ${score}`, 20, 30);

    // Lives
    ctx.fillText('Lives:', CANVAS_WIDTH / 2 - 50, 30);
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(CANVAS_WIDTH / 2 + 10 + i * 30, 15, 20, 20);
    }

    // Timer until next difficulty
    const timeUntilNext = Math.ceil((DIFFICULTY_INTERVAL - (gameTime - lastDifficultyIncrease)) / 1000);
    ctx.fillStyle = '#000000';
    ctx.fillText(`Next: ${timeUntilNext}s`, CANVAS_WIDTH - 150, 30);
    ctx.fillText(`Level: ${difficultyLevel}`, CANVAS_WIDTH - 150, 55);
}

// Start game when page loads
window.addEventListener('load', init);
