function initBackgroundText() {
    const backgroundText = document.getElementById('backgroundText');
    if (!backgroundText) {
        console.error("Could not find element with id 'backgroundText'");
        return;
    }

    const words = ['NEWS', 'POINTS', 'SPIRIT', 'EVENTS', 'SHHS', 'TRACKER', 'UPDATES', 'SCHOOL'];

    function createWord(word) {
        const span = document.createElement('span');
        span.textContent = word;
        span.classList.add('bg-word');
        span.style.left = `${Math.random() * 100}%`;
        span.style.top = `${Math.random() * 100}%`;
        span.style.transform = `rotate(${Math.random() * 360}deg)`;
        return span;
    }

    function populateBackground() {
        backgroundText.innerHTML = ''; // Clear existing words
        const wordCount = Math.floor((window.innerWidth * window.innerHeight) / 10000); // Adjust word count based on screen size
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            const wordElement = createWord(word);
            backgroundText.appendChild(wordElement);
        }
    }

    populateBackground();
    window.addEventListener('resize', populateBackground); // Repopulate on resize
}

document.addEventListener('DOMContentLoaded', initBackgroundText);