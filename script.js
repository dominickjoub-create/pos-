/* ===================================================================
   The Garden Guys — interactions
   =================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "27683598558"; // +27 68 359 8558

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Before / After comparison slider ---------- */
  var ba = document.getElementById("beforeAfter");
  if (ba) {
    var frame = ba.querySelector(".ba__frame");
    var beforeWrap = document.getElementById("baBefore");
    var handle = document.getElementById("baHandle");
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      beforeWrap.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }

    function posFromEvent(clientX) {
      var rect = frame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function startDrag(e) {
      dragging = true;
      frame.classList.add("dragging");
      moveDrag(e);
    }
    function moveDrag(e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (e.cancelable && e.touches) e.preventDefault();
      setPos(posFromEvent(clientX));
    }
    function endDrag() { dragging = false; frame.classList.remove("dragging"); }

    // Pointer / mouse
    frame.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);
    // Touch
    frame.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
    // Click anywhere on the frame to jump
    frame.addEventListener("click", function (e) {
      if (e.target.closest(".ba__handle")) return;
      setPos(posFromEvent(e.clientX));
    });
    // Keyboard
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") { setPos(cur - 4); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPos(cur + 4); e.preventDefault(); }
      else if (e.key === "Home") { setPos(0); e.preventDefault(); }
      else if (e.key === "End") { setPos(100); e.preventDefault(); }
    });

    setPos(50);
  }

  /* ---------- Smart quote form -> WhatsApp deep link ----------
     Each selected service reveals its own follow-up questions so the
     enquiry carries exactly what The Garden Guys needs to price the job. */
  var SIZE = ["Small (up to 200m²)", "Medium (200–600m²)", "Large (600m²+)"];

  var SERVICES = {
    garden: { label: "Garden service", fields: [
      { id: "size", label: "How big is your garden?", type: "select", options: SIZE },
      { id: "freq", label: "How often?", type: "select", options: ["Weekly", "Every two weeks", "Once a month", "Once-off"] }
    ]},
    cleanup: { label: "Garden clean-up", fields: [
      { id: "size", label: "Area to clean up", type: "select", options: SIZE },
      { id: "state", label: "How overgrown is it?", type: "select", options: ["A little", "Quite overgrown", "Very overgrown"] }
    ]},
    lawn: { label: "Lawn care", fields: [
      { id: "area", label: "Lawn size (approx m²)", type: "number", ph: "e.g. 120" }
    ]},
    tree: { label: "Tree felling / trimming", fields: [
      { id: "count", label: "How many trees?", type: "number", ph: "e.g. 2" },
      { id: "treesize", label: "Size of the trees", type: "select", options: ["Small (under 3m)", "Medium (3–6m)", "Large (6–10m)", "Very large (10m+)"] },
      { id: "work", label: "Felling or trimming?", type: "select", options: ["Fell / remove", "Trim only", "Both"] }
    ]},
    design: { label: "Landscape design", fields: [
      { id: "area", label: "Area size (approx m²)", type: "number", ph: "e.g. 300" },
      { id: "scope", label: "New design or makeover?", type: "select", options: ["Brand new", "Makeover of existing"] }
    ]},
    flowerbeds: { label: "Flowerbeds", fields: [
      { id: "area", label: "Flowerbed area (approx m²)", type: "number", ph: "e.g. 15" },
      { id: "work", label: "What do you need?", type: "select", options: ["Design & plant new", "Replant existing", "Just planting"] }
    ]},
    veg: { label: "Vegetable beds", fields: [
      { id: "area", label: "Veg bed area (approx m²)", type: "number", ph: "e.g. 10" }
    ]},
    irrigation: { label: "Irrigation repairs", fields: [
      { id: "desc", label: "What's the problem?", type: "text", ph: "e.g. sprinklers not popping up, leak in one zone" }
    ]},
    pool: { label: "Pool maintenance", fields: [
      { id: "poolsize", label: "Pool size", type: "select", options: ["Small", "Medium", "Large"] },
      { id: "freq", label: "How often?", type: "select", options: ["Once-off clean", "Weekly", "Every two weeks", "Monthly"] }
    ]},
    gutters: { label: "Gutter cleaning", fields: [
      { id: "storeys", label: "How many storeys?", type: "select", options: ["Single storey", "Double storey"] },
      { id: "length", label: "Approx length of gutters (m)", type: "number", ph: "optional" }
    ]},
    pathways: { label: "Steps / pathways", fields: [
      { id: "area", label: "How many square metres?", type: "number", ph: "e.g. 40" },
      { id: "material", label: "Preferred material", type: "select", options: ["Not sure", "Paving / brick", "Natural stone", "Gravel", "Concrete"] }
    ]},
    composting: { label: "Composting", fields: [
      { id: "area", label: "Area to compost (approx m²)", type: "number", ph: "e.g. 50" }
    ]}
  };

  var form = document.getElementById("quoteForm");
  if (form) {
    var chipInputs = form.querySelectorAll("#serviceChips input");
    var dynamicWrap = document.getElementById("dynamicFields");
    var dynamicInner = document.getElementById("dynamicFieldsInner");

    function fieldHTML(key, f) {
      var uid = "dyn-" + key + "-" + f.id;
      var control;
      if (f.type === "select") {
        var opts = '<option value="">Select…</option>';
        f.options.forEach(function (o) { opts += '<option value="' + o + '">' + o + "</option>"; });
        control = '<select id="' + uid + '" data-label="' + f.label + '">' + opts + "</select>";
      } else {
        var t = f.type === "number" ? "number" : "text";
        var ph = f.ph ? ' placeholder="' + f.ph + '"' : "";
        var min = f.type === "number" ? ' min="0"' : "";
        control = '<input type="' + t + '" id="' + uid + '" data-label="' + f.label + '"' + ph + min + " />";
      }
      return '<label class="field"><span>' + f.label + "</span>" + control + "</label>";
    }

    function renderDynamic() {
      var anyChecked = false;
      var html = "";
      chipInputs.forEach(function (chip) {
        if (!chip.checked) return;
        anyChecked = true;
        var key = chip.getAttribute("data-key");
        var svc = SERVICES[key];
        if (!svc) return;
        var rows = svc.fields.map(function (f) { return fieldHTML(key, f); }).join("");
        html += '<div class="svc-detail" data-key="' + key + '">' +
                  '<h4>' + svc.label + "</h4>" +
                  '<div class="svc-detail__grid">' + rows + "</div>" +
                "</div>";
      });
      dynamicInner.innerHTML = html;
      dynamicWrap.hidden = !anyChecked;
    }

    chipInputs.forEach(function (chip) {
      chip.addEventListener("change", renderDynamic);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var lines = ["Hi The Garden Guys! I'd like a quote please.", ""];
      var chosen = [];

      chipInputs.forEach(function (chip) {
        if (!chip.checked) return;
        var key = chip.getAttribute("data-key");
        var svc = SERVICES[key];
        if (!svc) return;
        var details = [];
        svc.fields.forEach(function (f) {
          var el = document.getElementById("dyn-" + key + "-" + f.id);
          var val = el && el.value ? el.value.trim() : "";
          if (val) details.push(f.label.replace(/\s*\(.*?\)/, "") + ": " + val);
        });
        chosen.push("• " + svc.label + (details.length ? " — " + details.join(", ") : ""));
      });

      var name = (document.getElementById("qName").value || "").trim();
      var suburb = (document.getElementById("qSuburb").value || "").trim();
      var type = document.getElementById("qType").value;
      var notes = (document.getElementById("qNotes").value || "").trim();

      if (chosen.length) {
        lines.push("*What I need:*");
        chosen.forEach(function (c) { lines.push(c); });
      } else {
        lines.push("*What I need:* General enquiry");
      }
      lines.push("");
      if (type) lines.push("*Property:* " + type);
      if (name) lines.push("*Name:* " + name);
      if (suburb) lines.push("*Suburb:* " + suburb);
      if (notes) lines.push("*Notes:* " + notes);

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();

/* ===================================================================
   Scroll-expand hero: media grows and background fades on scroll.
   Scroll-driven (sticky) — no scroll hijacking. Vanilla adaptation of
   the ScrollExpandMedia concept.
   =================================================================== */
(function () {
  "use strict";
  var track = document.getElementById("xheroTrack");
  if (!track) return;
  var section = document.querySelector(".xhero");
  var pin = document.getElementById("xheroPin");
  var media = document.getElementById("xheroMedia");
  var reveal = document.getElementById("xheroReveal");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    section.classList.add("is-static");
    reveal.classList.add("show");
    return;
  }

  var EXPAND_AT = 0.7;   // finish expanding at 70% of the track; hold the rest
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var scrollable = track.offsetHeight - vh;
    if (scrollable <= 0) return;
    var raw = clamp(-track.getBoundingClientRect().top / scrollable, 0, 1);
    var p = clamp(raw / EXPAND_AT, 0, 1);

    pin.style.setProperty("--p", p.toFixed(4));
    media.style.width = (320 + p * (window.innerWidth - 320)) + "px";
    media.style.height = (420 + p * (vh - 420)) + "px";
    media.style.borderRadius = (24 * (1 - p)) + "px";

    if (p > 0.92) reveal.classList.add("show");
    else reveal.classList.remove("show");
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
