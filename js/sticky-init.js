// Sticky Media Initialization - Ensures sticky images work properly
(function() {
    'use strict';
    
    console.log('[Sticky] Initializing sticky media system...');
    
    // Function to set sticky top position
    function updateStickyTop() {
        const navbar = document.getElementById('navbar');
        if (!navbar) {
            console.warn('[Sticky] Navbar not found!');
            return;
        }
        
        // Get actual navbar height
        const navbarRect = navbar.getBoundingClientRect();
        const navbarHeight = navbarRect.height;
        
        // Add some breathing room (16px)
        const stickyTop = Math.round(navbarHeight) + 16;
        
        // Set CSS variable
        document.documentElement.style.setProperty('--stick-top', `${stickyTop}px`);
        
        console.log(`[Sticky] Set --stick-top to ${stickyTop}px (navbar: ${navbarHeight}px)`);
    }
    
    // Function to verify sticky elements
    function verifyStickyElements() {
        const stickyElements = document.querySelectorAll('.sticky-media');
        
        if (stickyElements.length === 0) {
            console.warn('[Sticky] No elements with .sticky-media class found!');
            return;
        }
        
        console.log(`[Sticky] Found ${stickyElements.length} sticky elements:`);
        
        stickyElements.forEach((el, index) => {
            const computedStyle = window.getComputedStyle(el);
            const position = computedStyle.position;
            const top = computedStyle.top;
            
            // Check if element is inside a grid or flex container
            const parent = el.parentElement;
            const parentStyle = window.getComputedStyle(parent);
            const parentDisplay = parentStyle.display;
            
            console.log(`  ${index + 1}. Sticky element:`, {
                position: position,
                top: top,
                parentDisplay: parentDisplay,
                element: el
            });
            
            // Fix common issues
            if (position !== 'sticky' && window.innerWidth >= 768) {
                console.warn(`    ⚠️ Position is "${position}", should be "sticky" on desktop`);
                
                // Force sticky positioning if needed
                el.style.position = 'sticky';
                el.style.top = 'var(--stick-top)';
                el.style.alignSelf = 'start';
                el.style.zIndex = '1';
                
                console.log('    ✅ Applied sticky fix');
            }
            
            // Ensure images inside are visible
            const images = el.querySelectorAll('img');
            images.forEach(img => {
                img.style.opacity = '1';
                img.style.transform = 'none';
            });
        });
    }
    
    // Function to test sticky behavior
    window.testSticky = function() {
        console.log('=== STICKY DIAGNOSTICS ===');
        
        // Check CSS variable
        const rootStyles = getComputedStyle(document.documentElement);
        const stickTop = rootStyles.getPropertyValue('--stick-top');
        console.log('CSS Variable --stick-top:', stickTop || 'NOT SET');
        
        // Check each sticky element
        const stickyElements = document.querySelectorAll('.sticky-media');
        stickyElements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            
            console.log(`Sticky Element ${i + 1}:`, {
                position: styles.position,
                top: styles.top,
                actualTop: rect.top,
                height: rect.height,
                isSticking: rect.top <= (parseInt(stickTop) || 96)
            });
        });
        
        console.log('To fix: Run fixSticky()');
    };
    
    // Manual fix function
    window.fixSticky = function() {
        console.log('[Sticky] Applying manual fixes...');
        
        // Ensure CSS variable is set
        updateStickyTop();
        
        // Fix all sticky elements
        const stickyElements = document.querySelectorAll('.sticky-media');
        stickyElements.forEach((el) => {
            if (window.innerWidth >= 768) {
                el.style.cssText = `
                    position: sticky !important;
                    top: var(--stick-top) !important;
                    align-self: start !important;
                    z-index: 1 !important;
                `;
            } else {
                el.style.cssText = '';
            }
        });
        
        console.log('[Sticky] ✅ Manual fixes applied');
    };
    
    // Initialize on DOM ready
    function init() {
        // Set initial sticky top
        updateStickyTop();
        
        // Verify sticky elements
        setTimeout(verifyStickyElements, 100);
        
        // Update on window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                updateStickyTop();
                verifyStickyElements();
            }, 250);
        });
        
        // Update when navbar changes (e.g., when gurus hide/show)
        const navbar = document.getElementById('navbar');
        if (navbar) {
            // Use MutationObserver to watch for class changes
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        setTimeout(updateStickyTop, 50);
                    }
                });
            });
            
            observer.observe(navbar, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        console.log('[Sticky] ✅ Initialization complete');
        console.log('[Sticky] 💡 Run testSticky() to diagnose issues');
        console.log('[Sticky] 🔧 Run fixSticky() to apply manual fixes');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already loaded
        init();
    }
    
    // Also run on window load as backup
    window.addEventListener('load', function() {
        setTimeout(function() {
            updateStickyTop();
            verifyStickyElements();
        }, 500);
    });
    
})();
