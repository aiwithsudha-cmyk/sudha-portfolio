// ===================== PROJECT LIST =====================
// Used to build the "Previous / Next" links at the bottom of every project page.
// When you add a project, add one line here (same order as the cards on the Work / Playground page).
var PROJECTS = [
  { slug: 'bharat-ka-metro',      title: 'Bharat Ka Metro',                  folder: 'work' },
  { slug: 'ride-to-the-moon',     title: 'Ride to the Moon',                 folder: 'work' },
  { slug: '66-mg-road-film',      title: '66 MG Road',                       folder: 'work' },
  { slug: '66-mg-road-strategy',  title: '66 MG Road: Growth Strategy',      folder: 'work' },
  { slug: 'dot-and-key-research', title: 'Dot & Key Research',               folder: 'work' },
  { slug: 'agra-infographic',     title: 'Agra Infographic',                 folder: 'work' },
  { slug: 'disaster-simulation',  title: 'Disaster Simulation',              folder: 'playground' },
  { slug: 'readlist',             title: "What's on my Readlist",            folder: 'playground' },
  { slug: 'find-the-character',   title: 'Find the Character, Play the Song', folder: 'playground' }
];
// ========================================================

// Previous / Next links on project pages
(function () {
  var nav = document.getElementById('pager');
  if (!nav) return;
  var file = location.pathname.split('/').filter(Boolean).pop() || '';
  var slug = file.replace(/\.html$/, '');
  var cur = PROJECTS.filter(function (p) { return p.slug === slug; })[0];
  if (!cur) return;
  var sibs = PROJECTS.filter(function (p) { return p.folder === cur.folder; });
  if (sibs.length < 2) return;
  var i = sibs.indexOf(cur);
  var prev = sibs[(i - 1 + sibs.length) % sibs.length], next = sibs[(i + 1) % sibs.length];
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  nav.innerHTML =
    '<a class="prev" href="' + prev.slug + '.html"><small>\u2190 Previous</small>' + esc(prev.title) + '</a>' +
    '<a class="next" href="' + next.slug + '.html"><small>Next \u2192</small>' + esc(next.title) + '</a>';
})();

