const GAME_CONFIG = {
    
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 450,
    
    PLAYER: {
        WIDTH: 100,
        HEIGHT: 80,
        SLIDE_HEIGHT: 40,
        START_X: 100,
        GRAVITY: 0.8,
        JUMP_POWER: -15,
        DOUBLE_JUMP_MULTIPLIER: 0.8
    },
    
    BIRD: {
        WIDTH: 80,
        HEIGHT: 60,
        COLLISION_WIDTH: 60,
        COLLISION_HEIGHT: 40,
        MIN_FLY_HEIGHT: 200,
        MAX_FLY_HEIGHT: 300,
        FLY_AMPLITUDE: 50,
        FLY_SPEED: 0.03,
        MAINTAIN_ASPECT_RATIO: true,
        MAX_SCALE: 1.2,
        MIN_SCALE: 0.8
    },
    
    
    BIRD2: {
        WIDTH: 85,           
        HEIGHT: 65,
        COLLISION_WIDTH: 65,
        COLLISION_HEIGHT: 45,
        MIN_FLY_HEIGHT: 150,  
        MAX_FLY_HEIGHT: 250,
        FLY_AMPLITUDE: 60,    
        FLY_SPEED: 0.025,     
        MAINTAIN_ASPECT_RATIO: true,
        MAX_SCALE: 1.3,
        MIN_SCALE: 0.9
    },
    
    
    OBSTACLES: {
        ROCK: {
            WIDTH: 50,
            HEIGHT: 60
        },
        SPIKE: {
            WIDTH: 30,
            HEIGHT: 40
        },
       
        BIG_ROCK: {
            WIDTH: 70,
            HEIGHT: 80
        },
        CRYSTAL_TRAP: {  
            WIDTH: 45,
            HEIGHT: 50
        },
        WALL: {
            WIDTH: 25,
            HEIGHT: 100
        },
        DOUBLE_SPIKE: {
            WIDTH: 60,
            HEIGHT: 45
        }
    },
    
    
    GAME: {
        INITIAL_SPEED: 5,
        SPEED_INCREASE_INTERVAL: 500,
        SPEED_INCREASE_AMOUNT: 0.5,
        OBSTACLE_SPAWN_INTERVAL: 120,
        CRYSTAL_SPAWN_INTERVAL: 180,
        CRYSTAL_POINTS: 50,
        GROUND_Y: 350,
        
        BIRD_CRYSTAL_CHANCE: 0.7,        
        BIRD_CRYSTAL_DISTANCE: 80,       
        BIRD_CRYSTAL_POINTS_BONUS: 25    
    },
    
    IMAGES: {
        PLAYER: {
            IDLE: 'player_idle.png',
            RUN1: 'player_run1.png',
            RUN2: 'player_run2.png',
            JUMP: 'player_jump.png',
            SLIDE: 'player_slide.png',
            DOUBLE_JUMP: 'player_double_jump.png'
        },
        BIRD: {
            FLY1: 'enemy_walk1.png',
            FLY2: 'enemy_walk2.png',
            ATTACK: 'enemy_attack.png'
        },
        
        BIRD2: {
            FLY1: 'bird2_fly1.png',      
            FLY2: 'bird2_fly2.png',      
            ATTACK: 'bird2_attack.png'   
        },
       
        BACKGROUND: 'background.png'     
    },
    
    
    COLORS: {
        PRIMARY: '#00ffcc',
        SECONDARY: '#ff6b6b',
        ACCENT: '#ffff00',
        PLAYER_FALLBACK: '#00ff88',
        ENEMY_FALLBACK: '#ff4444',
        ENEMY2_FALLBACK: '#ff8844',      
        CRYSTAL: '#00ffcc',
        CRYSTAL_BONUS: '#ffff00',        
        BACKGROUND_GRADIENT: ['#0a0a0f', '#1a1a2e', '#16213e']
    },
    
    
    SPAWN_PROBABILITIES: {
        'rock': 0.15,
        'spike': 0.12,
        'big_rock': 0.08,
        'crystal_trap': 0.10,
        'wall': 0.07,
        'double_spike': 0.08,
        'flying': 0.20,      
        'flying2': 0.20      
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}