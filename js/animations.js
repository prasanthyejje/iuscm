/**
 * IUSCM Scroll Animations
 * A clean, reusable animation system using data-animate attributes
 * 
 * Usage:
 * - Add data-animate="fade|up|left|right" to any element
 * - Optional: Add data-animate-delay="200" for staggered animations (in ms)
 * - Elements inside .sticky-media will not animate (they stay static)
 */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        console.log('[Animations] Reduced motion detected, disabling animations');
        return;
    }

    // Get all elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (!animatedElements.length) {
        console.log('[Animations] No elements with data-animate found');
        return;
    }

    console.log(`[Animations] Found ${animatedElements.length} elements to animate`);

    // Filter out elements inside sticky containers (they should stay static)
    const elementsToAnimate = Array.from(animatedElements).filter(el => {
        const isInStickyMedia = el.closest('.sticky-media');
        if (isInStickyMedia) {
            // Make sure sticky images are visible immediately
            el.style.opacity = '1';
            el.style.transform = 'none';
            console.log('[Animations] Skipping sticky element:', el);
            return false;
        }
        return true;
    });

    if (!elementsToAnimate.length) {
        console.log('[Animations] No animatable elements after filtering');
        return;
    }

    console.log(`[Animations] Animating ${elementsToAnimate.length} elements (${animatedElements.length - elementsToAnimate.length} sticky elements excluded)`);

    // Create IntersectionObserver with smooth threshold
    const observerOptions = {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: '0px 0px -10% 0px' // Start slightly before element is fully in view
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Get optional delay
                const delay = parseInt(target.getAttribute('data-animate-delay') || '0', 10);
                
                // Apply animation with delay
                setTimeout(() => {
                    target.classList.add('visible');
                    
                    // Optional: dispatch custom event
                    target.dispatchEvent(new CustomEvent('animation-complete', {
                        bubbles: true,
                        detail: { 
                            animationType: target.getAttribute('data-animate'),
                            delay: delay 
                        }
                    }));
                }, delay);
                
                // Stop observing this element
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    // Start observing all elements
    elementsToAnimate.forEach(el => {
        // Ensure initial state is set
        el.classList.remove('visible');
        observer.observe(el);
    });

    // Optional: Re-trigger animations on dynamic content
    window.animateNewElements = function(container) {
        const newElements = (container || document).querySelectorAll('[data-animate]:not(.visible)');
        newElements.forEach(el => {
            if (!el.closest('.sticky-media')) {
                el.classList.remove('visible');
                observer.observe(el);
            }
        });
        console.log(`[Animations] Re-animated ${newElements.length} new elements`);
    };

    // Log animation completions (useful for debugging)
    document.addEventListener('animation-complete', (e) => {
        console.log(`[Animation Complete] Type: ${e.detail.animationType}, Delay: ${e.detail.delay}ms`);
    });

})();
