/*
 * AC Tactical HUD v1.1.0
 * StreamElements Custom Widget
 * Event routing and restart-safe Web Animations timeline.
 */

"use strict";

const hud = {
  alert: document.querySelector(".ac-alert"),
  header: document.querySelector(".alert-header"),
  message: document.querySelector(".alert-message"),
  logo: document.querySelector(".ac-logo"),
  logoRing: document.querySelector(".ac-logo-ring"),
  logoFlash: document.querySelector(".ac-logo-flash"),
  divider: document.querySelector(".ac-divider-glow"),
  footer: document.querySelector(".ac-footer"),
  online: document.querySelector(".ac-online"),
  eventCode: document.querySelector(".ac-event-code"),
  scan: document.querySelector(".ac-scan"),
  progress: document.querySelector(".ac-progress-fill"),
  charge: document.querySelector(".ac-progress-charge"),
  segments: [...document.querySelectorAll(".ac-segments span")],
  corners: [...document.querySelectorAll(".ac-corner")]
};

const timeline = {
  generation: 0,
  animations: new Set(),
  timers: new Set()
};

const timings = {
  panel: 0,
  frame: 130,
  logo: 260,
  header: 520,
  username: 735,
  scan: 900,
  divider: 1180,
  footer: 1400,
  progress: 1580,
  online: 2440,
  hide: 6500
};

window.addEventListener("onEventReceived", ({ detail = {} }) => {
  const listener = detail.listener;
  const data = detail.event || {};
  const name = data.name || data.sender || "New Raider";
  const amount = Math.max(1, Number(data.amount) || 1);

  const events = {
    "follower-latest": () => showAlert("NEW RAIDER", `Welcome aboard, ${user(name)}!`, "follow", "FLW-001"),
    "subscriber-gifted-latest": () => showAlert("SUPPLY DROP", `${user(name)} deployed ${amount} supply drop${plural(amount)}!`, "gift", "GFT-001"),
    "raid-latest": () => showAlert("REINFORCEMENTS ARRIVED", `${user(name)} arrived with ${amount} raider${plural(amount)}!`, "raid", "RAD-001"),
    "tip-latest": () => showAlert("MISSION SUPPORT", `${user(name)} supported the mission!`, "tip", "TIP-001"),
    "cheer-latest": () => showAlert("INTEL RECEIVED", `${user(name)} sent ${amount} bits!`, "bits", "BIT-001")
  };

  if (listener === "subscriber-latest") {
    if (data.bulkGifted || data.gifted) {
      const gifter = data.sender || name;
      showAlert("SUPPLY DROP", `${user(gifter)} deployed ${amount} supply drop${plural(amount)}!`, "gift", "GFT-001");
    } else {
      showAlert("CREW MEMBER", `${user(name)} joined the crew!`, "sub", "SUB-001");
    }
    return;
  }

  events[listener]?.();
});

function plural(amount) {
  return amount === 1 ? "" : "s";
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value);
  return node.innerHTML;
}

function user(name) {
  return `<span id="username">${escapeHtml(name)}</span>`;
}

function showAlert(header, message, type, code) {
  stopTimeline();
  hud.alert.dataset.type = type;
  hud.header.textContent = header;
  hud.message.innerHTML = message;
  hud.eventCode.textContent = code;
  resetHud();
  playTimeline(type, timeline.generation);
}

function stopTimeline() {
  timeline.generation += 1;
  timeline.timers.forEach(clearTimeout);
  timeline.timers.clear();
  timeline.animations.forEach((animation) => animation.cancel());
  timeline.animations.clear();
}

function later(callback, delay, generation) {
  const timer = setTimeout(() => {
    timeline.timers.delete(timer);
    if (generation === timeline.generation) callback();
  }, delay);
  timeline.timers.add(timer);
}

function animate(element, keyframes, options) {
  if (!element) return null;
  const animation = element.animate(keyframes, options);
  timeline.animations.add(animation);
  const release = () => timeline.animations.delete(animation);
  animation.addEventListener("finish", release, { once: true });
  animation.addEventListener("cancel", release, { once: true });
  return animation;
}

