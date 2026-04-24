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

/* ANIMAÇÃO SCROLL — SEÇÃO DE PASSOS (mobile + desktop) */
(function() {
  const wrapper      = document.getElementById('stepsWrapper');
  const steps        = document.querySelectorAll('.step-content');
  const progressFill = document.getElementById('stepsProgressFill');
  const stepNumberEl = document.getElementById('stepNumberCurrent');

  if (!wrapper || steps.length === 0) return;

  const TOTAL = steps.length;
  let current = -1;
  const pad   = n => String(n + 1).padStart(2, '0');

  /* Corrige --vh para iOS Safari */
  function setVH() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });

  function activate(index) {
    if (index === current) return;
    steps.forEach((s, i) => {
      s.classList.remove('active', 'exiting');
      if (i < index) s.classList.add('exiting');
    });
    steps[index].classList.add('active');
    current = index;
    if (stepNumberEl) stepNumberEl.textContent = pad(index);
  }

  function setProgress(ratio) {
    if (!progressFill) return;
    const pct = ((ratio * TOTAL) % 1) * 100;
    if (window.innerWidth <= 768) {
      progressFill.style.width  = pct + '%';
      progressFill.style.height = '100%';
    } else {
      progressFill.style.height = pct + '%';
      progressFill.style.width  = '100%';
    }
  }

  function onScroll() {
    const rect     = wrapper.getBoundingClientRect();
    const scrolled = -rect.top;
    const total    = wrapper.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const ratio  = Math.max(0, Math.min(1, scrolled / total));
    const active = Math.min(Math.floor(ratio * TOTAL), TOTAL - 1);
    activate(active);
    setProgress(ratio);
  }

  steps[0].classList.add('active');
  current = 0;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll,  { passive: true });
  onScroll();
})();
