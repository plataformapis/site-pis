/* ============================================================
   PIS — main.js v4.0
   ============================================================ */
'use strict';

/* LOADER */
(function() {
  const el = document.getElementById('loader');
  if (!el) return;
  const hide = () => el.classList.add('hide');
  document.readyState === 'complete'
    ? setTimeout(hide, 600)
    : window.addEventListener('load', () => setTimeout(hide, 600));
  setTimeout(hide, 3000);
})();

/* SCROLL PROGRESS */
(function() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const upd = () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100;
    bar.style.setProperty('--scroll', Math.min(pct, 100).toFixed(1) + '%');
  };
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* HEADER SCROLL STATE */
(function() {
  const h = document.getElementById('header');
  if (!h) return;
  const upd = () => h.classList.toggle('scrolled', scrollY > 24);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* MOBILE NAV */
(function() {
  const btn    = document.getElementById('nav-toggle');
  const nav    = document.getElementById('nav');
  const header = document.getElementById('header');
  if (!btn || !nav) return;

  const open  = () => { nav.classList.add('open');  btn.classList.add('open');  btn.setAttribute('aria-expanded','true');  document.body.classList.add('nav-open'); };
  const close = () => { nav.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open'); };

  btn.addEventListener('click', () => nav.classList.contains('open') ? close() : open());
  nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* SCROLL REVEAL */
(function() {
  const els = document.querySelectorAll('.reveal, .reveal-s');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ANIMATED COUNTERS */
(function() {
  const els = document.querySelectorAll('.metric__n[data-count]');
  if (!els.length) return;
  const ease = t => 1 - Math.pow(1 - t, 3);

  function run(el) {
    const target = +el.dataset.count;
    const dur = 1600, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(p) * target).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const wrap = document.querySelector('.hero__metrics');
  if (!wrap) return;
  let done = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) { done = true; els.forEach(run); }
  }, { threshold: .5 }).observe(wrap);
})();

/* SMOOTH SCROLL */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#' + id);
    });
  });
})();

/* ACTIVE NAV */
(function() {
  const secs  = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__link');
  if (!secs.length || !links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('nav__link--active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  secs.forEach(s => obs.observe(s));
})();

/* MAGNETIC BUTTONS */
(function() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${dx * .28}px, ${dy * .28}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* RIPPLE */
(function() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r  = btn.getBoundingClientRect();
      const rp = document.createElement('span');
      rp.className = 'ripple';
      rp.style.left = (e.clientX - r.left) + 'px';
      rp.style.top  = (e.clientY - r.top)  + 'px';
      btn.appendChild(rp);
      rp.addEventListener('animationend', () => rp.remove());
    });
  });
})();

/* ANIMAÇÃO SCROLL — SEÇÃO DE PASSOS */
(function() {
  const wrapper      = document.getElementById('stepsWrapper');
  const steps        = document.querySelectorAll('.step-content');
  const progressFill = document.getElementById('stepsProgressFill');
  const stepNumberEl = document.getElementById('stepNumberCurrent');

  const isMobile = () => window.innerWidth <= 768;

  if (!wrapper || steps.length === 0) return;

  const TOTAL_STEPS = steps.length;
  let currentStep = -1;

  const pad = n => String(n + 1).padStart(2, '0');

  function activateStep(index) {
    if (index === currentStep) return;

    steps.forEach((step, i) => {
      step.classList.remove('active', 'exiting');
      if (i < index) step.classList.add('exiting');
    });

    steps[index].classList.add('active');
    currentStep = index;

    if (stepNumberEl) stepNumberEl.textContent = pad(index);
  }

  function updateProgress(ratio) {
    if (!progressFill) return;
    const stepRatio = (ratio * TOTAL_STEPS) % 1;
    progressFill.style.height = (stepRatio * 100) + '%';
  }

  function onScroll() {
    if (isMobile()) return;

    const wrapperRect  = wrapper.getBoundingClientRect();
    const wrapperHeight = wrapper.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled   = -wrapperRect.top;
    const scrollable = wrapperHeight - viewportHeight;

    if (scrollable <= 0) return;

    const ratio      = Math.max(0, Math.min(1, scrolled / scrollable));
    const rawStep    = ratio * TOTAL_STEPS;
    const activeIndex = Math.min(Math.floor(rawStep), TOTAL_STEPS - 1);

    activateStep(activeIndex);
    updateProgress(ratio);
  }

  function onResize() {
    if (isMobile()) {
      steps.forEach(step => step.classList.remove('active', 'exiting'));
      currentStep = -1;
    } else {
      onScroll();
    }
  }

  if (!isMobile()) steps[0].classList.add('active');

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  onScroll();
})();
