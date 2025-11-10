// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Scroll Progress Indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    function updateScrollProgress() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }
    
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
    
    // Custom Cursor Implementation
    if (window.innerWidth > 768) { // Only on desktop
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        // Hide cursor initially until first mouse move
        cursor.style.opacity = '0';
        
        let currentX = 0;
        let currentY = 0;
        let isOverImage = false;
        
        // Track mouse position and update cursor immediately
        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            currentX = e.clientX;
            currentY = e.clientY;
            
            // If not over an image, follow cursor exactly
            if (!isOverImage) {
                cursor.style.left = currentX + 'px';
                cursor.style.top = currentY + 'px';
            }
        });
        
        // Hover effects on all interactive elements (buttons, links, and projects)
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .work-item, .gallery-item, .project-live-link, .project-back-link, .resume-button, .burger-menu, .work-image, .project-main-image, .project-gallery-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
        
        // Click effect
        document.addEventListener('mousedown', () => cursor.classList.add('click'));
        document.addEventListener('mouseup', () => cursor.classList.remove('click'));
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    const burgerMenu = document.querySelector('.burger-menu');
    const navigation = document.querySelector('.navigation');
    const navClose = document.querySelector('.nav-close');
    
    // Reset navigation state on page load
    if (navigation) {
        burgerMenu.classList.remove('active');
        navigation.classList.remove('active');
        // Clear any inline styles that might have been set
        navigation.style.display = '';
    }
    
    // Add ripple effect to buttons and links
    const rippleElements = document.querySelectorAll('button, .project-live-link, .project-back-link, .resume-button, .nav-link');
    rippleElements.forEach(element => {
        element.classList.add('ripple');
    });
    
    // Enhanced Scroll Reveal with fade and slide animations
    const revealElements = document.querySelectorAll('.text-reveal-wrapper, .work-item, .project-detail-item, .project-description-section, .project-gallery-item');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        // Set initial state for animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        revealObserver.observe(element);
    });
    
    // Burger menu toggle
    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navigation.classList.toggle('active');
        
        // For desktop, also show/hide the navigation overlay
        if (window.innerWidth > 768) {
            if (navigation.classList.contains('active')) {
                navigation.style.display = 'flex';
            } else {
                navigation.style.display = 'none';
            }
        }
    });
    
    // Close button functionality
    if (navClose) {
        navClose.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            if (window.innerWidth > 768) {
                navigation.style.display = 'none';
            }
        });
    }
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close menu for links that open in new tab
            if (this.getAttribute('target') === '_blank') {
                return;
            }
            
            // Close menu for normal navigation
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            if (window.innerWidth > 768) {
                navigation.style.display = 'none';
            }
            
            // Let the browser handle navigation to other pages
            // No preventDefault needed for page navigation
        });
    });
    
    // Page Transitions - Fade out on link click
    const allLinks = document.querySelectorAll('a[href]');
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip external links, new tab links, hash links, and special protocols
        if (!href || 
            link.getAttribute('target') === '_blank' ||
            href.startsWith('http://') || 
            href.startsWith('https://') ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:')) {
            return;
        }
        
        // Only handle internal page links
        link.addEventListener('click', function(e) {
            // Add fade-out effect
            document.body.classList.add('fade-out');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 400); // Match fadeOut animation duration
            
            e.preventDefault();
        });
    });
    
    // SIMPLE APPROACH:
    // 1. Hero section: Always gray (no transition)
    // 2. About section: White by default, smooth transition to gray at the end
    
    window.addEventListener('scroll', function() {
        const aboutSection = document.querySelector('.about-section');
        const scrollPosition = window.scrollY;
        
        if (aboutSection) {
            const aboutBottom = aboutSection.offsetTop + (aboutSection.offsetHeight / 8); // Start transition from 1/8 of about section
            
            if (scrollPosition < aboutBottom) {
                // BEFORE END OF ABOUT SECTION - WHITE
                document.body.style.setProperty('background-color', '#ffffff', 'important');
                // Update text colors for white background
                document.querySelectorAll('.about-text').forEach(el => {
                    el.style.setProperty('color', '#333333', 'important');
                });
                const label = document.querySelector('.about-label');
                if (label) label.style.setProperty('color', '#333333', 'important');
                const ctaLink = document.querySelector('.cta-link');
                if (ctaLink) {
                    ctaLink.style.setProperty('color', '#333333', 'important');
                    ctaLink.style.setProperty('border-color', '#333333', 'important');
                }
            } else {
                // AFTER END OF ABOUT SECTION - GRAY
                document.body.style.setProperty('background-color', '#212121', 'important');
                // Update text colors for gray background
                document.querySelectorAll('.about-text').forEach(el => {
                    el.style.setProperty('color', '#ffffff', 'important');
                });
                const label = document.querySelector('.about-label');
                if (label) label.style.setProperty('color', '#ffffff', 'important');
                const ctaLink = document.querySelector('.cta-link');
                if (ctaLink) {
                    ctaLink.style.setProperty('color', '#ffffff', 'important');
                    ctaLink.style.setProperty('border-color', '#ffffff', 'important');
                }
            }
        }
    });
    
    
    // Page load animations - hero elements only
    function animateOnLoad() {
        // Reset all animations first
        const titleLine1 = document.querySelector('.hero-title-line-1');
        const titleLine2 = document.querySelector('.hero-title-line-2');
        const titleLine3 = document.querySelector('.hero-title-line-3');
        const heroPortrait = document.querySelector('.hero-portrait');
        const heroName = document.querySelector('.hero-name');
        const heroYear = document.querySelector('.hero-year');
        const heroExperience = document.querySelector('.hero-experience');
        
        // Remove animate classes
        if (titleLine1) titleLine1.classList.remove('animate');
        if (titleLine2) titleLine2.classList.remove('animate');
        if (titleLine3) titleLine3.classList.remove('animate');
        if (heroPortrait) heroPortrait.classList.remove('animate');
        if (heroName) heroName.classList.remove('animate');
        if (heroYear) heroYear.classList.remove('animate');
        if (heroExperience) heroExperience.classList.remove('animate');
        
        // Force reflow
        if (titleLine1) titleLine1.offsetHeight;
        
        // Animate title lines with staggered timing
        setTimeout(() => {
            if (titleLine1) {
                titleLine1.classList.add('animate');
            }
        }, 200);
        
        setTimeout(() => {
            if (titleLine2) {
                titleLine2.classList.add('animate');
            }
        }, 400);
        
        setTimeout(() => {
            if (titleLine3) {
                titleLine3.classList.add('animate');
            }
        }, 600);
        
        // Animate portrait
        setTimeout(() => {
            if (heroPortrait) heroPortrait.classList.add('animate');
        }, 800);
        
        // Animate name
        setTimeout(() => {
            if (heroName) heroName.classList.add('animate');
        }, 1000);
        
        // Animate year
        setTimeout(() => {
            if (heroYear) heroYear.classList.add('animate');
        }, 1200);
        
        // Animate experience
        setTimeout(() => {
            if (heroExperience) heroExperience.classList.add('animate');
        }, 1400);
    }
    
    // About section scroll animation - paragraph-based staggered text
    const aboutParagraphs = document.querySelectorAll('.about-paragraph');
    
    const aboutTextObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraph = entry.target;
                const textElements = paragraph.querySelectorAll('.about-text');
                
                // Get paragraph number (1 or 2)
                const isParagraph2 = paragraph.classList.contains('about-paragraph-2');
                const baseDelay = isParagraph2 ? 400 : 200; // Second paragraph starts shortly after
                
                // Animate each paragraph
                textElements.forEach((textElement, index) => {
                    setTimeout(() => {
                        textElement.classList.add('animate');
                    }, baseDelay);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    aboutParagraphs.forEach(paragraph => {
        aboutTextObserver.observe(paragraph);
    });
    
    // Experience section animations
    const experienceTitle = document.querySelector('.experience-title h2');
    const experienceItems = document.querySelectorAll('.experience-item');
    
    const experienceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.matches('.experience-title h2')) {
                    // Animate title first
                    entry.target.classList.add('animate');
                    
                    // Add word-by-word reveal effect
                    const words = entry.target.querySelectorAll('.title-word');
                    words.forEach((word, index) => {
                        setTimeout(() => {
                            word.classList.add('revealed');
                        }, index * 200); // 200ms delay between each word
                    });
                } else if (entry.target.matches('.experience-item')) {
                    // Stagger experience items
                    const items = Array.from(experienceItems);
                    const index = items.indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 200); // 200ms delay between each item
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    // Observe title and items
    if (experienceTitle) {
        experienceObserver.observe(experienceTitle);
    }
    
    experienceItems.forEach(item => {
        experienceObserver.observe(item);
    });
    
    // Work page text reveal animation
    const workPageWrappers = document.querySelectorAll('.work-page-section .text-reveal-wrapper');
    const workGallery = document.querySelector('.work-gallery');
    
    const workPageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered animation for text wrappers
                workPageWrappers.forEach((wrapper, index) => {
                    setTimeout(() => {
                        wrapper.classList.add('revealed');
                    }, index * 200); // 200ms delay between each element
                });
                
                // Animate gallery elements
                if (workGallery) {
                    const galleryItems = workGallery.querySelectorAll('.gallery-item');
                    
                    // Animate gallery items
                    galleryItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 600 + (index * 200));
                    });
                }
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe work page section
    const workPageSection = document.querySelector('.work-page-section');
    if (workPageSection) {
        workPageObserver.observe(workPageSection);
    }

    // Gallery item click functionality - Direct navigation
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const projectName = item.getAttribute('data-project');
            
            // Add visual feedback
            item.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                item.style.transform = 'translateY(-5px)';
            }, 200);
            
            // Navigate to project page
            setTimeout(() => {
                if (projectName === 'stplaner') {
                    window.location.href = 'stplaner.html';
                } else if (projectName === 'monun') {
                    window.location.href = 'monun.html';
                } else if (projectName === 'doratec') {
                    window.location.href = 'doratec.html';
                } else if (projectName === 'spitex') {
                    window.location.href = 'spitex.html';
                } else if (projectName === 'jetonikeramika') {
                    window.location.href = 'jetonikeramika.html';
                } else if (projectName === 'mardal') {
                    window.location.href = 'mardal.html';
                } else if (projectName === 'archiget') {
                    window.location.href = 'archiget.html';
                } else if (projectName === 'baren') {
                    window.location.href = 'baren.html';
                } else if (projectName === 'riesen') {
                    window.location.href = 'riesen.html';
                } else if (projectName === 'ennur') {
                    window.location.href = 'ennur.html';
                } else if (projectName === 'socialmedia') {
                    window.location.href = 'socialmedia.html';
                } else if (projectName === 'printing') {
                    window.location.href = 'printing.html';
                } else if (projectName === 'alba') {
                    window.location.href = 'alba.html';
                }
            }, 300);
        });
    });


    // Project page image reveal animation
    // Main Image Carousel with Mouse Drag - Simple approach
    const frame = document.getElementById('carousel-frame');
    if (frame) {
        const track = document.getElementById('carousel-track');
        const slides = Array.from(track.children);
        const dotsEl = frame.querySelector('.carousel-dots');
        
        if (slides.length === 0) return;
        
        // Prevent image dragging - disable default drag behavior on all images
        const images = frame.querySelectorAll('img');
        images.forEach(img => {
            img.draggable = false;
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
        });
        
        // State
        let index = 0;
        let slideW = 1160; // each slide is 1160px (desktop)
        let gap = 24; // 24px gap between slides (desktop)
        let peekWidth = window.innerWidth * 0.2; // 20% of viewport for side previews

        function getSlideWidth() {
            if (window.innerWidth <= 768) {
                // Mobile: 90vw as set in CSS
                return window.innerWidth * 0.9;
            }
            // Desktop: Read actual width from first slide element (respects CSS max-width)
            if (slides[0]) {
                return slides[0].getBoundingClientRect().width;
            }
            return 1160; // Fallback
        }
        
        function getGap() {
            if (window.innerWidth <= 768) {
                return 16; // Mobile: 16px as set in CSS
            }
            return 24; // Desktop: 24px
        }
        
        function isMobile() {
            return window.innerWidth <= 768;
        }
        
        // Build dots
        const dots = dotsEl.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => goTo(i));
        });
        
        function updateSizes() {
            slideW = getSlideWidth();
            gap = getGap();
            peekWidth = isMobile() ? 0 : window.innerWidth * 0.2; // No peek on mobile
            goTo(index, false);
        }
        window.addEventListener('resize', updateSizes);
        
        function offsetFor(i) {
            // Position the track so:
            // - Active slide fills viewport: left edge at 0, right edge at slideW
            // - Previous slide shows its rightmost peekWidth (20%) at the left edge
            // - Next slide shows its leftmost peekWidth (20%) at the right edge
            // - Clear gap between active slide and side previews
            
            // When slide i is active:
            // - Slide i should fill viewport from 0 to slideW
            // - Slide i in flexbox is at position: i * (slideW + gap)
            // - To move slide i's left edge to 0: translateX = -(i * (slideW + gap))
            
            // For previous slide (i-1) to show peekWidth:
            // - Slide i-1 is at position: (i-1) * (slideW + gap) = i * (slideW + gap) - (slideW + gap)
            // - After translateX = -(i * (slideW + gap)), slide i-1 is at: -(slideW + gap)
            // - Slide i-1's right edge is at: -(slideW + gap) + slideW = -gap
            // - We want slide i-1's rightmost peekWidth visible at left edge
            // - Slide i-1's rightmost peekWidth is from position (slideW - peekWidth) to slideW
            // - Relative to slide i-1's left edge, this is at: slideW - peekWidth to slideW
            // - After translateX, these become: -(slideW + gap) + (slideW - peekWidth) to -(slideW + gap) + slideW
            // - Which is: -gap - peekWidth to -gap
            // - We want this to be visible from 0 to peekWidth
            // - So we need to shift right by: gap + peekWidth
            // - Final translateX: -(i * (slideW + gap)) + gap + peekWidth
            
            // But wait, this moves active slide's left edge to gap + peekWidth, not 0...
            
            // Actually, the issue is that we can't have both:
            // 1. Active slide fills viewport (0 to slideW)
            // 2. Previous slide shows peekWidth starting at 0
            
            // The solution: active slide starts slightly to the right to make room for peekWidth
            // Active slide should fill from peekWidth to peekWidth + slideW (but we clip to viewport)
            // Or better: active slide fills viewport, and peekWidth shows beyond the edges
            
            // Let's try a different approach: position so active slide fills viewport, 
            // and previous slide's right edge is at 0 (showing peekWidth from 0 to peekWidth)
            // This means: translateX = -(i * (slideW + gap)) + peekWidth
            // But then active slide's left edge is at peekWidth, not 0...
            
            // Actually, I think we need to reconsider: the viewport shows peekWidth + active + peekWidth
            // So active slide doesn't fill the full viewport, it fills the middle portion
            // But user said "main image fully in center" and "filling viewport"...
            
            // Let me try: active slide fills viewport (0 to slideW), and peekWidth is visible beyond edges
            // This requires overflow: visible on container, but we have overflow: hidden...
            
            // Alternative: position so active slide is centered, with peekWidth visible on sides
            // translateX = -(i * (slideW + gap)) + peekWidth
            // This makes active slide start at peekWidth, filling peekWidth to peekWidth + slideW
            // But viewport is 0 to slideW, so we see: peekWidth to slideW (not full slide)
            
            // I think the correct approach is:
            // Position active slide to fill viewport, and show peekWidth beyond the edges
            // This requires the container to be wider or overflow visible
            // But we can simulate it by positioning correctly
            
            // Let's try: translateX = -(i * (slideW + gap)) + peekWidth
            // This positions active slide starting at peekWidth
            // But we want it to fill viewport, so we need to adjust
            
            // Actually, let me reconsider: if active slide fills viewport (0 to slideW),
            // and previous slide shows peekWidth at left edge, then:
            // - Previous slide's right edge should be at 0
            // - Previous slide's rightmost peekWidth is from -peekWidth to 0
            // - After translateX = -(i * (slideW + gap)), slide i-1's right edge is at -gap
            // - We need to shift right by gap to make it 0
            // - So: translateX = -(i * (slideW + gap)) + gap
            // But this doesn't account for peekWidth...
            
            // I think the correct formula is:
            // translateX = -(i * (slideW + gap)) + peekWidth
            // This positions active slide starting at peekWidth, but we clip to show 0 to slideW
            
            // Actually wait, let me check what the user wants again:
            // "main image fully in center" - so centered
            // "filling viewport" - so fills 0 to slideW
            // "previous slide shows 20% at left edge" - so peekWidth from 0
            // This is impossible with overflow: hidden...
            
            // Unless... the container is wider than viewport? Or we use padding?
            
            // Position so active slide fills viewport (0 to slideW)
            // And previous slide shows its rightmost peekWidth (20%) at the left edge
            // This means: previous slide's right edge should be at 0 (showing peekWidth from -peekWidth to 0)
            // But with overflow: hidden, we can't see beyond 0...
            // So we position previous slide's right edge at peekWidth, showing peekWidth from 0 to peekWidth
            // Active slide then starts at: peekWidth + gap
            // But we want active slide to fill viewport (0 to slideW)...
            
            // Solution: position active slide at 0, and show peekWidth beyond the left edge
            // But with overflow: hidden, we need to use a different approach
            // OR: position active slide slightly to the right to make room for peekWidth
            
            // Let's try: position so active slide fills most of viewport, starting at peekWidth
            // This means: translateX = -(i * (slideW + gap)) + peekWidth
            // Active slide starts at peekWidth, fills peekWidth to peekWidth + slideW
            // But viewport is 0 to slideW, so we see: peekWidth to slideW (not full slide)
            
            // Actually, I think we need to position differently:
            // Active slide should fill 0 to slideW, and previous slide's peekWidth shows beyond -peekWidth to 0
            // This requires overflow: visible OR we position active slide starting at peekWidth
            
            // With overflow: hidden, we can't show peekWidth beyond 0
            // So we position previous slide's right edge at peekWidth, showing peekWidth from 0 to peekWidth
            // And active slide starts at peekWidth + gap
            // But we want active slide to fill viewport...
            
            // I think the correct approach with overflow: hidden is:
            // Position active slide to fill viewport, and previous slide's right edge is at peekWidth
            // This means: translateX = -(i * (slideW + gap)) + peekWidth
            // Active slide starts at peekWidth, but we want it to fill 0 to slideW...
            
            // Actually, let me try: position active slide at 0, and previous slide's right edge at peekWidth
            // This means previous slide shows peekWidth from 0 to peekWidth
            // And active slide fills from peekWidth + gap to slideW
            // But we want active slide to fill 0 to slideW...
            
            // With overflow: visible, we can show peekWidth beyond viewport edges
            // Position active slide to fill viewport (0 to slideW)
            // Previous slide's right edge should be at 0 (showing peekWidth from -peekWidth to 0)
            // After translateX = -(i * (slideW + gap)), slide i's left edge is at 0 ✓
            // Previous slide (i-1) is at -(slideW + gap), its right edge is at -gap
            // We want previous slide's right edge at 0, so shift right by gap
            // translateX = -(i * (slideW + gap)) + gap
            // But this doesn't show peekWidth... we need previous slide's right edge at -peekWidth
            // So shift right by gap + peekWidth
            // translateX = -(i * (slideW + gap)) + gap + peekWidth
            // But this moves active slide's left edge to gap + peekWidth, not 0...
            
            // Actually, I think the correct approach is:
            // Position active slide at 0 (fills viewport)
            // Previous slide's right edge at 0 (showing peekWidth from -peekWidth to 0)
            // This means: translateX = -(i * (slideW + gap)) + gap
            // Previous slide's right edge is at 0, showing peekWidth from -peekWidth to 0
            // Active slide starts at gap, not 0...
            
            // Let me try: translateX = -(i * (slideW + gap))
            // Active slide at 0 ✓
            // Previous slide at -(slideW + gap), right edge at -gap
            // To show peekWidth, we need previous slide's right edge at -peekWidth
            // So shift right by: gap - peekWidth
            // translateX = -(i * (slideW + gap)) + gap - peekWidth
            // But this moves active slide's left edge to gap - peekWidth, not 0...
            
            // I think the simplest solution is:
            // Position active slide at 0, and previous slide shows peekWidth beyond -peekWidth
            // translateX = -(i * (slideW + gap)) + gap
            // This positions active slide starting at gap, but we can adjust...
            
            // Actually, let me try: translateX = -(i * (slideW + gap))
            // This positions active slide at 0 (fills viewport)
            // Previous slide's right edge is at -gap
            // With overflow: visible, we see from -gap to slideW
            // But we want peekWidth visible from -peekWidth to 0
            // So we need previous slide's right edge at -peekWidth
            // Shift right by: gap - peekWidth
            // But this doesn't work...
            
            // Position active slide to fill viewport (0 to slideW)
            // With overflow: visible, previous slide's peekWidth shows beyond left edge
            // translateX = -(i * (slideW + gap)) positions active slide at 0
            // Previous slide is at -(slideW + gap), right edge at -gap
            // To show peekWidth, we shift right by (gap - peekWidth)
            // But this doesn't work...
            
            // Actually, let me recalculate from first principles:
            // We want: active slide fills 0 to slideW
            // Previous slide shows peekWidth from -peekWidth to 0
            // Previous slide's right edge should be at 0
            // Previous slide's left edge is at -slideW
            // Previous slide in flexbox is at: (i-1) * (slideW + gap)
            // After translateX, it should be at -slideW
            // So: (i-1) * (slideW + gap) + translateX = -slideW
            // translateX = -slideW - (i-1) * (slideW + gap)
            // = -slideW - i*(slideW + gap) + (slideW + gap)
            // = -i*(slideW + gap) + gap
            
            // But we also need active slide at 0:
            // i * (slideW + gap) + translateX = 0
            // translateX = -i * (slideW + gap)
            
            // These conflict! We need to choose one.
            
            // Let's prioritize: active slide fills viewport
            // translateX = -(i * (slideW + gap))
            // This positions active slide at 0
            // Previous slide's right edge is at -gap
            // With overflow: visible, we can see from -gap to slideW
            // But we want peekWidth visible from -peekWidth to 0
            // So we shift right by (gap - peekWidth) to show more of previous slide
            // Final: translateX = -(i * (slideW + gap)) + (gap - peekWidth)
            
            // Simplified calculation:
            // Position active slide to fill viewport (0 to slideW)
            // translateX = -(i * (slideW + gap)) positions active slide at 0
            // With overflow: visible, previous slide's peekWidth shows beyond left edge
            // But we need to account for gap, so shift by gap
            // translateX = -(i * (slideW + gap)) + gap
            // This positions active slide starting at gap, not 0...
            
            // Actually, let me try: position active slide at 0, ignore gap for positioning
            // translateX = -(i * slideW)
            // But this doesn't account for gap...
            
            // Let me try the simplest that accounts for gap and peekWidth:
            // Position so previous slide's right edge is at 0 (showing peekWidth from -peekWidth to 0)
            // Active slide starts at gap
            // But we want active slide to start at 0...
            
            // I think the solution is to position active slide at 0, and let peekWidth show beyond
            // translateX = -(i * (slideW + gap))
            // This positions active slide at 0 ✓
            // Previous slide's right edge is at -gap
            // With overflow: visible, we see from -gap to slideW
            // To show peekWidth, we shift right by gap
            // translateX = -(i * (slideW + gap)) + gap
            // But this moves active slide to gap...
            
            // Actually, I think we need to accept that active slide can't fill 0 to slideW
            // if we want to show peekWidth. Let me try:
            // translateX = -(i * (slideW + gap)) + peekWidth
            // Active slide starts at peekWidth, fills peekWidth to peekWidth + slideW
            // With viewport 0 to slideW, we see peekWidth to slideW (not full slide)
            
            // Or maybe we need to make the container wider? Or use padding?
            
            // Position so active slide fills viewport (0 to slideW)
            // and previous slide shows its rightmost 20% at left edge (0 to peekWidth)
            
            // Active slide should be at position 0 (fills 0 to slideW)
            // Active slide in flexbox is at: i * (slideW + gap)
            // So: translateX = -(i * (slideW + gap))
            
            // But we also need previous slide's right edge at peekWidth
            // Previous slide (i-1) is at: (i-1) * (slideW + gap)
            // After translateX = -(i * (slideW + gap)), it's at: -(slideW + gap)
            // Previous slide's right edge is at: -(slideW + gap) + slideW = -gap
            // We want it at peekWidth, so shift right by: gap + peekWidth
            // Final: translateX = -(i * (slideW + gap)) + gap + peekWidth
            
            // But this moves active slide to gap + peekWidth, not 0...
            
            // I think the solution is that active slide can't fill 0 to slideW exactly
            // if we want to show peekWidth. Active slide fills from peekWidth + gap to peekWidth + gap + slideW
            // But viewport is 0 to slideW, so we need to adjust the container or use padding
            
            // Actually, with overflow: visible, we can show beyond edges
            // So: translateX = -(i * (slideW + gap)) + gap
            // This positions previous slide's right edge at 0, showing peekWidth from -peekWidth to 0
            // But we want peekWidth from 0 to peekWidth, so shift by peekWidth more
            // translateX = -(i * (slideW + gap)) + gap + peekWidth
            
            // But then active slide starts at gap + peekWidth...
            
            // Let me try: position active slide at 0, previous slide extends beyond
            // translateX = -(i * (slideW + gap))
            // Previous slide's right edge is at -gap
            // To show peekWidth, we shift right by gap
            // translateX = -(i * (slideW + gap)) + gap
            
            // Position so active slide (1200px) is centered in viewport
            // and previous/next slides show 20% at the edges by default
            
            // Active slide should be centered in viewport
            // Previous slide's right edge should be at peekWidth (showing 20% from 0 to peekWidth)
            // Next slide's left edge should be at (viewportWidth - peekWidth) (showing 20% on right)
            
            // Active slide center should be at viewport center
            // But we also need previous slide's right edge at peekWidth
            // Previous slide (i-1) is at: (i-1) * (slideW + gap)
            // After translateX, previous slide should be at: peekWidth - slideW
            // So: (i-1) * (slideW + gap) + translateX = peekWidth - slideW
            // translateX = peekWidth - slideW - (i-1) * (slideW + gap)
            // = peekWidth - slideW - i*(slideW + gap) + (slideW + gap)
            // = peekWidth - i*(slideW + gap) + gap
            
            // But we also want active slide centered
            // Active slide center should be at: window.innerWidth / 2
            // Active slide is at: i * (slideW + gap)
            // After translateX, active slide left edge is at: i * (slideW + gap) + translateX
            // Active slide center is at: i * (slideW + gap) + translateX + slideW / 2
            
            // Let's prioritize: show previous slide's 20% on left, active slide centered
            // translateX = peekWidth - i*(slideW + gap) + gap
            // This positions previous slide's right edge at peekWidth
            // Active slide left edge is at: i * (slideW + gap) + peekWidth - i*(slideW + gap) + gap = peekWidth + gap
            
            // Actually, let's center active slide and show side previews
            // translateX = window.innerWidth / 2 - i * (slideW + gap) - slideW / 2
            // This centers active slide, and with overflow: visible, side previews should show
            
            // Position so active slide (1200px) is centered in viewport
            // and previous/next slides show 20% at the edges by default
            
            // Active slide should be centered in viewport
            // Viewport center is at: window.innerWidth / 2
            // Active slide center should be at viewport center
            // Active slide in flexbox is at: i * (slideW + gap)
            // Active slide center is at: i * (slideW + gap) + slideW / 2
            // After translateX, active slide center should be at: window.innerWidth / 2
            // So: i * (slideW + gap) + slideW / 2 + translateX = window.innerWidth / 2
            // translateX = window.innerWidth / 2 - i * (slideW + gap) - slideW / 2
            
            // This positions active slide centered, and with overflow: visible,
            // the previous and next slides will show 20% at the edges
            if (isMobile()) {
                // Mobile: center the slide in viewport (same as desktop logic)
                const viewportCenter = window.innerWidth / 2;
                return viewportCenter - (i * (slideW + gap)) - (slideW / 2);
            } else {
                // Desktop: center slide with peek previews on sides
                const viewportCenter = window.innerWidth / 2;
                return viewportCenter - (i * (slideW + gap)) - (slideW / 2);
            }
        }
        
        function applyTransform(x) {
            // Use translate3d for GPU acceleration
            track.style.transform = `translate3d(${x}px, 0, 0)`;
        }
        
        function goTo(i, animate = true) {
            index = Math.max(0, Math.min(slides.length - 1, i));
            
            if (!animate) {
                track.style.transition = 'none';
                requestAnimationFrame(() => {
                    applyTransform(offsetFor(index));
                    // force reflow then restore transition
                    track.offsetHeight;
                    track.style.transition = '';
                });
            } else {
                applyTransform(offsetFor(index));
            }
            
            // Update active states
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === index);
            });
            
            // Update dots
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        
        // Drag/swipe
        let dragging = false;
        let touchStarted = false;
        let startX = 0;
        let startY = 0;
        let startOffset = 0;
        let isHorizontalSwipe = null; // Track if user is swiping horizontally or vertically
        
        function onDown(e) {
            // For mouse events, prevent default and start dragging immediately
            if (!e.touches) {
                e.preventDefault();
                e.stopPropagation();
                dragging = true;
                track.style.transition = 'none';
                track.style.willChange = 'transform';
                frame.style.cursor = 'grabbing';
            } else {
                // For touch events, just record the start position but DON'T start dragging yet
                touchStarted = true;
                dragging = false;
            }
            
            startX = (e.touches ? e.touches[0].pageX : e.pageX);
            startY = (e.touches ? e.touches[0].pageY : e.pageY);
            startOffset = offsetFor(index);
            isHorizontalSwipe = null; // Reset swipe direction detection
        }
        
        function onMove(e) {
            // For touch events, check direction FIRST before any calculations
            if (e.touches && touchStarted && !dragging) {
                // Get position but don't calculate yet
                const x = e.touches[0].pageX;
                const y = e.touches[0].pageY;
                const dx = Math.abs(x - startX);
                const dy = Math.abs(y - startY);
                
                // If vertical movement is greater, exit IMMEDIATELY - let browser scroll
                if (dy > 3 && dy > dx) {
                    touchStarted = false;
                    dragging = false;
                    return; // Exit before doing ANY work
                }
                
                // Only continue if horizontal movement is detected
                if (dx > 3 && dx > dy) {
                    dragging = true;
                    touchStarted = false;
                    track.style.transition = 'none';
                    track.style.willChange = 'transform';
                } else {
                    // Not enough movement yet
                    return;
                }
            }
            
            // For mouse events, get coordinates normally
            const x = (e.touches ? e.touches[0].pageX : e.pageX);
            const y = (e.touches ? e.touches[0].pageY : e.pageY);
            const dx = x - startX;
            const dy = y - startY;
            
            // If we're not dragging, exit immediately
            if (!dragging) return;
            
            // We're dragging horizontally - transform slider
            // Can't preventDefault with passive: true, but touch-action handles it
            
            // Prevent default for mouse events only
            if (!e.touches) {
                e.preventDefault();
            }
            
            // Calculate new position with bounds
            const minOffset = offsetFor(slides.length - 1);
            const maxOffset = offsetFor(0);
            let newOffset = startOffset + dx;
            
            // Apply resistance when dragging beyond bounds
            if (newOffset > maxOffset) {
                // Dragging right beyond first slide - add resistance
                newOffset = maxOffset + (dx - (maxOffset - startOffset)) * 0.3;
            } else if (newOffset < minOffset) {
                // Dragging left beyond last slide - add resistance
                newOffset = minOffset + (dx - (minOffset - startOffset)) * 0.3;
            }
            
            // Apply transform immediately for smooth dragging
            applyTransform(newOffset);
        }
        
        function onUp(e) {
            // Reset touch started flag
            touchStarted = false;
            
            if (!dragging) return;
            
            dragging = false;
            frame.style.cursor = 'grab';
            track.style.willChange = '';
            
            // Get current position - use pageX for mouse events
            let currentX;
            if (e.changedTouches && e.changedTouches.length > 0) {
                currentX = e.changedTouches[0].pageX;
            } else {
                currentX = e.pageX;
            }
            
            const diffX = startX - currentX;
            
            // Mobile: more sensitive threshold (20px), Desktop: 30px
            const threshold = isMobile() ? 20 : 30;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Dragged LEFT - go to NEXT slide (index++)
                    if (index < slides.length - 1) {
                        index++;
                    }
                } else {
                    // Dragged RIGHT - go to PREVIOUS slide (index--)
                    if (index > 0) {
                        index--;
                    }
                }
            }
            
            // Always go to the calculated index
            track.style.transition = '';
            goTo(index);
        }
        
        // Mouse events for desktop
        frame.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        
        // Touch events - attach to IMAGES only (they have pointer-events: auto)
        // The slides have pointer-events: none to allow scrolling
        // touch-action: pan-y on frame allows vertical scrolling
        images.forEach(img => {
            img.addEventListener('touchstart', onDown, { passive: true });
            img.addEventListener('touchmove', onMove, { passive: true });
            img.addEventListener('touchend', onUp, { passive: true });
        });
        
        // Prevent default drag behavior on the entire carousel
        frame.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Also prevent context menu on right-click
        frame.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (frame.querySelector('.carousel-slide.active')) {
                if (e.key === 'ArrowLeft') {
                    goTo(index - 1);
                } else if (e.key === 'ArrowRight') {
                    goTo(index + 1);
                }
            }
        });
        
        // Initialize slide width, gap, and peek width
        slideW = getSlideWidth();
        gap = getGap();
        peekWidth = isMobile() ? 0 : window.innerWidth * 0.2;
        
        // Init
        goTo(0, false);
    }
    
    // Gallery images reveal only when scrolling to them
    const projectGalleryImages = document.querySelectorAll('.project-gallery-section .work-image');
    
    if (projectGalleryImages.length > 0) {
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    // Add revealed class with stagger
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 200); // 200ms stagger between images
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe each gallery image individually
        projectGalleryImages.forEach(image => {
            galleryObserver.observe(image);
        });
    }
    
    // Horizontal Sections scroll reveals
    const horizontalSectionItems = document.querySelectorAll('.horizontal-section-item');
    
    if (horizontalSectionItems.length > 0) {
        const horizontalSectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 150); // Staggered reveal
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -80px 0px'
        });
        
        horizontalSectionItems.forEach(item => {
            horizontalSectionObserver.observe(item);
        });
    }
    
    // Education section - simple reveal
    const educationSection = document.querySelector('.about-education');
    if (educationSection) {
        let hasAppeared = false;
        
        const educationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAppeared) {
                    educationSection.classList.add('revealed');
                    hasAppeared = true;
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        educationObserver.observe(educationSection);
    }
    
    // Project page text appear animation - observe each wrapper individually
    const projectPageWrappers = document.querySelectorAll('.project-main .text-reveal-wrapper');
    
    if (projectPageWrappers.length > 0) {
        // Ensure all wrappers start in hidden state with opacity
        projectPageWrappers.forEach(wrapper => {
            if (!wrapper.classList.contains('revealed')) {
                // Force initial state
                const children = wrapper.children;
                for (let child of children) {
                    child.style.opacity = '0';
                }
            }
        });
        
        const projectPageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    // Add revealed class with a slight stagger for elements in the same section
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 100); // 100ms delay between each element
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe each wrapper individually
        projectPageWrappers.forEach(wrapper => {
            projectPageObserver.observe(wrapper);
        });
    }

    // Start animations when page loads
    animateOnLoad();
    
});
