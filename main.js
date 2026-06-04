const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const eruptBtn = document.getElementById('eruptBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const particleSlider = document.getElementById('particleSlider');
const particleValue = document.getElementById('particleValue');

let width, height;
let particles = [];
let volcanoX, volcanoY;
let timeScale = 1.0;
let intensity = 500;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    volcanoX = width / 2;
    volcanoY = height - 100;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = (Math.random() * Math.PI / 2) + Math.PI / 4; // Upwards cone
        const speed = Math.random() * 15 + 10;
        this.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = -Math.sin(angle) * speed;
        this.life = Math.random() * 100 + 100;
        this.maxLife = this.life;
        this.size = Math.random() * 4 + 2;
        
        const isAsh = Math.random() > 0.8;
        if (isAsh) {
            this.color = `rgba(150, 150, 150, 0.8)`;
            this.type = 'ash';
            this.vy *= 0.5; 
        } else {
            const r = 255;
            const g = Math.floor(Math.random() * 100 + 50);
            const b = 0;
            this.color = `rgba(${r}, ${g}, ${b}, 1)`;
            this.type = 'lava';
        }
    }

    update(dt) {
        const scaledDt = dt * timeScale;
        
        // Gravity
        if (this.type === 'lava') {
            this.vy += 0.2 * scaledDt;
        } else {
            // Ash floats more
            this.vy += 0.02 * scaledDt;
            this.vx += (Math.random() - 0.5) * 0.5 * scaledDt; // Wind effect
        }

        this.x += this.vx * scaledDt;
        this.y += this.vy * scaledDt;
        this.life -= scaledDt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.type === 'lava') {
            const alpha = this.life / this.maxLife;
            // Shift to darker red as it cools
            const r = 255;
            const g = Math.floor((this.life / this.maxLife) * 100);
            ctx.fillStyle = `rgba(${r}, ${g}, 0, ${alpha})`;
            
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(255, 69, 0, ${alpha})`;
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
    }
}

function erupt() {
    for (let i = 0; i < intensity; i++) {
        particles.push(new Particle(volcanoX + (Math.random() * 40 - 20), volcanoY));
    }
}

// Draw the mountain silhouette
function drawVolcano() {
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(volcanoX - 250, height);
    ctx.lineTo(volcanoX - 40, volcanoY);
    
    // Crater opening
    ctx.lineTo(volcanoX + 40, volcanoY);
    
    ctx.lineTo(volcanoX + 250, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height);
    
    ctx.fillStyle = '#0a0a0c';
    ctx.shadowBlur = 0;
    ctx.fill();
    
    // Crater glow
    ctx.beginPath();
    ctx.ellipse(volcanoX, volcanoY, 40, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff4500';
    ctx.fill();
}

let lastTime = 0;
function animate(time) {
    // Normalize dt around ~60fps (16.6ms)
    let dt = (time - lastTime) / 16.66;
    if (dt > 3) dt = 3; 
    lastTime = time;

    // Clear with a slight trailing effect for motion blur
    ctx.fillStyle = 'rgba(11, 12, 16, 0.4)';
    ctx.fillRect(0, 0, width, height);
    
    drawVolcano();

    // Reset shadow blur before drawing particles
    ctx.shadowBlur = 0;

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        p.draw(ctx);
        
        // Remove dead particles or particles out of bounds
        if (p.life <= 0 || p.y > height + 10) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Event Listeners
eruptBtn.addEventListener('click', erupt);

speedSlider.addEventListener('input', (e) => {
    timeScale = parseFloat(e.target.value);
    speedValue.textContent = timeScale.toFixed(2);
});

particleSlider.addEventListener('input', (e) => {
    intensity = parseInt(e.target.value);
    particleValue.textContent = intensity;
});

// Start loop
requestAnimationFrame((time) => {
    lastTime = time;
    animate(time);
});
