// Navigation JavaScript

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
    const navLinks = document.querySelectorAll('.navbar-menu a, .mobile-nav-menu a');
    
    // State
    let isScrolled = false;
    let isMobileMenuOpen = false;

    // Initialize
    function init() {
        setupEventListeners();
        checkScroll();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', throttle(handleScroll, 100));
        
        // Mobile menu events
        if (navbarToggle) {
            navbarToggle.addEventListener('click', toggleMobileMenu);
        }
        
        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', closeMobileMenu);
        }
        
        // Mobile nav backdrop click to close
        if (mobileNavBackdrop) {
            mobileNavBackdrop.addEventListener('click', closeMobileMenu);
        }
        
        // Navigation link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
        
        // Escape key to close mobile menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        // Resize event to close mobile menu on desktop
        window.addEventListener('resize', debounce(handleResize, 250));
    }

    // Handle scroll for navbar background
    function handleScroll() {
        checkScroll();
    }

    // Check scroll position - gurus hide immediately, navbar changes at about-iuscm
    function checkScroll() {
        const scrollPosition = window.scrollY;
        const aboutSection = document.getElementById('about-iuscm');
        
        // Hide desktop gurus immediately on scroll
        const spiritualGurus = document.querySelector('.spiritual-gurus');
        if (spiritualGurus) {
            if (scrollPosition > 10) {
                spiritualGurus.style.maxHeight = '0';
                spiritualGurus.style.opacity = '0';
                spiritualGurus.style.padding = '0';
                spiritualGurus.style.margin = '0';
                spiritualGurus.style.overflow = 'hidden';
            } else {
                spiritualGurus.style.maxHeight = '100px';
                spiritualGurus.style.opacity = '1';
                spiritualGurus.style.padding = '';
                spiritualGurus.style.margin = '';
                spiritualGurus.style.overflow = 'visible';
            }
        }
        
        // Hide mobile gurus immediately on scroll
        const mobileGurus = document.querySelector('.lg\\:hidden.border-b');
        if (mobileGurus) {
            if (scrollPosition > 10) {
                mobileGurus.style.maxHeight = '0';
                mobileGurus.style.opacity = '0';
                mobileGurus.style.padding = '0';
                mobileGurus.style.overflow = 'hidden';
                mobileGurus.style.transition = 'all 0.3s ease-out';
            } else {
                mobileGurus.style.maxHeight = '100px';
                mobileGurus.style.opacity = '1';
                mobileGurus.style.padding = '';
                mobileGurus.style.overflow = 'visible';
            }
        }
        
        // Change navbar color when reaching about-iuscm section
        if (aboutSection) {
            const sectionTop = aboutSection.offsetTop;
            const threshold = sectionTop - 100;
            
            if (scrollPosition > threshold && !isScrolled) {
                isScrolled = true;
                navbar.classList.add('navbar-scrolled');
            } else if (scrollPosition <= threshold && isScrolled) {
                isScrolled = false;
                navbar.classList.remove('navbar-scrolled');
            }
        }
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        
        if (isMobileMenuOpen) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    }

    // Open mobile menu
    function openMobileMenu() {
        isMobileMenuOpen = true;
        navbarToggle.classList.add('active');
        mobileNav.classList.add('active');
        
        // Show backdrop
        if (mobileNavBackdrop) {
            mobileNavBackdrop.classList.add('active');
            mobileNavBackdrop.style.opacity = '1';
            mobileNavBackdrop.style.visibility = 'visible';
        }
        
        document.body.style.overflow = 'hidden';
        
        // Accessibility
        navbarToggle.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
        
        // Focus management
        setTimeout(() => {
            const firstLink = mobileNav.querySelector('a');
            if (firstLink) {
                firstLink.focus();
            }
        }, 300);
    }

    // Close mobile menu
    function closeMobileMenu() {
        isMobileMenuOpen = false;
        
        if (navbarToggle) {
            navbarToggle.classList.remove('active');
        }
        
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
        
        // Hide backdrop
        if (mobileNavBackdrop) {
            mobileNavBackdrop.classList.remove('active');
            mobileNavBackdrop.style.opacity = '0';
            mobileNavBackdrop.style.visibility = 'hidden';
        }
        
        document.body.style.overflow = '';
        
        // Accessibility
        if (navbarToggle) {
            navbarToggle.setAttribute('aria-expanded', 'false');
        }
        
        if (mobileNav) {
            mobileNav.setAttribute('aria-hidden', 'true');
        }
        
        // Return focus to toggle button
        if (navbarToggle) {
            navbarToggle.focus();
        }
    }

    // Handle navigation click
    function handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        // Check if it's an anchor link
        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (isMobileMenuOpen) {
                closeMobileMenu();
            }
            
            // Scroll to section
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        } else if (href && href.includes('meditation.html')) {
            // If clicking on Practical Manual link, let it navigate normally
            if (isMobileMenuOpen) {
                closeMobileMenu();
            }
        }
    }

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 767 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    }

    // Utility: Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Active navigation highlighting
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + navbar.offsetHeight + 50;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Add scroll spy
    window.addEventListener('scroll', throttle(updateActiveNav, 100));

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
