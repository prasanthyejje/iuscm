// Spiritual Gurus Section Scroll Behavior - FIXED
(function() {
    const gurusSection = document.querySelector('.spiritual-gurus');
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 30; // Reduced threshold for more immediate response
    
    let isHidden = false;
    let ticking = false;
    
    function updateGurus(scrollTop) {
        // More precise check - show immediately when at top
        if (scrollTop <= scrollThreshold) {
            if (isHidden) {
                // Show gurus
                if (gurusSection) {
                    gurusSection.classList.remove('gurus-hidden');
                    // Force immediate display
                    gurusSection.style.display = '';
                }
                if (navbar) {
                    navbar.classList.remove('navbar-scrolled');
                }
                isHidden = false;
                console.log('[Gurus] Showing at scroll position:', scrollTop);
            }
        } else {
            if (!isHidden) {
                // Hide gurus
                if (gurusSection) {
                    gurusSection.classList.add('gurus-hidden');
                }
                if (navbar) {
                    navbar.classList.add('navbar-scrolled');
                }
                isHidden = true;
                console.log('[Gurus] Hiding at scroll position:', scrollTop);
            }
        }
    }
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Use requestAnimationFrame for smooth updates
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateGurus(scrollTop);
                ticking = false;
            });
            ticking = true;
        }
        
        // Immediate update for exact top position
        if (scrollTop === 0) {
            updateGurus(0);
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen for scroll end to ensure proper state
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            const finalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            updateGurus(finalScrollTop);
            console.log('[Gurus] Final check at position:', finalScrollTop);
        }, 150);
    }, { passive: true });
    
    // Initial check on load
    setTimeout(function() {
        const initialScroll = window.pageYOffset || document.documentElement.scrollTop;
        updateGurus(initialScroll);
        console.log('[Gurus] Initial position:', initialScroll);
    }, 100);
    
    // Check on window focus (in case user returns to tab)
    window.addEventListener('focus', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        updateGurus(currentScroll);
    });
    
    console.log('[Gurus] Script initialized - Threshold:', scrollThreshold);
})();
