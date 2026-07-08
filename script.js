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

  /* ---------- Quote form -> WhatsApp deep link ---------- */
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var services = [];
      form.querySelectorAll("#serviceChips input:checked").forEach(function (c) {
        services.push(c.value);
      });

      var name = (document.getElementById("qName").value || "").trim();
      var suburb = (document.getElementById("qSuburb").value || "").trim();
      var type = document.getElementById("qType").value;
      var size = document.getElementById("qSize").value;
      var notes = (document.getElementById("qNotes").value || "").trim();

      var lines = [];
      lines.push("Hi The Garden Guys! I'd like a quote please.");
      lines.push("");
      lines.push("*Services:* " + (services.length ? services.join(", ") : "General enquiry"));
      if (type) lines.push("*Property:* " + type);
      if (size) lines.push("*Yard size:* " + size);
      if (name) lines.push("*Name:* " + name);
      if (suburb) lines.push("*Suburb:* " + suburb);
      if (notes) lines.push("*Notes:* " + notes);

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();
