/* The Health Lab — interactions */

document.body.classList.add('js');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── preloader + hero reveal ─────────────────────────── */

const preloader = document.getElementById('preloader');
const finishLoad = () => {
  document.body.classList.add('loaded');
  if (preloader) {
    preloader.classList.add('done');
    setTimeout(() => preloader.remove(), 1400);
  }
};
let seen = false;
try {
  seen = !!sessionStorage.getItem('hl-loaded');
  sessionStorage.setItem('hl-loaded', '1');
} catch (_) { /* storage unavailable */ }

if (prefersReduced || seen) {
  finishLoad();
} else {
  window.addEventListener('load', () => setTimeout(finishLoad, 900));
  setTimeout(finishLoad, 2600); // safety net
}

/* ── scroll reveals ──────────────────────────────────── */

const revealObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── scroll progress ─────────────────────────────────── */

const progress = document.getElementById('scrollProgress');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ── nav scroll spy ──────────────────────────────────── */

const spyLinks = document.querySelectorAll('[data-spy]');
const spySections = new Map();
spyLinks.forEach(link => {
  const sec = document.getElementById(link.dataset.spy);
  if (sec) spySections.set(sec, link);
});
const spyObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    const link = spySections.get(e.target);
    if (link && e.isIntersecting) {
      spyLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  }
}, { rootMargin: '-35% 0px -55% 0px' });
spySections.forEach((_, sec) => spyObserver.observe(sec));

/* ── custom cursor ───────────────────────────────────── */

if (finePointer && !prefersReduced) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    ring.style.transform =
      `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`;
    requestAnimationFrame(follow);
  })();

  const hoverables = 'a, button, summary, input, select, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) ring.classList.remove('is-hover');
  });
}

/* ── magnetic buttons ────────────────────────────────── */

if (finePointer && !prefersReduced) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.22,.9,.3,1)';
      el.style.transform = '';
      setTimeout(() => el.style.transition = '', 500);
    });
  });
}

/* ── parallax ghost words ────────────────────────────── */

const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
if (parallaxEls.length && !prefersReduced) {
  let ticking = false;
  const parallax = () => {
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translateY(${-offset}px)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  parallax();
}

/* ── animated counters ───────────────────────────────── */

const counters = document.querySelectorAll('.stat-num[data-count]');
const countObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    countObserver.unobserve(el);
    if (prefersReduced) { el.textContent = target; continue; }
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
counters.forEach(c => countObserver.observe(c));

/* ── menu overlay (mobile) ───────────────────────────── */

const burger = document.getElementById('burger');
const overlay = document.getElementById('menuOverlay');
const setMenu = open => {
  burger.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  overlay.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!overlay.classList.contains('open')));
overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ── FAQ — single open ───────────────────────────────── */

const faqs = document.querySelectorAll('.faq');
faqs.forEach(d => d.addEventListener('toggle', () => {
  if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
}));

/* ── testimonial rotator ─────────────────────────────── */

const slides = document.querySelectorAll('.tq-slide');
const tqIndex = document.getElementById('tqIndex');
let current = 0, timer;

const showSlide = i => {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
  tqIndex.textContent = String(current + 1).padStart(2, '0');
};
const restart = () => {
  clearInterval(timer);
  if (!prefersReduced) timer = setInterval(() => showSlide(current + 1), 6000);
};
document.getElementById('tqPrev').addEventListener('click', () => { showSlide(current - 1); restart(); });
document.getElementById('tqNext').addEventListener('click', () => { showSlide(current + 1); restart(); });
restart();

/* ── booking form ────────────────────────────────────── */

const form = document.getElementById('bookingForm');
const msg = document.getElementById('bf-msg');
const counter = document.getElementById('charCount');
const note = document.getElementById('formNote');

msg.addEventListener('input', () => {
  counter.textContent = `${msg.value.length} / 350`;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = [
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Phone: ${data.get('phone') || '—'}`,
    `Service: ${data.get('service')}`,
    '',
    data.get('message') || '(no message)'
  ].join('\n');
  window.location.href =
    `mailto:healthlab@surreynurse.com?subject=${encodeURIComponent('Booking request — The Health Lab')}&body=${encodeURIComponent(body)}`;
  note.hidden = false;
});
