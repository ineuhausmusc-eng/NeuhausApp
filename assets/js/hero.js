/* Portrait focus reveal. Touch: tap a portrait, then its platform link.
   Links remain usable without JavaScript through the fallback navigation. */
(() => {
  "use strict";
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const triggers = Array.from(hero.querySelectorAll("[data-hero-trigger]"));
  const links = Array.from(hero.querySelectorAll("[data-hero-link]"));
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function select(platform = "both") {
    hero.dataset.platform = platform;
    triggers.forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset.heroTrigger === platform));
    });
    links.forEach((link) => {
      const inactive = link.dataset.heroLink !== platform;
      link.inert = inactive;
      link.setAttribute("aria-hidden", String(inactive));
    });
  }

  select();
  [...triggers, ...links].forEach((control) => { control.hidden = false; });
  hero.classList.add("is-interactive");

  triggers.forEach((button) => {
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && finePointer.matches) select(button.dataset.heroTrigger);
    });
    button.addEventListener("click", () => select(button.dataset.heroTrigger));
  });
  hero.addEventListener("focusin", ({ target }) => {
    const control = target.closest("[data-hero-trigger], [data-hero-link]");
    if (control && (control.dataset.heroLink || control.matches(":focus-visible"))) {
      select(control.dataset.heroTrigger || control.dataset.heroLink);
    }
  });
  // Crossing from a portrait to its icon never resets the reveal.
  hero.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && !hero.querySelector(":focus-visible")) select();
  });
  hero.addEventListener("focusout", ({ relatedTarget }) => {
    if (!hero.contains(relatedTarget)) select();
  });
  hero.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const trigger = triggers.find((button) => button.dataset.heroTrigger === hero.dataset.platform);
    if (links.includes(document.activeElement)) trigger?.focus({ preventScroll: true });
    select();
  });
  document.addEventListener("pointerdown", ({ target }) => {
    if (!hero.contains(target)) select();
  }, { passive: true });
  window.addEventListener("pageshow", () => select());
})();
