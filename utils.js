const MathUtils = {
    
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
};

const ImageUtils = {
    
    isImageLoaded(img) {
        return img && img.complete && img.naturalHeight !== 0;
    },
    
    
    createImage(src, onLoad, onError) {
        const img = new Image();
        img.onload = onLoad || (() => {});
        img.onerror = onError || (() => {});
        img.src = src;
        return img;
    },
    
    
    scaleToFit(imgWidth, imgHeight, targetWidth, targetHeight) {
        const scale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
        return {
            width: imgWidth * scale,
            height: imgHeight * scale,
            scale: scale
        };
    }
};


const AnimationUtils = {
    
    sine(time, amplitude = 1, frequency = 1, offset = 0) {
        return Math.sin(time * frequency + offset) * amplitude;
    },
    
    
    bounce(time, amplitude = 1, frequency = 1) {
        return Math.abs(Math.sin(time * frequency)) * amplitude;
    },
    
    
    fade(time, duration, reverse = false) {
        const progress = MathUtils.clamp(time / duration, 0, 1);
        return reverse ? 1 - progress : progress;
    },
    
    
    pulse(time, minValue = 0.5, maxValue = 1, frequency = 1) {
        return MathUtils.lerp(minValue, maxValue, 
            (Math.sin(time * frequency) + 1) / 2);
    }
};


const GameUtils = {
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    
    checkCollisionWithTolerance(rect1, rect2, tolerance = 5) {
        return rect1.x + tolerance < rect2.x + rect2.width &&
               rect1.x + rect1.width - tolerance > rect2.x &&
               rect1.y + tolerance < rect2.y + rect2.height &&
               rect1.y + rect1.height - tolerance > rect2.y;
    },
    
    
    isOnScreen(obj, canvasWidth, canvasHeight, margin = 50) {
        return obj.x > -margin && 
               obj.x < canvasWidth + margin &&
               obj.y > -margin && 
               obj.y < canvasHeight + margin;
    },
    
    
    shake(intensity = 5, duration = 500) {
        return {
            x: MathUtils.random(-intensity, intensity),
            y: MathUtils.random(-intensity, intensity),
            intensity: intensity,
            duration: duration,
            startTime: Date.now()
        };
    }
};


const AudioUtils = {
    
    createBeep(frequency = 440, duration = 200, volume = 0.1) {
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            return null; 
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
        return oscillator;
    },
    

    playJumpSound() {
        return this.createBeep(660, 150, 0.05);
    },
    
    
    playCrystalSound() {
        return this.createBeep(880, 100, 0.08);
    },
    
    
    playHitSound() {
        return this.createBeep(220, 300, 0.1);
    }
};


const StorageUtils = {
    
    gameData: {},
    
    save(key, value) {
        this.gameData[key] = value;
    },
    
    load(key, defaultValue = null) {
        return this.gameData[key] !== undefined ? this.gameData[key] : defaultValue;
    },
    
    remove(key) {
        delete this.gameData[key];
    },
    
    clear() {
        this.gameData = {};
    }
};


const DebugUtils = {
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
        console.log(`${prefix} ${message}`);
    },
    
    
    drawHitbox(ctx, obj, color = 'red') {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        ctx.restore();
    },
    
    
    fpsCounter: {
        frames: 0,
        lastTime: 0,
        fps: 0,
        
        update() {
            this.frames++;
            const now = performance.now();
            if (now - this.lastTime >= 1000) {
                this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
                this.frames = 0;
                this.lastTime = now;
            }
        },
        
        draw(ctx, x = 10, y = 30) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(`FPS: ${this.fps}`, x, y);
            ctx.restore();
        }
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathUtils,
        ImageUtils,
        AnimationUtils,
        GameUtils,
        AudioUtils,
        StorageUtils,
        DebugUtils
    };
}