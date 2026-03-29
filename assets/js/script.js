const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

/* =========================
   CONFIG — ВКАЖИ СВОЇ ДАНІ
   ========================= */
// Telegram username (без @)
const TEACHER_TG = "lvivenglishteacher"; // <- заміни на свій, якщо інший

// Viber номер у міжнародному форматі
const TEACHER_VIBER_NUMBER = "+380000000000"; // <- заміни на свій номер

/* =========================
   Mobile drawer
   ========================= */
const burger = $("#burger");
const drawer = $("#drawer");

function setDrawer(open){
  drawer.style.display = open ? "block" : "none";
  burger.textContent = open ? "✕" : "☰";
  burger.setAttribute("aria-expanded", String(open));
}

burger?.addEventListener("click", () => {
  const isOpen = drawer.style.display === "block";
  setDrawer(!isOpen);
});

$$("#drawer a").forEach(a => a.addEventListener("click", () => setDrawer(false)));

/* =========================
   Smooth scroll with fixed header offset
   ========================= */
const header = $(".header");
function scrollToHash(hash){
  const el = document.querySelector(hash);
  if(!el) return;
  const headerH = header?.offsetHeight ?? 0;
  const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
  window.scrollTo({ top, behavior: "smooth" });
}

$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if(href && href.length > 1){
      e.preventDefault();
      history.replaceState(null, "", href);
      scrollToHash(href);
    }
  });
});

window.addEventListener("load", () => {
  if(location.hash) scrollToHash(location.hash);
});

/* =========================
   Scroll spy
   ========================= */
const sections = ["#forwho","#method","#video","#pricing","#reviews","#faq","#contact"]
  .map(id => document.querySelector(id))
  .filter(Boolean);

const navLinks = $$("#navlinks a");

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = "#" + entry.target.id;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });

sections.forEach(s => io.observe(s));

/* =========================
   Theme editor
   ========================= */
const themeBtn = $("#themeBtn");
const themePanel = $("#themePanel");
const closeTheme = $("#closeTheme");

const bgColor = $("#bgColor");
const accentColor = $("#accentColor");
const accent2Color = $("#accent2Color");
const radius = $("#radius");

const saveTheme = $("#saveTheme");
const resetTheme = $("#resetTheme");

const THEME_KEY = "landing_theme_v1";

function applyTheme(t){
  if(!t) return;
  document.documentElement.style.setProperty("--bg", t.bg);
  document.documentElement.style.setProperty("--accent", t.accent);
  document.documentElement.style.setProperty("--accent-2", t.accent2);
  document.documentElement.style.setProperty("--radius", t.radius + "px");
  document.documentElement.style.setProperty("--btn-bg", `linear-gradient(135deg, ${t.accent}, ${t.accent2})`);

  bgColor.value = t.bg;
  accentColor.value = t.accent;
  accent2Color.value = t.accent2;
  radius.value = t.radius;
}

function getCurrentTheme(){
  return {
    bg: bgColor.value,
    accent: accentColor.value,
    accent2: accent2Color.value,
    radius: Number(radius.value || 18),
  };
}

function loadTheme(){
  try{
    const raw = localStorage.getItem(THEME_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{ return null; }
}

function openTheme(open){
  themePanel.classList.toggle("open", open);
}

themeBtn?.addEventListener("click", () => openTheme(true));
closeTheme?.addEventListener("click", () => openTheme(false));

[bgColor, accentColor, accent2Color, radius].forEach(inp => {
  inp?.addEventListener("input", () => applyTheme(getCurrentTheme()));
});

saveTheme?.addEventListener("click", () => {
  const t = getCurrentTheme();
  localStorage.setItem(THEME_KEY, JSON.stringify(t));
  openTheme(false);
});

resetTheme?.addEventListener("click", () => {
  localStorage.removeItem(THEME_KEY);
  applyTheme({ bg:"#0b1220", accent:"#7c5cff", accent2:"#35d0ff", radius:18 });
});

const saved = loadTheme();
if(saved) applyTheme(saved);

/* =========================
   FORM: Telegram/Viber redirect
   ========================= */

function normalizeTelegram(input){
  let v = (input || "").trim();
  if(!v) return "";

  // allow full links
  if(v.includes("t.me/")) {
    // Extract username after t.me/
    const m = v.match(/t\.me\/([A-Za-z0-9_]+)/);
    return m ? m[1] : v;
  }

  // remove leading @
  v = v.replace(/^@+/, "");

  // basic sanitize
  v = v.replace(/[^A-Za-z0-9_]/g, "");
  return v;
}

function normalizePhone(input){
  let v = (input || "").trim();
  if(!v) return "";

  // keep digits and plus
  v = v.replace(/[^\d+]/g, "");

  // if starts with 00 -> +
  if(v.startsWith("00")) v = "+" + v.slice(2);

  // ensure leading +
  if(!v.startsWith("+")) v = "+" + v.replace(/\+/g, "");

  return v;
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch{
    return false;
  }
}

const form = $("#leadForm");
const hint = $("#formHint");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = ($("#name")?.value || "").trim();
  const tgRaw = ($("#telegram")?.value || "").trim();
  const viberRaw = ($("#viber")?.value || "").trim();

  const tgUser = normalizeTelegram(tgRaw);
  const viberNum = normalizePhone(viberRaw);

  if(!name){
    alert("Будь ласка, введи ім’я.");
    return;
  }
  if(!tgUser && !viberNum){
    alert("Будь ласка, заповни Telegram або Viber.");
    return;
  }

  const message =
`Привіт! Мене звати ${name} 😊
Хочу записатися на урок.

Мій Telegram: ${tgUser ? "@" + tgUser : "—"}
Мій Viber: ${viberNum || "—"}`;

  // Priority: Telegram if filled, else Viber
  if(tgUser){
    // Open Telegram chat to teacher with prefilled text
    const url = `https://t.me/${encodeURIComponent(TEACHER_TG)}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
    hint.textContent = "Відкриваю Telegram…";
    return;
  }

  // Viber (no reliable prefill). Open chat and copy message.
  const teacherViber = normalizePhone(TEACHER_VIBER_NUMBER);
  if(!teacherViber || teacherViber === "+"){
    alert("Потрібно налаштувати номер Viber викладача у script.js (TEACHER_VIBER_NUMBER).");
    return;
  }

  const copied = await copyToClipboard(message);
  const viberLink = `viber://chat?number=${encodeURIComponent(teacherViber)}`;

  // Try open Viber app
  window.location.href = viberLink;

  if(copied){
    hint.textContent = "Відкриваю Viber… Текст заявки скопійовано — просто встав у чат.";
  }else{
    hint.textContent = "Відкриваю Viber… Якщо треба — скопіюй текст заявки вручну.";
    alert("Текст заявки:\n\n" + message);
  }
});

/* Close panels on Esc */
window.addEventListener("keydown", (e) => {
  if(e.key === "Escape"){
    openTheme(false);
    setDrawer(false);
  }
});