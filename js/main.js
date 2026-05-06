/* ===================================================
   MAIN — Navigation, AOS, UI utilities
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── AOS ──────────────────────────────────────────
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   60,
    });
  }

  // ── Sticky nav on scroll ──────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('nav-scrolled', window.scrollY > 40);
      scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  // ── Mobile menu ───────────────────────────────────
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', open);
      // Toggle icon between Menu and X
      const icon = mobileBtn.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', open ? 'menu' : 'x');
        if (window.lucide) lucide.createIcons({ nodes: [icon] });
      }
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // ── Lucide icons ─────────────────────────────────
  if (window.lucide) lucide.createIcons();

  // ── Scroll-to-top button ─────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Smooth anchor scroll ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Active nav link on scroll ─────────────────────
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('nav a[href^="#"]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('text-white', active);
          link.classList.toggle('text-slate-300', !active);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  // ── Counter animation on scroll ───────────────────
  const countEls = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const target   = parseFloat(entry.target.dataset.count);
        const suffix   = entry.target.dataset.suffix  || '';
        const prefix   = entry.target.dataset.prefix  || '';
        const isFloat  = entry.target.dataset.float === 'true';
        const duration = 1300;
        const start    = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          const val      = eased * target;
          entry.target.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.6 });

  countEls.forEach(el => counterObserver.observe(el));

  // ── Hero phone: live call timer ───────────────────
  const timerEl = document.getElementById('call-timer');
  if (timerEl) {
    let secs = 47;
    setInterval(() => {
      secs++;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    }, 1000);
  }

  // ── Hero waveform bars: random heights ───────────
  document.querySelectorAll('.waveform-bar').forEach((bar, i) => {
    const maxH  = 8 + Math.random() * 24;
    const delay = ((i * 0.11) % 1.2).toFixed(2);
    bar.style.setProperty('--bar-max-h', maxH + 'px');
    bar.style.animationDelay = delay + 's';
  });

});
