/**
 * IUSCM Scroll Animations - FIXED VERSION
 * Complete rewrite with extensive debugging
 */

(function() {
    'use strict';

    console.log('===== ANIMATIONS SCRIPT LOADED =====');
    console.log('Script location:', window.location.href);
    console.log('DOM ready state:', document.readyState);

    // Function to initialize animations
    function initAnimations() {
        console.log('[Animations] Initializing...');
        
        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            console.log('[Animations] Reduced motion preference detected, skipping animations');
            // Make all elements visible
            document.querySelectorAll('[data-animate]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        // Get all animated elements
        const allElements = document.querySelectorAll('[data-animate]');
        console.log(`[Animations] Total elements with data-animate: ${allElements.length}`);
        
        if (allElements.length === 0) {
            console.warn('[Animations] No elements found with data-animate attribute!');
            console.log('[Animations] Searching for potential elements...');
            
            // Debug: Look for common elements
            console.log('  - Articles:', document.querySelectorAll('article').length);
            console.log('  - Sections:', document.querySelectorAll('section').length);
            console.log('  - Images:', document.querySelectorAll('img').length);
            console.log('  - Forms:', document.querySelectorAll('form').length);
            
            return;
        }

        // List all elements found
        allElements.forEach((el, index) => {
            const type = el.getAttribute('data-animate');
            const delay = el.getAttribute('data-animate-delay') || '0';
            const tag = el.tagName.toLowerCase();
            const classes = el.className;
            console.log(`  ${index + 1}. <${tag}> type="${type}" delay="${delay}" classes="${classes}"`);
        });

        // Filter out sticky elements
        const elementsToAnimate = [];
        const stickyElements = [];
        
        allElements.forEach(el => {
            const isSticky = el.closest('.sticky-media');
            if (isSticky) {
                // Force sticky elements to be visible
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.transition = 'none';
                stickyElements.push(el);
            } else {
                // Reset non-sticky elements
                el.style.opacity = '0';
                el.classList.remove('visible');
                elementsToAnimate.push(el);
            }
        });

        console.log(`[Animations] Breakdown:`);
        console.log(`  - Elements to animate: ${elementsToAnimate.length}`);
        console.log(`  - Sticky elements (no animation): ${stickyElements.length}`);

        if (elementsToAnimate.length === 0) {
            console.warn('[Animations] No animatable elements after filtering!');
            return;
        }

        // Create IntersectionObserver
        const observerOptions = {
            threshold: 0.1, // Lower threshold for easier triggering
            rootMargin: '0px 0px -50px 0px'
        };

        console.log('[Animations] Creating observer with options:', observerOptions);

        let animationCount = 0;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const animType = target.getAttribute('data-animate');
                    const delay = parseInt(target.getAttribute('data-animate-delay') || '0', 10);
                    
                    console.log(`[Animations] Element entering viewport: type="${animType}" delay="${delay}ms"`);
                    
                    setTimeout(() => {
                        target.classList.add('visible');
                        target.style.opacity = '1';
                        target.style.transform = 'none';
                        animationCount++;
                        console.log(`[Animations] ✅ Animated element #${animationCount} (${animType})`);
                        
                        // Dispatch event
                        target.dispatchEvent(new CustomEvent('animation-complete', {
                            bubbles: true,
                            detail: { type: animType, delay: delay }
                        }));
                    }, delay);
                    
                    // Stop observing
                    observer.unobserve(target);
                }
            });
        }, observerOptions);

        // Start observing
        elementsToAnimate.forEach((el, index) => {
            observer.observe(el);
            console.log(`[Animations] Observing element ${index + 1}/${elementsToAnimate.length}`);
        });

        console.log('[Animations] ✅ Observer started successfully');

        // Add global helper function
        window.debugAnimations = function() {
            const visible = document.querySelectorAll('[data-animate].visible');
            const notVisible = document.querySelectorAll('[data-animate]:not(.visible)');
            console.log('=== ANIMATION DEBUG ===');
            console.log(`Visible: ${visible.length}`);
            console.log(`Not visible: ${notVisible.length}`);
            notVisible.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                console.log(`  ${i + 1}. Hidden element at:`, {
                    top: Math.round(rect.top),
                    visible: rect.top < window.innerHeight
                });
            });
        };

        console.log('[Animations] 💡 TIP: Run debugAnimations() in console to check status');
    }

    // Wait for DOM to be ready
    function waitForDOM() {
        if (document.readyState === 'loading') {
            console.log('[Animations] Waiting for DOM...');
            document.addEventListener('DOMContentLoaded', function() {
                console.log('[Animations] DOMContentLoaded fired');
                setTimeout(initAnimations, 100); // Small delay to ensure everything is ready
            });
        } else {
            console.log('[Animations] DOM already ready');
            setTimeout(initAnimations, 100); // Small delay to ensure everything is ready
        }
    }

    // Start
    waitForDOM();

    // Also try on window load as backup
    window.addEventListener('load', function() {
        console.log('[Animations] Window load event fired');
        // Check if animations were already initialized
        if (document.querySelectorAll('[data-animate]:not(.visible)').length > 0) {
            console.log('[Animations] Re-initializing on window load...');
            initAnimations();
        }
    });

})();
