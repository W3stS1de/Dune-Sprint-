// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const crystalsEl = document.getElementById('crystals');
const highScoreEl = document.getElementById('highScore');


let gameInitialized = false;


let audioEnabled = false;

function initAudio() {
    try {
        window.backgroundMusic = new Audio();
        window.backgroundMusic.loop = true;
        window.backgroundMusic.volume = 0.3;
        
        window.jumpSound = new Audio();
        window.jumpSound.volume = 0.4;
        
        window.crystalSound = new Audio();
        window.crystalSound.volume = 0.5;
        
        window.gameOverSound = new Audio();
        window.gameOverSound.volume = 0.6;
        
        // Audio 
        window.backgroundMusic.src = 'assets/audio/background_music.mp3';
        window.jumpSound.src = 'assets/audio/jump_sound.mp3';
        window.crystalSound.src = 'assets/audio/crystal_sound.mp3';
        window.gameOverSound.src = 'assets/audio/gameover_sound.mp3';
        
        window.backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Background music loaded');
            audioEnabled = true;
        });
        
        window.backgroundMusic.addEventListener('error', () => {
            console.log('Background music not found');
        });
        
    } catch (error) {
        console.log('Audio initialization error:', error);
    }
}


function playBackgroundMusic() {
    if (audioEnabled && window.backgroundMusic) {
        window.backgroundMusic.currentTime = 0;
        window.backgroundMusic.play().catch(e => {
            console.log('Auto-play blocked by browser');
        });
    } else {
        console.log('Background music (file not found)');
    }
}

function stopBackgroundMusic() {
    if (window.backgroundMusic) {
        window.backgroundMusic.pause();
        window.backgroundMusic.currentTime = 0;
    }
}

function playJumpSound() {
    if (audioEnabled && window.jumpSound) {
        window.jumpSound.currentTime = 0;
        window.jumpSound.play().catch(e => console.log('Jump sound error:', e));
    } else {
        console.log('Jump sound (file not found)');
    }
}

function playCrystalSound() {
    if (audioEnabled && window.crystalSound) {
        window.crystalSound.currentTime = 0;
        window.crystalSound.play().catch(e => console.log('Crystal sound error:', e));
    } else {
        console.log('Crystal sound (file not found)');
    }
}

function playGameOverSound() {
    if (audioEnabled && window.gameOverSound) {
        window.gameOverSound.currentTime = 0;
        window.gameOverSound.play().catch(e => console.log('Game over sound error:', e));
    } else {
        console.log('Game over sound (file not found)');
    }
}


initAudio();

// Game State
let gameRunning = false;
let gameOver = false;
let score = 0;
let crystalsCollected = 0;
let highScore = 0; 
highScoreEl.textContent = highScore;

// Ground level 
const GROUND_Y = 350;
const PLAYER_GROUND_Y = 365;

// Player Object
const player = {
    x: 100,
    y: PLAYER_GROUND_Y - 80,
    width: 100,
    height: 80,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -15,
    doubleJumpAvailable: true,
    color: '#00ff00'
};


const playerImages = {};
const enemyImages = {};
const enemy2Images = {};
const scorpionImages = {};
const dinoImages = {};
const obstacleImages = {};
const backgrounds = {};


function loadBackgroundSilently() {
    const img = new Image();
    img.onload = function() {
        backgrounds.current = img;
        console.log('Background loaded silently');
        
        if (!gameRunning) {
            drawStartScreen();
        }
    };
    img.onerror = function() {
        console.log('Background failed to load, using fallback');
    };
    img.src = 'assets/backgrounds/background1.png';
}


function loadImageSilently(src, targetObject, propertyName) {
    const img = new Image();
    img.onload = function() {
        targetObject[propertyName] = img;
        console.log('Loaded:', propertyName);
    };
    img.onerror = function() {
        console.log('Failed to load:', propertyName);
    };
    img.src = src;
}


