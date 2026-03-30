const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

// --- CONFIG ---
const TEACHER_TG = "LvivEnglishTeacher"; // Ваш аккаунт

/* Mobile drawer */
const burger = $("#burger");
const drawer = $("#drawer");
function setDrawer(open){
  drawer.style.display = open ? "block" : "none";
  burger.textContent = open ? "✕" : "☰";
}
burger?.addEventListener("click", () => setDrawer(drawer.style.display !== "block"));
$$("#drawer a").forEach(a => a.addEventListener("click", () => setDrawer(false)));

/* Smooth scroll */
const header = $(".header");
function scrollToHash(hash){
  const el = document.querySelector(hash);
  if(!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - (header?.offsetHeight || 0) - 10;
  window.scrollTo({ top, behavior: "smooth" });
}
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if(href && href.length > 1){
      e.preventDefault();
      scrollToHash(href);
    }
  });
});

/* Telegram Logic */
function cleanTelegramInput(input){
  let v = (input || "").trim();
  // Якщо це посилання, дістаємо юзернейм
  if(v.includes("t.me/")) {
    const m = v.match(/t\.me\/([A-Za-z0-9_]+)/);
    return m ? m[1] : v;
  }
  // Прибираємо @ на початку, якщо є
  v = v.replace(/^@+/, "");
  return v;
}

const form = $("#leadForm");
const hint = $("#formHint");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = ($("#name").value || "").trim();
  const tgData = cleanTelegramInput($("#telegram").value);

  if(!name || !tgData){
    alert("Будь ласка, заповніть усі поля.");
    return;
  }

  const message = `Привіт! Мене звати ${name} 😊\nХочу записатися на урок.\nМій контакт: ${tgData}`;
  const url = `https://t.me/${TEACHER_TG}?text=${encodeURIComponent(message)}`;
  
  hint.textContent = "Переспрямовую у Telegram...";
  setTimeout(() => {
    window.open(url, "_blank");
    hint.textContent = "Готово! Надішліть повідомлення у чаті.";
  }, 600);
});
