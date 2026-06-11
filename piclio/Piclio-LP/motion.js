/* ============================================================
   PICLIO — motion & interactivity
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() { menu.classList.remove("open"); document.body.style.overflow = ""; }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function snapIfFrozen(el) {
    // In throttled/offscreen renderers CSS transitions can freeze at opacity:0.
    // If a revealed element hasn't actually faded in, force it visible.
    if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
      el.style.transition = "none";
      el.style.opacity = "1";
      el.style.transform = "none";
    }
  }
  function show(el) {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    setTimeout(function () { snapIfFrozen(el); }, 1000);
  }
  function inViewport(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.94 && r.bottom > -40;
  }
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    function checkReveals() {
      reveals.forEach(function (el) { if (!el.classList.contains("in") && inViewport(el)) show(el); });
    }
    checkReveals();
    requestAnimationFrame(checkReveals);
    [60, 200, 500, 1000].forEach(function (t) { setTimeout(checkReveals, t); });
    window.addEventListener("load", checkReveals);
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals, { passive: true });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { if (!el.classList.contains("in")) io.observe(el); });
    }
    // safety net: reveal (and snap) everything if anything slipped through
    setTimeout(function () { reveals.forEach(show); }, 1500);
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce || target === 0) { el.textContent = target + suffix; return; }
    var dur = 1500, start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var counted = [];
  function maybeCount(el) {
    if (counted.indexOf(el) !== -1) return;
    var r = el.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) * 0.95 && r.bottom > 0) { counted.push(el); animateCount(el); }
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && counted.indexOf(e.target) === -1) { counted.push(e.target); animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }
  counters.forEach(maybeCount); // immediate for in-view
  window.addEventListener("scroll", function () { counters.forEach(maybeCount); }, { passive: true });
  setTimeout(function () { counters.forEach(function (el) { if (counted.indexOf(el) === -1) { counted.push(el); animateCount(el); } }); }, 2600);

  /* ---------- Hero parallax (scroll + pointer compose, rotation preserved) ---------- */
  var ROT = { p1: -3, p2: 3, p3: -2, p4: -2 }; // base rotations (live-card = 0)
  var hero = document.querySelector(".hero");
  var parEls = hero ? Array.prototype.slice.call(hero.querySelectorAll("[data-par]")) : [];

  parEls.forEach(function (el) {
    var rot = 0;
    Object.keys(ROT).forEach(function (k) { if (el.classList.contains(k)) rot = ROT[k]; });
    if (el.classList.contains("p4")) rot = 4;
    el._st = { sy: 0, px: 0, py: 0, rot: rot };
  });
  function renderEl(el) {
    var s = el._st;
    el.style.transform = "translate3d(" + s.px.toFixed(1) + "px," + (s.sy + s.py).toFixed(1) + "px,0) rotate(" + s.rot + "deg)";
  }

  var ticking = false;
  function applyScroll() {
    var y = window.scrollY;
    if (hero && y < hero.offsetHeight + 300) {
      parEls.forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-par"));
        el._st.sy = y * depth / 100;
        if (!el.classList.contains("live-card")) renderEl(el); // live-card keeps its float animation
      });
    }
    ticking = false;
  }
  if (!reduce) {
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(applyScroll); ticking = true; }
    }, { passive: true });
  }

  /* pointer parallax on hero collage */
  var collage = document.getElementById("collage");
  if (collage && !reduce && window.matchMedia("(pointer:fine)").matches) {
    collage.addEventListener("mousemove", function (e) {
      var r = collage.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width - 0.5;
      var cy = (e.clientY - r.top) / r.height - 0.5;
      collage.querySelectorAll(".ph[data-par]").forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-par")) / 100;
        el.style.transition = "transform .3s ease-out";
        el._st.px = cx * depth * 55;
        el._st.py = cy * depth * 55;
        renderEl(el);
      });
    });
    collage.addEventListener("mouseleave", function () {
      collage.querySelectorAll(".ph[data-par]").forEach(function (el) {
        el._st.px = 0; el._st.py = 0; renderEl(el);
      });
    });
  }

  /* ---------- How-it-works: steps <-> phone sync (only if present) ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  if (steps.length) {
    var phones = document.querySelectorAll("[data-phone]");
    var phoneSub = document.getElementById("phoneSub");
    var subs = [
      "E-mail zaregistrován · galerie připravena",
      "Fotograf zachytil nový moment",
      "AI rozpoznala hosta za 0:27"
    ];
    var current = 0, autoTimer = null;

    var setStep = function (i) {
      current = i;
      steps.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
      phones.forEach(function (p) { p.classList.toggle("active", parseInt(p.getAttribute("data-phone"), 10) === i); });
      if (phoneSub) {
        phoneSub.style.opacity = "0";
        setTimeout(function () { phoneSub.textContent = subs[i]; phoneSub.style.opacity = "1"; }, 180);
      }
    };
    var startAuto = function () { if (!reduce) autoTimer = setInterval(function () { setStep((current + 1) % steps.length); }, 3200); };
    var restartAuto = function () { if (autoTimer) clearInterval(autoTimer); startAuto(); };
    steps.forEach(function (s, idx) {
      s.addEventListener("mouseenter", function () { setStep(idx); restartAuto(); });
      s.addEventListener("click", function () { setStep(idx); restartAuto(); });
    });
    startAuto();
    var howSection = document.getElementById("jak-to-funguje");
    if (howSection && "IntersectionObserver" in window) {
      var hio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!autoTimer) startAuto(); }
          else { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
        });
      }, { threshold: 0.2 });
      hio.observe(howSection);
    }
    if (phoneSub) { phoneSub.style.transition = "opacity .25s"; phoneSub.textContent = subs[0]; }
  }

  /* ---------- Showcase use-case carousel ---------- */
  var scTrack = document.getElementById("scTrack");
  if (scTrack) {
    var scSlides = Array.prototype.slice.call(scTrack.children);
    var scDotsWrap = document.getElementById("scDots");
    var scPrev = document.getElementById("scPrev");
    var scNext = document.getElementById("scNext");
    var scIndex = 0, scCount = scSlides.length, scTimer = null;

    // build dots
    var scDots = [];
    for (var d = 0; d < scCount; d++) {
      (function (i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Zážitek " + (i + 1));
        b.addEventListener("click", function () { scGo(i); scRestart(); });
        scDotsWrap.appendChild(b);
        scDots.push(b);
      })(d);
    }
    function scGo(i) {
      scIndex = (i + scCount) % scCount;
      var prev = (scIndex - 1 + scCount) % scCount;
      var next = (scIndex + 1) % scCount;
      scSlides.forEach(function (s, idx) {
        s.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next");
        if (idx === scIndex) s.classList.add("is-active");
        else if (idx === prev) s.classList.add("is-prev");
        else if (idx === next) s.classList.add("is-next");
        else if (idx === (scIndex - 2 + scCount) % scCount) s.classList.add("is-far-prev");
        else s.classList.add("is-far-next");
      });
      scDots.forEach(function (b, idx) { b.classList.toggle("active", idx === scIndex); });
    }
    // stage is built of absolutely-positioned slides → give it an explicit height
    function scLayout() {
      var h = 0;
      scSlides.forEach(function (s) {
        var card = s.firstElementChild || s;
        h = Math.max(h, card.offsetHeight);
      });
      if (h) scTrack.style.height = h + "px";
    }
    function scStart() { if (!reduce) scTimer = setInterval(function () { scGo(scIndex + 1); }, 6000); }
    function scRestart() { if (scTimer) clearInterval(scTimer); scStart(); }

    scPrev.addEventListener("click", function () { scGo(scIndex - 1); scRestart(); });
    scNext.addEventListener("click", function () { scGo(scIndex + 1); scRestart(); });

    // keyboard when carousel in view
    document.addEventListener("keydown", function (e) {
      var r = scTrack.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        if (e.key === "ArrowLeft") { scGo(scIndex - 1); scRestart(); }
        else if (e.key === "ArrowRight") { scGo(scIndex + 1); scRestart(); }
      }
    });

    // touch / drag swipe
    var sx = 0, dragging = false;
    var vp = scTrack.parentElement;
    vp.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; dragging = true; }, { passive: true });
    vp.addEventListener("touchend", function (e) {
      if (!dragging) return; dragging = false;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) { scGo(scIndex + (dx < 0 ? 1 : -1)); scRestart(); }
    }, { passive: true });

    // pause autoplay on hover
    vp.addEventListener("mouseenter", function () { if (scTimer) { clearInterval(scTimer); scTimer = null; } });
    vp.addEventListener("mouseleave", function () { if (!scTimer) scStart(); });

    scLayout();
    scGo(0);
    // recompute height after layout settles / on resize
    window.addEventListener("resize", scLayout, { passive: true });
    window.addEventListener("load", scLayout);
    [150, 500, 1100].forEach(function (t) { setTimeout(scLayout, t); });
    // autoplay only while in view
    if ("IntersectionObserver" in window) {
      var scio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!scTimer) scStart(); }
          else { if (scTimer) { clearInterval(scTimer); scTimer = null; } }
        });
      }, { threshold: 0.25 });
      scio.observe(scTrack);
    } else { scStart(); }
  }

  /* ---------- Bento crossfade (two samples per card) ---------- */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".bcard"));
    cards.forEach(function (card, ci) {
      var layers = Array.prototype.slice.call(card.querySelectorAll(".layer"));
      if (layers.length < 2) return;
      var idx = 0;
      // ensure first is active
      layers.forEach(function (l, i) { l.classList.toggle("active", i === 0); });
      if (reduce) return;
      // stagger start so cards don't all flip together
      var delay = 3200 + (ci % 4) * 700;
      setInterval(function () {
        var next = (idx + 1) % layers.length;
        layers[idx].classList.remove("active");
        layers[next].classList.add("active");
        idx = next;
      }, delay);
    });
  })();

  /* ---------- Showcase carousel figures: crossfade two samples (JS-driven) ---------- */
  (function () {
    var figs = Array.prototype.slice.call(document.querySelectorAll(".sc-figure"));
    figs.forEach(function (fig, ci) {
      var layers = Array.prototype.slice.call(fig.querySelectorAll(".layer"));
      if (layers.length < 2) return;
      // JS drives opacity directly (CSS opacity transitions freeze inside the
      // transformed/composited carousel slides) — set instant inline control.
      layers.forEach(function (l, i) {
        l.style.transition = "none";
        l.style.opacity = (i === 0) ? "1" : "0";
        l.classList.toggle("active", i === 0);
      });
      if (reduce) return;
      var idx = 0;
      var delay = 3400 + (ci % 3) * 650;
      var DUR = 900;

      function fade(outEl, inEl) {
        var t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / DUR, 1);
          var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
          inEl.style.opacity = e.toFixed(3);
          outEl.style.opacity = (1 - e).toFixed(3);
          if (p < 1) requestAnimationFrame(step);
          else {
            inEl.classList.add("active"); outEl.classList.remove("active");
          }
        }
        requestAnimationFrame(step);
      }

      setInterval(function () {
        var next = (idx + 1) % layers.length;
        fade(layers[idx], layers[next]);
        idx = next;
      }, delay);
    });
  })();

  /* ---------- Ensure videos actually play (autoplay needs muted property set) ---------- */
  (function () {
    var vids = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]"));
    if (!vids.length || reduce) return;
    function playAll() {
      vids.forEach(function (v) {
        v.muted = true; v.defaultMuted = true;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
    }
    playAll();
    window.addEventListener("load", playAll);
    // some browsers only allow play after a gesture/scroll — retry on first interaction
    var once = function () { playAll(); window.removeEventListener("scroll", once); window.removeEventListener("pointerdown", once); };
    window.addEventListener("scroll", once, { passive: true });
    window.addEventListener("pointerdown", once);
  })();

  /* ---------- FAQ accordion ---------- */
  var faq = document.getElementById("faqList");
  if (faq) {
    var items = Array.prototype.slice.call(faq.querySelectorAll(".faq-item"));
    function setOpen(item, open, instant) {
      var ans = item.querySelector(".faq-a");
      if (instant) ans.style.transition = "none";
      if (open) {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
      } else {
        item.classList.remove("open");
        ans.style.maxHeight = "0px";
      }
      if (instant) {
        // force reflow then restore transition so user clicks still animate
        void ans.offsetHeight;
        ans.style.transition = "";
      }
    }
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      setOpen(item, item.classList.contains("open"), true); // instant on init
      btn.addEventListener("click", function () {
        var willOpen = !item.classList.contains("open");
        items.forEach(function (it) { setOpen(it, false); });
        if (willOpen) setOpen(item, true);
      });
    });
    window.addEventListener("resize", function () {
      items.forEach(function (item) {
        if (item.classList.contains("open")) {
          var ans = item.querySelector(".faq-a");
          ans.style.transition = "none";
          ans.style.maxHeight = ans.scrollHeight + "px";
          void ans.offsetHeight;
          ans.style.transition = "";
        }
      });
    }, { passive: true });
  }
})();