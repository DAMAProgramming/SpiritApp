// js/mainInteract.js

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar__menu');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (mobileMenu && navbarMenu) {
        mobileMenu.addEventListener('click', function() {
            this.classList.toggle('is-active');
            navbarMenu.classList.toggle('active');
        });
    }

    const dropdownLinks = document.querySelectorAll('.navbar__links[data-dropdown]');
    
    dropdownLinks.forEach(link => {
        const dropdownId = link.getAttribute('data-dropdown');
        const dropdown = document.getElementById(dropdownId);
        
        if (isMobile) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other dropdowns
                dropdownLinks.forEach(otherLink => {
                    if (otherLink !== link) {
                        const otherId = otherLink.getAttribute('data-dropdown');
                        document.getElementById(otherId).style.display = 'none';
                    }
                });

                // Toggle current dropdown
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

                // Adjust scroll position if needed
                if (dropdown.style.display === 'block') {
                    const dropdownBottom = dropdown.getBoundingClientRect().bottom;
                    const windowHeight = window.innerHeight;
                    if (dropdownBottom > windowHeight) {
                        window.scrollTo({
                            top: window.pageYOffset + (dropdownBottom - windowHeight),
                            behavior: 'smooth'
                        });
                    }
                }
            });
        } else {
            // Desktop behavior
            link.addEventListener('mouseenter', () => {
                dropdown.style.display = 'block';
                setTimeout(() => dropdown.classList.add('active'), 10);
            });
            link.addEventListener('mouseleave', () => {
                dropdown.classList.remove('active');
                setTimeout(() => dropdown.style.display = 'none', 300);
            });
        }
    });

    // Close dropdowns when tapping outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar__links[data-dropdown]') && !e.target.closest('#mobile-menu')) {
            dropdownLinks.forEach(link => {
                const dropdownId = link.getAttribute('data-dropdown');
                const dropdown = document.getElementById(dropdownId);
                dropdown.style.display = 'none';
                dropdown.classList.remove('active');
            });
            if (isMobile) {
                navbarMenu.classList.remove('active');
                mobileMenu.classList.remove('is-active');
            }
        }
    });
});