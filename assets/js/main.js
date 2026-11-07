/* ==========================================================================
   Neuhaus Apps — homepage behaviour
   Progressive enhancement: every section, link and card is in the HTML, so the
   page reads and works before (and without) this script.
   ========================================================================== */
(() => {
  "use strict";
  document.documentElement.classList.replace("no-js", "js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const APPS = Array.isArray(window.NEUHAUS_APPS) ? window.NEUHAUS_APPS : [];
  const byKey = Object.fromEntries(APPS.map((a) => [a.key, a]));

  // Scroll-entrance controller. Section 5 fills these in when motion is on;
  // until then (or with reduced motion) they do nothing.
  const reveal = {
    flush() {},        // show everything inside an element now, no animation
    flushInView() {}   // show whatever is already on screen now
  };

  /* ---------- 1. Store destinations from the data model ------------------ */
  // Apple links: [data-store="apple"] inside a card, or with data-app-link.
  // Android links: [data-store="android"] inside a card.
  function appKeyFor(el) {
    return el.dataset.appLink || el.closest("[data-app]")?.dataset.app;
  }
  $$('[data-store="apple"]').forEach((a) => {
    const app = byKey[appKeyFor(a)];
    if (app?.apple) a.href = app.apple;
  });
  $$('[data-store="android"]').forEach((a) => {
    const app = byKey[appKeyFor(a)];
    if (!app) return;
    const label = $("[data-store-label]", a);
    if (app.googlePlay) {
      a.href = app.googlePlay;
      if (label) label.textContent = "Get it on Google Play";
      a.setAttribute("aria-label", `Get ${app.name} on Google Play`);
    } else {
      a.href = app.android;
      if (label) label.textContent = app.androidLabel || "Android updates";
    }
  });

  /* ---------- 2. Header: scrolled state, mobile menu, scroll-spy ---------- */
  const header = $(".nh-header");
  const menuBtn = $(".nh-menu-btn");
  const nav = $("#nh-nav");
  const menuLabel = $(".nh-menu-btn__label");
  const mobileMQ = window.matchMedia("(max-width: 47.99rem)");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open, { focusButton = false } = {}) {
    header.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Close" : "Menu";
    document.documentElement.style.overflow = open ? "hidden" : "";
    syncInert();
    if (open) $("a", nav)?.focus({ preventScroll: true });
    else if (focusButton) menuBtn.focus();
  }
  // Hide the off-canvas nav from assistive tech while closed on mobile.
  function syncInert() {
    const closed = !header.classList.contains("is-open");
    if (mobileMQ.matches && closed) nav.setAttribute("inert", "");
    else nav.removeAttribute("inert");
    // The open mobile panel owns focus; background content cannot receive Tab.
    $$("main, footer").forEach((el) => { el.inert = mobileMQ.matches && !closed; });
  }
  menuBtn.addEventListener("click", () => {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && header.classList.contains("is-open")) {
      const controls = $$("a[href], button", header).filter((el) => el.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === "Escape" && header.classList.contains("is-open")) {
      setMenu(false, { focusButton: true });
    }
  });
  mobileMQ.addEventListener("change", () => setMenu(false));
  syncInert();

  // Any in-page link closes the menu; scrolling respects reduced motion.
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (header.classList.contains("is-open")) setMenu(false);
      if (!target) return;
      // A shortcut must remain useful after a previous directory search.
      if (target.matches(".nh-card") && target.hidden) {
        input.value = "";
        runSearch();
      }
      e.preventDefault();
      // A jump is a direct request: the destination is ready on arrival.
      reveal.flush(target.closest("section, footer") || target);
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
      // Move focus for keyboard and screen-reader users without jumping.
      if (id !== "top") {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  // Scroll-spy: mark the nav item for the section in view.
  const spyMap = [
    ["top", $(".nh-hero")],
    ["apps", $("#apps")],
    ["apps", $("#closer-look")],
    ["approach", $("#approach")],
    ["about", $("#about")],
    ["contact", $("#support")]
  ].filter(([, el]) => el);
  const navLinks = $$(".nh-nav__list a");
  function spy() {
    const line = window.innerHeight * 0.35;
    let current = "top";
    for (const [key, el] of spyMap) {
      if (el.getBoundingClientRect().top <= line) current = key;
    }
    navLinks.forEach((a) => {
      if (a.dataset.nav === current) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  spy();
  window.addEventListener("scroll", spy, { passive: true });

  /* ---------- 3. Directory search --------------------------------------- */
  const input = $("#nh-search");
  const clearBtn = $(".nh-search__clear");
  const cards = $$(".nh-card");
  const countEl = $("#nh-count");
  const resultEl = $("#nh-result");
  const empty = $("#nh-empty");
  const emptyQ = $("#nh-empty-q");
  const total = cards.length;

  const haystack = new Map(cards.map((card) => {
    const app = byKey[card.dataset.app] || {};
    const text = [
      $(".nh-card__title", card)?.textContent, $(".nh-card__kind", card)?.textContent,
      $(".nh-card__desc", card)?.textContent, app.name, app.kind, app.keywords
    ].join(" ");
    return [card, text.toLowerCase().replace(/\s+/g, " ")];
  }));

  function runSearch() {
    const q = input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    let shown = 0;
    cards.forEach((card) => {
      const match = terms.every((t) => haystack.get(card).includes(t));
      card.hidden = !match;
      if (match) shown++;
    });
    countEl.textContent = `(${shown})`;
    resultEl.textContent = !q
      ? `Showing all ${total} apps`
      : `${shown} of ${total} ${total === 1 ? "app" : "apps"} match “${input.value.trim()}”`;
    empty.hidden = shown !== 0;
    emptyQ.textContent = input.value.trim();
    clearBtn.hidden = !q;
  }
  function clearSearch() {
    input.value = "";
    runSearch();
    input.focus();
  }
  input.addEventListener("input", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) { e.preventDefault(); clearSearch(); }
  });
  clearBtn.addEventListener("click", clearSearch);
  $("#nh-empty-clear").addEventListener("click", clearSearch);
  runSearch();

  /* ---------- 4. "A closer look" tabs (WAI-ARIA tabs pattern) ------------ */
  const tabs = $$('.nh-tab[role="tab"]');
  const stage = $(".nh-look__stage");
  function selectTab(tab, focus = false) {
    if (tab.getAttribute("aria-selected") === "true") { if (focus) tab.focus(); return; }
    reveal.flush(stage);                        // never wait on a scroll entrance
    const before = stage.offsetHeight;
    tabs.forEach((t) => {
      const on = t === tab;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      panel.classList.toggle("is-switching", on);
    });
    // Keep the visitor's place: hold the previous height while the new
    // panel's images decode, then release it.
    stage.style.minHeight = before + "px";
    setTimeout(() => { stage.style.minHeight = ""; }, 400);
    if (focus) tab.focus();
  }
  // Panel images are lazy; fetch all three pairs shortly before the section
  // arrives so a tab switch never waits on the network.
  const lookSection = $("#closer-look");
  const warm = () => $$("img[loading='lazy']", lookSection).forEach((img) => { img.loading = "eager"; });
  if ("IntersectionObserver" in window) {
    const warmer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { warm(); warmer.disconnect(); }
    }, { rootMargin: "800px 0px" });
    warmer.observe(lookSection);
  } else warm();
  stage.addEventListener("animationend", (e) => {
    if (e.animationName === "nh-swap") e.target.classList.remove("is-switching");
  });
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = null;
      if (e.key in keys) next = tabs[(i + keys[e.key] + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- 5. Scroll entrances --------------------------------------
     Markup: a [data-reveal-group] holds [data-reveal] items (or is one).
     data-reveal = "text" | "media" | "ui" | "block" picks duration and rise;
     data-beat = 0,1,2… orders items inside a group.
     Desktop: a group starts when its top is 6% into the viewport, items
     follow beat by beat, and groups arriving in the same frame queue up.
     Phone: each item is its own unit and simply arrives as it is reached.
     Only content below the fold at load is ever hidden; everything plays once.
  ------------------------------------------------------------------------- */
  const motionOK = () => !reduceMotion.matches && "IntersectionObserver" in window;
  if (motionOK()) {
    const root = document.documentElement;
    const css = getComputedStyle(root);
    const ms = (name) => parseFloat(css.getPropertyValue(name)) || 0;
    const phone = mobileMQ.matches;
    const BEAT = ms("--nh-reveal-beat");
    const GAP = ms("--nh-reveal-group-gap");
    const TRIGGER = css.getPropertyValue("--nh-reveal-trigger").trim() || "6%";
    const timers = new WeakMap();

    const itemsOf = (unit) =>
      unit.matches("[data-reveal]") ? [unit] : $$("[data-reveal]", unit);

    function settle(el) {
      clearTimeout(timers.get(el));
      el.classList.remove("nh-reveal-pending", "nh-reveal-in");
      el.style.removeProperty("--nh-delay");
    }

    const observer = new IntersectionObserver((entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.target.compareDocumentPosition(b.target) & 4 ? -1 : 1));
      arriving.forEach((entry, order) => {
        const unit = entry.target;
        observer.unobserve(unit);
        // Reached from above (reverse scroll after a jump): no entrance.
        if (entry.boundingClientRect.top < 0) { itemsOf(unit).forEach(settle); return; }
        const base = Math.min(order, 2) * GAP;
        itemsOf(unit).forEach((el) => {
          if (!el.classList.contains("nh-reveal-pending")) return;
          const beat = phone ? 0 : Number(el.dataset.beat || 0);
          const delay = base + beat * BEAT;
          el.style.setProperty("--nh-delay", delay + "ms");
          el.classList.replace("nh-reveal-pending", "nh-reveal-in");
          const dur = parseFloat(getComputedStyle(el).getPropertyValue("--nh-dur")) || 700;
          timers.set(el, setTimeout(() => settle(el), delay + dur + 60));
        });
      });
    }, { rootMargin: `0px 0px -${TRIGGER} 0px`, threshold: 0 });

    // If the page opens on a #link, land there before deciding what is hidden.
    const hashTarget = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (hashTarget) hashTarget.scrollIntoView({ block: "start" });

    const fold = window.innerHeight;
    const units = phone ? $$("[data-reveal]") : $$("[data-reveal-group]");
    units.forEach((unit) => {
      if (unit.getBoundingClientRect().top < fold) return;      // on screen or above: leave it
      itemsOf(unit).forEach((el) => el.classList.add("nh-reveal-pending"));
      observer.observe(unit);
    });

    reveal.flush = (scope) => {
      if (!scope) return;
      const pending = ".nh-reveal-pending, .nh-reveal-in";
      const elements = [...(scope.matches(pending) ? [scope] : []), $$(pending, scope)].flat();
      elements.forEach((el) => {
        const unit = el.closest("[data-reveal-group]");
        if (unit) observer.unobserve(unit);
        observer.unobserve(el);
        settle(el);
      });
    };
    reveal.flushInView = () => {
      const h = window.innerHeight;
      $$(".nh-reveal-pending").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) settle(el);
      });
    };

    // A focused control is never hidden or mid-animation.
    document.addEventListener("focusin", ({ target }) => {
      const unit = target.closest("[data-reveal-group]") || target.closest("[data-reveal]");
      if (unit) reveal.flush(unit);
    });
    // Typing or clearing the search acts on the cards right away.
    $("#apps").addEventListener("input", () => reveal.flush($("#apps")));
    // Back/forward and restored scroll positions: show what is on screen.
    window.addEventListener("popstate", () => setTimeout(reveal.flushInView, 120));
    window.addEventListener("pageshow", () => requestAnimationFrame(reveal.flushInView));
    // Settings that change mid-visit: stop all motion cleanly.
    const stopAll = () => { observer.disconnect(); $$(".nh-reveal-pending, .nh-reveal-in").forEach(settle); };
    reduceMotion.addEventListener("change", ({ matches }) => { if (matches) stopAll(); });
    mobileMQ.addEventListener("change", stopAll);
  }
})();
