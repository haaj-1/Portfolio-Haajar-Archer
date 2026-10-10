(() => {
  document.documentElement.classList.add('js');

  // every page opens at the top (or its #section); the intro animations assume it
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Backgrounds: 4K for large / high-density screens, 1920px for everyone else
  // (and for anyone on a data saver or a 2G connection).
  const conn = navigator.connection || {};
  const use4k = window.screen.width * (window.devicePixelRatio || 1) >= 2560
    && !conn.saveData && !/2g$/.test(conn.effectiveType || '');
  $$('.stage__layer video').forEach((v) => {
    const src = (use4k && v.getAttribute('data-src-4k')) || v.getAttribute('data-src');
    if (src) v.src = src;
  });

  // The intro screen shows once per visit; later pages go straight in.
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  const seenIntro = store.get('hx-entered') === '1';

  /* ---------------- split display headings into chars ---------------- */
  const splitInto = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'word';
          [...part].forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = ch;
            word.appendChild(c);
          });
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('arrow')) {
        splitInto(child);
      }
    });
  };
  $$('.display .line').forEach(splitInto);

  /* ---------------- capability marquee (about page) ---------------- */
  const marquees = [];
  const track = $('.marquee__track');
  if (track) {
    const caps = $$('#capList li').map((li) => li.textContent);
    const buildRow = (items) => {
      const row = document.createElement('div');
      row.className = 'marquee__row';
      items.forEach((text) => {
        const item = document.createElement('span');
        item.className = 'marquee__item';
        item.innerHTML = `<span class="mono">(${String(caps.indexOf(text) + 1).padStart(3, '0')})</span><span></span>`;
        item.lastChild.textContent = text;
        row.appendChild(item);
      });
      return row;
    };
    const half = Math.ceil(caps.length / 2);
    [[caps.slice(0, half), 1], [caps.slice(half), -1]].forEach(([items, dir], idx) => {
      let t = track;
      if (idx > 0) {
        const wrap = track.parentElement.cloneNode(false);
        t = document.createElement('div');
        t.className = 'marquee__track';
        wrap.appendChild(t);
        track.parentElement.after(wrap);
      }
      t.appendChild(buildRow(items));
      t.appendChild(buildRow(items));
      marquees.push({ el: t, dir, x: dir > 0 ? 0 : -50 });
    });
  }

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (!seenIntro) lenis.stop();
    window.__lenis = lenis;
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = a.getAttribute('href');
    if (target.length < 2 || !document.querySelector(target)) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else document.querySelector(target).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------------- page transitions ---------------- */
  const curtain = $('.curtain');
  $$('a[href$=".html"]').forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (reduceMotion || !curtain) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => { window.location.href = href; }, 520);
  }));
  // restore the page if the browser serves it from the back/forward cache
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.remove('is-leaving'); });

  /* ---------------- background scenes ---------------- */
  const layers = Object.fromEntries($$('.stage__layer').map((l) => [l.dataset.scene, l]));
  let currentScene = ($('.stage__layer.is-active') || {}).dataset?.scene;
  const activeVideo = () => layers[currentScene]?.querySelector('video');
  const setScene = (name) => {
    if (!layers[name] || name === currentScene) return;
    const prev = layers[currentScene];
    const next = layers[name];
    next.querySelector('video').play().catch(() => {});
    next.classList.add('is-active');
    prev.classList.remove('is-active');
    const leaving = currentScene;
    setTimeout(() => { if (currentScene !== leaving) prev.querySelector('video').pause(); }, 1500);
    currentScene = name;
  };

  /* ---------------- loader / entry ---------------- */
  const loader = $('#loader');
  const enterBtn = $('#enterBtn');
  let entered = false;
  const enter = () => {
    if (entered) return;
    entered = true;
    store.set('hx-entered', '1');
    activeVideo()?.play().catch(() => {});
    loader?.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-entered');
    if (lenis) lenis.start();
    introAnimation();
  };

  if (seenIntro || !loader) {
    loader?.remove();
    // run after the char-hiding setup below has applied
    requestAnimationFrame(enter);
  } else {
    const bar = $('#loaderBar');
    const count = $('#loaderCount');
    const firstVideo = activeVideo();
    let progress = 0;
    let assetsReady = !firstVideo;
    const markReady = () => { assetsReady = true; };
    if (firstVideo) {
      if (firstVideo.readyState >= 3) markReady();
      firstVideo.addEventListener('canplaythrough', markReady, { once: true });
      firstVideo.addEventListener('error', markReady, { once: true });
    }
    setTimeout(markReady, 6000); // never block on slow networks
    const startedAt = performance.now();
    const tickLoader = () => {
      const target = Math.min(assetsReady ? 100 : 88, ((performance.now() - startedAt) / 1600) * 100);
      progress += (target - progress) * 0.12;
      const shown = Math.round(progress >= 99.4 && assetsReady ? 100 : progress);
      bar.style.width = shown + '%';
      count.textContent = String(shown).padStart(3, '0');
      if (shown >= 100) {
        enterBtn.disabled = false;
        enterBtn.classList.add('is-ready');
        enterBtn.focus({ preventScroll: true });
        return;
      }
      requestAnimationFrame(tickLoader);
    };
    requestAnimationFrame(tickLoader);
    enterBtn.addEventListener('click', enter);
  }

  /* ---------------- header ---------------- */
  const header = $('#header');
  const onScroll = (y) => header?.classList.toggle('is-scrolled', y > 40);
  if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  /* ---------------- animations ---------------- */
  const introChars = $$('[data-intro] .char');
  function introAnimation() {
    if (!hasGsap || reduceMotion) return;
    gsap.fromTo(introChars, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.018, delay: seenIntro ? 0.1 : 0.25 });
    $$('[data-intro]').forEach((h) => {
      const section = h.closest('section');
      gsap.to($$('[data-reveal]', section), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6, stagger: 0.1 });
    });
    gsap.from('.header > *', { y: -30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.2 });
    gsap.fromTo('.stage__layer.is-active video', { scale: 1.08 }, { scale: 1, duration: 2.6, ease: 'expo.out' });
  }

  if (hasGsap && !reduceMotion) {
    gsap.set(introChars, { yPercent: 115 });

    // headings: characters rise in when they enter the viewport
    $$('.display').forEach((h) => {
      if (h.hasAttribute('data-intro')) return;
      const chars = $$('.char', h);
      gsap.set(chars, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: h, start: 'top 85%',
        onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.016 }),
      });
    });

    // small copy fades up
    $$('[data-reveal]').forEach((el) => {
      if (el.closest('section')?.querySelector('[data-intro]')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // statements drift against the background like a camera move
    $$('.statement, .cta').forEach((s) => {
      gsap.fromTo($('.display', s), { y: 70 }, { y: -70, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // slow push-in on the backdrop across the whole page
    gsap.to('.stage__layer', { scale: 1.06, ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.2 } });

    // opening heading fades as you leave it
    const firstSection = $('main > section');
    if (firstSection && firstSection.querySelector('[data-intro]') && !firstSection.classList.contains('contact')) {
      gsap.to(firstSection.querySelectorAll('.display, .kicker, .hero__quick'), { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: firstSection, start: 'center center', end: 'bottom top', scrub: true } });
    }

    // cards, job rows and toolkit groups rise in
    $$('.card').forEach((c, i) => {
      gsap.from(c, { y: 90, opacity: 0, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: c, start: 'top 94%' } });
    });
    $$('.job, .toolkit__group, .facts > div, .contact__list > div').forEach((el, i) => {
      gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 94%' } });
    });
  } else {
    $$('[data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  // scene switching works with or without motion
  if (hasGsap) {
    $$('main [data-scene]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onEnter: () => setScene(sec.dataset.scene),
        onEnterBack: () => setScene(sec.dataset.scene),
      });
    });
  }

  /* ---------------- stat counters ---------------- */
  const fmt = (n) => n.toLocaleString('en-US');
  $$('.stat__num, .countup').forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (!hasGsap || reduceMotion) { el.textContent = fmt(end) + suffix; return; }
    const obj = { v: 0 };
    if (el.classList.contains('countup')) el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(Math.round(obj.v)) + suffix; } }),
    });
  });

  /* ---------------- marquee loop (speeds up with scroll) ---------------- */
  let velocity = 0;
  if (lenis) lenis.on('scroll', (e) => { velocity = e.velocity || 0; });
  if (marquees.length && !reduceMotion) {
    const loopMarquee = () => {
      const boost = 1 + Math.min(Math.abs(velocity) * 0.08, 6);
      marquees.forEach((m) => {
        if (m.paused) return;
        m.x -= 0.025 * boost * m.dir;
        if (m.x <= -50) m.x += 50;
        if (m.x > 0) m.x -= 50;
        m.el.style.transform = `translate3d(${m.x}%,0,0)`;
      });
      velocity *= 0.92;
      requestAnimationFrame(loopMarquee);
    };
    requestAnimationFrame(loopMarquee);
    if (document.body.dataset.page === 'about') {
      marquees.forEach((m) => {
        m.el.parentElement.addEventListener('mouseenter', () => { m.paused = true; });
        m.el.parentElement.addEventListener('mouseleave', () => { m.paused = false; });
      });
    }
  }

  /* ---------------- About page: interactive details ---------------- */
  if (document.body.dataset.page === 'about') {
    // live local time next to "Doha, Qatar"
    $$('.live-time').forEach((el) => {
      const fmtTime = new Intl.DateTimeFormat('en-GB', { timeZone: el.dataset.tz, hour: '2-digit', minute: '2-digit' });
      const tick = () => { el.textContent = fmtTime.format(new Date()) + ' LOCAL'; };
      tick();
      el.hidden = false;
      setInterval(tick, 30000);
    });

    // underline sweep on the bio's key phrases once the card is on screen
    const bio = $('.bio__text');
    if (bio && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { bio.classList.add('is-inview'); io.disconnect(); }
      }), { threshold: 0.35 });
      io.observe(bio);
    } else if (bio) bio.classList.add('is-inview');

    // timeline rail fills as you scroll; each role's dot lights up when reached
    $$('.jobs--timeline').forEach((list) => {
      const fill = $('.rail__fill', list);
      const jobs = $$('.job', list);
      const update = () => {
        const r = list.getBoundingClientRect();
        const mid = window.innerHeight * 0.55;
        const pct = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        fill.style.setProperty('--fill', (pct * 100).toFixed(1) + '%');
        jobs.forEach((j) => j.classList.toggle('is-reached', j.getBoundingClientRect().top + 34 < mid));
      };
      if (lenis) lenis.on('scroll', update); else addEventListener('scroll', update, { passive: true });
      addEventListener('resize', update);
      update();
    });

    if (finePointer && !reduceMotion) {
      // soft spotlight that follows the cursor across each glass card
      $$('.bio__text, .facts, .job, .toolkit__group').forEach((card) => {
        card.classList.add('spot');
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      });

      // name letters lift and brighten near the cursor
      const name = $('[data-proximity]');
      if (name && hasGsap) {
        const chars = $$('.char', name);
        name.addEventListener('pointermove', (e) => {
          chars.forEach((c) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const k = Math.max(0, 1 - d / 170);
            gsap.to(c, { y: -k * 16, color: k > 0.35 ? '#ece2ff' : '#fbf8ff', duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
          });
        });
        name.addEventListener('pointerleave', () => {
          gsap.to(chars, { y: 0, color: '#fbf8ff', duration: 0.7, ease: 'elastic.out(1, 0.5)', stagger: 0.01, overwrite: 'auto' });
        });
      }
    }
  }

  /* ---------------- experience accordion ---------------- */
  $$('.job__head').forEach((btn) => btn.addEventListener('click', () => {
    const job = btn.closest('.job');
    const open = !job.classList.contains('is-open');
    job.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 750);
  }));

  /* ---------------- work filters ---------------- */
  const filterBtns = $$('.filters button');
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    filterBtns.forEach((x) => x.classList.toggle('is-active', x === b));
    $$('#workGrid .card').forEach((card) => {
      const show = f === 'all' || card.dataset.cat === f;
      card.hidden = !show;
      card.classList.toggle('card--wide-off', f !== 'all');
    });
    if (hasGsap && !reduceMotion) gsap.fromTo('#workGrid .card:not([hidden])', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
    if (hasGsap) ScrollTrigger.refresh();
  }));

  /* ---------------- copy email ---------------- */
  $$('.copy-email').forEach((b) => b.addEventListener('click', async () => {
    const hint = $('.copy-email__hint', b);
    try {
      await navigator.clipboard.writeText(b.dataset.email);
      hint.textContent = 'COPIED';
    } catch {
      window.location.href = `mailto:${b.dataset.email}`;
    }
    setTimeout(() => { hint.textContent = 'COPY'; }, 2000);
  }));

  /* ---------------- pointer: cursor, magnetic pills, card tilt ---------------- */
  if (finePointer && !reduceMotion) {
    const cursor = $('#cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.style.opacity = 1; });
    const followCursor = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(followCursor);
    };
    requestAnimationFrame(followCursor);
    $$('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------- floating light particles ---------------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, particles = [], mouseX = 0, mouseY = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (W * H) / 16000));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * 0.25 + 0.05),
      vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.8 + 0.2,
    }));
  };
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouseX = e.clientX / W - 0.5; mouseY = e.clientY / H - 0.5; });
  const drawParticles = () => {
    ctx.clearRect(0, 0, W, H);
    const scrollDrift = (lenis ? lenis.scroll : scrollY) * 0.05;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.tw += 0.02;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      const ox = mouseX * 24 * p.depth;
      let y = p.y + mouseY * 24 * p.depth - (scrollDrift * p.depth) % H;
      if (y < -10) y += H + 20;
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
      const g = ctx.createRadialGradient(p.x + ox, y, 0, p.x + ox, y, p.r * 4);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(1, 'rgba(220,200,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x + ox, y, p.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  };
  if (!reduceMotion) requestAnimationFrame(drawParticles);

  // pause the active video when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    const v = activeVideo();
    if (!v) return;
    if (document.hidden) v.pause(); else if (entered) v.play().catch(() => {});
  });
})();
