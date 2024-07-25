// background-text.js

class BackgroundWord {
    constructor(word, x, y, speed, container) {
        this.word = word;
        this.x = x;
        this.y = y;
        this.baseSpeed = speed;
        this.currentSpeed = speed;
        this.container = container;
        this.element = this.createElement();
        this.direction = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
    }

    createElement() {
        const span = document.createElement('span');
        span.textContent = this.word;
        span.classList.add('bg-word');
        this.container.appendChild(span);
        return span;
    }

    move(others, scrollSpeed) {
        // Apply scroll acceleration
        this.currentSpeed = this.baseSpeed + Math.abs(scrollSpeed) * 0.1;
        
        // Update position with scroll influence
        this.x += this.currentSpeed * this.direction.x;
        this.y += this.currentSpeed * this.direction.y - scrollSpeed * 0.5;

        // Update rotation
        this.rotation += this.rotationSpeed + scrollSpeed * 0.1;

        // Check for collisions with container edges
        if (this.x < 0 || this.x + this.width > this.container.clientWidth) {
            this.direction.x *= -1;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
        }
        if (this.y < 0 || this.y + this.height > this.container.clientHeight) {
            this.direction.y *= -1;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
        }

        // Check for collisions with other words
        others.forEach(other => {
            if (other !== this && this.checkCollision(other)) {
                this.resolveCollision(other);
            }
        });

        // Apply new position and rotation
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    resolveCollision(other) {
        [this.direction.x, other.direction.x] = [other.direction.x, this.direction.x];
        [this.direction.y, other.direction.y] = [other.direction.y, this.direction.y];
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        other.rotationSpeed = (Math.random() - 0.5) * 2;
    }
}

function initBackgroundText() {
    const backgroundText = document.getElementById('backgroundText');
    if (!backgroundText) {
        console.error("Could not find element with id 'backgroundText'");
        return;
    }

    const words = ['NEWS', 'POINTS', 'SPIRIT', 'EVENTS', 'SHHS', 'TRACKER', 'UPDATES', 'SCHOOL', 'HUSKIES', 'SWEET HOME'];
    let bgWords = [];
    let scrollSpeed = 0;
    let lastScrollTop = 0;

    function populateBackground() {
        backgroundText.innerHTML = '';
        bgWords = [];

        const wordCount = Math.floor((window.innerWidth * window.innerHeight) / 30000);
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            const x = Math.random() * (backgroundText.clientWidth - 100);
            const y = Math.random() * (backgroundText.clientHeight - 30);
            const speed = 0.5 + Math.random() * 0.7;
            bgWords.push(new BackgroundWord(word, x, y, speed, backgroundText));
        }
    }

    function animate() {
        bgWords.forEach(word => word.move(bgWords, scrollSpeed));
        // Gradually reduce scroll speed
        scrollSpeed *= 0.95;
        requestAnimationFrame(animate);
    }

    populateBackground();
    animate();

    // Handle scroll events
    window.addEventListener('scroll', () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        scrollSpeed = st - lastScrollTop;
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    });

    // Repopulate on resize, with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(populateBackground, 250);
    });
}

document.addEventListener('DOMContentLoaded', initBackgroundText);