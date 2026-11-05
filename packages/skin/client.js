window.__ModuleLoader__.load({
  id: '@local/dsh-fairy-skin',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // ---- FAIRY Ⅲ emblem, taken verbatim from the supplied asset pack ----
    const VECTOR = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1 -1 162 162\" role=\"img\" aria-label=\"Fairy\"><defs><linearGradient id=\"hddFairyOuter\" x1=\".2\" y1=\"0\" x2=\".8\" y2=\"1\"><stop stop-color=\"#4053f0\"/><stop offset=\".54\" stop-color=\"#3045dc\"/><stop offset=\"1\" stop-color=\"#3d50c8\"/></linearGradient><radialGradient id=\"hddFairyScleraHalo\" gradientUnits=\"userSpaceOnUse\" cx=\"80\" cy=\"80\" r=\"56\" color-interpolation=\"linearRGB\"><stop offset=\".82\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".875\" stop-color=\"#fff\" stop-opacity=\".28\"/><stop offset=\".91\" stop-color=\"#fff\" stop-opacity=\".11\"/><stop offset=\".96\" stop-color=\"#fff\" stop-opacity=\".035\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"hddFairyOuterHalo\" gradientUnits=\"userSpaceOnUse\" cx=\"80\" cy=\"80\" r=\"79\" color-interpolation=\"linearRGB\"><stop offset=\".80\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".868\" stop-color=\"#fff\" stop-opacity=\".28\"/><stop offset=\".90\" stop-color=\"#fff\" stop-opacity=\".18\"/><stop offset=\".95\" stop-color=\"#fff\" stop-opacity=\".06\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"hddFairyCatchHalo\" gradientUnits=\"userSpaceOnUse\" cx=\"98\" cy=\"100.5\" r=\"18\" color-interpolation=\"linearRGB\"><stop offset=\".53\" stop-color=\"#f5f8fd\" stop-opacity=\"0\"/><stop offset=\".611\" stop-color=\"#f5f8fd\" stop-opacity=\".43\"/><stop offset=\".72\" stop-color=\"#f5f8fd\" stop-opacity=\".19\"/><stop offset=\".83\" stop-color=\"#f5f8fd\" stop-opacity=\".055\"/><stop offset=\"1\" stop-color=\"#f5f8fd\" stop-opacity=\"0\"/></radialGradient></defs><circle cx=\"80\" cy=\"80\" r=\"79\" fill=\"url(#hddFairyOuterHalo)\"/><circle cx=\"80\" cy=\"80\" r=\"68\" fill=\"none\" stroke=\"#dceaff\" stroke-width=\"1.8\"/><circle cx=\"80\" cy=\"80\" r=\"68\" fill=\"url(#hddFairyOuter)\" stroke=\"#f2fbff\" stroke-width=\"1.2\"/><g id=\"hddFairyCorners\" fill=\"#2b3388\" transform=\"rotate(0 80 80)\"><circle cx=\"80\" cy=\"80\" r=\"51.75\"/><rect x=\"37\" y=\"37\" width=\"86\" height=\"86\" rx=\"2\" transform=\"rotate(3 80 80)\"/></g><g id=\"hddFairySclera\" transform=\"translate(80 80) scale(1) translate(-80 -80)\"><circle cx=\"80\" cy=\"80\" r=\"48\" fill=\"#eef0f5\"/><circle cx=\"80\" cy=\"80\" r=\"56\" fill=\"url(#hddFairyScleraHalo)\"/><circle cx=\"80\" cy=\"80\" r=\"48\" fill=\"none\" stroke=\"#fff\" stroke-width=\".8\" stroke-opacity=\".16\"/></g><g id=\"hddFairyIrisOuter\" transform=\"translate(80 80) scale(1) translate(-80 -80)\"><circle cx=\"80\" cy=\"80\" r=\"33\" fill=\"#9daee0\"/></g><g id=\"hddFairyIrisBlue\" transform=\"translate(80 80) scale(1) translate(-80 -80)\"><circle cx=\"80\" cy=\"80\" r=\"24.15\" fill=\"#eef0f5\"/><circle cx=\"80\" cy=\"80\" r=\"23.5\" fill=\"#317bcf\"/></g><g id=\"hddFairyPupil\" transform=\"translate(80 80) scale(1) translate(-80 -80)\"><circle cx=\"80\" cy=\"80\" r=\"16.6\" fill=\"none\" stroke=\"#f5f8fd\" stroke-width=\".1\"/><circle cx=\"80\" cy=\"80\" r=\"16\" fill=\"#3b3d8a\"/></g><g id=\"hddFairyHighlight\" transform=\"translate(80 80) scale(1) translate(-80 -80)\"><circle cx=\"98\" cy=\"100.5\" r=\"18\" fill=\"url(#hddFairyCatchHalo)\"/><circle cx=\"98\" cy=\"100.5\" r=\"11\" fill=\"#f5f8fd\"/></g></svg>";
    const SHIFTS = ["0","-12","6","-7","14","-4","9","-14","3","-9","11","-6","5","-11","8","-3","13","-8","4","-15"];
    const BANDS = 20;

    const MASCOT_CSS = String.raw`
/* Extracted from client.js: the mascot's animation, unchanged. */
[data-hdd-mascot] {   flex: 1 1 100%; display: flex; justify-content: center; align-items: center;   position: relative; padding: 12px 0 26px; box-sizing: border-box;   overflow: visible !important;   transition: opacity 0.25s ease-out; }

html[data-hdd-boot-active="true"] [data-hdd-mascot] {   opacity: 0 !important; }

[data-hdd-mascot-stage] {   position: relative; flex: 0 0 auto !important;   width: min(260px, 100%); aspect-ratio: 1 / 1; height: auto;   max-width: 260px; }

[data-hdd-mascot-bloom] {   position: absolute; inset: -14%; border-radius: 50%;   corner-shape: round;   background: radial-gradient(circle closest-side, rgba(150, 200, 255, 0.34) 0%, rgba(80, 150, 255, 0.22) 32%, rgba(56, 116, 255, 0.09) 55%, rgba(0, 0, 0, 0) 74%);   animation: hdd-mascot-bloom 3s ease-in-out infinite; }

[data-hdd-mascot-stage]::before {   corner-shape: round;   border: 5px solid rgba(236, 246, 255, 0.7);   box-shadow: 0 0 16px rgba(198, 230, 255, 0.55), inset 0 0 14px rgba(198, 230, 255, 0.4);   filter: blur(3px);   opacity: 0;   animation: hdd-mascot-ripple 3.4s ease-out infinite; }

[data-hdd-mascot-mark] { position: absolute; inset: 11%; }

[data-hdd-mascot-band] {   position: absolute; inset: 0;   animation: hdd-mascot-slice 3.6s steps(1, end) infinite;   will-change: transform; }

[data-hdd-mascot-band] svg { width: 100%; height: 100%; display: block; }

@keyframes hdd-mascot-bloom {   0%, 100% { opacity: 0.7; transform: scale(1); }   50% { opacity: 1; transform: scale(1.06); } }

@keyframes hdd-mascot-ripple {   0% { transform: scale(1.08); opacity: 0; }   18% { opacity: 0.9; }   66% { opacity: 0.3; }   100% { transform: scale(1.42); opacity: 0; } }

@keyframes hdd-mascot-slice {   0%, 96% { transform: translateX(0); filter: none; }   96.2% { transform: translateX(var(--hdd-shift, 0px)); filter: brightness(1.35) saturate(1.35); }   97.4% { transform: translateX(calc(var(--hdd-shift, 0px) * -0.35)); filter: brightness(1.12); }   98.4%, 100% { transform: translateX(0); filter: none; } }

[data-hdd-mark-scope] #hddFairyCorners {   transform-box: view-box; transform-origin: 80px 80px;   animation: hdd-mascot-turn 3s linear infinite; }

[data-hdd-mark-scope] #hddFairySclera { animation-name: hdd-mascot-sclera; }

[data-hdd-mark-scope] #hddFairyIrisOuter { animation-name: hdd-mascot-iris-outer; animation-delay: -47ms; }

[data-hdd-mark-scope] #hddFairyIrisBlue { animation-name: hdd-mascot-iris-blue; animation-delay: -94ms; }

[data-hdd-mark-scope] #hddFairyHighlight { animation-name: hdd-mascot-iris-blue; animation-delay: -94ms; }

[data-hdd-mark-scope] #hddFairyPupil { animation-name: hdd-mascot-pupil; animation-delay: -188ms; }

@keyframes hdd-mascot-turn { from { transform: rotate(0deg); } to { transform: rotate(90deg); } }

@keyframes hdd-mascot-sclera { 0%, 100% { transform: scale(0.985); } 50% { transform: scale(0.91); } }

@keyframes hdd-mascot-iris-outer { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.90); } }

@keyframes hdd-mascot-iris-blue { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.87); } }

@keyframes hdd-mascot-pupil { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.85); } }

[data-hdd-mascot][data-rail="true"] [data-hdd-mascot-stage] {   width: min(112px, 100%); aspect-ratio: 1 / 1; height: auto; }

[data-hdd-boot-bloom] {   position: absolute; inset: -14%; border-radius: 50%;   corner-shape: round;   background: radial-gradient(circle closest-side, rgba(150, 200, 255, 0.34) 0%, rgba(80, 150, 255, 0.22) 32%, rgba(56, 116, 255, 0.09) 55%, rgba(0, 0, 0, 0) 74%);   animation: hdd-mascot-bloom 3s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {   [data-hdd-mascot] [data-hdd-mascot-bloom],   [data-hdd-mascot] [data-hdd-mascot-stage]::before,   [data-hdd-mascot] [data-hdd-mascot-band],   [data-hdd-mark-scope] #hddFairyCorners { animation: none; }   [data-hdd-mark-scope] #hddFairySclera, [data-hdd-mark-scope] #hddFairyIrisOuter,   [data-hdd-mark-scope] #hddFairyIrisBlue, [data-hdd-mark-scope] #hddFairyPupil,   [data-hdd-mark-scope] #hddFairyHighlight { animation: none; } }

`;

    const SKIN_CSS = String.raw`
:root, body, body[data-ds-dark-theme] {
  --fs-ink: #dbe6f4;
  --fs-dim: #93a7bd;
  --fs-line: rgba(98, 140, 220, 0.20);
  --fs-line-strong: rgba(120, 170, 255, 0.42);
  --fs-cyan: #7fb4ff;
  --fs-blue: #2f6bff;

  --dsw-alias-bg-base: #040a17 !important;
  --dsw-alias-bg-layer-1: #081226 !important;
  --dsw-alias-bg-layer-2: #0a1526 !important;
  --dsw-alias-bg-layer-3: #0d1b31 !important;
  --dsw-alias-bg-overlay: #0a1526 !important;
  --dsw-alias-bg-module-platform: #081226 !important;
  --dsw-alias-border-l1: rgba(98, 140, 220, 0.10) !important;
  --dsw-alias-border-l2: rgba(98, 140, 220, 0.18) !important;
  --dsw-alias-border-l3: rgba(98, 140, 220, 0.26) !important;
  --dsw-alias-border-l4: rgba(98, 140, 220, 0.34) !important;
  --dsw-alias-label-primary: #dbe6f4 !important;
  --dsw-alias-label-primary-dimmed: #c2d4e6 !important;
  --dsw-alias-label-secondary: #a3b8cd !important;
  --dsw-alias-label-tertiary: #8aa0b8 !important;
  --dsw-alias-label-caption: #778da4 !important;
  --dsw-alias-brand-primary: #8fc2ff !important;
  --dsw-alias-brand-text: #dbe6f4 !important;
  --dsw-alias-link: #7fb4ff !important;
  --dsw-specific-sidebar-fill: #0a0c25 !important;
  --dsw-specific-input-major: #071329 !important;
  --dsw-specific-bubble: #172a49 !important;
  --dsw-specific-bubble-highlight: #1d3558 !important;
  --dsw-specific-selector: #0a1526 !important;
  --dsw-specific-menu: rgba(8, 14, 30, 0.97) !important;
  --dsw-menu-surface-fill: rgba(8, 14, 30, 0.97) !important;
  --dsw-specific-sidebar-nav-item-active: rgba(38, 74, 130, 0.42) !important;
  --dsw-specific-sidebar-nav-item-active-accent: rgba(98, 140, 220, 0.20) !important;
  --dsw-specific-sidebar-nav-item-hover: rgba(34, 66, 118, 0.30) !important;
  --dsw-alias-interactive-bg-hover: rgba(80, 130, 200, 0.12) !important;
  --dsw-alias-interactive-bg-active: rgba(100, 160, 240, 0.20) !important;
  --dsw-alias-markdown-code-block: #071120 !important;
  --dsw-alias-markdown-inline-code: #0c1a2e !important;
  --dsw-alias-scrollbar-bg-l1: #172a44 !important;
  --dsw-alias-scrollbar-bg-l2: #172a44 !important;
  --dsw-alias-scrollbar-hover-l1: #2a4a72 !important;
  --dsw-alias-scrollbar-hover-l2: #2a4a72 !important;
  --dsw-alias-state-business-primary: #7fb4ff !important;
  --dsw-alias-state-warn-primary: #ffc45e !important;
  --dsw-radius-sm: 3px;
  --dsw-radius-md: 4px;
  --dsw-radius-lg: 6px;
  --dsw-radius-xl: 8px;
  --dsw-radius-panel: 10px;
}
html, body {
  background: #040a17 !important;
  color: var(--fs-ink) !important;
  font-family: "Segoe UI", "Microsoft YaHei", var(--dsw-font-family), system-ui, sans-serif;
}

#root { position: relative; z-index: 1; }

/* backdrop layers live in the HUD: body pseudo elements sit below the app root */
.fs-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(120% 90% at 50% 26%, rgba(30, 56, 120, 0.16) 0%, rgba(18, 34, 74, 0.06) 48%, transparent 72%);
  mix-blend-mode: screen;
}
.fs-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.45;
  background-image:
    linear-gradient(rgba(96, 140, 220, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 140, 220, 0.075) 1px, transparent 1px);
  background-size: 72px 72px;
}

/* ---------- sidebar ---------- */
[class*="_2H3hWW_root"]:not([class*="_collapsed"]) {
  width: 278px !important;
  min-width: 278px !important;
  max-width: 278px !important;
  border-right: 1px solid rgba(70, 110, 170, 0.16);
}
button[class*="_newSession"] {
  margin-top: 18px !important;
  background: linear-gradient(180deg, rgba(34, 52, 84, 0.95), rgba(23, 38, 64, 0.95)) !important;
  border: 1px solid rgba(64, 104, 160, 0.55) !important;
  border-radius: 6px !important;
  color: #e8f1fb !important;
  letter-spacing: 0.02em;
  box-shadow: none !important;
  clip-path: none !important;
}
button[class*="_newSession"]:hover {
  border-color: rgba(110, 160, 230, 0.8) !important;
  background: linear-gradient(180deg, rgba(26, 42, 74, 0.96), rgba(18, 30, 56, 0.96)) !important;
}

[class*="_panelRow"] {
  border-radius: 6px !important;
  color: #cfd9e8 !important;
  font-size: 15px !important;
  letter-spacing: 0.02em;
}
[class*="_panelList"] { margin-top: 3px !important; }
[class*="_regionArea"] { margin-top: 17px !important; }

[class*="_panelGlyph"] svg { width: 18px !important; height: 18px !important; }
[class*="_tabs"] button, [class*="_tab"] { font-size: 15px !important; }
[class*="_panelRow"]:hover { background: rgba(40, 92, 138, 0.24) !important; }
[class*="_panelActive"] {
  background: #1b2436 !important;
  box-shadow: none !important;
  color: #edf3fb !important;
}
[class*="_panelGlyph"] svg, [class*="_iconButton"] svg, [class*="_footerActions"] svg { color: #93a9c4; }
[class*="_panelRow"]:hover [class*="_panelGlyph"] svg { color: #b6e5ff; }



/* the shell's window frame paints the sidebar fill across the whole title strip;
   clear it so the top bar matches the content area exactly */
[class*="_frame"], [class*="_frame"]::before, [class*="_frame"]::after { background: transparent !important; }

/* ---------- brand ---------- */
[class*="_brandIdentity"] { height: auto !important; }
[class*="_brandMark"], [class*="_railMark"], [class*="_brandIdentity"] * { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }
.fs-brand { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; line-height: 1.05; overflow: visible; }
.fs-brand-name { margin-left: 0;
  font-family: Montserrat, var(--dsw-font-family); font-size: 17px; font-weight: 700;
  letter-spacing: 0.01em; color: #f2f7ff; text-shadow: 0 0 18px rgba(110, 170, 255, 0.45);
}
.fs-brand-sub { margin-left: 0; font-size: 9.5px; letter-spacing: 0; color: #7d90ab; white-space: nowrap; }
.fs-sigil { display: inline-flex; width: 30px; height: 30px; opacity: 0.9; filter: drop-shadow(0 0 4px rgba(90, 150, 255, 0.35)); }
.fs-sigil svg { width: 100%; height: 100%; display: block; }

/* ---------- tabs ---------- */
[class*="_tabs"] { border-bottom: 1px solid rgba(126, 220, 255, 0.14) !important; }
[class*="_tabActive"] {
  color: #eaf8ff !important;
  box-shadow: inset 0 -2px 0 #7fd8ff !important;
  text-shadow: 0 0 12px rgba(126, 220, 255, 0.45);
}

/* ---------- chat column ---------- */
[class*="_embeddedBody"] {
  --dsh-chat-content-width: min(calc(100% - 48px), 700px);
  --dsh-composer-card-max-width: min(calc(100% - 40px), 720px);
}

/* ---------- composer ---------- */
[class*="_composerSeat"] { background: transparent !important; border: 0 !important; box-shadow: none !important; }
[class*="_composerSeat"] [class*="_input"] { background: transparent !important; }
button[aria-label="发送消息"], button[aria-label="发送"], button[title="发送消息"] {
  border-radius: 50% !important;
  corner-shape: round;
  background: #2f6bff !important;
  border: 1px solid rgba(160, 200, 255, 0.55) !important;
  box-shadow: 0 0 14px rgba(47, 107, 255, 0.45) !important;
  color: #f2f8ff !important;
}

textarea, [contenteditable="true"] { color: #dcecf8 !important; caret-color: #7fd8ff; }
textarea::placeholder, [contenteditable="true"]:empty::before { color: #5d7d99 !important; }

button { border-radius: 2px; letter-spacing: 0.04em; }
[class*="_chip"], [class*="_select"] {
  background: rgba(13, 33, 54, 0.9) !important;
  border: 1px solid rgba(126, 220, 255, 0.16) !important;
  color: #a9c8e2 !important;
  border-radius: 2px !important;
}

/* ---------- HUD ---------- */
.fs-hud { position: fixed; inset: 0; pointer-events: none; z-index: 60; }
.fs-corner { position: absolute; width: 22px; height: 22px; border: 1px solid rgba(126, 220, 255, 0.45); }
.fs-corner.tl { top: 6px; left: 6px; border-right: 0; border-bottom: 0; }
.fs-corner.tr { top: 6px; right: 6px; border-left: 0; border-bottom: 0; }
.fs-corner.bl { bottom: 6px; left: 6px; border-right: 0; border-top: 0; }
.fs-corner.br { bottom: 6px; right: 6px; border-left: 0; border-top: 0; }
.fs-scan {
  position: absolute; inset: 0; opacity: 0.16; mix-blend-mode: screen;
  background: repeating-linear-gradient(0deg, rgba(126, 220, 255, 0.06) 0 1px, transparent 1px 3px);
}
.fs-mark {
  position: absolute; top: 9px; right: 148px;
  font-family: var(--ds-font-family-code), Consolas, monospace;
  font-size: 9px; letter-spacing: 0.14em; color: rgba(160, 200, 255, 0.62);
  text-transform: uppercase;
  padding: 3px 8px; border: 1px solid rgba(90, 140, 210, 0.28);
  border-radius: 6px; background: rgba(10, 20, 38, 0.85);
}
.fs-mark b { color: rgba(220, 240, 255, 0.92); font-weight: 600; }

/* the desktop shell injects its Windows menubar as a shadow host; only inherited
   custom properties reach inside, so restyle it through them */
[data-windows-menu] {
  z-index: 1200 !important;
  --dsh-windows-menu-start: 88px !important;
  --dsw-alias-label-secondary: #cfd9e8 !important;
  --dsw-alias-label-primary: #eaf2fb !important;
  --dsw-alias-interactive-bg-hover: rgba(90, 140, 210, 0.18) !important;
}

.fs-new {
  position: fixed; left: 52px; top: 6px; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  padding: 0; border: 0; border-radius: 6px; background: transparent;
  color: #cfd9e8; font: 18px/1 var(--dsw-font-family); cursor: default;
  pointer-events: auto; -webkit-app-region: no-drag;
}
.fs-new:hover { background: rgba(90, 140, 210, 0.18); color: #eaf2fb; }
.fs-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(130% 95% at 50% 45%, transparent 58%, rgba(0, 4, 10, 0.55) 100%);
}

.fs-mascot-seat {
  position: fixed; left: 22px; bottom: 112px; width: 234px; height: 234px;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 55;
}
.fs-mascot-seat::before {
  content: ""; position: absolute; inset: 26%; border-radius: 50%; corner-shape: round;
  background: radial-gradient(circle closest-side, rgba(70, 110, 230, 0.30) 0%, rgba(40, 70, 180, 0.14) 48%, transparent 74%);
  filter: blur(16px);
}
.fs-mascot-seat::after {
  content: ""; position: absolute; inset: 8%; border-radius: 50%; corner-shape: round;
  border: 1px solid rgba(150, 200, 255, 0.32);
  box-shadow: 0 0 20px rgba(90, 150, 255, 0.32), inset 0 0 16px rgba(90, 150, 255, 0.22);
  filter: blur(3px);
  pointer-events: none;
  animation: fs-halo-breathe 3.6s ease-in-out infinite;
}
@keyframes fs-halo-breathe {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.95; }
}
@media (prefers-reduced-motion: reduce) {
  .fs-mascot-seat::after { animation: fs-halo-breathe 3.6s ease-in-out infinite !important; }
}
.fs-mascot-seat [data-hdd-mascot] { padding: 0; flex: 0 0 auto; width: 100%; height: 100%; }
.fs-mascot-seat [data-hdd-mascot-stage] { width: min(190px, 100%); max-width: 190px; }
.fs-mascot-seat [data-hdd-mascot-mark] { inset: 14% !important; }
.fs-mascot-seat [data-hdd-mascot-stage]::before { display: none !important; }
.fs-mascot-seat [data-hdd-mascot-bloom] { animation: none !important; opacity: 0.7; inset: 6% !important; }
.fs-mascot-seat [data-hdd-mascot-mark] svg {
  display: block; width: 100%; height: 100%;
}
.fs-scan { display: none !important; }

.fs-pills { display: flex; align-items: center; gap: 8px; margin-right: 6px; }
.fs-diag {
  position: fixed; left: 300px; top: 58px; z-index: 9999;
  background: #7d1226; color: #fff; font: 11px/1.55 Consolas, monospace;
  padding: 8px 10px; border-radius: 4px; max-width: 760px; white-space: pre-wrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.fs-pill {
  display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 11px;
  border-radius: 13px; background: rgba(11, 22, 40, 0.9);
  border: 1px solid rgba(70, 110, 170, 0.35);
  color: #8fb0d0; font-size: 11px; letter-spacing: 0.02em; white-space: nowrap;
}
.fs-pill b { color: #cfe4ff; font-weight: 600; }
.fs-pill-alert { color: #ff9a9a; border-color: rgba(255, 90, 90, 0.35); }
.fs-pill-alert i { font-style: normal; color: #ff5a52; font-size: 9px; }
.fs-pill-idle { color: #8fb0d0; }
.fs-pill-idle i { font-style: normal; color: #4fd0a0; font-size: 9px; }

[class*="_triggerEffort"] { display: none !important; }



html[data-fairy-splash] [data-windows-menu] { display: none !important; }
.fs-splash { position: fixed; inset: 0; z-index: 99990; background: #04070d; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: default; }
.fs-splash video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fs-splash-img { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.4s ease; }
.fs-splash-mark { position: relative; width: 240px; height: 240px; z-index: 2;
  filter: drop-shadow(0 0 46px rgba(90, 150, 255, 0.65));
  will-change: transform;
  transition: transform 1.3s cubic-bezier(.4, 0, .2, 1); }
.fs-splash-mark svg { width: 100%; height: 100%; display: block; }
.fs-splash-shrink .fs-splash-mark { filter: none; }
.fs-splash-shrink .fs-splash-mark svg * { animation: none !important; }
.fs-splash-shrink .fs-splash-mark {
  transform: translate(calc(139px - 50vw), calc(50vh - 229px)) scale(0.78);
}
.fs-splash-text { position: absolute; left: 0; right: 0; top: calc(50% + 168px); text-align: center; z-index: 3;
  color: #dcecf8; font-size: 15px; line-height: 2.1; letter-spacing: .06em; text-shadow: 0 0 18px rgba(80, 140, 255, .45); }
.fs-splash-line { opacity: 0; animation: fs-splash-line .9s ease forwards; }
@keyframes fs-splash-line { from { opacity: 0; transform: translateY(6px); } to { opacity: .92; transform: none; } }
.fs-splash-shrink .fs-splash-text { opacity: 0; transition: opacity .4s ease; }
/* presented-file / edited-file cards: the shipped light card does not follow the dark tokens */
[data-presented-file="true"] {
  background: #0a1526 !important;
  border: 1px solid rgba(98, 140, 220, 0.18) !important;
  box-shadow: none !important;
  color: #cfe0f2 !important;
}
[data-presented-file="true"] * { color: #cfe0f2 !important; }
[data-presented-file="true"] [class*="_add"], [data-presented-file="true"] [class*="_added"] { color: #5fd0a0 !important; }
[data-presented-file="true"] [class*="_del"], [data-presented-file="true"] [class*="_removed"] { color: #ff8b8b !important; }
/* edited-file (diff) card from the dockit kit: its header ignores the dark tokens */
[class*="kuwlJq_header"] {
  background: #0a1526 !important;
  border-color: rgba(98, 140, 220, 0.16) !important;
  color: #cfe0f2 !important;
}
[class*="kuwlJq_root"], [class*="kuwlJq_body"] {
  background: #0a1526 !important;
  border-color: rgba(98, 140, 220, 0.16) !important;
  color: #cfe0f2 !important;
}
[class*="kuwlJq_"] { color: #cfe0f2 !important; }
.fs-tts {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  padding: 0; border: 0; border-radius: 6px; background: transparent;
  color: #8fb0d0; cursor: default; margin-right: 2px;
}
.fs-tts:hover { background: rgba(90, 140, 210, 0.16); color: #dbe9f8; }
.fs-tts-on { color: #7fd8ff; text-shadow: 0 0 8px rgba(127, 216, 255, 0.55); }

.fs-mic-wrap { position: relative; display: inline-flex; }
.fs-mic {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  padding: 0; border: 0; border-radius: 6px; background: transparent;
  color: #8fb0d0; cursor: default;
}
.fs-mic:hover { background: rgba(90, 140, 210, 0.16); color: #dbe9f8; }
.fs-mic-note {
  position: absolute; bottom: 34px; right: 0; white-space: nowrap;
  background: rgba(10, 20, 38, 0.96); border: 1px solid rgba(90, 140, 210, 0.35);
  border-radius: 6px; padding: 4px 8px; font-size: 10px; color: #cfe4ff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

/* the official voice-input activity control, restyled to the H.D.D. palette */
[class*="_triggerAnchor"] button,
[class*="_triggerAnchor"] [role="button"],
button[class*="_roundButton"] {
  width: 30px !important; height: 30px !important;
  border-radius: 6px !important; border: 0 !important;
  background: transparent !important; color: #8fb0d0 !important;
}
[class*="_triggerAnchor"] button:hover,
button[class*="_roundButton"]:hover {
  background: rgba(90, 140, 210, 0.16) !important; color: #dbe9f8 !important;
}
[class*="_waveform"] { color: #7fd8ff !important; }

.fs-topfade {
  position: fixed; top: 0; right: 0; width: 240px; height: 40px; pointer-events: none;
  background: linear-gradient(90deg, rgba(10, 12, 35, 0) 0%, rgba(10, 12, 35, 0.5) 25%, #0a0c23 43%, #0a0c23 100%);
}

.fs-foot {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px;
  border: 1px solid rgba(90, 140, 210, 0.28); border-radius: 10px;
  background: rgba(10, 20, 38, 0.8);
  font-family: var(--ds-font-family-code), Consolas, monospace;
  font-size: 9px; letter-spacing: 0.14em; color: #6f93b8; text-transform: uppercase;
}
.fs-foot i { font-style: normal; color: #4fd0a0; font-size: 8px; }

.fs-dock {
  display: flex; align-items: center; gap: 10px; padding: 2px 4px;
  font-family: var(--ds-font-family-code), Consolas, monospace; font-size: 10px;
  letter-spacing: 0.12em; color: #5f7f9b; text-transform: uppercase;
}
.fs-dock i { font-style: normal; color: #7fd8ff; }
.fs-dock .sep { width: 1px; height: 9px; background: rgba(126, 220, 255, 0.25); }

.fs-hero { display: flex; align-items: center; gap: 14px; }
.fs-hero .word {
  font-family: Montserrat, var(--dsw-font-family); font-weight: 800; font-style: italic;
  font-size: 28px; letter-spacing: 0.12em;
  background: linear-gradient(180deg, #ffffff 0%, #a9e2ff 48%, #3f66d0 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 14px rgba(80, 150, 255, 0.55));
}
.fs-hero .sub { font-size: 9px; letter-spacing: 0.34em; color: #5f88ad; }
`;

    /* the asset pack stops every mascot animation when the OS asks for reduced motion;
       the emblem is the point of this skin, so keep the motion (user's request). */
    const FORCE_MOTION_CSS = String.raw`
@media (prefers-reduced-motion: reduce) {
  [data-hdd-mascot] [data-hdd-mascot-band] { animation: hdd-mascot-slice 3.6s steps(1, end) infinite !important; }
  [data-hdd-mascot] [data-hdd-mascot-stage]::before { animation: hdd-mascot-ripple 3.4s ease-out infinite !important; }
  [data-hdd-mascot-bloom] { animation: hdd-mascot-bloom 3s ease-in-out infinite !important; }
  [data-hdd-mark-scope] #hddFairyCorners { animation: hdd-mascot-turn 3s linear infinite !important; }
  [data-hdd-mark-scope] #hddFairySclera { animation: hdd-mascot-sclera 1.5s ease-in-out infinite !important; }
  [data-hdd-mark-scope] #hddFairyIrisOuter { animation: hdd-mascot-iris-outer 1.5s ease-in-out infinite !important; }
  [data-hdd-mark-scope] #hddFairyIrisBlue,
  [data-hdd-mark-scope] #hddFairyHighlight { animation: hdd-mascot-iris-blue 1.5s ease-in-out infinite !important; }
  [data-hdd-mark-scope] #hddFairyPupil { animation: hdd-mascot-pupil 1.5s ease-in-out infinite !important; }
}
`;

    /* the emblem should rotate, not twitch: kill the glitch bands and every inner pulse */
    const QUIET_CSS = String.raw`
[data-hdd-mascot-band] { display: none !important; }
[data-hdd-mark-scope] #hddFairySclera,
[data-hdd-mark-scope] #hddFairyIrisOuter,
[data-hdd-mark-scope] #hddFairyIrisBlue,
[data-hdd-mark-scope] #hddFairyHighlight,
[data-hdd-mark-scope] #hddFairyPupil { animation: none !important; }
/* only the small corner marks turn; the eye and its white glow stay put */
.fs-mascot-seat [data-hdd-mascot-mark] * { animation: none !important; }
[data-hdd-mark-scope] #hddFairyCorners {
  transform-box: view-box;
  transform-origin: 80px 80px;
  animation: fs-corner-spin 14s linear infinite !important;
}
@keyframes fs-corner-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  [data-hdd-mark-scope] #hddFairyCorners { animation: fs-corner-spin 14s linear infinite !important; }
}
`;

    let startNewSession = () => {};

    let accountBalance = null;
    let accountUsed = 0;
    const balanceListeners = new Set();
    class FairyBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error) {
        try { console.error('[fairy] component failed', error); } catch (ignored) { /* ignore */ }
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    }
    const Safe = (Component) => function FairySafe(props) {
      return h(FairyBoundary, null, h(Component, props));
    };

    function setAccountBalance(value) {
      accountBalance = value;
      balanceListeners.forEach((fn) => fn());
    }
    function recordBalance(payload) {
      try {
        const list = Array.isArray(payload.value) ? payload.value : [payload.value];
        const wallet = list.find((w) => w && w.balance !== undefined);
        if (wallet) {
          const current = Number(wallet.balance);
          const key = 'fairy.balance.first';
          let first = Number(window.localStorage.getItem(key));
          if (!Number.isFinite(first) || first <= 0 || first < current) {
            first = current;
            window.localStorage.setItem(key, String(current));
          }
          accountUsed = Math.max(0, first - current);
        }
      } catch (error) {
        /* storage unavailable: keep the raw payload without a used figure */
      }
      setAccountBalance(payload);
    }
    function useAccountBalance() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        balanceListeners.add(force);
        return () => { balanceListeners.delete(force); };
      }, []);
      return accountBalance;
    }

    let presetProbe = '';
    const presetListeners = new Set();
    function setPresetProbe(text) {
      presetProbe = text;
      presetListeners.forEach((fn) => fn());
    }
    function usePresetProbe() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        presetListeners.add(force);
        return () => { presetListeners.delete(force); };
      }, []);
      return presetProbe;
    }

    function buildMascot(mount) {
      const root = document.createElement('div');
      root.setAttribute('data-hdd-mascot', 'true');
      root.setAttribute('data-rail', 'false');
      root.title = 'FAIRY Ⅲ';
      const stage = document.createElement('div');
      stage.setAttribute('data-hdd-mascot-stage', 'true');
      const bloom = document.createElement('span');
      bloom.setAttribute('data-hdd-mascot-bloom', 'true');
      const mark = document.createElement('div');
      mark.setAttribute('data-hdd-mascot-mark', 'true');
      mark.setAttribute('data-hdd-mark-scope', 'true');
      mark.innerHTML = VECTOR;
      stage.appendChild(bloom);
      stage.appendChild(mark);
      root.appendChild(stage);
      mount.appendChild(root);
      return root;
    }

    function Mascot() {
      const ref = React.useRef(null);
      React.useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const root = buildMascot(el);
        return () => { if (root.parentNode === el) el.removeChild(root); };
      }, []);
      return h('div', { className: 'fs-mascot-seat', 'aria-hidden': true, ref });
    }

    function Sigil() {
      return h('span', { className: 'fs-sigil', 'aria-hidden': true,
        dangerouslySetInnerHTML: { __html: VECTOR } });
    }

    function BrandText() {
      return h('div', { className: 'fs-brand' },
        h('span', { className: 'fs-brand-name' }, 'Fairy'),
        h('span', { className: 'fs-brand-sub' }, 'Ⅲ型总序式集成泛用人工智能'),
      );
    }

    function Hud() {
      return h('div', { className: 'fs-hud', 'aria-hidden': true },
        h('div', { className: 'fs-glow' }),
        h('div', { className: 'fs-grid' }),
        h('div', { className: 'fs-vignette' }),
        h('div', { className: 'fs-scan' }),
        h('div', { className: 'fs-topfade' }),
        h('div', { className: 'fs-mark' }, 'H.D.D. SYSTEM // ', h('b', null, 'FAIRY Ⅲ')),
        h('div', { className: 'fs-corner tl' }),
        h('div', { className: 'fs-corner tr' }),
        h('div', { className: 'fs-corner bl' }),
        h('div', { className: 'fs-corner br' }),
        h(Mascot, null),
        h('button', {
          className: 'fs-new', type: 'button', title: '新建会话',
          onClick: () => startNewSession(),
        }, '+'),
      );
    }

    function Pills(props) {
      let session;
      try {
        session = props.useSession ? props.useSession((s) => s) : undefined;
      } catch (e) {
        session = undefined;
      }
      const running = Boolean(session && session.running);
      const balance = useAccountBalance();
      let amountText = '--';
      let bonusText = '';
      if (balance && !balance.__error) {
        const list = Array.isArray(balance.value) ? balance.value : [balance.value];
        const wallet = list.find((w) => w && w.balance !== undefined) || list[0];
        if (wallet && wallet.balance !== undefined) {
          amountText = '\u00a5' + Number(wallet.balance).toFixed(2);
        }
        const bonuses = Array.isArray(balance.bonusWallets) ? balance.bonusWallets : [];
        const bonus = bonuses.reduce((sum, w) => sum + Number((w && w.balance) || 0), 0);
        if (bonus > 0) bonusText = '\u3000\u8d60\u9001 \u00a5' + bonus.toFixed(2);
      }
      const usedText = accountUsed >= 0.01 ? '\u3000\u672c\u6b21\u5df2\u7528 \u00a5' + accountUsed.toFixed(2) : '';
      return h('div', { className: 'fs-pills' },
        h('span', { className: 'fs-pill' }, '\u5269\u4f59\u7535\u8d39 ', h('b', null, amountText), bonusText, usedText),
        h('span', { className: 'fs-pill ' + (running ? 'fs-pill-alert' : 'fs-pill-idle') },
          h('i', null, '\u25cf'), running ? ' \u8fd0\u884c\u4e2d' : ' \u5f85\u547d'),
      );
    }
    /* ---------- voice reply (GPT-SoVITS on 127.0.0.1:9880) ---------- */
    const TTS_BASE = 'http://127.0.0.1:9890/tts';
    const TTS_REF_AUDIO = '__FAIRY_ROOT__/voice/ref/fairy_ref.wav';
    const TTS_PROMPT = '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';
    let ttsEnabled = window.localStorage.getItem('fairy.tts') !== '0';
    const ttsListeners = new Set();
    function runSplash() {
      try {
        // replay on every app launch, but not on a quick reload of the same window
        const last = Number(window.sessionStorage.getItem('fairy.boot.at') || 0);
        if (Number.isFinite(last) && Date.now() - last < 45000) return;
      } catch (error) { /* ignore */ }
      const root = document.createElement('div');
      root.className = 'fs-splash';
      const video = document.createElement('video');
      video.src = SPLASH_VIDEO;
      video.autoplay = true;
      video.playsInline = true;
      root.appendChild(video);
      document.documentElement.dataset.fairySplash = '1';
      document.body.appendChild(root);

      // pre-generate the greeting voice while the animation plays
      const variantIndex = Math.floor(Math.random() * SPLASH_VARIANTS.length);
      const greetingLines = SPLASH_VARIANTS[variantIndex];
      const greetingText = greetingLines.join('');
      const greetQuery = new URLSearchParams({
        text: greetingText,
        text_lang: 'zh',
        ref_audio_path: TTS_REF_AUDIO,
        prompt_text: TTS_PROMPT,
        prompt_lang: 'zh',
        media_type: 'wav',
        streaming_mode: 'false',
        text_split_method: 'cut5',
        speed_factor: '1.0',
      });
      const greetAudio = new Audio();
      greetAudio.preload = 'auto';
      greetAudio.src = ASSET_BASE + '/cache/greet_' + (variantIndex + 1) + '.wav';
      greetAudio.addEventListener('error', () => {
        greetAudio.src = TTS_BASE + '?' + greetQuery.toString();
      }, { once: true });

      let finished = false;
      let shrinking = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        delete document.documentElement.dataset.fairySplash;
        try { window.sessionStorage.setItem('fairy.boot.at', String(Date.now())); } catch (error) { /* ignore */ }
        greetAudio.pause();
        root.remove();
      };
      const shrink = () => {
        if (finished || shrinking) return;
        shrinking = true;
        root.className = 'fs-splash fs-splash-shrink';
        setTimeout(finish, 1500);
      };
      const greet = () => {
        if (finished || shrinking || root.dataset.phase === 'greet') return;
        root.dataset.phase = 'greet';
        video.remove();
        const image = document.createElement('div');
        image.className = 'fs-splash-img';
        image.style.backgroundImage = 'url("' + SPLASH_IMAGE + '")';
        root.appendChild(image);
        const mark = document.createElement('div');
        mark.className = 'fs-splash-mark';
        mark.innerHTML = VECTOR;
        root.appendChild(mark);
        const text = document.createElement('div');
        text.className = 'fs-splash-text';
        greetingLines.forEach((line, index) => {
          const row = document.createElement('div');
          row.className = 'fs-splash-line';
          row.style.animationDelay = (0.35 + index * 0.55) + 's';
          row.textContent = line;
          text.appendChild(row);
        });
        root.appendChild(text);
        requestAnimationFrame(() => { image.style.opacity = '0.55'; });
        const played = greetAudio.play();
        if (played && played.catch) played.catch(() => {});
        const wait = () => {
          const duration = Number.isFinite(greetAudio.duration) && greetAudio.duration > 0
            ? greetAudio.duration * 1000
            : 6200;
          return Math.min(16000, Math.max(5200, duration + 900));
        };
        setTimeout(shrink, wait());
      };

      video.addEventListener('ended', greet);
      video.addEventListener('error', greet);
      root.addEventListener('click', finish);
      const timer = setTimeout(greet, 20000);
      root.addEventListener('remove', () => clearTimeout(timer));
      const play = video.play();
      if (play && play.catch) {
        play.catch(() => {
          video.muted = true;
          const retry = video.play();
          if (retry && retry.catch) retry.catch(() => {});
        });
      }
    }
    function Mic() {
      const [note, setNote] = React.useState(false);
      const [official, setOfficial] = React.useState(false);
      React.useEffect(() => {
        const check = () => {
          const found = document.querySelector('[class*="_triggerAnchor"], [class*="_waveform"]');
          setOfficial(Boolean(found));
        };
        check();
        const mo = new MutationObserver(check);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => mo.disconnect();
      }, []);
      React.useEffect(() => {
        if (!note) return undefined;
        const t = setTimeout(() => setNote(false), 2400);
        return () => clearTimeout(t);
      }, [note]);
      if (official) return null;
      return h('span', { className: 'fs-mic-wrap' },
        h('button', {
          className: 'fs-mic', type: 'button', title: '语音输入',
          onClick: () => setNote(true),
        },
          h('svg', {
            width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
            stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
          },
            h('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3 }),
            h('path', { d: 'M5 11a7 7 0 0 0 14 0' }),
            h('line', { x1: 12, y1: 18, x2: 12, y2: 21 }),
          )),
        note ? h('span', { className: 'fs-mic-note' }, '语音输入未启用 · 需要 SenseVoice 插件') : null,
      );
    }

    /* model control: database glyph + the catalog name, badges hidden */
    function ModelBadge(props) {
      const model = props && props.model;
      const label = (model && (model.name || model.displayName || model.id)) || '';
      const dbg = Object.keys(props || {}).join('|') + ' >> ' + JSON.stringify(model || null).slice(0, 60);
      const icon = h('svg', {
        width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, style: { display: 'block', opacity: 0.85, flex: 'none' },
      },
        h('ellipse', { cx: 10.5, cy: 5.5, rx: 6.8, ry: 2.8 }),
        h('path', { d: 'M3.7 5.5v6.2c0 1.5 3 2.7 6.8 2.7' }),
        h('path', { d: 'M3.7 11.7v6.2c0 1.5 3 2.7 6.8 2.7h1.2' }),
        h('path', { d: 'M17.3 5.5v4.1' }),
        h('circle', { cx: 17.4, cy: 17.2, r: 2.1 }),
        h('path', { d: 'M17.4 14.2v-1.1M17.4 21.3v-1.1M14.4 17.2h-1.1M21.5 17.2h-1.1' }),
      );
      if (props && props.placement !== 'trigger' && label) return h('span', null, label);
      return icon;
    }
    function PresetInfo() {
      const text = usePresetProbe();
      if (true) return null;
      if (!text) return null;
      return h('div', {
        style: {
          position: 'fixed', left: 300, top: 480, zIndex: 9999, maxWidth: 900,
          background: 'rgba(120, 20, 40, 0.95)', color: '#fff', padding: '8px 10px',
          borderRadius: 4, font: '11px/1.5 Consolas, monospace', whiteSpace: 'pre-wrap',
        },
      }, text);
    }

    /* the dockit file cards hardcode a light surface; repaint them inline so no specificity fight */
    function repaintLightSurfaces() {
      document.querySelectorAll('*').forEach((el) => {
        const bg = getComputedStyle(el).backgroundColor;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return;
        const [r, g, b] = [+m[1], +m[2], +m[3]];
        if (r < 215 || g < 215 || b < 215) return;
        if (el.clientWidth < 200 || el.clientHeight < 24) return;
        el.style.setProperty('background', '#0a1526', 'important');
        el.style.setProperty('background-color', '#0a1526', 'important');
        el.style.setProperty('background-image', 'none', 'important');
        el.style.setProperty('border-color', 'rgba(98, 140, 220, 0.16)', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
      });
    }
    function watchLightSurfaces() {
      let timer;
      const run = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { try { repaintLightSurfaces(); } catch (error) { /* ignore */ } }, 350);
      };
      run();
      const observer = new MutationObserver(run);
      observer.observe(document.body, { childList: true, subtree: true });
      const until = Date.now() + 120000;
      const tick = setInterval(() => {
        run();
        if (Date.now() > until) { clearInterval(tick); observer.disconnect(); }
      }, 900);
    }
    let domProbe = '';
    const domListeners = new Set();
    function setDomProbe(text) { domProbe = text; domListeners.forEach((fn) => fn()); }
    function useDomProbe() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => { domListeners.add(force); return () => { domListeners.delete(force); }; }, []);
      return domProbe;
    }
    function DomProbe() {
      const text = useDomProbe();
      if (!text) return null;
      return h('pre', {
        style: { position: 'fixed', left: 250, top: 150, zIndex: 9999, maxWidth: 1100, margin: 0,
          background: 'rgba(20,80,40,.96)', color: '#eaffef', padding: '8px 10px',
          fontSize: 9, lineHeight: 1.45, whiteSpace: 'pre-wrap', borderRadius: 4 },
      }, text);
    }
    function runDomProbe() {
      const el = document.querySelector('[class*="kuwlJq"]');
      if (!el) { setDomProbe('no ku node'); return; }
      setDomProbe(el.outerHTML.replace(/\s+/g, ' ').slice(0, 900));
    }
    function FooterStatus() {
      return h('div', { className: 'fs-foot', title: 'H.D.D. LINK' },
        h('i', null, '\u25cf'),
        h('span', null, 'H.D.D.'),
      );
    }

    function HeroMark() {
      return h('div', { className: 'fs-hero' },
        h('span', { className: 'word' }, 'H.D.D.'),
        h('span', { className: 'sub' }, 'SYSTEM'),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.inject(['uiWorkspace'], (scope) => {
          startNewSession = () => {
            try {
              scope.uiWorkspace.startSession();
            } catch (error) {
              /* the shell keeps the current view when a new session cannot start */
            }
          };
        });

        ctx.inject(['remote', 'remote.account', 'locale'], (scope) => {
          let stopped = false;
          const load = async () => {
            try {
              const res = await scope.remote.account.getBalance({
                version: '0.2.1-rc.2',
                locale: scope.locale.getSnapshot().active,
                timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
              });
              if (stopped) return;
              if (res && res.ok) recordBalance(res.value);
              else setAccountBalance({ __error: 'not-ok: ' + JSON.stringify(res && res.error).slice(0, 60) });
            } catch (error) {
              setAccountBalance({ __error: 'throw: ' + String((error && error.message) || error).slice(0, 80) });
            }
          };
          load();
          const timer = setInterval(load, 120000);
          scope.effect(() => () => { stopped = true; clearInterval(timer); });
        });

        ctx.inject(['remote', 'remote.agentPresets', 'locale'], (scope) => {
          const meta = () => ({
            version: '0.2.1-rc.2',
            locale: scope.locale.getSnapshot().active,
            timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
          });
          const load = async () => {
            try {
              const res = await scope.remote.agentPresets.list();
              if (res && res.ok) {
                const value = res.value;
                const list = Array.isArray(value) ? value : (value && value.presets) || [];
                const fairy = list.find((p) => p && p.id === 'fairy');
                setPresetProbe(fairy
                  ? JSON.stringify(fairy, null, 1)
                  : 'no fairy; ids=' + list.map((p) => p && p.id).join(','));
              } else {
                setPresetProbe('list not-ok: ' + JSON.stringify(res).slice(0, 220));
              }
            } catch (error) {
              setPresetProbe('throw: ' + String((error && error.message) || error).slice(0, 220));
            }
          };
          load();
        });

        window.setTimeout(() => {
          try { runSplash(); } catch (error) { console.error('[fairy] splash failed', error); }
        }, 400);
        window.setTimeout(() => { try { watchLightSurfaces(); } catch (error) { /* ignore */ } }, 1500);


        ctx.effect(() => {
          const el = document.createElement('style');
          el.id = 'fairy-skin-css';
          el.textContent = SKIN_CSS + '\n' + MASCOT_CSS + '\n' + FORCE_MOTION_CSS + '\n' + QUIET_CSS;
          document.head.appendChild(el);
          return () => el.remove();
        }, 'fairy-skin: styles');
        const reg = (slot, id, comp) => {
          try {
            ctx.slots.inject(slot, () => ctx.slots.register({ name: slot, id, priority: -10 }, Safe(comp)));
          } catch (error) {
            try { console.error('[fairy] slot failed', slot, error); } catch (ignored) { /* ignore */ }
          }
        };
        reg('sidebar.brand.mark', 'fairy-sigil', Sigil);
        reg('sidebar.brand.name', 'fairy-brand', BrandText);
        reg('conversation.hero.brand.mark', 'fairy-hero', HeroMark);
        reg('conversation.input.model.label', 'fairy-model-badge', ModelBadge);
        try {
          ctx.slots.inject('shell.overlay', () => ctx.slots.register(
            { name: 'shell.overlay', id: 'fairy-hud', order: 5 }, Safe(Hud)));
        } catch (error) {
          try { console.error('[fairy] slot failed', 'shell.overlay', error); } catch (ignored) { /* ignore */ }
        }
        try {
          ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
            { name: 'sidebar.footer.action', id: 'fairy-foot', order: 5 }, Safe(FooterStatus)));
        } catch (error) {
          try { console.error('[fairy] slot failed', 'sidebar.footer.action', error); } catch (ignored) { /* ignore */ }
        }
        try {
          ctx.slots.inject('conversation.input.right', () => ctx.slots.register(
            { name: 'conversation.input.right', id: 'fairy-pills', order: 5 }, Safe(Pills)));
        } catch (error) {
          try { console.error('[fairy] slot failed', 'conversation.input.right', error); } catch (ignored) { /* ignore */ }
        }
        try {
          ctx.slots.inject('conversation.input.right', () => ctx.slots.register(
            { name: 'conversation.input.right', id: 'fairy-mic', order: 6 }, Safe(Mic)));
        } catch (error) {
          try { console.error('[fairy] slot failed', 'conversation.input.right', error); } catch (ignored) { /* ignore */ }
        }

        try {
          ctx.slots.inject('shell.overlay', () => ctx.slots.register(
            { name: 'shell.overlay', id: 'fairy-preset-info', order: 97 }, Safe(PresetInfo)));
        } catch (error) {
          try { console.error('[fairy] slot failed', 'shell.overlay', error); } catch (ignored) { /* ignore */ }
        }
      },
    };
  },
});




































































