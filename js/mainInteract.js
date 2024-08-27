document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.navbar__dropdown');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.navbar__links');
        const menu = dropdown.querySelector('.dropdown__menu');

        if (isMobile) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');

                // Adjust scroll position if needed
                if (dropdown.classList.contains('active')) {
                    const dropdownBottom = menu.getBoundingClientRect().bottom;
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
            // Desktop behavior remains the same
            dropdown.addEventListener('mouseenter', () => dropdown.classList.add('active'));
            dropdown.addEventListener('mouseleave', () => dropdown.classList.remove('active'));
        }
    });

    // Close dropdowns when tapping outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar__dropdown')) {
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });
});