// In-page YouTube player: clicking the picture or the Play button swaps the image for the video.
// (Without JavaScript the same buttons simply open YouTube.)
(function () {
  var hero = document.querySelector('.detail-hero');
  if (!hero) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-youtube]');
    if (!a) return;
    e.preventDefault();
    if (hero.classList.contains('is-player')) return;
    var title = (document.querySelector('h1') || {}).textContent || 'Video';
    hero.classList.add('is-player');
    hero.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-youtube') +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + title.replace(/"/g, '') +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

// Beyond work mosaic: click a photo and it grows to the middle of the screen; click again (or Esc) and it settles back.
(function () {
  var grid = document.getElementById('mosaic');
  if (!grid) return;

  // photos that don't exist yet are simply left out
  grid.querySelectorAll('img').forEach(function (img) {
    function drop() { if (img.closest('li')) img.closest('li').remove(); }
    if (img.complete && img.naturalWidth === 0) drop();
    img.addEventListener('error', drop);
  });

  var back, pop, pimg, cap, btnX, btnP, btnN;
  var idx = -1, isOpen = false, busy = false;

  function tiles() { return Array.prototype.slice.call(grid.querySelectorAll('.ph')); }
  function build() {
    if (back) return;
    back = document.createElement('div'); back.className = 'pop-backdrop';
    pop = document.createElement('figure'); pop.className = 'pop';
    pimg = document.createElement('img'); cap = document.createElement('figcaption');
    pop.appendChild(pimg); pop.appendChild(cap);
    function mk(cls, label, txt) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pop-btn ' + cls;
      b.setAttribute('aria-label', label); b.innerHTML = txt; return b;
    }
    btnX = mk('pop-close', 'Close photo', '&#10005;');
    btnP = mk('pop-prev', 'Previous photo', '&larr;');
    btnN = mk('pop-next', 'Next photo', '&rarr;');
    [back, pop, btnX, btnP, btnN].forEach(function (el) { el.style.display = 'none'; document.body.appendChild(el); });
    back.addEventListener('click', close);
    pop.addEventListener('click', close);
    btnX.addEventListener('click', close);
    btnP.addEventListener('click', function () { go(-1); });
    btnN.addEventListener('click', function () { go(1); });
  }
  function box(r, radius) {
    pop.style.left = r.left + 'px'; pop.style.top = r.top + 'px';
    pop.style.width = r.width + 'px'; pop.style.height = r.height + 'px';
    pop.style.borderRadius = radius + 'px';
  }
  function target(img) {
    var ar = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 4 / 3;
    var maxW = Math.min(window.innerWidth * 0.92, 1200), maxH = window.innerHeight * 0.78;
    var w = maxW, h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return { left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2 - 12, width: w, height: h };
  }
  function show(i) {
    var all = tiles();
    var tile = all[i], img = tile.querySelector('img');
    pimg.src = img.currentSrc || img.src;
    pimg.alt = img.alt;
    cap.textContent = tile.dataset.caption || img.alt || '';
    tile.classList.add('is-popped');
    return { tile: tile, img: img };
  }
  function open(i) {
    if (isOpen || busy) return;
    build();
    var cur = show(i); idx = i; isOpen = true;
    var r = cur.tile.getBoundingClientRect();
    pop.style.transition = 'none'; box(r, 14); pop.style.display = 'block';
    void pop.offsetWidth;
    pop.style.transition = '';
    document.documentElement.classList.add('pop-lock');
    back.style.display = 'block';
    requestAnimationFrame(function () {
      back.classList.add('on'); pop.classList.add('open');
      [btnX, btnP, btnN].forEach(function (b) { b.style.display = 'flex'; });
      requestAnimationFrame(function () { [btnX, btnP, btnN].forEach(function (b) { b.classList.add('on'); }); });
      box(target(cur.img), 16);
    });
    btnX.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen || busy) return;
    busy = true;
    var all = tiles(), tile = all[idx];
    document.documentElement.classList.remove('pop-lock');
    var r = tile.getBoundingClientRect();
    pop.classList.remove('open'); back.classList.remove('on');
    [btnX, btnP, btnN].forEach(function (b) { b.classList.remove('on'); });
    box(r, 14);
    var done = false;
    function finish() {
      if (done) return; done = true;
      pop.style.display = 'none'; back.style.display = 'none';
      [btnX, btnP, btnN].forEach(function (b) { b.style.display = 'none'; });
      tile.classList.remove('is-popped');
      isOpen = false; busy = false;
      tile.focus({ preventScroll: true });
    }
    pop.addEventListener('transitionend', function te(e) {
      if (e.propertyName === 'width') { pop.removeEventListener('transitionend', te); finish(); }
    });
    setTimeout(finish, 650);
  }
  function go(d) {
    if (!isOpen || busy) return;
    var all = tiles();
    all[idx].classList.remove('is-popped');
    idx = (idx + d + all.length) % all.length;
    var cur = show(idx);
    box(target(cur.img), 16);
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.ph');
    if (!b) return;
    open(tiles().indexOf(b));
  });
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });
  window.addEventListener('resize', function () { if (isOpen && !busy) { pop.style.transition = 'none'; box(target(tiles()[idx].querySelector('img')), 16); void pop.offsetWidth; pop.style.transition = ''; } });
  // swipe left / right on touch screens
  var sx = null;
  document.addEventListener('touchstart', function (e) { if (isOpen) sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!isOpen || sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// Theme: palette + light/dark mode, remembered in localStorage.
// The inline script in each page's <head> applies the saved values before first paint;
// this file wires up the controls in the Theme dropdown.
(function () {
  var root = document.documentElement;

  function currentPalette() { return root.getAttribute('data-palette') || 'berry'; }
  function currentMode() { return root.getAttribute('data-theme') || 'light'; }

  function syncControls() {
    var p = currentPalette(), m = currentMode();
    document.querySelectorAll('.palette-opt').forEach(function (b) {
      b.classList.toggle('active', b.dataset.p === p);
    });
    document.querySelectorAll('.mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === m);
    });
  }

  document.querySelectorAll('.palette-opt').forEach(function (b) {
    b.addEventListener('click', function () {
      root.setAttribute('data-palette', b.dataset.p);
      try { localStorage.setItem('palette', b.dataset.p); } catch (e) {}
      syncControls();
    });
  });

  document.querySelectorAll('.mode-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      root.setAttribute('data-theme', b.dataset.mode);
      try { localStorage.setItem('mode', b.dataset.mode); } catch (e) {}
      syncControls();
    });
  });

  syncControls();
})();

// Header dropdowns: only one open at a time
(function () {
  var menus = [
    { btn: document.getElementById('pagesBtn'), panel: document.getElementById('pagesDropdown') },
    { btn: document.getElementById('themeBtn'), panel: document.getElementById('themeDropdown') },
    { btn: document.getElementById('contactBtn'), panel: document.getElementById('contactDropdown') }
  ].filter(function (m) { return m.btn && m.panel; });

  menus.forEach(function (m) {
    m.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !m.panel.classList.contains('open');
      menus.forEach(function (o) { o.panel.classList.remove('open'); });
      if (willOpen) m.panel.classList.add('open');
    });
  });

  // Clicks inside an open dropdown keep it open (so you can try several palettes);
  // clicks anywhere else close it.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu-wrap')) {
      menus.forEach(function (o) { o.panel.classList.remove('open'); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') menus.forEach(function (o) { o.panel.classList.remove('open'); });
  });
})();