function startBackgroundLoading() {
    // Load background
    loadBackgroundSilently();
    
    // Load player images
    loadImageSilently('assets/player/player_left_step1.png', playerImages, 'leftStep1');
    loadImageSilently('assets/player/player_left_step2.png', playerImages, 'leftStep2');
    loadImageSilently('assets/player/player_right_step1.png', playerImages, 'rightStep1');
    loadImageSilently('assets/player/player_right_step2.png', playerImages, 'rightStep2');
    loadImageSilently('assets/player/player_jump.png', playerImages, 'jump');
    loadImageSilently('assets/player/player_double_jump.png', playerImages, 'doubleJump');
    
    // Load enemy images
    loadImageSilently('assets/enemies/enemy_walk1.png', enemyImages, 'fly1');
    loadImageSilently('assets/enemies/enemy_walk2.png', enemyImages, 'fly2');
    loadImageSilently('assets/enemies/enemy_attack.png', enemyImages, 'attack');
    loadImageSilently('assets/enemies/bird2_fly1.png', enemy2Images, 'fly1');
    loadImageSilently('assets/enemies/bird2_fly2.png', enemy2Images, 'fly2');
    loadImageSilently('assets/enemies/bird2_attack.png', enemy2Images, 'attack');
    loadImageSilently('assets/enemies/scorpion_run1.png', scorpionImages, 'run1');
    loadImageSilently('assets/enemies/scorpion_run2.png', scorpionImages, 'run2');
    loadImageSilently('assets/enemies/scorpion_run3.png', scorpionImages, 'run3');
    loadImageSilently('assets/enemies/dino_run1.png', dinoImages, 'run1');
    loadImageSilently('assets/enemies/dino_run2.png', dinoImages, 'run2');
    
    // Load obstacle images
    loadImageSilently('assets/obstacles/cactus1.png', obstacleImages, 'cactus1');
    loadImageSilently('assets/obstacles/cactus2.png', obstacleImages, 'cactus2');
    loadImageSilently('assets/obstacles/rock1.png', obstacleImages, 'rock1');
    loadImageSilently('assets/obstacles/rock2.png', obstacleImages, 'rock2');
}

// Game Objects Arrays
let obstacles = [];
let crystals = [];
let particles = [];
let stars = [];
let clouds = [];

// Game Variables
let gameSpeed = 5;
let frameCount = 0;
let animationFrame = 0;

// Initialize background elements
function initBackground() {
    // Create stars
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200,
            size: Math.random() * 2,
            brightness: Math.random()
        });
    }

    // Create clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 150,
            width: 80 + Math.random() * 40,
            height: 40,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

