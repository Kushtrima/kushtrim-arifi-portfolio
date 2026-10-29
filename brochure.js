// The catalogues and brochures (work/cityhotel-brochure.html, work/albfix-catalogue.html, the three on
// work/business-leaders-brochures.html), turned like real ones with the page-flip library (vendor/page-flip, MIT).
// Closed on the cover at first, which sits in the middle; open, two pages side by side; with an even number of pages,
// the back cover alone at the end. Upright pages stay two side by side on a phone too (photographs run across the
// fold); wide pages show one at a time on a narrow screen. A corner can be dragged, a page clicked or tapped, or the
// arrows and the keyboard's arrows used (they turn the one most on the screen). The page size comes from the first
// page's picture. Pages load once a book comes near the screen, a few ahead of the reader.
(() => {
    const brochures = document.querySelectorAll('.brochure');
    if (!brochures.length) return;
    if (!window.St) {
        // The library didn't load: the pages stand one under another
        brochures.forEach((brochure) => brochure.classList.add('is-static'));
        return;
    }
    const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const books = []; // each book's turner and how much of it is on the screen, for the keyboard

    brochures.forEach((brochure) => {
        const book = brochure.querySelector('.brochure-book');
        const shift = brochure.querySelector('.brochure-shift');
        const pages = [...book.querySelectorAll('.brochure-page')];
        const counter = brochure.querySelector('.brochure-count');
        const prev = brochure.querySelector('.brochure-prev');
        const next = brochure.querySelector('.brochure-next');
        const last = pages.length - 1;
        const backAlone = pages.length % 2 === 0;
        const lastSpread = backAlone ? last : last - 1; // two side by side: the first page of the last spread
        const firstPicture = pages[0].querySelector('img');
        const ratio = firstPicture.getAttribute('height') / firstPicture.getAttribute('width');
        const wide = ratio < 1;

        const flip = new St.PageFlip(book, {
            width: 1000,
            height: Math.round(1000 * ratio),
            size: 'stretch',
            minWidth: wide ? 280 : 100, // wide pages: narrower than two of these side by side, one page at a time
            maxWidth: 1000,
            minHeight: Math.round((wide ? 280 : 100) * ratio),
            maxHeight: Math.round(1000 * ratio),
            showCover: true,
            usePortrait: wide,
            maxShadowOpacity: 0.5,
            flippingTime: lessMotion ? 300 : 900,
        });
        const twoUp = () => flip.getOrientation() === 'landscape';

        // The pages around the open ones load; the rest wait until the reader comes near
        let near = false;
        const loadAround = (page) => {
            if (!near) return;
            for (let i = Math.max(0, page - 2); i <= Math.min(last, page + 5); i++) {
                pages[i].querySelector('img').loading = 'eager';
            }
        };
        // Closed (the cover or the back alone, two pages wide), the book moves so that the one page sits in the middle
        const place = (page) => {
            shift.classList.toggle('is-cover', twoUp() && page === 0);
            shift.classList.toggle('is-back', twoUp() && backAlone && page === last);
        };
        const show = (page) => {
            place(page);
            loadAround(page);
            const alone = !twoUp() || page === 0 || (backAlone && page === last);
            counter.textContent = `${alone ? page + 1 : `${page + 1}–${page + 2}`} / ${pages.length}`;
            prev.disabled = page === 0;
            next.disabled = page === (twoUp() ? lastSpread : last);
        };

        flip.on('flip', (e) => show(e.data));
        flip.on('changeOrientation', () => show(flip.getCurrentPageIndex()));
        flip.on('changeState', (e) => {
            // A turn by a click, a tap, an arrow or a key: the book starts moving to its new place as the page turns
            if (e.data === 'flipping') {
                const turn = flip.getFlipController().getCalculation();
                const page = flip.getCurrentPageIndex();
                if (turn) {
                    const step = twoUp() ? 2 : 1;
                    const target = turn.getDirection() === 0
                        ? (twoUp() && page === 0 ? 1 : Math.min(twoUp() ? lastSpread : last, page + step))
                        : (twoUp() && backAlone && page === last ? last - 2 : Math.max(0, page - step));
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

        // A finger scrolling the page over the book must not turn a page as it lifts: the library takes a slow
        // scroll that started on the book (over 250ms) for a tap. Moved more than 10px, mostly up or down, with the
        // pages at rest, it was a scroll, and the library's touch ends here without a turn
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

        const seen = { flip, ratio: 0 };
        books.push(seen);
        new IntersectionObserver(([entry]) => {
            seen.ratio = entry.intersectionRatio;
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] }).observe(book);
    });

    // The keyboard's left and right arrows turn the pages of the book most on the screen (at least half of it)
    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select')) return;
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const book = books.reduce((most, b) => (b.ratio > most.ratio ? b : most), { ratio: 0 });
        if (book.ratio < 0.5) return;
        if (e.key === 'ArrowRight') book.flip.flipNext('bottom');
        else book.flip.flipPrev('bottom');
        e.preventDefault();
    });
})();
