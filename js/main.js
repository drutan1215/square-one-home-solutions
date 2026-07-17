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
  // The hero is pinned (position: sticky) at every breakpoint, and
  // progress is driven by how far the page has scrolled through the tall
  // .hero-scroll-wrap spacer behind it — same mechanic on mobile as
  // desktop, just a shorter spacer (see the 1024/768px CSS breakpoints).
  const heroVideo = document.querySelector('.hero-bg-video');
  const heroWrap = document.querySelector('.hero-scroll-wrap');

  if (heroVideo && heroWrap) {
    let duration = 0;
    let pendingTime = null;
    let seekInFlight = false;
    let seekWatchdog = null;

    // Mobile browsers frequently refuse to fetch even metadata for a
    // <video> until playback is requested — with no `autoplay` attribute
    // and no user gesture, `loadedmetadata` can simply never fire, which
    // left duration at 0 and the scrub silently doing nothing. Calling
    // play() immediately (allowed for muted+playsinline without a
    // gesture) forces the load to start; pausing right after also
    // primes iOS Safari to paint seeked frames rather than a blank one.
    const primeVideo = () => {
      const attempt = heroVideo.play();
      if (attempt !== undefined) attempt.then(() => heroVideo.pause()).catch(() => {});
    };
    heroVideo.addEventListener('loadedmetadata', () => {
      duration = heroVideo.duration || 0;
      computeTarget();
    });
    primeVideo();
    if (heroVideo.readyState >= 1) duration = heroVideo.duration || 0;

    // Never issue a new seek while one is still resolving — queuing seeks
    // faster than the decoder can service them is what caused the jank.
    // Instead we track only the latest desired time and apply it the
    // moment the previous seek finishes.
    const applyPendingSeek = () => {
      if (pendingTime === null || seekInFlight) return;
      seekInFlight = true;
      heroVideo.currentTime = pendingTime;
      pendingTime = null;
      // Some browsers never fire 'seeked' when the target doesn't
      // meaningfully differ from the current position — most notably
      // the very first seek-to-0 on page load, since currentTime already
      // starts at 0. Without this, that single missed event permanently
      // wedges seekInFlight and silently kills scrubbing for the rest of
      // the page's life. This watchdog self-heals if 'seeked' goes quiet.
      clearTimeout(seekWatchdog);
      seekWatchdog = setTimeout(() => {
        seekInFlight = false;
        applyPendingSeek();
      }, 250);
    };
    heroVideo.addEventListener('seeked', () => {
      clearTimeout(seekWatchdog);
      seekInFlight = false;
      applyPendingSeek();
    });

    const computeTarget = () => {
      if (!duration) return;
      const rect = heroWrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max((-rect.top) / scrollable, 0), 1);
      // Seeking to exactly `duration` has no frame to land on in most
      // browsers and renders blank (showing the frame's black background
      // through it), so keep the target just shy of the true end.
      pendingTime = progress * Math.max(duration - 0.15, 0);
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
    window.addEventListener('resize', computeTarget);
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
