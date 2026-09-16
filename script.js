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
        document.documentElement.classList.remove('intro-on');
        document.body.style.cursor = 'auto';
        document.querySelectorAll('.hero-mask > span, .hero-small-mask > *, .hero-portrait, .about-text, .experience-title h2, .work-gallery .gallery-item, .about-title, .about-text-large, .four-column-section, .column')
            .forEach((element) => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
        document.querySelectorAll('.hero-image-section').forEach((frame) => { frame.style.clipPath = 'none'; });
        document.querySelectorAll('.experience-title .title-word').forEach((word) => { word.style.color = cssVar('--color-primary'); });
        document.querySelectorAll('.text-reveal-wrapper').forEach((wrapper) => {
            wrapper.style.setProperty('--text-reveal', '1');
            wrapper.style.setProperty('--text-reveal-y', '0');
        });
        document.querySelectorAll('.project-gallery-section .work-image').forEach((image) => image.style.setProperty('--curtain', '1'));
    }

    // Compact header: past the top of the page the header folds into a small bar in the middle of the top, holding
    // "[a]" and a "+". The "+" opens the bar sideways onto the page links and turns into a "×" to close it (so do Escape and
    // a click elsewhere); back at the top the full header returns. Built here, before the cursor, ripple and page
    // transition code below pick up links and buttons, so without GSAP the plain header simply stays
    const siteHeader = document.querySelector('.header');
    if (siteHeader && hasMotion) {
        const headerLogo = siteHeader.querySelector('.logo-text');
        const bar = document.createElement('div');
        bar.className = 'header-bar';

        const home = document.createElement('a');
        home.className = 'header-bar-home';
        home.href = headerLogo ? headerLogo.getAttribute('href') : 'index.html';
        home.textContent = '[a]';
        home.setAttribute('aria-label', 'Kushtrim Arifi, home');

        const links = document.createElement('nav');
        links.className = 'header-bar-links';
        links.id = 'header-bar-links';
        links.setAttribute('aria-label', 'Pages');
        // The link for the page you're on stays orange; project pages under /work/ count as Work
        const pagePath = (path) => path.replace(/\.html$/, '').replace(/\/index$/, '/');
        const here = pagePath(location.pathname);
        siteHeader.querySelectorAll('.nav-list .nav-link').forEach((link) => {
            const copy = link.cloneNode(true);
            copy.className = 'header-bar-link';
            copy.tabIndex = -1;
            const target = pagePath(new URL(link.getAttribute('href'), location.href).pathname);
            if (target === here || (target.endsWith('/work') && here.includes('/work/'))) {
                copy.classList.add('is-current');
                copy.setAttribute('aria-current', 'page');
            }
            links.append(copy);
        });

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'header-bar-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', links.id);
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.innerHTML = '<span></span><span></span>';

        bar.append(home, links, toggle);
        document.body.append(bar);
        // Centred by GSAP's xPercent, a percentage of the bar's own width that keeps it centred as it opens (a CSS
        // translate is dropped once GSAP moves the bar)
        gsap.set(bar, { autoAlpha: 0, xPercent: -50 });
        gsap.set(links, { width: 0 });
        const glide = CustomEase.create('header-glide', '0.65,0,0.35,1');

        let open = false;
        const setOpen = (state) => {
            if (open === state) return;
            open = state;
            toggle.setAttribute('aria-expanded', String(state));
            toggle.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');
            links.querySelectorAll('a').forEach((link) => { link.tabIndex = state ? 0 : -1; });
            if (state) {
                // Opening: the bar widens evenly both ways while the links drift in one after another
                gsap.to(links, { width: links.scrollWidth, duration: 0.8, ease: glide, overwrite: 'auto' });
                gsap.fromTo(links.children, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08, delay: 0.25, overwrite: 'auto' });
            } else {
                // Closing: the links fade first, then the bar narrows back to "[a]" and "+"
                gsap.to(links.children, { opacity: 0, x: -6, duration: 0.25, ease: 'power1.in', stagger: { each: 0.04, from: 'end' }, overwrite: 'auto' });
                gsap.to(links, { width: 0, duration: 0.7, ease: glide, delay: 0.12, overwrite: 'auto' });
            }
            gsap.to(toggle, { rotation: state ? 135 : 0, duration: 0.7, ease: glide, overwrite: 'auto' });
        };

        // The full header at the top. Below it the logo and the links drift toward the middle as they fade and the bar
        // rises into place there; back at the top the bar sinks away and they drift back out (not while the phone menu
        // is open)
        const [logoPart, ...rightParts] = [siteHeader.querySelector('.logo'), siteHeader.querySelector('.navigation'), siteHeader.querySelector('.burger-menu')];
        const headerParts = [logoPart, ...rightParts].filter(Boolean);
        const setCompact = (state) => {
            if (state && siteHeader.querySelector('.navigation.active')) return;
            if (!state) setOpen(false);
            if (state) {
                if (logoPart) gsap.to(logoPart, { x: 40, autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' });
                gsap.to(rightParts.filter(Boolean), { x: -40, autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' });
                gsap.fromTo(bar, { autoAlpha: 0, y: -14, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.2, overwrite: 'auto' });
            } else {
                gsap.to(bar, { autoAlpha: 0, y: -10, scale: 0.95, duration: 0.4, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(headerParts, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', delay: 0.15, overwrite: 'auto' });
            }
        };
        ScrollTrigger.create({ start: 80, end: 'max', onEnter: () => setCompact(true), onLeaveBack: () => setCompact(false) });

        toggle.addEventListener('click', () => setOpen(!open));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', (event) => {
            if (open && !bar.contains(event.target)) setOpen(false);
        });
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
        const interactiveElements = document.querySelectorAll('a, button, .experience-row, .nav-link, .work-item, .gallery-item, .project-live-link, .project-back-link, .resume-button, .burger-menu, .work-image, .project-main-image, .project-gallery-item');
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

    // The footer's year
    document.querySelectorAll('.footer-year').forEach((year) => { year.textContent = String(new Date().getFullYear()); });

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

    // Intro on every load of the home page: empty brackets appear, the name writes itself out between them (the
    // brackets moving apart as it grows), unwrites again, an "a" takes its place, and "[a]" moves to its place in the
    // header's logo while the dark ground opens from the middle; the header's logo fades in around it
    const introCover = document.documentElement.classList.contains('intro-on') ? document.querySelector('.intro') : null;
    const introHeaderLogo = document.querySelector('.header .logo-text');
    let introLength = 0;
    if (introCover && introHeaderLogo && hasMotion) {
        const introLogo = introCover.querySelector('.intro-logo');
        const brackets = [...introCover.querySelectorAll('.intro-bracket')];
        const nameBox = introCover.querySelector('.intro-name');
        const letterA = introCover.querySelector('.intro-a');

        // One clipped box per letter, so each can grow from nothing to its own width
        const name = nameBox.textContent;
        nameBox.textContent = '';
        const letters = [...name].map((character) => {
            const letter = document.createElement('span');
            letter.className = 'intro-letter';
            letter.textContent = character === ' ' ? ' ' : character;
            nameBox.append(letter);
            return letter;
        });
        letterA.classList.add('intro-letter');
        const widths = new Map([...letters, letterA].map((letter) => [letter, letter.getBoundingClientRect().width]));
        gsap.set([...letters, letterA], { width: 0, opacity: 0 });

        // Where "[a]" sits inside the header's "Kushtrim [a]", and how much smaller the header's type is
        let landing = { x: 0, y: 0, scale: 1 };
        const measureLanding = () => {
            const text = introHeaderLogo.firstChild;
            const range = document.createRange();
            range.setStart(text, text.textContent.indexOf('['));
            range.setEnd(text, text.textContent.trimEnd().length);
            const to = range.getBoundingClientRect();
            const from = introLogo.getBoundingClientRect();
            landing = {
                x: to.left - from.left,
                y: to.top + to.height / 2 - (from.top + from.height / 2),
                scale: parseFloat(getComputedStyle(introHeaderLogo).fontSize) / parseFloat(getComputedStyle(introLogo).fontSize),
            };
        };
        const introOpen = CustomEase.create('intro-open', '0.76,0,0.24,1');
        const channels = (name) => cssVar(name).match(/[0-9a-f]{2}/gi).map((hex) => parseInt(hex, 16));
        const [light, dark] = [channels('--color-primary'), channels('--color-secondary')];
        const landedColour = `rgb(${light.map((value, i) => Math.abs(value - dark[i])).join(', ')})`;

        // Slow and soft, and straight: nothing moves up or down, the letters only grow and fade in place. The "a" grows
        // in while the last letters leave, so the brackets close straight onto "[a]"; a short pause on it, then the glide
        introLength = 3.4;
        gsap.timeline({
            onComplete: () => {
                document.documentElement.classList.remove('intro-on');
                gsap.set(introHeaderLogo, { clearProps: 'opacity,transition,visibility' });
            },
        })
            .set([introCover, introHeaderLogo], { animation: 'none' })
            .set(introLogo, { visibility: 'visible', transformOrigin: '0% 50%' })
            .fromTo(brackets, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.15)
            .to(letters, { width: (i, letter) => widths.get(letter), opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, 0.55)
            .to([...letters].reverse(), { width: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', stagger: 0.035 }, 2.3)
            .to(letterA, { width: widths.get(letterA), opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 2.7)
            .add(measureLanding, 3.34)
            // Ends in the colour the header shows its logo in over the hero: its difference blend against the dark ground
            .to(introLogo, { x: () => landing.x, y: () => landing.y, scale: () => landing.scale, color: landedColour, duration: 1.2, ease: 'power3.inOut' }, 3.35)
            .to(introCover.querySelector('.intro-half--top'), { yPercent: -100, duration: 1.2, ease: introOpen }, 3.45)
            .to(introCover.querySelector('.intro-half--bottom'), { yPercent: 100, duration: 1.2, ease: introOpen }, 3.45)
            .set(introHeaderLogo, { visibility: 'visible', opacity: 0, transition: 'none' }, 4.2)
            .to(introHeaderLogo, { opacity: 1, duration: 0.45, ease: 'power1.inOut' }, 4.2)
            .to(introLogo, { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, 4.2);
    }

    // Text into particles on scroll (the hero's name). The letters are drawn on a scratch canvas and every few pixels of
    // ink become a dot with its own outward path and start; dots grow with the type
    const sampleDots = (ink, [x0, y0, x1, y1], ratio, size, centreX, centreY) => {
        const dots = [];
        if (x1 <= x0 || y1 <= y0) return dots;
        const regionWidth = x1 - x0;
        const pixels = ink.getImageData(x0, y0, regionWidth, y1 - y0).data;
        const step = Math.max(2, Math.round((size * ratio) / 55));
        for (let y = 0; y < y1 - y0; y += step) {
            for (let x = 0; x < regionWidth; x += step) {
                if (pixels[(y * regionWidth + x) * 4 + 3] < 128) continue;
                const dotX = (x0 + x) / ratio;
                const dotY = (y0 + y) / ratio;
                const angle = Math.atan2(dotY - centreY, dotX - centreX) + (Math.random() - 0.5) * 1.4;
                const reach = size * (0.8 + Math.random() * 2.4);
                dots.push({
                    x: dotX,
                    y: dotY,
                    dx: Math.cos(angle) * reach,
                    dy: Math.sin(angle) * reach - size * 0.6 * Math.random(),
                    delay: Math.random() * 0.4,
                    size: step / ratio,
                });
            }
        }
        return dots;
    };

    // Each dot starts in its letter and flies out along its own path, leaving a little later than the last, and fades
    // as it goes. The letters hand over to the dots over the first 8% of the burst: the words fade out as the dots fade
    // in, so the text dissolves into dots instead of switching to them
    const paintDots = (canvas, ratio, dots, progress, words) => {
        const ink = canvas.getContext('2d');
        ink.setTransform(1, 0, 0, 1, 0, 0);
        ink.clearRect(0, 0, canvas.width, canvas.height);
        const handover = Math.min(1, progress / 0.08);
        gsap.set(words, handover > 0 ? { opacity: 1 - handover } : { clearProps: 'opacity' });
        if (handover <= 0) return;
        ink.setTransform(ratio, 0, 0, ratio, 0, 0);
        ink.fillStyle = cssVar('--color-primary');
        for (const dot of dots) {
            const travel = Math.min(1, Math.max(0, (progress - dot.delay) / (1 - dot.delay)));
            if (travel >= 1) continue;
            const eased = 1 - (1 - travel) ** 3;
            ink.globalAlpha = (1 - travel) * handover;
            ink.fillRect(dot.x + dot.dx * eased, dot.y + dot.dy * eased, dot.size, dot.size);
        }
        ink.globalAlpha = 1;
    };

    // Hero: the photo opens from its centre while it settles from a slight zoom, the big words rise out of their
    // masks in reading order, then the small print. On scroll the hero holds still (when the name sits beside the photo)
    // while the name bursts into particles that pass behind the cut-out person.
    const hero = document.querySelector('.hero');
    if (hero && hasMotion) {
        const heroOut = CustomEase.create('hero-out', '0.16,1,0.3,1');
        // The photo and the cut-out person above the name move as one
        const photos = hero.querySelectorAll('.hero-image-section');

        gsap.timeline({ defaults: { ease: heroOut }, delay: introLength })
            .fromTo(photos, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3 }, 0.1)
            .fromTo('.hero-portrait', { scale: 1.2 }, { scale: 1, duration: 2.2 }, 0.1)
            .fromTo(hero.querySelectorAll('.hero-word--first > span'), { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1.1 }, 0.55)
            .fromTo(hero.querySelectorAll('.hero-word--last > span'), { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1.1 }, 0.69)
            .fromTo(hero.querySelectorAll('.hero-small-mask > *'), { y: 0, yPercent: 100 }, { yPercent: 0, duration: 0.9, stagger: 0.08 }, 1.25);

        // The name breaks into particles on scroll: its letters are sampled into dots on the .hero-particles canvas,
        // which fly outward and fade as the scroll goes on and gather back into the name on the way up. The real words
        // fade into the dots as the burst starts; the cut-out person stays above the canvas, so dots pass behind the head
        const particleCanvas = hero.querySelector('.hero-particles');
        const nameWords = hero.querySelectorAll('.hero-title-section .hero-mask');
        const nameLines = [...hero.querySelectorAll('.hero-title-section .hero-mask > span')];
        const burst = { progress: 0 };
        let dots = [];

        const drawDots = () => {
            if (particleCanvas) paintDots(particleCanvas, particleCanvas.width / (hero.offsetWidth || 1), dots, burst.progress, nameWords);
        };

        // Draws each word at its resting place (layout offsets, which ignore the transforms) on a scratch canvas and
        // keeps one dot for every few pixels of ink
        const buildDots = () => {
            if (!particleCanvas) return;
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            particleCanvas.width = Math.round(hero.offsetWidth * ratio);
            particleCanvas.height = Math.round(hero.offsetHeight * ratio);
            const scratch = document.createElement('canvas');
            scratch.width = particleCanvas.width;
            scratch.height = particleCanvas.height;
            const ink = scratch.getContext('2d', { willReadFrequently: true });
            dots = [];
            nameLines.forEach((line) => {
                const mask = line.parentElement;
                const frame = mask.offsetParent;
                const style = getComputedStyle(line);
                const size = parseFloat(style.fontSize);
                const left = frame.offsetLeft + mask.offsetLeft;
                const top = frame.offsetTop + mask.offsetTop;
                ink.setTransform(ratio, 0, 0, ratio, 0, 0);
                ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ink.letterSpacing = style.letterSpacing;
                ink.fillStyle = '#fff';
                const metrics = ink.measureText(line.textContent);
                const lineHeight = parseFloat(style.lineHeight) || size * 0.9;
                const baseline = top + (lineHeight - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
                ink.fillText(line.textContent, left, baseline);

                const region = [
                    Math.max(0, Math.floor((left - size * 0.2) * ratio)),
                    Math.max(0, Math.floor((top - size * 0.2) * ratio)),
                    Math.min(scratch.width, Math.ceil((left + mask.offsetWidth + size * 0.2) * ratio)),
                    Math.min(scratch.height, Math.ceil((top + size * 1.2) * ratio)),
                ];
                dots = dots.concat(sampleDots(ink, region, ratio, size, left + mask.offsetWidth / 2, top + size * 0.45));
            });
            drawDots();
        };

        gsap.matchMedia().add({
            stacked: '(max-width: 699px), (max-width: 1023px) and (orientation: portrait)',
            wide: '(min-width: 700px)',
            reduceMotion: '(prefers-reduced-motion: reduce)',
        }, ({ conditions }) => {
            if (conditions.reduceMotion || !particleCanvas) return undefined;
            // Only 15% of the way: the page moves on with the name starting to break up and the dots still in the air
            const animation = gsap.to(burst, { progress: 0.15, ease: 'none', onUpdate: drawDots });
            if (!conditions.stacked) {
                // Name beside the photo: the hero holds still for 15% of a screen's scrolling while the name bursts that
                // far (the pace of a full burst over a whole screen), then the page moves on. It is pinned after the triggers above it were made, so they are re-sorted
                // to measure with the pin's extra scroll
                ScrollTrigger.create({ trigger: hero, start: 'top top', end: '+=15%', pin: true, scrub: 1, animation, refreshPriority: 1, onRefresh: buildDots });
                ScrollTrigger.sort();
            } else {
                // Stacked (shorter than the screen): the name bursts as the hero scrolls away, the photo slower than the page
                const scroll = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
                ScrollTrigger.create({ ...scroll, animation, onRefresh: buildDots });
                gsap.to(photos, { yPercent: 12, ease: 'none', scrollTrigger: { ...scroll } });
            }
            return () => {
                burst.progress = 0;
                drawDots();
            };
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
        // Experience list: the rows fade up one after another as the list comes into view. Then reading focus: the row at
        // the middle of the screen is at full light with its years orange, and the light passes to the next row over the
        // distance between their middles (so a taller, wrapped row dims like the rest). The focus glides after the scroll
        // rather than jumping, and past either end of the list the first or last row keeps it
        const experienceRows = [...document.querySelectorAll('.experience-row')];
        if (experienceRows.length) {
            gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
                gsap.from(experienceRows, {
                    autoAlpha: 0, y: 16, duration: 0.8, ease: 'power3.out', stagger: 0.08,
                    scrollTrigger: { trigger: experienceRows[0].parentElement, start: 'top 85%', once: true },
                });
            });

            // Dimmed through the text colour (the row's --row-years and --row-text), not opacity, so the orange CV "+" stays at
            // full colour and the white hover can take over
            const [red, green, blue] = cssVar('--color-primary-rgb').split(',').map(Number);
            const dimText = `rgba(${red}, ${green}, ${blue}, 0.5)`;
            const lightToText = gsap.utils.interpolate(dimText, cssVar('--color-primary'));
            const lightToYears = gsap.utils.interpolate(dimText, cssVar('--color-orange'));
            let centres = [];
            let remeasured = true;
            // From the layout (offsetTop), so a row still moving in its fade-up isn't measured out of place
            const pageTop = (element) => {
                let top = 0;
                for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
                return top;
            };
            const measureRows = () => {
                centres = experienceRows.map((row) => pageTop(row) + row.offsetHeight / 2);
                remeasured = true;
            };
            measureRows();
            ScrollTrigger.addEventListener('refresh', measureRows);

            let focus = null;
            gsap.ticker.add(() => {
                const list = experienceRows[0].parentElement.getBoundingClientRect();
                if (list.bottom < -window.innerHeight || list.top > window.innerHeight * 2) return;
                const target = gsap.utils.clamp(centres[0], centres[centres.length - 1], window.scrollY + window.innerHeight / 2);
                const next = focus === null || reducedMotion ? target : focus + (target - focus) * 0.14;
                if (!remeasured && focus !== null && Math.abs(next - focus) < 0.05) return;
                remeasured = false;
                focus = next;
                experienceRows.forEach((row, i) => {
                    const neighbour = focus >= centres[i] ? centres[i + 1] : centres[i - 1];
                    const light = neighbour === undefined ? 1 : gsap.utils.clamp(0, 1, 1 - Math.abs(focus - centres[i]) / Math.abs(neighbour - centres[i]));
                    row.style.setProperty('--row-years', lightToYears(light));
                    row.style.setProperty('--row-text', lightToText(light));
                });
            });

            // Clicking a row (anywhere but the open list itself, so its text can be selected and the CV link used) opens what
            // was done there, turning its "+" into a "−", and closes the row that was open. The rows below move with it, so the focus is re-measured as it
            // opens and the scroll triggers after it
            const setWorkOpen = (row, open) => {
                const work = row.querySelector('.job-work');
                row.classList.toggle('is-open', open);
                row.querySelector('.job-title').setAttribute('aria-expanded', String(open));
                gsap.to(work, {
                    height: open ? 'auto' : 0, duration: 0.5, ease: 'power3.inOut', overwrite: true, onUpdate: measureRows, onComplete: () => ScrollTrigger.refresh(),
                });
                gsap.to(work.firstElementChild, {
                    autoAlpha: open ? 1 : 0, y: open ? 0 : 8, duration: open ? 0.45 : 0.25, delay: open ? 0.15 : 0, ease: 'power2.out', overwrite: true,
                });
            };
            experienceRows.forEach((row) => {
                const work = row.querySelector('.job-work');
                const toggle = row.querySelector('.job-title');
                if (!work || !toggle) return;
                gsap.set(work, { height: 0, overflow: 'hidden' });
                gsap.set(work.firstElementChild, { autoAlpha: 0, y: 8 });
                toggle.setAttribute('aria-expanded', 'false');
                row.classList.remove('is-open');
                row.addEventListener('click', (event) => {
                    if (event.target.closest('.job-work')) return;
                    const open = toggle.getAttribute('aria-expanded') !== 'true';
                    experienceRows.forEach((other) => {
                        if (other !== row && other.querySelector('.job-title')?.getAttribute('aria-expanded') === 'true') setWorkOpen(other, false);
                    });
                    setWorkOpen(row, open);
                });
            });
        }
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
