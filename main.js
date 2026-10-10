(() => {
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

  /* ---------------- capability marquee ---------------- */
  const caps = $$('#capList li').map((li) => li.textContent);
  const track = $('.marquee__track');
  const buildRow = (items) => {
    const row = document.createElement('div');
    row.className = 'marquee__row';
    items.forEach((text) => {
      const i = caps.indexOf(text) + 1;
      const item = document.createElement('span');
      item.className = 'marquee__item';
      item.innerHTML = `<span class="mono">(${String(i).padStart(3, '0')})</span><span></span>`;
      item.lastChild.textContent = text;
      row.appendChild(item);
    });
    return row;
  };
  const half = Math.ceil(caps.length / 2);
  const marquees = [];
  [[caps.slice(0, half), 1], [caps.slice(half), -1]].forEach(([items, dir], idx) => {
    const wrap = idx === 0 ? track.parentElement : track.parentElement.cloneNode(false);
    const t = idx === 0 ? track : document.createElement('div');
    t.className = 'marquee__track';
    t.innerHTML = '';
    t.appendChild(buildRow(items));
    t.appendChild(buildRow(items));
    if (idx > 0) { wrap.appendChild(t); track.parentElement.after(wrap); }
    marquees.push({ el: t, dir, x: dir > 0 ? 0 : -50 });
  });

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.stop();
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
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else document.querySelector(target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = a.getAttribute('href');
    if (target.length < 2 || !document.querySelector(target)) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
  }));

  /* ---------------- background scenes ---------------- */
  const layers = Object.fromEntries($$('.stage__layer').map((l) => [l.dataset.scene, l]));
  let currentScene = 'hero';
  const setScene = (name) => {
    if (!layers[name] || name === currentScene) return;
    const prev = layers[currentScene];
    const next = layers[name];
    const v = next.querySelector('video');
    v.play().catch(() => {});
    next.classList.add('is-active');
    prev.classList.remove('is-active');
    const leaving = currentScene;
    setTimeout(() => { if (currentScene !== leaving) prev.querySelector('video').pause(); }, 1500);
    currentScene = name;
  };

  /* ---------------- loader ---------------- */
  const loader = $('#loader');
  const enterBtn = $('#enterBtn');
  const bar = $('#loaderBar');
  const count = $('#loaderCount');
  const heroVideo = $('.stage__layer[data-scene="hero"] video');
  let progress = 0;
  let assetsReady = false;
  const markReady = () => { assetsReady = true; };
  if (heroVideo.readyState >= 3) markReady();
  heroVideo.addEventListener('canplaythrough', markReady, { once: true });
  heroVideo.addEventListener('error', markReady, { once: true });
  setTimeout(markReady, 6000); // never block on slow networks
  const startedAt = performance.now();
  const tickLoader = () => {
    const elapsed = performance.now() - startedAt;
    const cap = assetsReady ? 100 : 88;
    const target = Math.min(cap, (elapsed / 1600) * 100);
    progress += (target - progress) * 0.12;
    const shown = Math.round(progress >= 99.4 && assetsReady ? 100 : progress);
    bar.style.width = shown + '%';
    count.textContent = String(shown).padStart(3, '0');
    if (shown >= 100) {
      enterBtn.disabled = false;
      enterBtn.classList.add('is-ready');
      return;
    }
    requestAnimationFrame(tickLoader);
  };
  requestAnimationFrame(tickLoader);

  let entered = false;
  const enter = () => {
    if (entered) return;
    entered = true;
    heroVideo.play().catch(() => {});
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-entered');
    if (lenis) lenis.start();
    introAnimation();
    setTimeout(() => showBubble(4200), 1600);
  };
  enterBtn.addEventListener('click', enter);

  /* ---------------- animations ---------------- */
  const heroLines = $$('.hero .display .char');
  const introAnimation = () => {
    if (!hasGsap || reduceMotion) return;
    gsap.fromTo(heroLines, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out', stagger: 0.018, delay: 0.25 });
    gsap.to('.hero [data-reveal]', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6 });
    gsap.fromTo('.stage__layer.is-active video', { scale: 1.15 }, { scale: 1, duration: 2.6, ease: 'expo.out' });
  };

  if (hasGsap && !reduceMotion) {
    gsap.set(heroLines, { yPercent: 115 });

    // headings: characters rise in when they enter the viewport
    $$('.display').forEach((h) => {
      if (h.closest('.hero')) return;
      const chars = $$('.char', h);
      gsap.set(chars, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: h, start: 'top 82%',
        onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.016 }),
      });
    });

    // small mono copy fades up
    $$('[data-reveal]').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // statements drift against the background like a camera move
    $$('.statement, .contact').forEach((s) => {
      gsap.fromTo($('.display', s), { y: 80 }, { y: -80, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // slow push-in on the backdrop across the whole page
    gsap.to('.stage__layer', { scale: 1.14, ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.2 } });

    // hero fades out as you leave it
    gsap.to('.hero .display, .hero .kicker', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

    // cards rise in
    $$('.card').forEach((c, i) => {
      gsap.from(c, { y: 90, opacity: 0, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: c, start: 'top 92%' } });
    });

    // job rows slide in
    $$('.job').forEach((j, i) => {
      gsap.from(j, { x: -40, opacity: 0, duration: 1, ease: 'expo.out', delay: i * 0.08, scrollTrigger: { trigger: j, start: 'top 90%' } });
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
  $$('.stat__num').forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (!hasGsap || reduceMotion) { el.textContent = fmt(end) + suffix; return; }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(Math.round(obj.v)) + suffix; } }),
    });
  });

  /* ---------------- marquee loop (speeds up with scroll) ---------------- */
  let velocity = 0;
  if (lenis) lenis.on('scroll', (e) => { velocity = e.velocity || 0; });
  const loopMarquee = () => {
    const boost = 1 + Math.min(Math.abs(velocity) * 0.08, 6);
    marquees.forEach((m) => {
      m.x -= 0.025 * boost * m.dir;
      if (m.x <= -50) m.x += 50;
      if (m.x > 0) m.x -= 50;
      m.el.style.transform = `translate3d(${m.x}%,0,0)`;
    });
    velocity *= 0.92;
    requestAnimationFrame(loopMarquee);
  };
  if (!reduceMotion) requestAnimationFrame(loopMarquee);

  /* ---------------- experience accordion ---------------- */
  $$('.job__head').forEach((btn) => btn.addEventListener('click', () => {
    const job = btn.closest('.job');
    const open = !job.classList.contains('is-open');
    job.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 750);
  }));

  /* ---------------- menu ---------------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start();
  }
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop();
    if (hasGsap && !reduceMotion) gsap.from('.menu li', { yPercent: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Enter' && !entered && !enterBtn.disabled && document.activeElement === document.body) enter();
  });

  /* ---------------- orb bubble ---------------- */
  const bubble = $('#bubble');
  let bubbleTimer;
  function showBubble(ms = 2600) {
    bubble.classList.add('is-visible');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('is-visible'), ms);
  }
  $('.navpill__orb').addEventListener('mouseenter', () => showBubble());
  $('.navpill__orb').addEventListener('focus', () => showBubble());

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
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
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
  let W = 0, H = 0, dpr = 1, particles = [], mouseX = 0, mouseY = 0;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      const ox = mouseX * 24 * p.depth;
      const oy = mouseY * 24 * p.depth - (scrollDrift * p.depth) % H;
      let y = p.y + oy; if (y < -10) y += H + 20;
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
    const v = layers[currentScene].querySelector('video');
    if (document.hidden) v.pause(); else if (entered) v.play().catch(() => {});
  });
})();
