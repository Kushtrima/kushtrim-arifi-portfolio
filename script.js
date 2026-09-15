// Site interactions and motion. Motion runs on GSAP (vendor/gsap: gsap, ScrollTrigger, CustomEase) and keeps
// the durations, delays and easing curves of the CSS transitions and timers it replaced.
document.addEventListener('DOMContentLoaded', function () {
    const hasMotion = Boolean(window.gsap && window.ScrollTrigger && window.CustomEase);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    let EASE = {};
    if (hasMotion) {
        gsap.registerPlugin(ScrollTrigger, CustomEase);
        // Less motion requested by the system: every animation jumps to its end
        if (reducedMotion) gsap.globalTimeline.timeScale(100);
        EASE = {
            smooth: CustomEase.create('smooth', '0.01,0.01,0.5,1'), // --transition-smooth
            reveal: CustomEase.create('reveal', '0.25,0.46,0.45,0.94'),
            ease: CustomEase.create('css-ease', '0.25,0.1,0.25,1'),
            easeOut: CustomEase.create('css-ease-out', '0,0,0.58,1'),
            easeInOut: CustomEase.create('css-ease-in-out', '0.42,0,0.58,1'),
        };

        // An image that finishes loading after the scroll triggers were measured moves everything below it:
        // measure again shortly after (the IntersectionObservers this replaced noticed that by themselves)
        const remeasure = gsap.delayedCall(0.15, () => ScrollTrigger.refresh()).pause();
        document.querySelectorAll('img').forEach((img) => {
            if (!img.complete) img.addEventListener('load', () => remeasure.restart(true), { once: true });
        });
    } else {
        showWithoutMotion();
    }

    // GSAP didn't load: show everything that would otherwise wait for an animation
    function showWithoutMotion() {
        document.body.style.cursor = 'auto';
        document.querySelectorAll('.hero-title-line-1, .hero-title-line-2, .hero-title-line-3, .hero-portrait, .hero-name, .hero-year, .hero-experience, .about-text, .experience-title h2, .experience-item, .work-gallery .gallery-item, .about-title, .about-text-large, .four-column-section, .column')
            .forEach((element) => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
        document.querySelectorAll('.experience-title .title-word').forEach((word) => { word.style.color = cssVar('--color-primary'); });
        document.querySelectorAll('.text-reveal-wrapper').forEach((wrapper) => {
            wrapper.style.setProperty('--text-reveal', '1');
            wrapper.style.setProperty('--text-reveal-y', '0');
        });
        document.querySelectorAll('.project-gallery-section .work-image').forEach((image) => image.style.setProperty('--curtain', '1'));
    }

    // Custom Cursor Implementation
    if (window.innerWidth > 768 && hasMotion) { // Only on desktop
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        // Centred on the pointer at any size, hidden until the first mouse move
        gsap.set(cursor, { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0 });
        const moveX = gsap.quickSetter(cursor, 'left', 'px');
        const moveY = gsap.quickSetter(cursor, 'top', 'px');
        let visible = false;

        // Follow the pointer exactly
        document.addEventListener('mousemove', (e) => {
            if (!visible) {
                gsap.set(cursor, { opacity: 1 });
                visible = true;
            }
            moveX(e.clientX);
            moveY(e.clientY);
        });

        // Hover: grow to 40px and fill white. The fill fades through white, not grey, like a CSS transition,
        // and sizes keep their fractions (GSAP would round them to whole pixels).
        const white = cssVar('--color-primary-rgb');
        const grow = () => {
            if (getComputedStyle(cursor).backgroundColor === 'rgba(0, 0, 0, 0)') gsap.set(cursor, { backgroundColor: `rgba(${white}, 0)` });
            gsap.to(cursor, { width: 40, height: 40, backgroundColor: `rgba(${white}, 1)`, duration: 0.3, ease: EASE.easeOut, autoRound: false, overwrite: 'auto' });
        };
        const shrink = () => gsap.to(cursor, {
            width: 20, height: 20, backgroundColor: `rgba(${white}, 0)`, duration: 0.3, ease: EASE.easeOut, autoRound: false, overwrite: 'auto',
            onComplete: () => gsap.set(cursor, { clearProps: 'backgroundColor' }),
        });

        // Hover effects on all interactive elements (buttons, links, and projects)
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .work-item, .gallery-item, .project-live-link, .project-back-link, .resume-button, .burger-menu, .work-image, .project-main-image, .project-gallery-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', grow);
            el.addEventListener('mouseleave', shrink);
        });

        // Click effect
        document.addEventListener('mousedown', () => gsap.to(cursor, { scale: 0.8, duration: 0.15, ease: EASE.easeOut, overwrite: 'auto' }));
        document.addEventListener('mouseup', () => gsap.to(cursor, { scale: 1, duration: 0.15, ease: EASE.easeOut, overwrite: 'auto' }));
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

    // Scroll reveal: fade in and rise 30px once 10% of the element is 100px above the bottom of the screen.
    // Text inside a .text-reveal-wrapper fades in with it; on the work page it also slides up out of its mask
    // over 1.2s (on project pages project.css never gave that slide a transition, so the text is simply in place).
    // The hidden state eases in over 0.8s (as the old CSS transition did), so an element already on screen
    // is measured where it sits and revealed before it has moved.
    const revealElements = document.querySelectorAll('.text-reveal-wrapper, .work-item, .project-detail-item, .project-description-section, .project-gallery-item');
    if (hasMotion) {
        const textSlides = !document.body.classList.contains('project-body');
        revealElements.forEach((element) => {
            gsap.set(element, { transition: 'none' });
            gsap.to(element, { opacity: 0, y: 30, duration: 0.8, ease: EASE.reveal });
            ScrollTrigger.create({
                trigger: element,
                start: 'top+=10% bottom-=100',
                once: true,
                onEnter: () => {
                    gsap.to(element, { opacity: 1, y: 0, duration: 0.8, ease: EASE.reveal, overwrite: 'auto' });
                    if (element.classList.contains('text-reveal-wrapper')) {
                        gsap.fromTo(element, { '--text-reveal': 0 }, { '--text-reveal': 1, duration: 0.8, ease: EASE.reveal });
                        if (textSlides) gsap.fromTo(element, { '--text-reveal-y': 1 }, { '--text-reveal-y': 0, duration: 1.2, ease: EASE.smooth });
                        else gsap.set(element, { '--text-reveal-y': 0 });
                    }
                },
            });
        });
    }

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
            e.preventDefault();
            if (!hasMotion) {
                window.location.href = href;
                return;
            }
            // Fade the page out over 0.4s, then navigate (the load fade-in animation can't hold the opacity)
            document.body.style.animation = 'none';
            gsap.fromTo(document.body, { opacity: 1 }, {
                opacity: 0, duration: 0.4, ease: EASE.easeInOut, onComplete: () => { window.location.href = href; },
            });
        });
    });

    // Back/forward can restore a page from memory still faded out
    window.addEventListener('pageshow', (event) => {
        if (event.persisted && hasMotion) gsap.set(document.body, { opacity: 1 });
    });

    // Home page colours: white while the about section is on screen, dark from an eighth of the way into it
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection && hasMotion) {
        const aboutTexts = document.querySelectorAll('.about-text');
        const label = document.querySelector('.about-label');
        const ctaLink = document.querySelector('.cta-link');
        const setTheme = (dark) => {
            const ground = cssVar(dark ? '--color-secondary' : '--color-primary');
            const text = cssVar(dark ? '--color-primary' : '--color-text');
            gsap.to(document.body, { backgroundColor: ground, duration: 0.8, ease: EASE.smooth, overwrite: 'auto' });
            gsap.to(aboutTexts, { color: text, duration: 0.3, ease: EASE.easeInOut, overwrite: 'auto' });
            if (label) gsap.to(label, { color: text, duration: 0.8, ease: EASE.easeInOut, overwrite: 'auto' });
            if (ctaLink) {
                gsap.to(ctaLink, { color: text, duration: 0.8, ease: EASE.easeInOut, overwrite: 'auto' });
                gsap.set(ctaLink, { borderColor: text });
            }
        };
        setTheme(false);
        ScrollTrigger.create({
            trigger: aboutSection,
            start: () => `top+=${aboutSection.offsetHeight / 8} top`,
            end: 'max',
            onEnter: () => setTheme(true),
            onLeaveBack: () => setTheme(false),
        });
    }

    // Page load: hero lines slide up out of their masks, then the portrait, name, year and experience
    if (hasMotion) {
        [['.hero-title-line-1', 0.2], ['.hero-title-line-2', 0.4], ['.hero-title-line-3', 0.6], ['.hero-portrait', 0.8],
            ['.hero-name', 1.0], ['.hero-year', 1.2], ['.hero-experience', 1.4]].forEach(([selector, delay]) => {
            const element = document.querySelector(selector);
            if (element) gsap.fromTo(element, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: EASE.smooth, delay });
        });
    }

    // About section scroll animation - the second paragraph starts shortly after the first
    document.querySelectorAll('.about-paragraph').forEach((paragraph) => {
        const texts = paragraph.querySelectorAll('.about-text');
        if (!hasMotion || !texts.length) return;
        ScrollTrigger.create({
            trigger: paragraph,
            start: 'top+=10% bottom-=100',
            once: true,
            onEnter: () => gsap.fromTo(texts, { y: 0, yPercent: 100 }, {
                yPercent: 0, duration: 0.8, ease: EASE.smooth, delay: paragraph.classList.contains('about-paragraph-2') ? 0.4 : 0.2,
            }),
        });
    });

    // Experience section: the title rises and its words brighten 200ms apart; items rise 200ms apart
    if (hasMotion) {
        const experienceTitle = document.querySelector('.experience-title h2');
        if (experienceTitle) {
            ScrollTrigger.create({
                trigger: experienceTitle,
                start: 'top+=30% bottom',
                once: true,
                onEnter: () => {
                    gsap.to(experienceTitle, { opacity: 1, y: 0, duration: 1, ease: EASE.easeOut });
                    gsap.to(experienceTitle.querySelectorAll('.title-word'), { color: cssVar('--color-primary'), duration: 0.8, ease: EASE.easeOut, stagger: 0.2 });
                },
            });
        }
        document.querySelectorAll('.experience-item').forEach((item, index) => {
            ScrollTrigger.create({
                trigger: item,
                start: 'top+=30% bottom',
                once: true,
                onEnter: () => gsap.to(item, { opacity: 1, y: 0, duration: 0.8, ease: EASE.easeOut, delay: index * 0.2 }),
            });
        });
    }

    // Work page gallery: each card appears and slides up 30px, 600ms after the section shows and 200ms apart
    const workGallery = document.querySelector('.work-gallery');
    const workPageSection = document.querySelector('.work-page-section');
    if (workGallery && workPageSection && hasMotion) {
        const cards = workGallery.querySelectorAll('.gallery-item');
        ScrollTrigger.create({
            trigger: workPageSection,
            start: 'top+=10% bottom',
            once: true,
            onEnter: () => cards.forEach((card, index) => {
                const delay = 0.6 + index * 0.2;
                gsap.set(card, { opacity: 1, delay });
                gsap.to(card, { y: 0, duration: 0.3, ease: EASE.ease, delay });
            }),
        });
    }

    // Gallery item click functionality - Direct navigation
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const projectName = item.getAttribute('data-project');

            // Add visual feedback
            if (hasMotion) {
                gsap.to(item, { y: -8, duration: 0.3, ease: EASE.ease, overwrite: 'auto' });
                gsap.to(item, { y: -5, duration: 0.3, ease: EASE.ease, delay: 0.2, overwrite: 'auto' });
            }

            // Navigate to project page (all project pages live under /work/)
            setTimeout(() => {
                const knownProjects = [
                    'stplaner', 'monun', 'doratec', 'spitex', 'jetonikeramika',
                    'mardal', 'baren', 'riesen', 'ennur', 'socialmedia',
                    'printing', 'alba', 'wmk', 'hbs', 'hbs-website', 'cityhotel', 'etno'
                ];
                if (knownProjects.includes(projectName)) {
                    window.location.href = '/work/' + projectName + '.html';
                }
            }, 300);
        });
    });

    // Project gallery images: the cover slides down off each image over 3.5s, 200ms apart per group
    const curtainImages = document.querySelectorAll('.project-gallery-section .work-image');
    if (curtainImages.length && hasMotion) {
        ScrollTrigger.batch(curtainImages, {
            start: 'top+=10% bottom-=50',
            once: true,
            onEnter: (batch) => gsap.fromTo(batch, { '--curtain': 0 }, { '--curtain': 1, duration: 3.5, ease: EASE.reveal, stagger: 0.2 }),
        });
    }

    // About page: title, statement and columns fade up on load
    if (hasMotion && document.body.classList.contains('about-main')) {
        const fadeUp = (element, delay) => gsap.to(element, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: EASE.easeOut, delay });
        document.querySelectorAll('.about-title, .about-text-large').forEach((element) => fadeUp(element, 0.2));
        document.querySelectorAll('.four-column-section').forEach((element) => fadeUp(element, 0));
        const narrow = window.matchMedia('(max-width: 768px)').matches;
        document.querySelectorAll('.column').forEach((column) => {
            const position = Array.prototype.indexOf.call(column.parentElement.children, column) + 1;
            fadeUp(column, narrow ? 0.1 : ({ 1: 0.1, 2: 0.2, 3: 0.3 }[position] || 0.2));
        });
    }

    /**
     * Reusable function for Scroll-Linked Image Reveal
     * Images move from bottom as you scroll
     */
    function setupScrollLinkedReveal(selector) {
        const images = document.querySelectorAll(selector);

        if (images.length === 0 || !hasMotion) return;
        if (reducedMotion) {
            gsap.set(images, { y: 0, opacity: 1 });
            return;
        }

        const gradientTargets = new Map();
        // The gradient over a scrolled-past image eases towards its new value over 0.3s. overwrite 'auto' only
        // replaces an earlier gradient tween: the same image can be running its gallery curtain at the same time.
        const setGradient = (image, value) => {
            if (gradientTargets.get(image) === value) return;
            gradientTargets.set(image, value);
            gsap.to(image, { '--gradient-opacity': value, duration: 0.3, ease: EASE.ease, overwrite: 'auto' });
        };

        function updatePositions() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
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

                    gsap.set(image, { y: 0, scale: 1, opacity });
                    setGradient(image, 0);
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

                    gsap.set(image, { y: translateY, scale: 1, opacity });
                    setGradient(image, Math.min(Math.max(gradientOpacity, 0), 1));
                }
            });
        }

        // Initial setup
        gsap.set(images, { y: 80, scale: 1, opacity: 0 });
        updatePositions();
        // Recalculated on GSAP's frame loop whenever the scroll position or the window size has changed
        // (not a ScrollTrigger: its end is measured once, and images loading later make the page longer)
        let lastState = `${window.scrollY}|${window.innerWidth}|${window.innerHeight}`;
        gsap.ticker.add(() => {
            const state = `${window.scrollY}|${window.innerWidth}|${window.innerHeight}`;
            if (state === lastState) return;
            lastState = state;
            updatePositions();
        });
    }

    // Apply the reveal effect to all project images
    ['stplaner', 'monun', 'doratec', 'spitex', 'jetonikeramika', 'mardal', 'alba', 'ennur', 'hbs', 'hbs-website', 'cityhotel']
        .forEach((project) => setupScrollLinkedReveal(`.${project}-image-reveal`));
});
