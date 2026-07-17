/* Square One Home Solutions — Main JS */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky header ──
  const header = document.querySelector('.header');
  const updateHeader = () => {
    if (window.scrollY > 60) {
      header.classList.remove('transparent');
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  };
  if (header) {
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ── Mobile menu ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Hero video scroll-scrub ──
  // Only enabled on viewports wide enough for the sticky two-column hero
  // (see the 1024px breakpoint in style.css) — below that the video just
  // autoplays/loops normally via its HTML attributes.
  const heroVideo = document.querySelector('.hero-bg-video');
  const heroWrap = document.querySelector('.hero-scroll-wrap');
  const scrubEnabled = window.matchMedia('(min-width: 1025px)').matches;

  if (heroVideo && heroWrap && scrubEnabled) {
    let duration = 0;
    let pendingTime = null;
    let seekInFlight = false;

    const primeVideo = () => {
      duration = heroVideo.duration || 0;
      // Take manual control: stop the native autoplay/loop once we know
      // scrubbing is active, and prime iOS Safari so seeked frames render
      // (it won't paint a seek until the video has played at least once).
      heroVideo.play().then(() => heroVideo.pause()).catch(() => {});
    };
    heroVideo.addEventListener('loadedmetadata', primeVideo);
    if (heroVideo.readyState >= 1) primeVideo();

    // Never issue a new seek while one is still resolving — queuing seeks
    // faster than the decoder can service them is what caused the jank.
    // Instead we track only the latest desired time and apply it the
    // moment the previous seek finishes.
    const applyPendingSeek = () => {
      if (pendingTime === null || seekInFlight) return;
      seekInFlight = true;
      heroVideo.currentTime = pendingTime;
      pendingTime = null;
    };
    heroVideo.addEventListener('seeked', () => {
      seekInFlight = false;
      applyPendingSeek();
    });

    const computeTarget = () => {
      if (!duration) return;
      const rect = heroWrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      pendingTime = progress * duration;
      applyPendingSeek();
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          computeTarget();
        });
      }
    }, { passive: true });
    window.addEventListener('load', computeTarget);
  }

  // ── Scroll fade-in ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, entry.target.dataset.delay || 0);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = (i % 4) * 80;
    observer.observe(el);
  });

  // ── Active nav link ──
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/index';
    if (currentPath.endsWith(href) || (href === 'index.html' && (currentPath === '' || currentPath.endsWith('/')))) {
      link.classList.add('active');
    }
  });

  // ── Contact form ──
  const contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.form-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        contactForm.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) success.style.display = 'block';
      }, 1200);
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Phone number click tracking ──
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', { event_category: 'Contact', event_label: link.href });
      }
    });
  });

});
