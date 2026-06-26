/* =====================================================================
   Perfect Trim Lawn Care Services — main.js (vanilla, no dependencies)
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Mobile navigation ---------------- */
  var toggle = $(".nav__toggle");
  var menu   = $(".nav__menu");
  var scrim  = $(".nav-scrim");

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openMenu() {
    menu.classList.add("is-open");
    if (scrim) scrim.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    if (scrim) scrim.addEventListener("click", closeMenu);
    $$(".nav__link", menu).forEach(function (l) { l.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------------- Sticky header ---------------- */
  var header = $(".header");
  function onScrollHeader() { if (header) header.classList.toggle("is-stuck", window.scrollY > 12); }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------------- Active nav (by file) ---------------- */
  (function () {
    var path = location.pathname.split("/").pop() || "index.html";
    $$(".nav__link").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("#")[0];
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  })();

  /* ---------------- Smooth scroll for in-page anchors ---------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- Animated counters ---------------- */
  var nums = $$("[data-count]");
  if ("IntersectionObserver" in window && nums.length) {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "";
        so.unobserve(el);
        if (prefersReduced) { el.textContent = target + suffix; return; }
        var t0 = null, dur = 1400;
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { so.observe(n); });
  }

  /* ---------------- Gallery filtering ---------------- */
  var filters = $$(".filter");
  var tiles = $$(".tile");
  if (filters.length && tiles.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active"); btn.setAttribute("aria-pressed", "true");
        var cat = btn.getAttribute("data-filter");
        tiles.forEach(function (tile) {
          tile.classList.toggle("is-hidden", !(cat === "all" || tile.getAttribute("data-cat") === cat));
        });
      });
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  $$(".faq__item").forEach(function (item) {
    var q = $(".faq__q", item), a = $(".faq__a", item);
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* ---------------- Before/after slider ---------------- */
  $$(".ba").forEach(function (ba) {
    var after = $(".ba__after", ba), handle = $(".ba__handle", ba), range = $(".ba__range", ba);
    if (!after || !range) return;
    function set(v) { after.style.clipPath = "inset(0 0 0 " + v + "%)"; if (handle) handle.style.left = v + "%"; }
    range.addEventListener("input", function () { set(this.value); });
    set(range.value || 50);
  });

  /* ---------------- Back to top ---------------- */
  var toTop = $(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () { toTop.classList.toggle("is-visible", window.scrollY > 600); }, { passive: true });
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- Quote form validation ---------------- */
  var form = $("#quote-form");
  if (form) {
    var setErr = function (field, msg) {
      field.classList.toggle("is-invalid", !!msg);
      var e = $(".field__error", field);
      if (e) e.textContent = msg || "";
    };
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /[0-9]{7,}/;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$(".field[data-validate]", form).forEach(function (field) {
        var input = $("input, select, textarea", field);
        if (!input) return;
        var val = (input.value || "").trim(), type = input.getAttribute("data-type"), msg = "";
        if (!val) msg = "This field is required.";
        else if (type === "email" && !emailRe.test(val)) msg = "Enter a valid email address.";
        else if (type === "phone" && !phoneRe.test(val.replace(/\D/g, ""))) msg = "Enter a valid phone number.";
        if (msg) ok = false;
        setErr(field, msg);
      });
      if (!ok) {
        var firstBad = $(".field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea", form);
        if (firstBad) firstBad.focus();
        return;
      }
      form.reset();
      var success = $("#form-success");
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    $$(".field[data-validate] input, .field[data-validate] select, .field[data-validate] textarea", form).forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("is-invalid")) setErr(field, "");
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