function resetHud() {
  hud.online.classList.remove("is-online");
  hud.alert.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());

  setStyles(hud.alert, { opacity: "0", transform: "translate3d(0,-12px,0) scale(.985)" });
  setStyles(hud.header, { opacity: "0", transform: "translate3d(0,8px,0)" });
  setStyles(hud.message, { opacity: "0", transform: "translate3d(0,8px,0)" });
  setStyles(hud.logo, { opacity: "0", transform: "scale(.82)", filter: "brightness(.65)" });
  setStyles(hud.logoRing, { opacity: "0", transform: "scale(.72) rotate(-20deg)" });
  setStyles(hud.logoFlash, { opacity: "0", transform: "scale(.4)" });
  setStyles(hud.divider, { transform: "translate3d(-120%,0,0)" });
  setStyles(hud.footer, { opacity: "0", transform: "translate3d(0,5px,0)" });
  setStyles(hud.eventCode, { opacity: "0" });
  setStyles(hud.scan, { opacity: "0", transform: "translate3d(-190%,0,0) skewX(-16deg)" });
  setStyles(hud.progress, { transform: "scaleX(0)", filter: "brightness(1)" });
  setStyles(hud.charge, { opacity: "0", transform: "translate3d(-100%,0,0)" });

  hud.segments.forEach((segment) => setStyles(segment, { opacity: "0", transform: "scaleX(0)" }));
  hud.corners.forEach((corner) => setStyles(corner, {
    opacity: "0",
    transform: cornerStart(corner)
  }));
}

function setStyles(element, styles) {
  Object.assign(element.style, styles);
}

function cornerStart(corner) {
  if (corner.classList.contains("ac-corner-tl")) return "translate3d(12px,12px,0)";
  if (corner.classList.contains("ac-corner-tr")) return "translate3d(-12px,12px,0)";
  if (corner.classList.contains("ac-corner-bl")) return "translate3d(12px,-12px,0)";
  return "translate3d(-12px,-12px,0)";
}