// Scroll progress bar + footer percentage
(function () {
  var progress = document.getElementById('progress');
  var scrollPct = document.getElementById('scrollPct');
  function update() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? Math.round((h.scrollTop / max) * 100) : 0;
    if (progress) progress.style.width = pct + '%';
    if (scrollPct) scrollPct.textContent = pct + '%';
  }
  window.addEventListener('scroll', update);
  update();
})();

// Live Mumbai (IST) clock in the footer
(function () {
  var clock = document.getElementById('clock');
  if (!clock) return;
  function tick() {
    try {
      clock.textContent = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
      }) + ' IST';
    } catch (e) { /* noop */ }
  }
  tick();
  setInterval(tick, 30000);
})();


// Sideways project gallery: a continuous, seamless glide.
// It keeps moving until the visitor hovers over the gallery (resumes on leave), touches it
// (resumes a few seconds after), or clicks an arrow (stays stopped until they press play again).
// Reduced-motion visitors get a plain, manual gallery with no auto-movement.
(function () {
  var rail = document.getElementById('rail');
  var prev = document.getElementById('railPrev');
  var next = document.getElementById('railNext');
  var pauseBtn = document.getElementById('railPause');
  if (!rail || !prev || !next) return;

  var SPEED = 55;                // pixels per second
  var TOUCH_RESUME = 3500;       // ms after a finger leaves the gallery
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cards = Array.prototype.slice.call(rail.querySelectorAll('.card'));
  var looping = !reduce && cards.length > 1;

  // Endless loop: append a copy of every card; when we've scrolled one full set, jump back by that set.
  var W = 0;
  if (looping) {
    cards.forEach(function (c) {
      var k = c.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      k.tabIndex = -1;
      k.classList.add('card-copy');
      rail.appendChild(k);
    });
    var measure = function () {
      var copy = rail.querySelector('.card-copy');
      W = copy.offsetLeft - cards[0].offsetLeft;
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
  }

  function gap() { return parseFloat(getComputedStyle(rail).columnGap) || 24; }
  function step() { return cards[0].getBoundingClientRect().width + gap(); }
  function jump(by) {
    var b = rail.style.scrollBehavior;
    rail.style.scrollBehavior = 'auto';
    rail.scrollLeft += by;
    rail.style.scrollBehavior = b;
  }
  function atEnd() { return rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8; }
  function update() {
    if (looping) { prev.disabled = false; next.disabled = false; return; }
    prev.disabled = rail.scrollLeft < 8;
    next.disabled = atEnd();
  }

  var userPaused = reduce, hovering = false, touching = false, visible = true;
  var gliding = false;           // true while snapping is switched off for the glide

  function setGliding(on) {
    gliding = on;
    rail.classList.toggle('is-gliding', on);
  }
  function setPaused(p) {
    userPaused = p;
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', p ? 'Resume auto-scroll' : 'Pause auto-scroll');
    pauseBtn.innerHTML = p ? '&#9654;' : '&#10074;&#10074;';
  }
  setPaused(userPaused);
  if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });

  // Arrows: take manual control (this stops the glide), then move one card.
  function manual(dir) {
    setPaused(true);
    setGliding(false);
    if (looping && dir < 0 && rail.scrollLeft < step()) jump(W);
    rail.scrollBy({ left: dir * step(), behavior: 'smooth' });
  }
  prev.addEventListener('click', function () { manual(-1); });
  next.addEventListener('click', function () { manual(1); });

  // After a manual scroll settles, hop back by one set so the loop never runs out of cards.
  var settleT = null;
  rail.addEventListener('scroll', function () {
    update();
    if (!looping || gliding) return;
    clearTimeout(settleT);
    settleT = setTimeout(function () { if (rail.scrollLeft >= W) jump(-W); }, 160);
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Hover (or keyboard focus) pauses; leaving resumes.
  [rail, prev, next].forEach(function (el) {
    el.addEventListener('mouseenter', function () { hovering = true; });
    el.addEventListener('mouseleave', function () { hovering = false; });
  });
  rail.addEventListener('focusin', function () { hovering = true; });
  rail.addEventListener('focusout', function () { hovering = false; });

  // Touch: pause while a finger is on it, resume shortly after.
  var touchT = null;
  rail.addEventListener('touchstart', function () {
    touching = true; clearTimeout(touchT); setGliding(false);
  }, { passive: true });
  rail.addEventListener('touchend', function () {
    clearTimeout(touchT);
    touchT = setTimeout(function () { touching = false; }, TOUCH_RESUME);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.2 }).observe(rail);
  }

  if (!looping) return;

  // The glide itself.
  var pos = 0, last = 0, wasRunning = false;
  function tick(ts) {
    var dt = last ? Math.min(ts - last, 64) : 16;
    last = ts;
    var run = !userPaused && !hovering && !touching && visible && !document.hidden;
    if (run) {
      if (!wasRunning) { setGliding(true); pos = rail.scrollLeft; }
      pos += SPEED * dt / 1000;
      if (pos >= W) pos -= W;
      rail.scrollLeft = pos;
    }
    wasRunning = run;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Project clips: a short muted clip plays over the card image.
// Desktop: on hover or keyboard focus. Touch screens: the card that is mostly in view.
// Clips live in assets/clips/<project-slug>.mp4. A missing file is simply ignored.
(function () {
  var cards = document.querySelectorAll('.card[data-clip]');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function vid(card) { return card.querySelector('.card-clip'); }
  function play(card) {
    var v = vid(card);
    if (!v || v.dataset.failed) return;
    if (!v.dataset.loaded) {
      v.dataset.loaded = '1';
      v.addEventListener('error', function () { v.dataset.failed = '1'; card.classList.remove('clip-on'); });
      v.addEventListener('loadedmetadata', function () {
        card.classList.toggle('clip-v', v.videoHeight > v.videoWidth);   // vertical clip: centre it over a blurred backdrop
      });
      v.src = v.dataset.src;
    }
    var p = v.play();
    if (p && p.then) p.then(function () { card.classList.add('clip-on'); }).catch(function () {});
  }
  function stop(card) {
    var v = vid(card);
    if (!v) return;
    v.pause();
    card.classList.remove('clip-on');
    try { v.currentTime = 0; } catch (e) {}
  }

  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hoverCapable) {
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { play(card); });
      card.addEventListener('mouseleave', function () { stop(card); });
      card.addEventListener('focusin', function () { play(card); });
      card.addEventListener('focusout', function () { stop(card); });
    });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.75) play(e.target); else stop(e.target);
      });
    }, { threshold: [0, 0.75] });
    cards.forEach(function (card) { io.observe(card); });
  }
})();

