// dropdown-animation.js

document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.navbar__dropdown');

    dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('.dropdown__menu');
        let height = 0;

        // Calculate the height of the dropdown content
        function calculateHeight() {
            menu.style.height = 'auto';
            menu.style.opacity = '0';
            menu.style.pointerEvents = 'none';
            height = menu.offsetHeight + 'px';
            menu.style.height = '0';
            menu.style.opacity = '';
            menu.style.pointerEvents = '';
        }

        // Calculate initial height
        calculateHeight();

        // Recalculate height on window resize
        window.addEventListener('resize', calculateHeight);

        // Add event listeners for mouse interactions
        dropdown.addEventListener('mouseenter', () => {
            menu.style.height = height;
        });

        dropdown.addEventListener('mouseleave', () => {
            menu.style.height = '0';
        });
    });
});