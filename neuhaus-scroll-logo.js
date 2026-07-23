const TAG_NAME = "neuhaus-scroll-logo";

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function defineNeuhausScrollLogo() {
  if (typeof window === "undefined" || customElements.get(TAG_NAME)) {
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        --neuhaus-section-height: 235svh;
        display: block;
        position: relative;
        height: var(--neuhaus-section-height);
        background: #000508;
        color: #eefdf9;
        isolation: isolate;
      }

      .sticky {
        position: sticky;
        top: 0;
        display: grid;
        width: 100%;
        height: 100svh;
        min-height: 30rem;
        place-items: center;
        overflow: clip;
        background:
          radial-gradient(circle at 50% 50%, rgba(0, 221, 185, 0.065), transparent 38%),
          radial-gradient(circle at 50% 45%, rgba(255, 139, 24, 0.045), transparent 51%),
          #000508;
        touch-action: pan-y;
      }

      .sticky::before {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at center, transparent 0 34%, rgba(0, 0, 0, 0.17) 67%, rgba(0, 0, 0, 0.68) 100%);
        content: "";
        pointer-events: none;
      }

      .stage {
        position: relative;
        width: min(76vw, 43.75rem);
        aspect-ratio: 1;
        perspective: 75rem;
        perspective-origin: 50% 50%;
        pointer-events: none;
        user-select: none;
      }

      .halo {
        position: absolute;
        inset: 23%;
        border-radius: 50%;
        background:
          conic-gradient(
            from 20deg,
            rgba(255, 192, 55, 0.28),
            rgba(28, 246, 189, 0.24),
            rgba(26, 220, 246, 0.20),
            rgba(255, 101, 12, 0.27),
            rgba(255, 192, 55, 0.28)
          );
        filter: blur(3.5rem);
        opacity: 0.34;
        transform: scale(1.05);
      }

      .object {
        --logo-rx: 0deg;
        --logo-ry: 0deg;
        --logo-rz: 0deg;
        --logo-scale: 0.96;
        position: absolute;
        inset: 0;
        transform:
          rotateX(var(--logo-rx))
          rotateY(var(--logo-ry))
          rotateZ(var(--logo-rz))
          scale(var(--logo-scale));
        transform-style: preserve-3d;
        will-change: transform;
      }

      .layer,
      .glint {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        -webkit-mask-image: radial-gradient(
          circle farthest-corner at center,
          #000 0 67%,
          rgba(0, 0, 0, 0.94) 71%,
          transparent 78%
        );
        mask-image: radial-gradient(
          circle farthest-corner at center,
          #000 0 67%,
          rgba(0, 0, 0, 0.94) 71%,
          transparent 78%
        );
      }

      .layer {
        display: block;
        object-fit: contain;
        -webkit-user-drag: none;
      }

      .depth {
        opacity: 0.62;
        filter: brightness(0.30) saturate(1.18) contrast(1.12);
        transform: translateZ(var(--layer-z));
      }

      .front {
        backface-visibility: hidden;
        transform: translateZ(0.72rem);
      }

      .back {
        backface-visibility: hidden;
        filter: brightness(0.84) saturate(0.92);
        transform: rotateY(180deg) translateZ(0.72rem);
      }

      .glint {
        z-index: 2;
        background:
          linear-gradient(
            112deg,
            transparent 22%,
            rgba(255, 255, 255, 0.02) 39%,
            rgba(255, 255, 255, 0.30) 49%,
            rgba(255, 255, 255, 0.03) 58%,
            transparent 76%
          );
        backface-visibility: hidden;
        mix-blend-mode: soft-light;
        opacity: 0.45;
        transform: translateZ(0.735rem);
      }

      @media (max-width: 42rem) {
        .stage {
          width: min(91vw, 38rem);
          perspective: 58rem;
        }

        .halo {
          filter: blur(2.7rem);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          height: 100svh;
        }

        .object {
          transform: none !important;
        }
      }

      @supports not (height: 100svh) {
        :host {
          --neuhaus-section-height: 235vh;
        }

        .sticky {
          height: 100vh;
        }
      }
    </style>

    <div class="sticky" part="sticky">
      <div class="stage" part="stage">
        <div class="halo" aria-hidden="true"></div>
        <div class="object" part="object">
          <div class="glint" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;

  class NeuhausScrollLogo extends HTMLElement {
    static get observedAttributes() {
      return ["image", "turns", "section-height", "label"];
    }

    constructor() {
      super();
      this._initialized = false;
      this._connected = false;
      this._targetProgress = 0;
      this._currentProgress = 0;
      this._turns = 3;
      this._raf = 0;
      this._lastFrameTime = 0;
      this._tick = this._tick.bind(this);
      this._measure = this._measure.bind(this);
      this._handleMotionPreference = this._handleMotionPreference.bind(this);
    }

    connectedCallback() {
      if (!this._initialized) {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._object = this.shadowRoot.querySelector(".object");
        this._sticky = this.shadowRoot.querySelector(".sticky");
        this._createLayers();
        this._initialized = true;
      }

      if (this._connected) {
        return;
      }

      this._connected = true;
      this._motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._motionQuery.addEventListener?.("change", this._handleMotionPreference);
      window.addEventListener("scroll", this._measure, { passive: true });
      window.addEventListener("resize", this._measure, { passive: true });

      if ("ResizeObserver" in window) {
        this._resizeObserver = new ResizeObserver(this._measure);
        this._resizeObserver.observe(this);
      }

      this._syncAttributes();
      this._measure(true);
      requestAnimationFrame(() => this._measure(true));
    }

    disconnectedCallback() {
      this._connected = false;
      window.removeEventListener("scroll", this._measure);
      window.removeEventListener("resize", this._measure);
      this._motionQuery?.removeEventListener?.("change", this._handleMotionPreference);
      this._resizeObserver?.disconnect();
      this._resizeObserver = null;

      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }
    }

    attributeChangedCallback() {
      if (!this._initialized) {
        return;
      }

      this._syncAttributes();
      this._measure(true);
    }

    _createLayers() {
      const glint = this._object.querySelector(".glint");
      this._images = [];

      for (let index = -3; index <= 3; index += 1) {
        const depthLayer = document.createElement("img");
        depthLayer.className = "layer depth";
        depthLayer.alt = "";
        depthLayer.draggable = false;
        depthLayer.decoding = "async";
        depthLayer.style.setProperty("--layer-z", `${index * 3.8}px`);
        this._object.insertBefore(depthLayer, glint);
        this._images.push(depthLayer);
      }

      const front = document.createElement("img");
      front.className = "layer front";
      front.alt = "";
      front.draggable = false;
      front.decoding = "async";
      this._object.insertBefore(front, glint);
      this._images.push(front);

      const back = document.createElement("img");
      back.className = "layer back";
      back.alt = "";
      back.draggable = false;
      back.decoding = "async";
      this._object.insertBefore(back, glint);
      this._images.push(back);
    }

    _syncAttributes() {
      const image = this.getAttribute("image") || "./assets/neuhaus-3d-logo.png";
      this._images.forEach((layer) => {
        if (layer.getAttribute("src") !== image) {
          layer.setAttribute("src", image);
        }
      });

      this._turns = Math.max(0, finiteNumber(this.getAttribute("turns"), 3));

      const sectionHeight = clamp(
        finiteNumber(this.getAttribute("section-height"), 235),
        120,
        500,
      );
      this.style.setProperty("--neuhaus-section-height", `${sectionHeight}svh`);

      const label = this.getAttribute("label") || "Neuhaus Apps logo";
      this._sticky.setAttribute("role", "img");
      this._sticky.setAttribute("aria-label", label);
    }

    _handleMotionPreference() {
      this._measure(true);
    }

    _measure(snap = false) {
      if (!this._connected || !this._object) {
        return;
      }

      if (this._motionQuery?.matches) {
        if (this._raf) {
          cancelAnimationFrame(this._raf);
          this._raf = 0;
        }
        this._lastFrameTime = 0;
        this._targetProgress = 0;
        this._currentProgress = 0;
        this._applyTransform(0);
        return;
      }

      const rect = this.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      this._targetProgress = clamp(-rect.top / travel);

      if (snap === true) {
        if (this._raf) {
          cancelAnimationFrame(this._raf);
          this._raf = 0;
        }
        this._lastFrameTime = 0;
        this._currentProgress = this._targetProgress;
        this._applyTransform(this._currentProgress);
        return;
      }

      if (!this._raf) {
        this._lastFrameTime = 0;
        this._raf = requestAnimationFrame(this._tick);
      }
    }

    _tick(timestamp) {
      const delta = this._targetProgress - this._currentProgress;

      if (Math.abs(delta) < 0.0005) {
        this._currentProgress = this._targetProgress;
        this._applyTransform(this._currentProgress);
        this._raf = 0;
        this._lastFrameTime = 0;
        return;
      }

      const frameTime = 1000 / 60;
      const elapsed = this._lastFrameTime
        ? Math.min(250, timestamp - this._lastFrameTime)
        : frameTime;
      const blend = 1 - Math.pow(1 - 0.30, elapsed / frameTime);
      this._lastFrameTime = timestamp;
      this._currentProgress += delta * blend;
      this._applyTransform(this._currentProgress);
      this._raf = requestAnimationFrame(this._tick);
    }

    _applyTransform(progress) {
      const primarySpin = progress * this._turns * 360;
      const crossAxisSpin = progress * 360;
      const motionPhase = progress * Math.PI * this._turns * 2;
      const tilt = Math.sin(motionPhase) * 9;
      const roll =
        Math.sin(motionPhase + Math.PI / 3) *
        Math.sin(progress * Math.PI) *
        6;
      const scale = 0.96 + Math.sin(progress * Math.PI) * 0.04;

      this._object.style.setProperty("--logo-rx", `${crossAxisSpin + tilt}deg`);
      this._object.style.setProperty("--logo-ry", `${primarySpin}deg`);
      this._object.style.setProperty("--logo-rz", `${roll}deg`);
      this._object.style.setProperty("--logo-scale", scale.toFixed(4));
    }
  }

  customElements.define(TAG_NAME, NeuhausScrollLogo);
}

defineNeuhausScrollLogo();
