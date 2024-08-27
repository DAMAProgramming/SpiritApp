// dropdown-debug.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dropdown debug script loaded');

    const dropdowns = document.querySelectorAll('.navbar__dropdown');
    
    dropdowns.forEach((dropdown, index) => {
        console.log(`Dropdown ${index} found:`, dropdown);

        const link = dropdown.querySelector('.navbar__links');
        const menu = dropdown.querySelector('.dropdown__menu');

        if (link && menu) {
            console.log(`Dropdown ${index} elements:`, { link, menu });

            dropdown.addEventListener('mouseenter', () => {
                console.log(`Dropdown ${index} mouseenter`);
                menu.style.height = 'auto';
                menu.style.opacity = '1';
                console.log(`Dropdown ${index} height set to:`, menu.style.height);
            });

            dropdown.addEventListener('mouseleave', () => {
                console.log(`Dropdown ${index} mouseleave`);
                menu.style.height = '0';
                menu.style.opacity = '0';
            });
        } else {
            console.error(`Dropdown ${index} missing elements:`, { link, menu });
        }
    });
});