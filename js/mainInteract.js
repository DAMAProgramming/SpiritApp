// js/mainInteract.js

document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    const dropdowns = document.querySelectorAll('.navbar__dropdown');

    // Toggle mobile menu
    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });

    // Handle dropdowns in mobile view
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.navbar__links');
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 960) {
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                const isExpanded = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                        d.querySelector('.dropdown__menu').style.maxHeight = '0';
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
                
                if (!isExpanded) {
                    dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
                } else {
                    dropdownMenu.style.maxHeight = '0';
                }
            }
        });
    });

    // Close mobile menu when a link is clicked
    menuLinks.addEventListener('click', function(e) {
        if (e.target.classList.contains('navbar__links') || e.target.classList.contains('dropdown__link')) {
            menu.classList.remove('is-active');
            menuLinks.classList.remove('active');
        }
    });
});