// Particle System
class Particle {
    constructor(x, y, color, vx = null, vy = null) {
        this.x = x;
        this.y = y;
        this.vx = vx !== null ? vx : (Math.random() * 4 - 2);
        this.vy = vy !== null ? vy : (Math.random() * 4 - 2);
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life -= 0.02;
        this.size *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Draw Player with smooth fallback
function drawPlayer() {
    const currentImage = getPlayerImage();
    
    if (currentImage && currentImage.complete && currentImage.naturalHeight !== 0) {
        ctx.drawImage(currentImage, player.x, player.y, player.width, player.height);
    } else {
        // Always ready fallback
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 15, player.y + 15, 12, 12);
        ctx.fillRect(player.x + 50, player.y + 15, 12, 12);
        
        // Mouth
        ctx.fillRect(player.x + 20, player.y + 45, 30, 8);
    }
}

function getPlayerImage() {
    if (player.velocityY < 0 && !player.doubleJumpAvailable) {
        return playerImages.doubleJump;
    } else if (player.velocityY !== 0) {
        return playerImages.jump;
    } else {
        const animSpeed = Math.max(6, 15 - Math.floor(gameSpeed));
        const walkCycle = Math.floor(frameCount / animSpeed) % 4;
        
        switch(walkCycle) {
            case 0: return playerImages.leftStep1;
            case 1: return playerImages.leftStep2;
            case 2: return playerImages.rightStep1;
            case 3: return playerImages.rightStep2;
            default: return playerImages.leftStep1;
        }
    }
}

// Enemy Image Functions
function getEnemyImage() {
    const animTime = Math.floor(Date.now() / 300) % 2;
    return animTime === 0 ? enemyImages.fly1 : enemyImages.fly2;
}

function getEnemy2Image() {
    const animTime = Math.floor(Date.now() / 400) % 2;
    return animTime === 0 ? enemy2Images.fly1 : enemy2Images.fly2;
}

function getScorpionImage() {
    const animTime = Math.floor(Date.now() / 200) % 3;
    switch(animTime) {
        case 0: return scorpionImages.run1;
        case 1: return scorpionImages.run2;
        case 2: return scorpionImages.run3;
        default: return scorpionImages.run1;
    }
}

function getDinoImage() {
    const animTime = Math.floor(Date.now() / 200) % 2;
    return animTime === 0 ? dinoImages.run1 : dinoImages.run2;
}

// Draw Flying Bird
function drawFlyingBird(obstacle, birdImage) {
    if (birdImage && birdImage.complete && birdImage.naturalHeight !== 0) {
        let drawWidth = obstacle.displayWidth;
        let drawHeight = obstacle.displayHeight;
        
        const imgAspectRatio = birdImage.naturalWidth / birdImage.naturalHeight;
        const targetAspectRatio = drawWidth / drawHeight;
        
        if (imgAspectRatio > targetAspectRatio) {
            drawHeight = drawWidth / imgAspectRatio;
        } else {
            drawWidth = drawHeight * imgAspectRatio;
        }
        
        const drawX = obstacle.x - (drawWidth - obstacle.width) / 2;
        const drawY = obstacle.y - (drawHeight - obstacle.height) / 2;
        
        ctx.drawImage(birdImage, drawX, drawY, drawWidth, drawHeight);
    } else {
        // Instant fallback
        const color = obstacle.type === 'flying' ? '#9400d3' : '#d39400';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 
                   obstacle.width/2, obstacle.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = obstacle.type === 'flying' ? '#b833ff' : '#ffb833';
        const wingFlap = Math.sin(Date.now() * 0.01) * 5;
        ctx.fillRect(obstacle.x - 10, obstacle.y + obstacle.height/2 + wingFlap, 10, 15);
        ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + obstacle.height/2 - wingFlap, 10, 15);
    }
}