function playTimeline(type, generation) {
  const urgent = type === "raid" || type === "gift";
  const username = hud.message.querySelector("#username");

  animate(hud.alert, [
    { opacity: 0, transform: "translate3d(0,-12px,0) scale(.985)" },
    { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
  ], motion(430, timings.panel, "cubic-bezier(.2,.75,.2,1)"));

  hud.segments.forEach((segment, index) => {
    const direction = segment.closest(".ac-segments-left") ? 18 : -18;
    animate(segment, [
      { opacity: 0, transform: `translate3d(${direction}px,0,0) scaleX(0)` },
      { opacity: 1, transform: "translate3d(0,0,0) scaleX(1)" }
    ], motion(500, timings.frame + index * 45, "cubic-bezier(.2,.8,.2,1)"));
  });

  hud.corners.forEach((corner) => animate(corner, [
    { opacity: 0, transform: cornerStart(corner) },
    { opacity: 1, transform: "translate3d(0,0,0)" }
  ], motion(400, timings.frame + 100, "cubic-bezier(.2,.85,.25,1)")));

  animate(hud.logoRing, [
    { opacity: 0, transform: "scale(.72) rotate(-20deg)" },
    { opacity: 1, transform: "scale(1.06) rotate(4deg)", offset: 0.78 },
    { opacity: 1, transform: "scale(1) rotate(0deg)" }
  ], motion(560, timings.logo, "cubic-bezier(.2,.85,.25,1)"));

  animate(hud.logo, [
    { opacity: 0, transform: "scale(.82)", filter: "brightness(.65)" },
    { opacity: 1, transform: "scale(1.06)", filter: "brightness(2.1)", offset: 0.78 },
    { opacity: 1, transform: "scale(1)", filter: "brightness(1)" }
  ], motion(510, timings.logo + 60, "cubic-bezier(.18,.85,.25,1)"));

  animate(hud.logoFlash, [
    { opacity: 0, transform: "scale(.4)" },
    { opacity: 0.9, transform: "scale(1.15)", offset: 0.35 },
    { opacity: 0, transform: "scale(1.7)" }
  ], motion(190, timings.header - 15, "ease-out"));

  reveal(hud.header, timings.header, 410, "11px", "7px");
  reveal(hud.message, timings.username, 390);

  // One uninterrupted, compositor-friendly scanner pass across the full panel.
  animate(hud.scan, [
    { opacity: 0, transform: "translate3d(-190%,0,0) skewX(-16deg)" },
    { opacity: urgent ? 0.58 : 0.34, offset: 0.08 },
    { opacity: urgent ? 0.48 : 0.28, offset: 0.9 },
    { opacity: 0, transform: "translate3d(690%,0,0) skewX(-16deg)" }
  ], motion(1500, timings.scan, "linear"));

  flash(hud.header, timings.scan + 190, urgent ? 2.25 : 1.8);
  flash(username, timings.scan + 410, urgent ? 2.5 : 2.05);

  animate(hud.divider, [
    { transform: "translate3d(-120%,0,0)" },
    { transform: "translate3d(465%,0,0)" }
  ], motion(720, timings.divider, "cubic-bezier(.2,.7,.25,1)"));

  reveal(hud.footer, timings.footer, 340);

  // The bright charge head and fill share timing, making the scanner appear to energize the bar.
  animate(hud.progress, [
    { transform: "scaleX(0)", filter: "brightness(1)" },
    { filter: "brightness(1.8)", offset: 0.2 },
    { transform: "scaleX(1)", filter: "brightness(1)" }
  ], motion(820, timings.progress, "cubic-bezier(.18,.72,.2,1)"));

  animate(hud.charge, [
    { opacity: 0, transform: "translate3d(-100%,0,0)" },
    { opacity: 1, offset: 0.08 },
    { opacity: 1, offset: 0.86 },
    { opacity: 0, transform: "translate3d(1080%,0,0)" }
  ], motion(820, timings.progress, "cubic-bezier(.18,.72,.2,1)"));

  animate(hud.eventCode, [{ opacity: 0 }, { opacity: 1 }], motion(280, timings.progress + 530, "ease-out"));

  later(() => hud.online.classList.add("is-online"), timings.online, generation);

  if (urgent) {
    animate(hud.alert, [
      { boxShadow: "0 22px 60px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.09)" },
      { boxShadow: "0 22px 60px rgba(0,0,0,.72), 0 0 24px rgba(184,50,57,.35), inset 0 0 24px rgba(184,50,57,.1)" },
      { boxShadow: "0 22px 60px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.09)" }
    ], motion(type === "raid" ? 900 : 560, timings.online + 80, "ease-in-out"));
  }

  later(() => {
    hud.online.classList.remove("is-online");
    animate(hud.alert, [
      { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
      { opacity: 0, transform: "translate3d(0,8px,0) scale(.99)" }
    ], motion(500, 0, "ease-in"));
  }, timings.hide, generation);
}

function motion(duration, delay, easing) {
  return { duration, delay, easing, fill: "forwards" };
}

function reveal(element, delay, duration, fromSpacing, toSpacing) {
  const first = { opacity: 0, transform: "translate3d(0,8px,0)" };
  const last = { opacity: 1, transform: "translate3d(0,0,0)" };
  if (fromSpacing) first.letterSpacing = fromSpacing;
  if (toSpacing) last.letterSpacing = toSpacing;
  animate(element, [first, last], motion(duration, delay, "cubic-bezier(.2,.75,.2,1)"));
}

function flash(element, delay, brightness) {
  animate(element, [
    { filter: "brightness(1)", textShadow: "0 0 0 rgba(255,255,255,0)" },
    { filter: `brightness(${brightness})`, textShadow: "0 0 12px rgba(225,235,245,.7)", offset: 0.45 },
    { filter: "brightness(1)", textShadow: "0 0 0 rgba(255,255,255,0)" }
  ], motion(300, delay, "ease-out"));
}

