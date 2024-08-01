// background-text.js

class BackgroundWord {
    constructor(word, x, y, container, pageHeight) {
        this.word = word;
        this.x = x;
        this.y = y;
        this.container = container;
        this.pageHeight = pageHeight;
        this.element = this.createElement();
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.initialRotation = (Math.random() - 0.5) * 10;
        this.currentRotation = this.initialRotation;
        this.currentX = x;
        this.currentY = y;
        this.targetX = x;
        this.targetY = y;
        this.setTransform(this.currentX, this.currentY, this.currentRotation);
        this.element.classList.add('hidden');
        setTimeout(() => {
            this.element.classList.remove('hidden');
            this.element.classList.add('visible');
        }, Math.random() * 1000);
    }

    createElement() {
        const span = document.createElement('span');
        span.textContent = this.word;
        span.classList.add('bg-word');
        this.container.appendChild(span);
        return span;
    }

    setTransform(x, y, rotation) {
        this.element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    }

    update(scrollY, mouseX, mouseY, viewportHeight) {
        // Simple half-speed parallax
        const parallaxY = scrollY * 0.5;
        let yPos = this.y - parallaxY;
        
        // Wrap vertically if needed
        if (yPos < -viewportHeight) {
            yPos += this.pageHeight + viewportHeight * 2;
        } else if (yPos > this.pageHeight + viewportHeight) {
            yPos -= this.pageHeight + viewportHeight * 2;
        }

        const dx = mouseX - (this.x + this.width / 2);
        const dy = mouseY - (yPos + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const repelRadius = 200;
        let rotationAngle = this.initialRotation;
        
        if (distance < repelRadius) {
            const repelFactor = (repelRadius - distance) / repelRadius;
            this.targetX = this.x - dx * repelFactor * 0.5;
            this.targetY = yPos - dy * repelFactor * 0.5;
            
            const maxRotation = 15;
            rotationAngle += (dx > 0 ? -1 : 1) * repelFactor * maxRotation;
            this.element.classList.add('mouse-interact');
        } else {
            this.targetX = this.x;
            this.targetY = yPos;
            this.element.classList.remove('mouse-interact');
        }

        // Smooth transition for position
        this.currentX += (this.targetX - this.currentX) * 0.05;
        this.currentY += (this.targetY - this.currentY) * 0.05;

        // Smooth transition for rotation
        this.currentRotation += (rotationAngle - this.currentRotation) * 0.05;

        // Set visibility based on position
        if (this.currentY < -viewportHeight || this.currentY > viewportHeight * 2) {
            this.element.classList.add('hidden');
            this.element.classList.remove('visible');
        } else {
            this.element.classList.remove('hidden');
            this.element.classList.add('visible');
        }

        this.setTransform(this.currentX, this.currentY, this.currentRotation);
    }
}

function initBackgroundText() {
    const backgroundText = document.getElementById('backgroundText');
    if (!backgroundText) {
        console.error("Could not find element with id 'backgroundText'");
        return;
    }

    const words = ['NEWS', 'POINTS', 'SPIRIT', 'EVENTS', 'SHHS', 'TRACKER', 'UPDATES', 'SCHOOL', 'HUSKIES', 'SWEET HOME', 'MAY WEEK', 'ANNOUCEMENTS', 'ASSEMBLIES', 'SCHOOL SPIRIT'];
    let bgWords = [];
    let mouseX = 0;
    let mouseY = 0;

    function populateBackground() {
        backgroundText.innerHTML = '';
        bgWords = [];

        const containerWidth = backgroundText.clientWidth;
        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const extendedHeight = pageHeight + window.innerHeight * 2; // Add extra space top and bottom

        // Maintain the same word density
        const wordCount = Math.floor((containerWidth * extendedHeight) / 15000);
        
        for (let i = 0; i < wordCount; i++) {
            let x, y, overlapping;
            do {
                x = Math.random() * containerWidth;
                y = Math.random() * extendedHeight - window.innerHeight; // Offset to account for extra top space
                overlapping = bgWords.some(word => 
                    Math.abs(word.x - x) < 100 && Math.abs(word.y - y) < 50
                );
            } while (overlapping);

            const word = words[Math.floor(Math.random() * words.length)];
            bgWords.push(new BackgroundWord(word, x, y, backgroundText, pageHeight));
        }
    }

    function animate() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        bgWords.forEach(word => word.update(scrollY, mouseX, mouseY, viewportHeight));
        requestAnimationFrame(animate);
    }

    populateBackground();
    animate();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(populateBackground, 250);
    });
}

document.addEventListener('DOMContentLoaded', initBackgroundText);