document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. Header: Big/Square → Shrunk Capsule on Scroll
    // ==========================================================================
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // 2. Mobile Nav
    // ==========================================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const navOverlay = document.querySelector('.nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    const openMenu = () => { mobileNav.classList.add('active'); navOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { mobileNav.classList.remove('active'); navOverlay.classList.remove('active'); document.body.style.overflow = ''; };
    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

    // ==========================================================================
    // 3. Scroll Reveal & Highlighter
    // ==========================================================================
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }});
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => revealObserver.observe(el));

    const hlObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('active'), 300); obs.unobserve(e.target); }});
    }, { threshold: 0.5 });
    document.querySelectorAll('.marker-highlight').forEach(el => hlObserver.observe(el));

    // ==========================================================================
    // 4. Fan Cards Portfolio
    // ==========================================================================
    const fanWrapper = document.querySelector('.fan-wrapper');
    const fanCards = Array.from(document.querySelectorAll('.fan-card'));
    const fanBtnPrev = document.querySelector('.fan-prev');
    const fanBtnNext = document.querySelector('.fan-next');

    if (fanWrapper && fanCards.length > 0) {
        let centerIdx = Math.floor(fanCards.length / 2);
        const MAX_VISIBLE = 7;
        const HALF = 3;

        const FAN_SLOTS = [
            { rot: -21, scale: 0.72, x: -280, y: 20, zIndex: 1, opacity: 0.5 },
            { rot: -14, scale: 0.80, x: -190, y: 12, zIndex: 2, opacity: 0.7 },
            { rot: -7,  scale: 0.90, x: -100, y: 4,  zIndex: 3, opacity: 0.85 },
            { rot: 0,   scale: 1.0,  x: 0,    y: 0,  zIndex: 10, opacity: 1 },
            { rot: 7,   scale: 0.90, x: 100,  y: 4,  zIndex: 3, opacity: 0.85 },
            { rot: 14,  scale: 0.80, x: 190,  y: 12, zIndex: 2, opacity: 0.7 },
            { rot: 21,  scale: 0.72, x: 280,  y: 20, zIndex: 1, opacity: 0.5 },
        ];

        const getMultiplier = () => {
            const w = window.innerWidth;
            if (w < 400) return 0.36;
            if (w < 480) return 0.42;
            if (w < 640) return 0.52;
            if (w < 768) return 0.65;
            if (w < 1024) return 0.85;
            return 1.0;
        };

        const updateFan = () => {
            const mult = getMultiplier();
            fanCards.forEach((card, i) => {
                // Calculate which slot this card occupies relative to center
                let offset = i - centerIdx;
                // Wrap around for large sets
                if (fanCards.length > MAX_VISIBLE) {
                    while (offset > HALF) offset -= fanCards.length;
                    while (offset < -HALF) offset += fanCards.length;
                }

                const slotIdx = offset + HALF;
                
                if (slotIdx >= 0 && slotIdx < MAX_VISIBLE) {
                    const slot = FAN_SLOTS[slotIdx];
                    card.style.transform = `translateX(${slot.x * mult}px) translateY(${slot.y * mult}px) rotate(${slot.rot}deg) scale(${slot.scale})`;
                    card.style.zIndex = slot.zIndex;
                    card.style.opacity = slot.opacity;
                    card.style.pointerEvents = 'auto';
                    card.classList.toggle('active-card', slotIdx === HALF);
                } else {
                    card.style.transform = `translateX(${(offset > 0 ? 400 : -400) * mult}px) scale(0.5) rotate(${offset > 0 ? 30 : -30}deg)`;
                    card.style.opacity = '0';
                    card.style.pointerEvents = 'none';
                    card.style.zIndex = '0';
                    card.classList.remove('active-card');
                }
            });
        };

        const nextCard = () => { centerIdx = (centerIdx + 1) % fanCards.length; updateFan(); };
        const prevCard = () => { centerIdx = (centerIdx - 1 + fanCards.length) % fanCards.length; updateFan(); };

        if (fanBtnNext) fanBtnNext.addEventListener('click', nextCard);
        if (fanBtnPrev) fanBtnPrev.addEventListener('click', prevCard);

        // Click on side cards to navigate
        fanCards.forEach((card, i) => {
            card.addEventListener('click', () => {
                if (i !== centerIdx) { centerIdx = i; updateFan(); }
            });
        });

        // Swipe support
        let startX = 0;
        fanWrapper.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
        fanWrapper.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].screenX;
            if (diff > 50) nextCard();
            else if (diff < -50) prevCard();
        }, { passive: true });

        // Auto-play
        let fanInterval = setInterval(nextCard, 4500);
        fanWrapper.addEventListener('mouseenter', () => clearInterval(fanInterval));
        fanWrapper.addEventListener('mouseleave', () => { fanInterval = setInterval(nextCard, 4500); });

        window.addEventListener('resize', updateFan);
        updateFan();
    }

    // ==========================================================================
    // 5. Marquee Reviews — duplicate content for infinite scroll
    // ==========================================================================
    document.querySelectorAll('.marquee-track').forEach(track => {
        // Clone children once more to fill the infinite loop
        const children = Array.from(track.children);
        children.forEach(child => {
            const clone = child.cloneNode(true);
            track.appendChild(clone);
        });
    });

});
