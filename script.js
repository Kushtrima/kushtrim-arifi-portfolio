// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function () {
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
        entries.forEach((entry) => {
            if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                // Animate immediately when entering viewport
                entry.target.classList.add('revealed');
                entry.target.style.setProperty('opacity', '1', 'important');
                entry.target.style.setProperty('transform', 'translateY(0)', 'important');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(element => {
        // Set initial state for animation - force with !important
        element.style.setProperty('opacity', '0', 'important');
        element.style.setProperty('transform', 'translateY(30px)', 'important');
        element.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        revealObserver.observe(element);
    });

    // Burger menu toggle
    burgerMenu.addEventListener('click', function () {
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
        navClose.addEventListener('click', function () {
            burgerMenu.classList.remove('active');
            navigation.classList.remove('active');
            if (window.innerWidth > 768) {
                navigation.style.display = 'none';
            }
        });
    }

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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
        link.addEventListener('click', function (e) {
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

    // Scroll Manager to consolidate listeners
    class ScrollManager {
        constructor() {
            this.callbacks = [];
            this.ticking = false;
            this.scrollY = window.scrollY;
            this.windowHeight = window.innerHeight;

            this.handleScroll = this.handleScroll.bind(this);
            this.handleResize = this.handleResize.bind(this);
            this.update = this.update.bind(this);

            window.addEventListener('scroll', this.handleScroll, { passive: true });
            window.addEventListener('resize', this.handleResize);
        }

        add(callback) {
            this.callbacks.push(callback);
        }

        handleScroll() {
            this.scrollY = window.scrollY;
            this.requestTick();
        }

        handleResize() {
            this.scrollY = window.scrollY;
            this.windowHeight = window.innerHeight;
            this.requestTick();
        }

        requestTick() {
            if (!this.ticking) {
                window.requestAnimationFrame(this.update);
                this.ticking = true;
            }
        }

        update() {
            this.callbacks.forEach(cb => cb(this.scrollY, this.windowHeight));
            this.ticking = false;
        }
    }

    const scrollManager = new ScrollManager();

    // SIMPLE APPROACH:
    // 1. Hero section: Always gray (no transition)
    // 2. About section: White by default, smooth transition to gray at the end
    function updateBackgroundColor(scrollY) {
        const aboutSection = document.querySelector('.about-section');

        if (aboutSection) {
            const aboutBottom = aboutSection.offsetTop + (aboutSection.offsetHeight / 8);

            if (scrollY < aboutBottom) {
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
    }
    scrollManager.add(updateBackgroundColor);
    // Initial update
    updateBackgroundColor(window.scrollY);


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

    const aboutTextObserver = new IntersectionObserver(function (entries) {
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
    // Exclude gallery section title so it animates like other text via the generic observer
    // Use the generic revealObserver for all text; only handle gallery items here
    const workPageWrappers = []; // No special text handling to ensure consistent reveal
    const workGallery = document.querySelector('.work-gallery');

    const workPageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (workGallery) {
                    const galleryItems = workGallery.querySelectorAll('.gallery-item');
                    galleryItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 600 + (index * 200));
                    });
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe work page section (for gallery items only)
    const workPageSection = document.querySelector('.work-page-section');
    if (workPageSection) workPageObserver.observe(workPageSection);

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
                } else if (projectName === 'wmk') {
                    window.location.href = 'wmk.html';
                }
            }, 300);
        });
    });


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

    /**
     * Reusable function for Scroll-Linked Image Reveal
     * Images move from bottom as you scroll
     * Uses shared ScrollManager for performance
     */
    function setupScrollLinkedReveal(selector, manager) {
        const images = document.querySelectorAll(selector);

        if (images.length === 0) return;

        // Shared logic, called by ScrollManager
        function updatePositions(scrollY, windowHeight) {
            const viewportCenter = windowHeight / 2;
            const isMobile = window.innerWidth <= 768; // Check dynamically

            images.forEach((image) => {
                const rect = image.getBoundingClientRect();
                const imageTop = rect.top;
                const imageCenter = imageTop + (rect.height / 2);

                // MOBILE: Center spotlight effect - only centered image is fully visible
                if (isMobile) {
                    const distanceFromCenter = Math.abs(imageCenter - viewportCenter);
                    const fadeZone = windowHeight * 0.3; // Images fade over 30% of viewport height

                    let opacity = 1;
                    if (distanceFromCenter > fadeZone) {
                        opacity = 0.3;
                    } else {
                        opacity = 1 - (distanceFromCenter / fadeZone) * 0.7;
                    }

                    image.style.opacity = opacity;
                    image.style.transform = 'translateY(0) scale(1)';
                    image.style.setProperty('--gradient-opacity', 0);
                } else {
                    // DESKTOP: Original effect - images appear from bottom
                    const imageAbsoluteTop = scrollY + imageTop;
                    const animationDistance = windowHeight * 0.15;
                    const animationStart = imageAbsoluteTop - animationDistance - (windowHeight * 0.4);
                    const animationEnd = imageAbsoluteTop + animationDistance;

                    let progress = 0;
                    if (scrollY < animationStart) {
                        progress = 0;
                    } else if (scrollY >= animationStart && scrollY < animationEnd) {
                        progress = (scrollY - animationStart) / (animationEnd - animationStart);
                        progress = Math.min(Math.max(progress, 0), 1);
                    } else {
                        progress = 1;
                    }

                    const imageBottomPos = imageTop + rect.height;
                    const imageInFullView = imageTop >= scrollY && imageBottomPos <= (scrollY + windowHeight);
                    const imageCenterY = imageTop + (rect.height / 2);
                    const viewportCenterY = scrollY + (windowHeight / 2);
                    const isNearCenter = Math.abs(imageCenterY - viewportCenterY) < windowHeight * 0.3;

                    if ((imageInFullView || isNearCenter) && progress > 0.5) {
                        progress = 1;
                    }

                    const easedProgress = progress * progress * (3 - 2 * progress);
                    const translateY = (1 - easedProgress) * 80;
                    const opacity = easedProgress;

                    let gradientOpacity = 0;
                    if (easedProgress >= 0.5) {
                        if (imageTop < -200) {
                            const distanceOutOfView = Math.abs(imageTop) - 200;
                            const fadeDistance = 300;
                            gradientOpacity = Math.min(distanceOutOfView / fadeDistance, 1);
                        }
                    }

                    const gradientOpacityClamped = Math.min(Math.max(gradientOpacity, 0), 1);

                    image.style.transform = `translateY(${translateY}px) scale(1)`;
                    image.style.opacity = opacity;
                    image.style.setProperty('--gradient-opacity', gradientOpacityClamped);
                }
            });
        }

        // Register callback with the manager
        if (manager) {
            manager.add(updatePositions);
        }

        // Initial setup
        images.forEach((image) => {
            image.style.transform = 'translateY(80px) scale(1)';
            image.style.opacity = '0';
        });

        // Initial update
        updatePositions(window.scrollY, window.innerHeight);
    }

    // Apply the reveal effect to all project images
    setupScrollLinkedReveal('.stplaner-image-reveal', scrollManager);
    setupScrollLinkedReveal('.monun-image-reveal', scrollManager);
    setupScrollLinkedReveal('.doratec-image-reveal', scrollManager);
    setupScrollLinkedReveal('.spitex-image-reveal', scrollManager);
    setupScrollLinkedReveal('.jetonikeramika-image-reveal', scrollManager);
    setupScrollLinkedReveal('.mardal-image-reveal', scrollManager);
    setupScrollLinkedReveal('.alba-image-reveal', scrollManager);
    setupScrollLinkedReveal('.ennur-image-reveal', scrollManager);

    // Start animations when page loads
    animateOnLoad();

});
