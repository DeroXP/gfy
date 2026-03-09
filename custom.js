"use strict";

/**
 * Floating Chat Widget
 * A draggable, resizable iframe-based chat modal with theme support.
 *
 * Improvements over original:
 *  - CSS injected via stylesheet instead of inline styles everywhere
 *  - Proper RGB/hex color parsing for background detection
 *  - Clean open/close/minimize state machine
 *  - Keyboard shortcut (Ctrl+Shift+C) to toggle
 *  - Close button added
 *  - Enter key navigates URL bar
 *  - Resize handle
 *  - Click-outside dims (doesn't close) for less annoyance
 *  - Smooth spring-like animations
 *  - Accessible: aria labels, focus management
 */
(function () {
  // ── Configuration ──────────────────────────────────────────────────
  const CONFIG = {
    defaultUrl: "https://www.blackbox.ai/",
    modalWidth: 720,
    modalHeight: 520,
    toggleKey: "KeyC", // Ctrl+Shift+C
    brandName: "GFY",
  };

  // ── State ──────────────────────────────────────────────────────────
  let state = "closed"; // "closed" | "open" | "minimized"
  let modalEl = null;
  let currentUrl = CONFIG.defaultUrl;
  let isDark = false;

  // ── Utility: color helpers ─────────────────────────────────────────
  function parseColor(raw) {
    if (!raw) return { r: 0, g: 0, b: 0 };
    const hex = raw.trim();
    if (hex.startsWith("#")) {
      const h = hex.replace("#", "");
      const full = h.length === 3
        ? h.split("").map((c) => c + c).join("")
        : h;
      return {
        r: parseInt(full.substring(0, 2), 16),
        g: parseInt(full.substring(2, 4), 16),
        b: parseInt(full.substring(4, 6), 16),
      };
    }
    const m = raw.match(/(\d+)/g);
    if (m && m.length >= 3) {
      return { r: +m[0], g: +m[1], b: +m[2] };
    }
    return { r: 0, g: 0, b: 0 };
  }

  function luminance({ r, g, b }) {
    return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  }

  function isPageLight() {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    return luminance(parseColor(bg)) > 0.5;
  }

  function rgbToHex({ r, g, b }) {
    return (
      "#" +
      [r, g, b]
        .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function adjustBrightness(color, amount) {
    const c = parseColor(color);
    return rgbToHex({
      r: c.r + amount,
      g: c.g + amount,
      b: c.b + amount,
    });
  }

  // ── Inject styles ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("gfy-chat-styles")) return;
    const style = document.createElement("style");
    style.id = "gfy-chat-styles";
    style.textContent = `
      /* Toggle button */
      #gfy-toggle {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 99999;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a2e;
        color: #fff;
        opacity: 0.65;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        transition: opacity 0.25s, transform 0.25s, box-shadow 0.25s;
      }
      #gfy-toggle:hover {
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.35);
      }
      #gfy-toggle:active {
        transform: scale(0.95);
      }
      #gfy-toggle:focus-visible {
        outline: 2px solid #6c63ff;
        outline-offset: 3px;
      }

      /* Modal */
      #gfy-modal {
        position: fixed;
        z-index: 100000;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06);
        transition: opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1);
        display: flex;
        flex-direction: column;
        background: #0d1117;
      }
      #gfy-modal.is-hidden {
        opacity: 0;
        transform: scale(0.92);
        pointer-events: none;
      }
      #gfy-modal.is-visible {
        opacity: 1;
        transform: scale(1);
      }
      #gfy-modal.is-minimized {
        opacity: 1;
        transform: translateY(calc(100% - 38px));
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      #gfy-modal.is-dimmed {
        opacity: 0.55;
      }

      /* Titlebar */
      .gfy-titlebar {
        height: 38px;
        min-height: 38px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        cursor: grab;
        user-select: none;
        background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
      }
      .gfy-titlebar:active { cursor: grabbing; }

      .gfy-titlebar__brand {
        font-weight: 700;
        font-size: 13px;
        color: #c9d1d9;
        letter-spacing: 1.5px;
        margin-right: auto;
      }

      .gfy-titlebar__url {
        flex: 1;
        max-width: 260px;
        height: 24px;
        padding: 0 8px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        background: rgba(255,255,255,0.04);
        color: #c9d1d9;
        font-size: 12px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, background 0.2s;
      }
      .gfy-titlebar__url:focus {
        border-color: #6c63ff;
        background: rgba(255,255,255,0.08);
      }

      .gfy-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: #8b949e;
        transition: background 0.2s, color 0.2s, transform 0.15s;
      }
      .gfy-btn:hover {
        background: rgba(255,255,255,0.08);
        color: #c9d1d9;
        transform: scale(1.1);
      }
      .gfy-btn:active { transform: scale(0.9); }
      .gfy-btn--close:hover { background: #da3633; color: #fff; }

      /* Iframe area */
      .gfy-iframe {
        flex: 1;
        width: 100%;
        border: none;
        background: #0d1117;
      }

      /* Resize handle */
      .gfy-resize {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 18px;
        height: 18px;
        cursor: nwse-resize;
        opacity: 0.3;
        transition: opacity 0.2s;
      }
      .gfy-resize:hover { opacity: 0.7; }
      .gfy-resize::after {
        content: '';
        position: absolute;
        right: 4px;
        bottom: 4px;
        width: 8px;
        height: 8px;
        border-right: 2px solid #8b949e;
        border-bottom: 2px solid #8b949e;
      }

      /* ── Light theme overrides ─── */
      #gfy-modal.theme-light {
        background: #ffffff;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08);
      }
      #gfy-modal.theme-light .gfy-titlebar {
        background: linear-gradient(135deg, #f6f8fa 0%, #eaeef2 100%);
        border-bottom-color: rgba(0,0,0,0.08);
      }
      #gfy-modal.theme-light .gfy-titlebar__brand { color: #24292f; }
      #gfy-modal.theme-light .gfy-titlebar__url {
        border-color: rgba(0,0,0,0.12);
        background: rgba(0,0,0,0.03);
        color: #24292f;
      }
      #gfy-modal.theme-light .gfy-titlebar__url:focus {
        border-color: #6c63ff;
        background: #fff;
      }
      #gfy-modal.theme-light .gfy-btn { color: #57606a; }
      #gfy-modal.theme-light .gfy-btn:hover {
        background: rgba(0,0,0,0.06);
        color: #24292f;
      }
      #gfy-modal.theme-light .gfy-btn--close:hover { background: #da3633; color: #fff; }
      #gfy-modal.theme-light .gfy-iframe { background: #fff; }
      #gfy-modal.theme-light .gfy-resize::after {
        border-color: #8b949e;
      }
      #gfy-toggle.theme-light {
        background: #f0f0f3;
        color: #24292f;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      }
    `;
    document.head.appendChild(style);
  }

  // ── Create toggle button ───────────────────────────────────────────
  function createToggle() {
    const btn = document.createElement("button");
    btn.id = "gfy-toggle";
    btn.setAttribute("aria-label", "Toggle chat widget");
    btn.textContent = "💬";
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    return btn;
  }

  // ── Create modal ───────────────────────────────────────────────────
  function createModal() {
    const modal = document.createElement("div");
    modal.id = "gfy-modal";
    modal.classList.add("is-hidden");
    modal.style.width = CONFIG.modalWidth + "px";
    modal.style.height = CONFIG.modalHeight + "px";
    // Center initially
    modal.style.left = (window.innerWidth - CONFIG.modalWidth) / 2 + "px";
    modal.style.top = (window.innerHeight - CONFIG.modalHeight) / 2 + "px";

    // ── Titlebar ──
    const titlebar = document.createElement("div");
    titlebar.className = "gfy-titlebar";

    const brand = document.createElement("span");
    brand.className = "gfy-titlebar__brand";
    brand.textContent = CONFIG.brandName;

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "gfy-titlebar__url";
    urlInput.placeholder = "Enter URL…";
    urlInput.value = currentUrl;
    urlInput.setAttribute("aria-label", "Navigate to URL");
    // Prevent drag when interacting with input
    urlInput.addEventListener("mousedown", (e) => e.stopPropagation());
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        navigateTo(urlInput.value.trim());
      }
    });

    const themeBtn = document.createElement("button");
    themeBtn.className = "gfy-btn";
    themeBtn.setAttribute("aria-label", "Toggle theme");
    themeBtn.textContent = "☀️";
    themeBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      applyTheme();
      themeBtn.textContent = isDark ? "🌙" : "☀️";
    });

    const minBtn = document.createElement("button");
    minBtn.className = "gfy-btn";
    minBtn.setAttribute("aria-label", "Minimize");
    minBtn.textContent = "─";
    minBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    minBtn.addEventListener("click", () => {
      if (state === "minimized") {
        setState("open");
      } else {
        setState("minimized");
      }
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "gfy-btn gfy-btn--close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    closeBtn.addEventListener("click", () => setState("closed"));

    titlebar.append(brand, urlInput, themeBtn, minBtn, closeBtn);
    modal.appendChild(titlebar);

    // ── Iframe ──
    const iframe = document.createElement("iframe");
    iframe.className = "gfy-iframe";
    iframe.id = "gfy-iframe";
    iframe.src = currentUrl;
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allow", "clipboard-write");
    modal.appendChild(iframe);

    // ── Resize handle ──
    const resize = document.createElement("div");
    resize.className = "gfy-resize";
    setupResize(resize, modal);
    modal.appendChild(resize);

    // ── Drag ──
    setupDrag(titlebar, modal);

    // ── Click outside dims ──
    document.addEventListener("mousedown", (e) => {
      if (state !== "open") return;
      if (!modal.contains(e.target) && e.target.id !== "gfy-toggle") {
        modal.classList.add("is-dimmed");
      } else {
        modal.classList.remove("is-dimmed");
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  // ── Navigation ─────────────────────────────────────────────────────
  function navigateTo(url) {
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = "https://" + url;
    currentUrl = url;
    const iframe = document.getElementById("gfy-iframe");
    if (iframe) iframe.src = currentUrl;
    const input = modalEl?.querySelector(".gfy-titlebar__url");
    if (input) input.value = currentUrl;
  }

  // ── Drag logic ─────────────────────────────────────────────────────
  function setupDrag(handle, target) {
    let dragging = false;
    let ox, oy;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
      dragging = true;
      ox = e.clientX - target.getBoundingClientRect().left;
      oy = e.clientY - target.getBoundingClientRect().top;
      // Remove CSS transition during drag for responsiveness
      target.style.transition = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const x = Math.max(0, Math.min(e.clientX - ox, window.innerWidth - target.offsetWidth));
      const y = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - target.offsetHeight));
      target.style.left = x + "px";
      target.style.top = y + "px";
    });

    window.addEventListener("mouseup", () => {
      if (dragging) {
        dragging = false;
        target.style.transition = "";
      }
    });
  }

  // ── Resize logic ───────────────────────────────────────────────────
  function setupResize(handle, target) {
    let resizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = target.offsetWidth;
      startH = target.offsetHeight;
      target.style.transition = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      const w = Math.max(360, startW + (e.clientX - startX));
      const h = Math.max(260, startH + (e.clientY - startY));
      target.style.width = w + "px";
      target.style.height = h + "px";
    });

    window.addEventListener("mouseup", () => {
      if (resizing) {
        resizing = false;
        target.style.transition = "";
      }
    });
  }

  // ── Theme ──────────────────────────────────────────────────────────
  function applyTheme() {
    const toggle = document.getElementById("gfy-toggle");
    if (!modalEl) return;
    if (isDark) {
      modalEl.classList.remove("theme-light");
      toggle?.classList.remove("theme-light");
    } else {
      modalEl.classList.add("theme-light");
      toggle?.classList.add("theme-light");
    }
  }

  function autoDetectTheme() {
    isDark = !isPageLight();
    applyTheme();
  }

  // ── State machine ──────────────────────────────────────────────────
  function setState(next) {
    if (!modalEl) modalEl = createModal();
    state = next;
    const toggle = document.getElementById("gfy-toggle");

    modalEl.classList.remove("is-hidden", "is-visible", "is-minimized", "is-dimmed");

    switch (state) {
      case "open":
        modalEl.classList.add("is-visible");
        autoDetectTheme();
        if (toggle) toggle.textContent = "✕";
        break;
      case "minimized":
        modalEl.classList.add("is-minimized");
        if (toggle) toggle.textContent = "💬";
        break;
      case "closed":
      default:
        modalEl.classList.add("is-hidden");
        if (toggle) toggle.textContent = "💬";
        break;
    }
  }

  function toggle() {
    if (state === "closed") {
      setState("open");
    } else {
      setState("closed");
    }
  }

  // ── Keyboard shortcut ──────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === CONFIG.toggleKey) {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape" && state === "open") {
      setState("closed");
    }
  });

  // ── Init ───────────────────────────────────────────────────────────
  injectStyles();
  createToggle();
})();
