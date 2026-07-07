/* =========================================================
   NUNUS BARBER SHOP — progressive enhancement layer
   Core content works with NO JS. Everything here is additive:
   nav, carousels, lightbox, live-status, booking, hero parallax,
   and a lazy Three.js chrome scissors accent (off to the side,
   never behind the headline). Guarded so nothing throws.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer:fine)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky / condensing nav ---------- */
  var nav = $("#nav");
  function onScroll() { if (nav) nav.classList.toggle("is-condensed", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile hamburger ---------- */
  var toggle = $("#navToggle");
  var navLinks = $("#navLinks");
  if (toggle && navLinks) {
    var closeMenu = function () {
      navLinks.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", navLinks).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Hero parallax depth (subtle, GPU-light) ---------- */
  var heroImg = $("#heroImg");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0) scale(1.06)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Magnetic buttons (pointer devices only) ---------- */
  if (!reduceMotion && finePointer) {
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Soft 3D tilt on cards/images ---------- */
  if (!reduceMotion && finePointer) {
    $$(".tilt").forEach(function (el) {
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateY(" + (px * 6).toFixed(2) + "deg) rotateX(" + (-py * 6).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Generic carousel ---------- */
  function makeCarousel(root, opts) {
    if (!root) return;
    opts = opts || {};
    var viewport = $(".carousel__viewport", root);
    var track = $(".carousel__track", root);
    var slides = $$(":scope > *", track);
    var dotsWrap = $(".carousel__dots", root);
    if (!track || slides.length === 0) return;

    root.classList.add("is-enhanced");
    var perView = opts.perView ? opts.perView() : 1;
    var index = 0, timer = null;

    function pages() { return Math.max(1, Math.ceil(slides.length / perView)); }

    function build() {
      perView = opts.perView ? opts.perView() : 1;
      if (dotsWrap) {
        dotsWrap.innerHTML = "";
        for (var i = 0; i < pages(); i++) {
          var b = document.createElement("button");
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", "Go to slide " + (i + 1));
          (function (i) { b.addEventListener("click", function () { go(i * perView, true); }); })(i);
          dotsWrap.appendChild(b);
        }
      }
      go(index, false);
    }

    function go(i, user) {
      var max = slides.length - perView;
      if (i < 0) i = max;
      if (i > max) i = 0;
      index = i;
      var slideW = slides[0].getBoundingClientRect().width;
      track.style.transform = "translateX(" + (-index * slideW) + "px)";
      if (dotsWrap) {
        var active = Math.round(index / perView);
        $$("button", dotsWrap).forEach(function (d, di) { d.setAttribute("aria-selected", String(di === active)); });
      }
      if (user) restart();
    }
    function next() { go(index + perView, false); }
    function prev() { go(index - perView, false); }

    $$(".carousel__arrow", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        parseInt(btn.getAttribute("data-dir"), 10) > 0 ? next() : prev();
        restart();
      });
    });

    function start() { if (!opts.autoplay || reduceMotion) return; stop(); timer = setInterval(next, opts.interval || 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    var sx = 0, dx = 0, dragging = false;
    viewport.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; dragging = true; stop(); }, { passive: true });
    viewport.addEventListener("touchmove", function (e) { if (dragging) dx = e.touches[0].clientX - sx; }, { passive: true });
    viewport.addEventListener("touchend", function () {
      if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
      dx = 0; dragging = false; start();
    });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 200); });

    build();
    start();
  }

  var galleryPerView = function () { var w = window.innerWidth; return w < 620 ? 1 : w < 900 ? 2 : 3; };
  makeCarousel($("#galleryCarousel"), { autoplay: true, interval: 4500, perView: galleryPerView });
  makeCarousel($("#reviewsCarousel"), { autoplay: true, interval: 6000, perView: function () { return 1; } });

  /* ---------- Lightbox ---------- */
  (function () {
    var lb = $("#lightbox");
    if (!lb) return;
    var img = $("#lightboxImg");
    var closeBtn = $("#lightboxClose");
    var btns = $$("#galleryTrack .gallery__btn");
    var current = 0, lastFocus = null;

    function open(i) {
      current = (i + btns.length) % btns.length;
      var inner = btns[current].querySelector("img");
      img.src = btns[current].getAttribute("data-full");
      img.alt = inner ? inner.alt : "Gallery image";
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { open(current + d); }

    btns.forEach(function (b, i) { b.addEventListener("click", function () { open(i); }); });
    closeBtn.addEventListener("click", close);
    $$(".lightbox__nav", lb).forEach(function (n) {
      n.addEventListener("click", function () { step(parseInt(n.getAttribute("data-dir"), 10)); });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
  })();

  /* ---------- Live open/closed status (Africa/Johannesburg, 24-hour HH:MM) ---------- */
  (function () {
    var wrap = $("#liveStatus");
    var textEl = $("#liveStatusText");
    if (!wrap || !textEl) return;

    // Opening hours in minutes-from-midnight, keyed by JS day (0=Sun)
    var HOURS = {
      1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], // Mon–Fri 09:00–18:00
      6: [480, 930],  // Sat 08:00–15:30
      0: [540, 840]   // Sun 09:00–14:00
    };
    var DAYNAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function nowInJoburg() {
      try {
        var parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Johannesburg", weekday: "short",
          hour: "2-digit", minute: "2-digit", hour12: false
        }).formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        var wdIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
        var hh = parseInt(map.hour, 10) % 24; // Intl may emit "24" at midnight
        return { day: wdIndex, mins: hh * 60 + parseInt(map.minute, 10) };
      } catch (e) {
        var d = new Date();
        var utc = d.getUTCHours() * 60 + d.getUTCMinutes() + 120; // SAST = UTC+2
        var day = d.getUTCDay();
        if (utc >= 1440) { utc -= 1440; day = (day + 1) % 7; }
        return { day: day, mins: utc };
      }
    }

    // 24-hour "hundred" format: always HH:MM, e.g. 18:00, 08:00, 15:30
    function fmt(mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
    }

    function nextOpenDay(fromDay) {
      for (var i = 1; i <= 7; i++) {
        var d = (fromDay + i) % 7;
        if (HOURS[d]) return { day: d, open: HOURS[d][0] };
      }
      return null;
    }

    function update() {
      var t = nowInJoburg();
      var today = HOURS[t.day];
      var open = false, msg;

      if (today && t.mins >= today[0] && t.mins < today[1]) {
        open = true;
        var closingSoon = today[1] - t.mins <= 45;
        msg = "Open now · until " + fmt(today[1]) + (closingSoon ? " (closing soon)" : "");
      } else if (today && t.mins < today[0]) {
        msg = "Closed · opens today at " + fmt(today[0]);
      } else {
        var n = nextOpenDay(t.day);
        msg = n ? "Closed · opens " + DAYNAME[n.day] + " at " + fmt(n.open) : "Closed";
      }

      wrap.classList.toggle("is-open", open);
      wrap.classList.toggle("is-closed", !open);
      textEl.textContent = msg;

      $$("#hoursTable tr").forEach(function (tr) {
        tr.classList.toggle("is-today", parseInt(tr.getAttribute("data-day"), 10) === t.day);
      });
    }

    update();
    setInterval(update, 60000);
  })();

  /* ---------- Booking form -> pre-filled WhatsApp ---------- */
  (function () {
    var form = $("#bookingForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = ($("#bkName").value || "").trim();
      var phone = ($("#bkPhone").value || "").trim();
      var service = $("#bkService").value;
      var time = ($("#bkTime").value || "").trim();
      if (!name) { $("#bkName").focus(); return; }

      var lines = [
        "Hi Nunus Barber Shop, I'd like to book an appointment.",
        "Name: " + name,
        phone ? "Phone: " + phone : "",
        "Service: " + service,
        time ? "Preferred time: " + time : ""
      ].filter(Boolean);

      window.open("https://wa.me/27746151005?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  })();

  /* ---------- Lazy Three.js chrome scissors accent (off to the side) ---------- */
  (function () {
    var stage = $("#scissors3d");
    if (!stage || reduceMotion) return;

    function hasWebGL() {
      try {
        var c = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
      } catch (e) { return false; }
    }
    if (!hasWebGL()) return; // CSS ✂ glyph fallback stays

    function loadThree() {
      return new Promise(function (resolve, reject) {
        if (window.THREE) return resolve(window.THREE);
        var s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        s.async = true;
        s.onload = function () { window.THREE ? resolve(window.THREE) : reject(); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // Only build once the accent scrolls near view (never blocks first paint)
    function whenVisible(cb) {
      if (!("IntersectionObserver" in window)) return cb();
      var ob = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { ob.disconnect(); cb(); }
      }, { rootMargin: "200px" });
      ob.observe(stage);
    }

    whenVisible(function () {
      loadThree().then(initScissors).catch(function () { /* CDN blocked → CSS glyph stays */ });
    });

    function initScissors(THREE) {
      var size = stage.clientWidth || 120;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      var renderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
      catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.setSize(size, size);
      stage.appendChild(renderer.domElement);
      stage.classList.add("is-live"); // hide CSS glyph

      var chrome = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, roughness: 0.18, metalness: 1 });
      var group = new THREE.Group();
      scene.add(group);

      // Build one scissor blade+handle, then mirror it → crossed scissors
      function blade() {
        var g = new THREE.Group();
        var b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 3.2, 12), chrome);
        b.position.y = 1.1;
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 12, 28), chrome);
        ring.position.y = -0.9;
        g.add(b); g.add(ring);
        return g;
      }
      var left = blade();  left.rotation.z = 0.28;
      var right = blade(); right.rotation.z = -0.28; right.scale.x = -1;
      group.add(left); group.add(right);
      // pivot pin
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), chrome));
      group.rotation.x = 0.3;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 6); scene.add(key);
      var gold = new THREE.DirectionalLight(0xc9a24b, 0.7); gold.position.set(-5, -2, 3); scene.add(gold);

      var last = 0, interval = 1000 / 30, t0 = performance.now(), running = true;
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; }).observe(stage);

      function loop(now) {
        requestAnimationFrame(loop);
        if (!running || now - last < interval) return;
        last = now;
        var t = (now - t0) / 1000;
        group.rotation.z = t * 0.4;                 // slow rotate
        group.position.y = Math.sin(t * 1.1) * 0.15; // gentle float
        renderer.render(scene, camera);
      }
      requestAnimationFrame(loop);

      window.addEventListener("resize", function () {
        var s = stage.clientWidth || 120;
        renderer.setSize(s, s);
      });
    }
  })();

})();
