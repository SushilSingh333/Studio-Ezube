/* ============================================================
   Studio Ezube — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- Business contact (edit these two to go live) -------- */
  var WHATSAPP = '919811000000';      // country code + number, no '+'
  /* -------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    navScroll();
    heroSlides();
    burger();
    revealOnScroll();
    counters();
    forms();
    workFilter();
    lightbox();
    fab();
    modal();
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------- Nav scrolled state ---------------- */
  function navScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var ticking = false;
    var update = function () {
      // Transparent at the very top; solid after a small scroll.
      nav.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------- Hero background display ---------------- */
  function heroSlides() {
    var slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2 || reduceMotion) return;
    var i = 0;
    window.setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5200);
  }

  /* ---------------- Mobile menu ---------------- */
  function burger() {
    var nav = document.getElementById('nav');
    var btn = document.getElementById('burger');
    var mobile = document.getElementById('navMobile');
    if (!btn || !nav) return;
    var toggle = function (open) {
      var willOpen = open !== undefined ? open : !nav.classList.contains('open');
      nav.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    };
    btn.addEventListener('click', function () { toggle(); });
    if (mobile) {
      mobile.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { toggle(false); });
      });
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  function revealOnScroll() {
    var els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Animated counters ---------------- */
  function counters() {
    var nums = document.querySelectorAll('.num[data-count]');
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
      var dur = 1600, t0 = null;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- Forms ---------------- */
  function forms() {
    document.querySelectorAll('.lead-form').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        clearErrors(form);
        var ok = true, firstBad = null;

        var name = form.querySelector('[name="name"]');
        var phone = form.querySelector('[name="phone"]');
        var type = form.querySelector('[name="type"]');

        if (name && !name.value.trim()) { ok = false; markBad(name); firstBad = firstBad || name; }
        var digits = phone ? phone.value.replace(/\D/g, '') : '';
        if (phone && (digits.length < 10 || digits.length > 13)) { ok = false; markBad(phone); firstBad = firstBad || phone; }
        if (type && !type.value) { ok = false; markBad(type); firstBad = firstBad || type; }

        if (!ok) { if (firstBad) firstBad.focus(); return; }

        // Compose a WhatsApp hand-off so the lead reaches the studio instantly.
        var get = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ''; };
        var lines = ['Hi Studio Ezube, I\'d like a free consultation.',
          'Name: ' + get('name'),
          'Phone: ' + get('phone'),
          'Home: ' + get('type')];
        if (get('area')) lines.push('Locality: ' + get('area'));
        if (get('budget')) lines.push('Budget: ' + get('budget'));
        if (get('message')) lines.push('Notes: ' + get('message'));
        var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));

        var success = form.querySelector('.form-success');
        if (success) success.hidden = false;
        window.setTimeout(function () { window.open(url, '_blank', 'noopener'); }, 400);
        form.reset();
      });

      // clear error styling as the user fixes fields
      form.querySelectorAll('input,select,textarea').forEach(function (f) {
        f.addEventListener('input', function () {
          var field = f.closest('.field');
          if (field) field.classList.remove('invalid');
        });
      });
    });
  }
  function markBad(el) { var f = el.closest('.field'); if (f) f.classList.add('invalid'); }
  function clearErrors(form) {
    form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
  }

  /* ---------------- Work filter ---------------- */
  function workFilter() {
    var chips = document.querySelectorAll('.fchip');
    var cards = document.querySelectorAll('.work-card');
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var f = chip.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-cat') === f;
          card.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------------- Lightbox ---------------- */
  function lightbox() {
    var lb = document.getElementById('lightbox');
    var img = document.getElementById('lbImg');
    if (!lb || !img) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
    var items = cards.map(function (c) {
      var i = c.querySelector('img');
      return { src: c.getAttribute('data-full') || i.src, alt: i ? i.alt : '' };
    });
    var idx = 0;

    var show = function (i) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].src;
      img.alt = items[idx].alt;
    };
    var open = function (i) { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    var close = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

    cards.forEach(function (c, i) { c.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------------- Lead modal ---------------- */
  function modal() {
    var m = document.getElementById('leadModal');
    var form = document.getElementById('modalForm');
    if (!m || !form) return;

    var open = function (bhk) {
      // fresh form each time: hide any success + clear errors
      var succ = form.querySelector('.form-success');
      if (succ) succ.hidden = true;
      form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
      if (bhk) {
        var sel = form.querySelector('[name="type"]');
        if (sel) {
          for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === bhk || sel.options[i].text === bhk) { sel.selectedIndex = i; break; }
          }
        }
      }
      m.classList.add('open');
      m.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var first = form.querySelector('input,select');
      if (first) window.setTimeout(function () { first.focus(); }, 80);
    };
    var close = function () {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-open-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var nav = document.getElementById('nav');
        if (nav) { nav.classList.remove('open'); }   // close mobile menu if open
        var b = document.getElementById('burger');
        if (b) { b.setAttribute('aria-expanded', 'false'); }
        open(el.getAttribute('data-bhk'));
      });
    });
    m.querySelector('.modal-close').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('open')) close();
    });
  }

  /* ---------------- Floating buttons ---------------- */
  function fab() {
    var el = document.getElementById('fab');
    if (!el) return;
    var toggle = function () { el.classList.toggle('show', window.scrollY > 480); };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }
})();
