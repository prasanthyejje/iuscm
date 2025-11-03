// Navbar Scroll Effect - Transparent to Cream Background
(function() {
    'use strict';
    
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero-section');
    
    if (!navbar || !hero) return;
    
    function handleNavbarScroll() {
        const heroHeight = hero.offsetHeight;
        const scrollPosition = window.scrollY;
        
        // When scrolled past hero section, add scrolled class
        if (scrollPosition > heroHeight - 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
    
    // Run on scroll
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Run on page load
    handleNavbarScroll();
})();