// Hero wave: the clip is shot on a green screen. Each frame is drawn to a canvas and the green is
// removed live, so she stands directly on whatever palette colour the page is using.
// Replace assets/hero-wave.mp4 / .webm with a new green-screen clip and it just works. If a clip looks
// fringed, tweak LO (lower = removes more green) and HI. Reduced-motion visitors see the still frame.
(function () {
  var fig = document.getElementById('heroFigure');
  if (!fig) return;
  var v = fig.querySelector('.hero-video'), c = fig.querySelector('.hero-canvas');
  if (!v || !c) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var LO = 22, HI = 108;       // "greenness" thresholds: below LO keep, above HI remove, blend in between
  var PAUSE_BETWEEN = 2500;    // ms of rest between waves
  var ctx = c.getContext('2d', { willReadFrequently: true });
  var visible = true, waitT = null;

  var blocked = false;         // true if the browser won't let us read the video pixels (e.g. page opened from a file)
  function paint() {
    if (blocked) return;
    if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    var img;
    try { img = ctx.getImageData(0, 0, c.width, c.height); }
    catch (err) { blocked = true; fig.classList.remove('is-live'); v.pause(); return; }
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2], m = r > b ? r : b, k = g - m;
      if (k > 0) {
        d[i + 1] = m;                                            // remove green tint
        if (k > LO) d[i + 3] = k >= HI ? 0 : 255 * (HI - k) / (HI - LO);   // make the green see-through
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function loop() {
    if (blocked || v.paused || v.ended) return;
    paint();
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(loop); else requestAnimationFrame(loop);
  }
  function start() {
    clearTimeout(waitT);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  v.addEventListener('playing', function () {
    if (v.videoWidth) { paint(); if (!blocked) fig.classList.add('is-live'); }
    loop();
  });
  v.addEventListener('ended', function () {
    // the clip ends in the same pose it starts in, so the replay is seamless
    waitT = setTimeout(function () { v.currentTime = 0; if (visible) start(); }, PAUSE_BETWEEN);
  });

  function replay() { clearTimeout(waitT); v.currentTime = 0; start(); }
  fig.addEventListener('click', replay);
  fig.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replay(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (!visible) v.pause();
      else if (!v.ended && v.currentTime > 0) start();
    }, { threshold: 0.2 }).observe(fig);
  }
  start();
})();
