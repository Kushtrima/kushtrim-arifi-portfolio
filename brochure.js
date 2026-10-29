// The brochure on work/cityhotel-brochure.html, turned like a real one with the page-flip library (vendor/page-flip,
// MIT). Closed on the cover at first, which sits in the middle; open, two pages side by side; the back cover alone at
// the end. A corner can be dragged, a page clicked or tapped, or the arrows and the keyboard's arrows used. Pages load
// once the brochure comes near the screen, a few spreads ahead of the reader.
(() => {
    const brochure = document.querySelector('.brochure');
    if (!brochure) return;
    if (!window.St) {
        brochure.classList.add('is-static'); // the library didn't load: the pages stand one under another
        return;
    }
    const book = brochure.querySelector('.brochure-book');
    const shift = brochure.querySelector('.brochure-shift');
    const pages = [...book.querySelectorAll('.brochure-page')];
    const count = brochure.querySelector('.brochure-count');
    const prev = brochure.querySelector('.brochure-prev');
    const next = brochure.querySelector('.brochure-next');
    const last = pages.length - 1;
    const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const flip = new St.PageFlip(book, {
        width: 1000,
        height: 1414, // A4
        size: 'stretch',
        minWidth: 100,
        maxWidth: 1000,
        minHeight: 141,
        maxHeight: 1414,
        showCover: true,
        usePortrait: false, // two pages side by side on a phone too: the photographs run across the fold
        maxShadowOpacity: 0.5,
        flippingTime: lessMotion ? 300 : 900,
    });

    // The pages around the open ones load; the rest wait until the reader comes near
    let near = false;
    const loadAround = (page) => {
        if (!near) return;
        for (let i = Math.max(0, page - 2); i <= Math.min(last, page + 5); i++) {
            pages[i].querySelector('img').loading = 'eager';
        }
    };
    // Closed (the cover or the back alone), the book moves so that the one page sits in the middle
    const place = (page) => {
        shift.classList.toggle('is-cover', page === 0);
        shift.classList.toggle('is-back', page === last);
    };
    const show = (page) => {
        place(page);
        loadAround(page);
        count.textContent = `${page === 0 || page === last ? page + 1 : `${page + 1}–${page + 2}`} / ${pages.length}`;
        prev.disabled = page === 0;
        next.disabled = page === last;
    };

    flip.on('flip', (e) => show(e.data));
    flip.on('changeState', (e) => {
        // A turn by a click, a tap, an arrow or a key: the book starts moving to its new place as the page turns
        if (e.data === 'flipping') {
            const turn = flip.getFlipController().getCalculation();
            const page = flip.getCurrentPageIndex();
            if (turn) {
                const target = turn.getDirection() === 0
                    ? (page === 0 ? 1 : Math.min(last, page + 2))
                    : (page === last ? last - 2 : Math.max(0, page - 2));
                place(target);
                loadAround(target);
            }
        }
        // At rest again, after a turn or a drag let go halfway (the page falls back, and so does the book)
        if (e.data === 'read') place(flip.getCurrentPageIndex());
    });
    flip.loadFromHTML(pages);
    brochure.classList.add('is-ready');

    new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        near = true;
        loadAround(flip.getCurrentPageIndex());
    }, { rootMargin: '100% 0px' }).observe(book);

    // A finger scrolling the page over the book must not turn a page as it lifts: the library takes a slow scroll that
    // started on the book (over 250ms) for a tap. Moved more than 10px, mostly up or down, with the pages at rest, it
    // was a scroll, and the library's touch ends here without a turn
    let touchStart = null;
    book.addEventListener('touchstart', (e) => {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
        if (!touchStart) return;
        const end = e.changedTouches[0];
        const dx = Math.abs(end.clientX - touchStart.x);
        const dy = Math.abs(end.clientY - touchStart.y);
        touchStart = null;
        if (dy > 10 && dy > dx && flip.getState() === 'read') flip.userStop({ x: 0, y: 0 }, true);
    }, { capture: true });

    prev.addEventListener('click', () => flip.flipPrev('bottom'));
    next.addEventListener('click', () => flip.flipNext('bottom'));

    // The keyboard's left and right arrows turn the pages while the brochure is on the screen
    let onScreen = false;
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }, { threshold: 0.5 }).observe(book);
    document.addEventListener('keydown', (e) => {
        if (!onScreen || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select')) return;
        if (e.key === 'ArrowRight') flip.flipNext('bottom');
        else if (e.key === 'ArrowLeft') flip.flipPrev('bottom');
        else return;
        e.preventDefault();
    });
})();
