/* =========================================================
   NUNUS BARBER SHOP — progressive enhancement layer
   Core content works with NO JS. Everything here is additive:
   nav, carousels, lightbox, live-status, booking, and a lazy
   Three.js barber pole. Guarded so nothing throws on failure.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky / condensing nav ---------- */
  var nav = $("#nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-condensed", window.scrollY > 40);
  };
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
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
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
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
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

  /* ---------- Subtle 3D tilt on cards/images ---------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    $$(".tilt").forEach(function (el) {
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 7).toFixed(2) + "deg)";
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
    var index = 0;
    var timer = null;

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

    /* autoplay with pause on hover/focus */
    function start() {
      if (!opts.autoplay || reduceMotion) return;
      stop();
      timer = setInterval(next, opts.interval || 5000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    /* touch swipe */
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
    return { next: next, prev: prev, go: go };
  }

  var galleryPerView = function () {
    var w = window.innerWidth;
    return w < 620 ? 1 : w < 900 ? 2 : 3;
  };
  makeCarousel($("#galleryCarousel"), { autoplay: true, interval: 4500, perView: galleryPerView });
  makeCarousel($("#reviewsCarousel"), { autoplay: true, interval: 6000, perView: function () { return 1; } });

  /* ---------- Lightbox ---------- */
  (function () {
    var lb = $("#lightbox");
    if (!lb) return;
    var img = $("#lightboxImg");
    var closeBtn = $("#lightboxClose");
    var btns = $$("#galleryTrack .gallery__btn");
    var current = 0;
    var lastFocus = null;

    function open(i) {
      current = (i + btns.length) % btns.length;
      var src = btns[current].getAttribute("data-full");
      var inner = btns[current].querySelector("img");
      // skip placeholders that have no real image
      img.src = src;
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

  /* ---------- Live open/closed status (Africa/Johannesburg) ---------- */
  (function () {
    var wrap = $("#liveStatus");
    var textEl = $("#liveStatusText");
    if (!wrap || !textEl) return;

    // Opening hours in minutes-from-midnight, keyed by JS day (0=Sun)
    var HOURS = {
      1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], // Mon–Fri 9–18
      6: [480, 930],  // Sat 8:00–15:30
      0: [540, 840]   // Sun 9:00–14:00
    };
    var DAYNAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function nowInJoburg() {
      // Convert current time to Africa/Johannesburg (UTC+2, no DST) reliably.
      try {
        var parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Johannesburg", weekday: "short",
          hour: "2-digit", minute: "2-digit", hour12: false
        }).formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        var wdIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
        return { day: wdIndex, mins: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
      } catch (e) {
        // Fallback: assume SAST = UTC+2
        var d = new Date();
        var utc = d.getUTCHours() * 60 + d.getUTCMinutes() + 120;
        var day = d.getUTCDay();
        if (utc >= 1440) { utc -= 1440; day = (day + 1) % 7; }
        return { day: day, mins: utc };
      }
    }

    function fmt(mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      return h + (m ? ":" + (m < 10 ? "0" + m : m) : "") ;
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

      // Highlight today's row
      $$("#hoursTable tr").forEach(function (tr) {
        tr.classList.toggle("is-today", parseInt(tr.getAttribute("data-day"), 10) === t.day);
      });
    }

    update();
    setInterval(update, 60000); // refresh every minute
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

      var url = "https://wa.me/27746151005?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  })();

  /* ---------- Lazy-load Three.js barber pole (never blocks paint) ---------- */
  (function () {
    var stage = $("#heroStage");
    var fallback = $("#poleFallback");
    if (!stage || reduceMotion) return;

    // Feature-detect WebGL first — keep the CSS pole if unavailable.
    function hasWebGL() {
      try {
        var c = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
      } catch (e) { return false; }
    }
    if (!hasWebGL()) return;

    function loadThree() {
      return new Promise(function (resolve, reject) {
        if (window.THREE) return resolve(window.THREE);
        var s = document.createElement("script");
        // Lazy CDN load; keep as a classic script so no build step is needed.
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        s.async = true;
        s.onload = function () { window.THREE ? resolve(window.THREE) : reject(); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // Only bother once the hero is/near viewport (it is, at load, but keep idle-friendly)
    var kickoff = function () {
      loadThree().then(initPole).catch(function () {
        /* CDN blocked/offline → CSS fallback stays. Silent by design. */
      });
    };
    if ("requestIdleCallback" in window) requestIdleCallback(kickoff, { timeout: 2500 });
    else setTimeout(kickoff, 1200);

    function initPole(THREE) {
      var w = stage.clientWidth, h = stage.clientHeight;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0, 9);

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.setSize(w, h);
      stage.appendChild(renderer.domElement);

      // Hide CSS fallback now that WebGL is live
      if (fallback) fallback.classList.add("is-hidden");

      var group = new THREE.Group();
      scene.add(group);

      // ---- Glass cylinder with a helical red/white/blue stripe texture ----
      var tex = makeStripeTexture();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      var poleMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.1 });
      var poleGeo = new THREE.CylinderGeometry(1.05, 1.05, 5.4, 48, 1, true);
      var pole = new THREE.Mesh(poleGeo, poleMat);
      group.add(pole);

      // Glass shell
      var glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transparent: true, opacity: 0.12,
        roughness: 0.05, metalness: 0, clearcoat: 1
      });
      var glass = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.16, 5.4, 48, 1, true), glassMat);
      group.add(glass);

      // Chrome caps
      var chrome = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.18, metalness: 1 });
      function cap(y) {
        var c = new THREE.Group();
        var body = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.5, 48), chrome);
        var ring = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.12, 16, 48), chrome);
        ring.rotation.x = Math.PI / 2;
        c.add(body); c.add(ring);
        var tip = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), chrome);
        tip.position.y = y > 0 ? 0.42 : -0.42;
        c.add(tip);
        c.position.y = y;
        return c;
      }
      group.add(cap(2.95));
      group.add(cap(-2.95));

      // ---- Lighting ----
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      var key = new THREE.DirectionalLight(0xfff2d6, 1.1); key.position.set(4, 6, 6); scene.add(key);
      var rim = new THREE.DirectionalLight(0xd4af37, 0.8); rim.position.set(-5, 2, -4); scene.add(rim);
      var brick = new THREE.PointLight(0xb04a37, 0.5, 30); brick.position.set(-3, -2, 4); scene.add(brick);

      group.rotation.z = 0.12;

      // ---- Interaction: gentle cursor / gyro tilt ----
      var targetX = 0, targetY = 0;
      window.addEventListener("mousemove", function (e) {
        targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
        targetY = (e.clientY / window.innerHeight - 0.5) * 0.35;
      }, { passive: true });
      if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (e) {
          if (e.gamma == null) return;
          targetX = Math.max(-0.6, Math.min(0.6, (e.gamma || 0) / 60));
          targetY = Math.max(-0.4, Math.min(0.4, (e.beta || 0) / 120));
        }, { passive: true });
      }

      // ---- Animate, frame-rate capped for mid phones ----
      var last = 0, fps = 32, interval = 1000 / fps, t0 = performance.now();
      var running = true;
      // Pause when hero off-screen
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { running = en[0].isIntersecting; })
          .observe(stage);
      }

      function resize() {
        w = stage.clientWidth; h = stage.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", resize);

      function loop(now) {
        requestAnimationFrame(loop);
        if (!running) return;
        if (now - last < interval) return;
        last = now;
        var t = (now - t0) / 1000;
        tex.offset.y = (t * 0.35) % 1;                 // helix scroll
        group.rotation.y += (targetX - group.rotation.y) * 0.05 + 0.006;
        group.rotation.x += (targetY - group.rotation.x) * 0.05;
        group.position.y = Math.sin(t * 0.9) * 0.12;   // float
        renderer.render(scene, camera);
      }
      requestAnimationFrame(loop);
    }

    // Canvas-drawn diagonal barber stripes → texture
    function makeStripeTexture() {
      var c = document.createElement("canvas");
      c.width = 128; c.height = 512;
      var g = c.getContext("2d");
      var stripe = 44, colors = ["#c0392b", "#ffffff", "#1f4e8f", "#ffffff"];
      g.save();
      g.translate(0, 0);
      // draw slanted bands by shearing
      for (var y = -stripe * 4; y < c.height + stripe * 4; y += stripe) {
        var ci = Math.floor((y / stripe)) % colors.length;
        if (ci < 0) ci += colors.length;
        g.fillStyle = colors[ci];
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(c.width, y - 60);
        g.lineTo(c.width, y - 60 + stripe);
        g.lineTo(0, y + stripe);
        g.closePath();
        g.fill();
      }
      g.restore();
      var THREE = window.THREE;
      var tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      return tex;
    }
  })();

})();
