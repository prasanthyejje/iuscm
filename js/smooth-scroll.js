// Smooth Scroll JavaScript

(function() {
    'use strict';

    // Configuration
    const config = {
        duration: 800,
        easing: 'easeInOutCubic',
        offset: 80, // Navbar height + some padding
        updateURL: true,
        popstate: true
    };

    // Easing functions
    const easingFunctions = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    };

    // Initialize
    function init() {
        setupSmoothScroll();
        setupPopstateHandler();
    }

    // Setup smooth scroll for all anchor links
    function setupSmoothScroll() {
        // Prevent browser default scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Always start at top on page load
        window.scrollTo(0, 0);
        
        // Get all links that start with #
        const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        links.forEach(link => {
            link.addEventListener('click', handleLinkClick);
        });

        // Handle direct load with hash (only from external links)
        if (window.location.hash && document.referrer) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    scrollToElement(target, 0); // No duration for initial load
                }
            }, 100);
        }
    }

    // Handle link click
    function handleLinkClick(e) {
        const href = this.getAttribute('href');
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            // Smooth scroll to target
            scrollToElement(targetElement, config.duration);
            
            // Update URL
            if (config.updateURL) {
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
            }
            
            // Focus management for accessibility
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
        }
    }

    // Scroll to element
    function scrollToElement(element, duration) {
        const start = window.pageYOffset;
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementTop - config.offset;
        const distance = targetPosition - start;
        const startTime = performance.now();
        
        // Don't scroll if already at position
        if (Math.abs(distance) < 1) {
            return;
        }
        
        // Animation function
        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing
            const easing = easingFunctions[config.easing] || easingFunctions.easeInOutCubic;
            const ease = easing(progress);
            
            // Calculate new position
            const newPosition = start + (distance * ease);
            
            // Scroll to new position
            window.scrollTo(0, newPosition);
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                // Animation complete - trigger event
                const event = new CustomEvent('smoothScrollComplete', {
                    detail: {
                        target: element
                    }
                });
                window.dispatchEvent(event);
            }
        }
        
        // Start animation
        if (duration === 0) {
            window.scrollTo(0, targetPosition);
        } else {
            requestAnimationFrame(animation);
        }
    }

    // Handle browser back/forward buttons
    function setupPopstateHandler() {
        if (!config.popstate) return;
        
        window.addEventListener('popstate', function(e) {
            if (window.location.hash) {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    e.preventDefault();
                    scrollToElement(target, config.duration);
                }
            }
        });
    }

    // Utility: Get navbar height dynamically
    function getNavbarHeight() {
        const navbar = document.querySelector('.navbar');
        return navbar ? navbar.offsetHeight : 0;
    }

    // Update offset based on navbar height
    function updateOffset() {
        config.offset = getNavbarHeight() + 20;
    }

    // Update offset on resize
    window.addEventListener('resize', debounce(updateOffset, 250));

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

    // Public API
    window.smoothScroll = {
        scrollTo: function(target, duration = config.duration) {
            if (typeof target === 'string') {
                target = document.querySelector(target);
            }
            if (target) {
                scrollToElement(target, duration);
            }
        },
        updateConfig: function(newConfig) {
            Object.assign(config, newConfig);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