function drawObstacle(obstacle) {
    ctx.save();
    
    switch(obstacle.type) {
        case 'cactus1':
            if (obstacleImages.cactus1 && obstacleImages.cactus1.complete && obstacleImages.cactus1.naturalHeight !== 0) {
                ctx.drawImage(obstacleImages.cactus1, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                // Instant fallback
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(obstacle.x + 15, obstacle.y, 10, obstacle.height);
                ctx.fillRect(obstacle.x + 5, obstacle.y + 20, 15, 8);
                ctx.fillRect(obstacle.x + 25, obstacle.y + 30, 15, 8);
            }
            break;
            
        case 'cactus2':
            if (obstacleImages.cactus2 && obstacleImages.cactus2.complete && obstacleImages.cactus2.naturalHeight !== 0) {
                ctx.drawImage(obstacleImages.cactus2, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(obstacle.x + 12, obstacle.y, 12, obstacle.height);
                ctx.fillRect(obstacle.x + 2, obstacle.y + 15, 12, 6);
                ctx.fillRect(obstacle.x + 24, obstacle.y + 25, 12, 6);
            }
            break;
            
        case 'rock1':
            if (obstacleImages.rock1 && obstacleImages.rock1.complete && obstacleImages.rock1.naturalHeight !== 0) {
                ctx.drawImage(obstacleImages.rock1, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.fillStyle = '#a0845c';
                ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
            }
            break;
            
        case 'rock2':
            if (obstacleImages.rock2 && obstacleImages.rock2.complete && obstacleImages.rock2.naturalHeight !== 0) {
                ctx.drawImage(obstacleImages.rock2, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                ctx.fillStyle = '#756147';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.fillStyle = '#8b7355';
                ctx.fillRect(obstacle.x + 3, obstacle.y + 3, obstacle.width - 6, obstacle.height - 6);
            }
            break;
            
        case 'scorpion':
            if (scorpionImages.run1 && scorpionImages.run1.complete && scorpionImages.run1.naturalHeight !== 0) {
                const currentScorpionImage = getScorpionImage();
                ctx.drawImage(currentScorpionImage, obstacle.x, obstacle.y, obstacle.displayWidth, obstacle.displayHeight);
            } else {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                ctx.fillStyle = '#654321';
                ctx.fillRect(obstacle.x - 10, obstacle.y + 10, 15, 8);
                ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + 10, 15, 8);
                
                ctx.fillRect(obstacle.x + obstacle.width - 15, obstacle.y - 10, 5, 15);
            }
            break;
        
        case 'dinosaur':
            if (dinoImages.run1 && dinoImages.run1.complete && dinoImages.run1.naturalHeight !== 0) {
                const currentDinoImage = getDinoImage();
                ctx.drawImage(currentDinoImage, obstacle.x, obstacle.y, obstacle.displayWidth, obstacle.displayHeight);
            } else {
                ctx.fillStyle = '#4a5d23';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    
                ctx.fillStyle = '#5a6d33';
                ctx.fillRect(obstacle.x + obstacle.width - 30, obstacle.y - 20, 35, 25);
                    
                ctx.fillRect(obstacle.x - 15, obstacle.y + 20, 20, 15);
            }
            break;

        case 'flying':
            drawFlyingBird(obstacle, getEnemyImage());
            break;
            
        case 'flying2':
            drawFlyingBird(obstacle, getEnemy2Image());
            break;
    }
    
    ctx.restore();
}

// Draw Background 
function drawBackground() {
    if (backgrounds.current && backgrounds.current.complete && backgrounds.current.naturalHeight !== 0) {
        ctx.drawImage(backgrounds.current, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        stars.forEach(star => {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + star.brightness + ')';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        
        clouds.forEach(cloud => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.ellipse(cloud.x - cloud.width/3, cloud.y, cloud.width/3, cloud.height/3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.ellipse(cloud.x + cloud.width/3, cloud.y, cloud.width/3, cloud.height/3, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Desert ground
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
    groundGradient.addColorStop(0, '#e8c9a0');
    groundGradient.addColorStop(0.3, '#d4b896');
    groundGradient.addColorStop(0.7, '#c4a47c');
    groundGradient.addColorStop(1, '#b8956b');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Sand dunes
    ctx.fillStyle = 'rgba(196, 164, 124, 0.4)';
    for (let i = 0; i < canvas.width; i += 80) {
        const duneHeight = Math.sin((i + frameCount * 0.5) * 0.02) * 8;
        ctx.beginPath();
        ctx.ellipse(i + 40, GROUND_Y + 15 + duneHeight, 60, 15, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Sand texture
    ctx.fillStyle = 'rgba(220, 195, 165, 0.2)';
    for (let i = 0; i < canvas.width; i += 25) {
        for (let j = GROUND_Y; j < canvas.height; j += 20) {
            const noise = Math.random() * 3;
            ctx.fillRect(i + noise, j + noise, 2, 2);
        }
    }
    
    // Horizon line
    ctx.strokeStyle = '#c4a47c';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#c4a47c';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawCrystal(crystal) {
    ctx.save();
    
    
    if (!crystal.floatOffset) crystal.floatOffset = Math.random() * Math.PI * 2;
    crystal.floatOffset += 0.02;
    const floatY = Math.sin(crystal.floatOffset) * 3;
    
    
    let scale = 1;
    let glowIntensity = 1;
    if (crystal.bonusCrystal) {
        if (!crystal.pulseTime) crystal.pulseTime = 0;
        crystal.pulseTime += 0.1;
        scale = 1 + Math.sin(crystal.pulseTime) * 0.15;
        glowIntensity = 1 + Math.sin(crystal.pulseTime) * 0.5;
    }
    
    // Positioning
    const drawX = crystal.x + crystal.width/2;
    const drawY = crystal.y + crystal.height/2 + floatY;
    
    // Colors
    const mainColor = crystal.bonusCrystal ? '#ffff00' : '#00ffcc';
    const shadowColor = crystal.bonusCrystal ? '#ffd700' : '#00aaaa';
    
    // Draw beautiful IRYS text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fontSize = Math.floor(24 * scale);
    ctx.font = 'bold ' + fontSize + 'px Arial';
    
    if (crystal.bonusCrystal) {
        ctx.shadowBlur = 25 * glowIntensity;
        ctx.shadowColor = mainColor;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 4;
        ctx.strokeText('IRYS', drawX, drawY);
    }
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = shadowColor;
    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = 3;
    ctx.strokeText('IRYS', drawX, drawY);
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = mainColor;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;
    ctx.strokeText('IRYS', drawX, drawY);
    
    const gradient = ctx.createLinearGradient(drawX - 30, drawY - 15, drawX + 30, drawY + 15);
    if (crystal.bonusCrystal) {
        gradient.addColorStop(0, '#ffff88');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ffcc00');
    } else {
        gradient.addColorStop(0, '#88ffff');
        gradient.addColorStop(0.5, '#00ffcc');
        gradient.addColorStop(1, '#00ccaa');
    }
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 5;
    ctx.shadowColor = mainColor;
    ctx.fillText('IRYS', drawX, drawY);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold ' + Math.floor(fontSize * 0.8) + 'px Arial';
    ctx.fillText('IRYS', drawX - 1, drawY - 2);
    
    if (crystal.bonusCrystal) {
        const sparkleCount = 6;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (Math.PI * 2 / sparkleCount) * i + crystal.pulseTime;
            const sparkleX = drawX + Math.cos(angle) * (35 * scale);
            const sparkleY = drawY + Math.sin(angle) * (20 * scale);
            const sparkleSize = 2 + Math.sin(crystal.pulseTime + i) * 1;
            
            ctx.fillStyle = 'rgba(255, 255, 0, ' + (0.5 + Math.sin(crystal.pulseTime + i) * 0.3) + ')';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.strokeStyle = 'rgba(255, 255, 0, ' + (0.3 * glowIntensity) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 40 * scale, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Update Player
function updatePlayer() {
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y > PLAYER_GROUND_Y - player.height) {
        player.y = PLAYER_GROUND_Y - player.height;
        player.velocityY = 0;
        player.doubleJumpAvailable = true;
    }

    if (frameCount % 3 === 0 && player.velocityY < 0 && gameRunning && !gameOver) {
        particles.push(new Particle(
            player.x + player.width / 2,
            player.y + player.height,
            '#00ffcc'
        ));
    }
}

// Weighted random choice
function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }
    return items[items.length - 1];
}

function createObstacle() {
    const types = ['cactus1', 'cactus2', 'rock1', 'rock2', 'flying', 'flying2', 'scorpion', 'dinosaur']; 
    const weights = [18, 18, 10, 10, 8, 8, 18, 27]; 
    
    const type = weightedRandomChoice(types, weights);
    
    let obstacle = {
        x: canvas.width,
        type: type,
        hit: false
    };

    switch(type) {
        case 'cactus1':
            obstacle.y = GROUND_Y - 120 + 25;
            obstacle.width = 80;
            obstacle.height = 120;
            break;
            
        case 'cactus2':
            obstacle.y = GROUND_Y - 100 + 20;
            obstacle.width = 70;
            obstacle.height = 100;
            break;
            
        case 'rock1':
            obstacle.y = GROUND_Y - 90 + 5;
            obstacle.width = 110;
            obstacle.height = 90;
            break;
            
        case 'rock2':
            obstacle.y = GROUND_Y - 70 + 8;
            obstacle.width = 85;
            obstacle.height = 70;
            break;
            
        case 'scorpion':
            obstacle.y = GROUND_Y - 80 + 5;   
            obstacle.width = 120;
            obstacle.height = 80;
            obstacle.displayWidth = 120;
            obstacle.displayHeight = 80;
            break;

        case 'dinosaur':
            obstacle.y = GROUND_Y - 120 + 25;
            obstacle.width = 160;              
            obstacle.height = 120;             
            obstacle.displayWidth = 160;       
            obstacle.displayHeight = 120;      
            break;            
            
        case 'flying':
            obstacle.y = GROUND_Y - 120 - Math.random() * 100;
            obstacle.displayWidth = 80;
            obstacle.displayHeight = 60;
            obstacle.width = 60;
            obstacle.height = 40;
            
            if (Math.random() < 0.6) {
                createBirdCrystal(obstacle, 'bird1');
            }
            break;
            
        case 'flying2':
            obstacle.y = GROUND_Y - 100 - Math.random() * 80;
            obstacle.displayWidth = 100;      
            obstacle.displayHeight = 80;       
            obstacle.width = 80;              
            obstacle.height = 60;              
                
            if (Math.random() < 0.65) {
                createBirdCrystal(obstacle, 'bird2');
            }
            break;
    }

    obstacles.push(obstacle);
}

// Create Crystal
function createCrystal() {
    let attempts = 0;
    let validPosition = false;
    let crystal;
    
    while (!validPosition && attempts < 10) {
        crystal = {
            x: canvas.width,
            y: GROUND_Y - 80 - Math.random() * 150,
            width: 60,  
            height: 30, 
            collected: false
        };
        
        validPosition = true;
        for (let obstacle of obstacles) {
            if (Math.abs(crystal.x - obstacle.x) < 100 && 
                Math.abs(crystal.y - obstacle.y) < 80) {
                validPosition = false;
                break;
            }
        }
        
        attempts++;
    }
    
    if (validPosition) {
        crystals.push(crystal);
    }
}

function createBirdCrystal(birdObstacle, birdType) {
    const distance = 100;
    const angles = [-Math.PI/3, -Math.PI/6, Math.PI/6, Math.PI/3];
    const angle = angles[Math.floor(Math.random() * angles.length)];
    
    const crystal = {
        x: canvas.width + distance,
        y: birdObstacle.y + Math.sin(angle) * 60,
        width: 60,  
        height: 30, 
        collected: false,
        bonusCrystal: true,
        birdType: birdType
    };
    
    crystal.y = Math.max(80, Math.min(crystal.y, GROUND_Y - 80));
    
    if (Math.abs(crystal.y - birdObstacle.y) < 60) {
        crystal.y = birdObstacle.y - 80;
    }
    
    crystals.push(crystal);
}

// Update Obstacles
function updateObstacles() {
    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= gameSpeed;
        
        if (obstacle.type === 'flying') {
            obstacle.y += Math.sin(Date.now() * 0.002) * 2;
        } else if (obstacle.type === 'flying2') {
            obstacle.y += Math.sin(Date.now() * 0.0025 + Math.PI/4) * 2.5;
        }
        
        if (!obstacle.hit) {
            let collision = false;
            
            if (obstacle.type === 'flying' || obstacle.type === 'flying2') {
                collision = checkBirdCollision(player, obstacle);
            } else if (obstacle.type === 'dinosaur') {
                collision = checkDinosaurCollision(player, obstacle);
            } else {
                collision = checkCollision(player, obstacle);
            }
            
            if (collision) {
                gameOver = true;
                createExplosion(player.x + player.width/2, player.y + player.height/2);
            }
        }
        
        return obstacle.x > -obstacle.width;
    });
}

// Update Crystals
function updateCrystals() {
    crystals = crystals.filter(crystal => {
        crystal.x -= gameSpeed;
        
        const baseFloat = Math.sin(Date.now() * 0.003 + crystal.x) * 0.5;
        crystal.y += baseFloat;
        
        if (!crystal.collected && checkCollision(player, crystal)) {
            crystal.collected = true;
            crystalsCollected++;
            const points = crystal.bonusCrystal ? 75 : 50;
            score += points;
            
            createCrystalParticles(
                crystal.x + crystal.width/2, 
                crystal.y + crystal.height/2, 
                crystal.bonusCrystal
            );
            
            playCrystalSound();
            updateUI();
        }
        
        return crystal.x > -crystal.width && !crystal.collected;
    });
}

// Update Background
function updateBackground() {
    stars.forEach(star => {
        star.brightness = 0.5 + Math.sin(Date.now() * 0.001 + star.x) * 0.5;
    });
    
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * 150;
        }
    });
}

// Create Particles
function createCrystalParticles(x, y, isBonus = false) {
    const particleCount = isBonus ? 15 : 10;
    const colors = isBonus ? ['#ffff00', '#ffd700', '#ffcc00'] : ['#00ffcc', '#00aaaa', '#88ffff'];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const speed = 2 + Math.random() * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push(new IRYSParticle(
            x, y, color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            isBonus
        ));
    }
    
    if (isBonus) {
        particles.push(new TextParticle(x, y, '+75', '#ffff00'));
    } else {
        particles.push(new TextParticle(x, y, '+50', '#00ffcc'));
    }
}

class IRYSParticle extends Particle {
    constructor(x, y, color, vx, vy, isBonus = false) {
        super(x, y, color, vx, vy);
        this.isBonus = isBonus;
        this.initialLife = 1;
        this.sparkle = Math.random() * Math.PI * 2;
    }
    
    update() {
        super.update();
        this.sparkle += 0.2;
        
        if (this.isBonus) {
            this.life -= 0.015; 
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        if (this.isBonus) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            
            const sparkleIntensity = Math.sin(this.sparkle) * 0.5 + 0.5;
            ctx.globalAlpha = this.life * sparkleIntensity;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
        }
        
        ctx.restore();
    }
}

class TextParticle {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1;
        this.vy = -2; 
        this.startTime = Date.now();
    }
    
    update() {
        this.y += this.vy;
        this.life -= 0.02;
        this.vy *= 0.98;
    }
    
    draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, '#ff6b6b'));
    }
}

// Update Particles
function updateParticles() {
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
}

// Draw Particles
function drawParticles() {
    particles.forEach(particle => particle.draw());
}

function checkCollision(rect1, rect2) {
    const playerMargin = 15; 
    const obstacleMargin = 12; 
    
    const playerHitbox = {
        x: rect1.x + playerMargin,
        y: rect1.y + playerMargin,
        width: rect1.width - (playerMargin * 2),
        height: rect1.height - (playerMargin * 2)
    };
    
    const obstacleHitbox = {
        x: rect2.x + obstacleMargin,
        y: rect2.y + obstacleMargin,
        width: rect2.width - (obstacleMargin * 2),
        height: rect2.height - (obstacleMargin * 2)
    };
    
    return playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
           playerHitbox.x + playerHitbox.width > obstacleHitbox.x &&
           playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
           playerHitbox.y + playerHitbox.height > obstacleHitbox.y;
}

function checkBirdCollision(player, bird) {
    const playerMargin = 18; 
    const birdMargin = 15;
    
    const playerHitbox = {
        x: player.x + playerMargin,
        y: player.y + playerMargin,
        width: player.width - (playerMargin * 2),
        height: player.height - (playerMargin * 2)
    };
    
    const birdHitbox = {
        x: bird.x + birdMargin,
        y: bird.y + birdMargin,
        width: bird.width - (birdMargin * 2),
        height: bird.height - (birdMargin * 2)
    };
    
    return playerHitbox.x < birdHitbox.x + birdHitbox.width &&
           playerHitbox.x + playerHitbox.width > birdHitbox.x &&
           playerHitbox.y < birdHitbox.y + birdHitbox.height &&
           playerHitbox.y + playerHitbox.height > birdHitbox.y;
}

function checkDinosaurCollision(player, dinosaur) {
    const playerMargin = 25; 
    const dinoMargin = 20;   
    
    const playerHitbox = {
        x: player.x + playerMargin,
        y: player.y + playerMargin,
        width: player.width - (playerMargin * 2),
        height: player.height - (playerMargin * 2)
    };
    
    const dinoHitbox = {
        x: dinosaur.x + dinoMargin,
        y: dinosaur.y + dinoMargin,
        width: dinosaur.width - (dinoMargin * 2),
        height: dinosaur.height - (dinoMargin * 2)
    };
    
    return playerHitbox.x < dinoHitbox.x + dinoHitbox.width &&
           playerHitbox.x + playerHitbox.width > dinoHitbox.x &&
           playerHitbox.y < dinoHitbox.y + dinoHitbox.height &&
           playerHitbox.y + playerHitbox.height > dinoHitbox.y;
}

// Update UI
function updateUI() {
    scoreEl.textContent = score;
    crystalsEl.textContent = crystalsCollected;
}

// Draw Game Over
function drawGameOver() {
    stopBackgroundMusic();
    playGameOverSound();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('IRYS: ' + crystalsCollected, canvas.width/2, canvas.height/2 + 60);
    
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
        
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('NEW RECORD!', canvas.width/2, canvas.height/2 + 100);
    }
    
    restartBtn.style.display = 'block';
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
    }
    
    if (frameCount % 10 === 0) {
        score++;
        updateUI();
    }
    
    if (frameCount % 80 === 0) {    
        createObstacle();
    }
    
    if (frameCount % 150 === 0) {   
        createCrystal();
    }
    
    updateBackground();
    updatePlayer();
    updateObstacles();
    updateCrystals();
    updateParticles();
    
    drawBackground();
    crystals.forEach(crystal => drawCrystal(crystal));
    drawPlayer();
    obstacles.forEach(obstacle => drawObstacle(obstacle));
    drawParticles();
    
    if (gameOver) {
        drawGameOver();
        return;
    }
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    crystalsCollected = 0;
    gameSpeed = 5;
    frameCount = 0;
    
    player.y = PLAYER_GROUND_Y - player.height;
    player.velocityY = 0;
    player.doubleJumpAvailable = true;
    
    obstacles = [];
    crystals = [];
    particles = [];
    
    initBackground();
    updateUI();
    
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    
    playBackgroundMusic();
    gameLoop();
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Keyboard Controls 
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gameOver) return;
    
    if ((e.key === 'ArrowUp' || e.code === 'KeyW') && player.y >= PLAYER_GROUND_Y - player.height) {
        player.velocityY = player.jumpPower;
        playJumpSound();
        e.preventDefault();
    }
    
    if (e.key === ' ' && player.doubleJumpAvailable && player.y < PLAYER_GROUND_Y - player.height) {
        player.velocityY = player.jumpPower * 0.9;
        player.doubleJumpAvailable = false;
        playJumpSound();
        if (gameRunning && !gameOver) {
            createCrystalParticles(player.x + player.width/2, player.y + player.height);
        }
        e.preventDefault();
    }
});


