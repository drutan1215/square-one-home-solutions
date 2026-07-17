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
  const heroVideo = document.querySelector('.hero-bg-video');
  const heroWrap = document.querySelector('.hero-scroll-wrap');
  if (heroVideo && heroWrap) {
    let duration = 0;
    let ticking = false;

    const primeVideo = () => {
      duration = heroVideo.duration || 0;
      // iOS Safari won't render seeked frames until the video has played once.
      heroVideo.play().then(() => heroVideo.pause()).catch(() => {});
    };
    heroVideo.addEventListener('loadedmetadata', primeVideo);
    if (heroVideo.readyState >= 1) primeVideo();

    const updateVideoScrub = () => {
      ticking = false;
      if (!duration) return;
      const rect = heroWrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      const targetTime = progress * duration;
      if (Math.abs(heroVideo.currentTime - targetTime) > 0.04) {
        heroVideo.currentTime = targetTime;
      }
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateVideoScrub);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('load', updateVideoScrub);
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