function drawStartScreen() {
    if (backgrounds.current && backgrounds.current.complete && backgrounds.current.naturalHeight !== 0) {
        ctx.drawImage(backgrounds.current, 0, 0, canvas.width, canvas.height);
        
        const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
        groundGradient.addColorStop(0, '#e8c9a0');
        groundGradient.addColorStop(0.3, '#d4b896');
        groundGradient.addColorStop(0.7, '#c4a47c');
        groundGradient.addColorStop(1, '#b8956b');
        
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
        groundGradient.addColorStop(0, '#e8c9a0');
        groundGradient.addColorStop(0.3, '#d4b896');
        groundGradient.addColorStop(0.7, '#c4a47c');
        groundGradient.addColorStop(1, '#b8956b');
        
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.strokeText('Dune Sprint', canvas.width/2, canvas.height/2 - 100);
    ctx.fillText('Dune Sprint', canvas.width/2, canvas.height/2 - 100);

    ctx.font = 'bold 24px Arial';
    ctx.strokeText('Collect IRYS and avoid obstacles!', canvas.width/2, canvas.height/2 - 50);
    ctx.fillText('Collect IRYS and avoid obstacles!', canvas.width/2, canvas.height/2 - 50);

    ctx.restore();
}


function initGame() {
    gameRunning = false;
    gameOver = false;
    gameInitialized = true;
    
    initBackground();
    drawStartScreen();
    
    
    startBackgroundLoading();
    
    console.log('Game initialized instantly - loading assets in background');
}


document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});


document.addEventListener('click', () => {
    if (!audioEnabled) {
        initAudio();
    }
}, { once: true });


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
