// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
const TELEGRAM_CHAT_ID   = "YOUR_CHAT_ID_HERE";
const TEACHER_TG_USER    = "LvivEnglishTeacher";

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentQuestion = 0;
let score = 0;
let userName = "";
let userContact = "";
let answers = [];

if (document.getElementById("year")) {
  document.getElementById("year").textContent = new Date().getFullYear();
}

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const screens = {
  welcome: document.getElementById("screen-welcome"),
  quiz:    document.getElementById("screen-quiz"),
  result:  document.getElementById("screen-result"),
};

function showScreen(name) {
  Object.keys(screens).forEach(key => {
    if(screens[key]) screens[key].classList.remove("active");
  });
  if(screens[name]) screens[name].classList.add("active");
}

// ─── WELCOME SCREEN LOGIC ─────────────────────────────────────────────────────
const btnStart = document.getElementById("btn-start");
if (btnStart) {
  btnStart.addEventListener("click", () => {
    const nameInput    = document.getElementById("input-name");
    const contactInput = document.getElementById("input-contact");

    userName    = nameInput.value.trim();
    userContact = contactInput.value.trim();

    if (!userName || !userContact) {
      if (nameInput && !nameInput.value.trim()) nameInput.classList.add("error");
      if (contactInput && !contactInput.value.trim()) contactInput.classList.add("error");
      return;
    }

    if (nameInput) nameInput.classList.remove("error");
    if (contactInput) contactInput.classList.remove("error");
    
    startQuiz();
  });
}

["input-name", "input-contact"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", function() {
      this.classList.remove("error");
    });
  }
});

// ─── QUIZ LOGIC ───────────────────────────────────────────────────────────────
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  answers = [];
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q         = questions[currentQuestion];
  const total     = questions.length;
  const progress  = (currentQuestion / total) * 100;

  const counterEl = document.getElementById("q-counter");
  const badgeEl = document.getElementById("q-level-badge");
  const textEl = document.getElementById("q-text");
  const barEl = document.getElementById("progress-bar");

  if (counterEl) counterEl.textContent = `${currentQuestion + 1} / ${total}`;
  if (badgeEl) badgeEl.textContent = q.level;
  if (textEl) textEl.textContent = q.text;
  if (barEl) barEl.style.width = progress + "%";

  const optionsContainer = document.getElementById("options-container");
  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    const labels = ["A", "B", "C", "D"];
    
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn-custom";
      btn.innerHTML = `<span class="option-label-custom">${labels[i]}</span><span class="option-text-custom">${opt}</span>`;
      btn.addEventListener("click", () => selectAnswer(i, btn));
      optionsContainer.appendChild(btn);
    });
  }

  const card = document.getElementById("question-card");
  if (card) {
    card.classList.remove("slide-in");
    void card.offsetWidth;
    card.classList.add("slide-in");
  }
}

function selectAnswer(chosenIndex, btn) {
  const q = questions[currentQuestion];

  document.querySelectorAll(".option-btn-custom").forEach(b => b.disabled = true);

  const allBtns = document.querySelectorAll(".option-btn-custom");
  if (allBtns[q.correct]) allBtns[q.correct].classList.add("correct");

  if (chosenIndex === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("incorrect");
  }

  answers.push({ question: currentQuestion, chosen: chosenIndex, correct: q.correct });

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      renderQuestion();
    } else {
      showResultScreen();
    }
  }, 700);
}

function showResultScreen() {
  const barEl = document.getElementById("progress-bar");
  if (barEl) barEl.style.width = "100%";
  showScreen("result");
}

const btnReveal = document.getElementById("btn-reveal");
if (btnReveal) {
  btnReveal.addEventListener("click", async () => {
    btnReveal.disabled = true;
    btnReveal.innerHTML = '<span class="spinner-custom"></span> Надсилання результатів...';

    const level = calculateLevel(score);

    await sendToTelegram(level);

    const emojiEl = document.getElementById("result-emoji");
    const codeEl = document.getElementById("result-code");
    const nameEl = document.getElementById("result-name");
    const scoreEl = document.getElementById("result-score");
    const contentEl = document.getElementById("result-content");

    if (emojiEl) emojiEl.textContent  = level.emoji;
    if (codeEl) codeEl.textContent   = level.code;
    if (nameEl) nameEl.textContent   = level.name;
    if (scoreEl) scoreEl.textContent  = `${score} / ${questions.length} правильних відповідей`;

    if (contentEl) contentEl.classList.add("visible");
    btnReveal.style.display = "none";
    
    // Автоматичний редірект в чат репетитора з доданим полем "Контакти" відповідно до вашого шаблону
    setTimeout(() => {
      const percentage = Math.round((score / questions.length) * 100);
      const tgMsg = `Привіт! Я пройшов тест на визначення рівня англійської мови.\n\n` +
                    `👤 Ім'я: ${userName}\n` +
                    `📱 Контакти: ${userContact}\n` +
                    `📊 Результат: ${score}/${questions.length} (${percentage}%)\n` +
                    `🎯 Орієнтовний рівень: ${level.code} (${level.name})`;
      window.open(`https://t.me/${TEACHER_TG_USER}?text=${encodeURIComponent(tgMsg)}`, "_blank");
    }, 3000);
  });
}

async function sendToTelegram(level) {
  const percentage = Math.round((score / questions.length) * 100);
  
  // 📈 Підрахунок статистики по рівнях (Варіант А: Глибока аналітика)
  const levelStats = {};
  questions.forEach(q => {
    if (!levelStats[q.level]) {
      levelStats[q.level] = { correct: 0, total: 0 };
    }
    levelStats[q.level].total++;
  });
  
  answers.forEach(ans => {
    const q = questions[ans.question];
    if (q && ans.chosen === ans.correct) {
      if (levelStats[q.level]) {
        levelStats[q.level].correct++;
      }
    }
  });

  const getRating = (stat) => {
    if (!stat || stat.total === 0) return "Немає даних";
    const pct = (stat.correct / stat.total) * 100;
    if (pct === 100) return "Відмінно";
    if (pct >= 75) return "Добре";
    if (pct >= 40) return "Задовільно";
    if (pct > 0) return "Є прогалини";
    return "Зарано";
  };

  // 🔗 Автоматичне форматування клікабельного посилання на Telegram користувача
  let contactFormatted = userContact;
  let cleanContact = userContact.trim().replace(/^@+/, "");
  if (cleanContact.includes("t.me/")) {
    const m = cleanContact.match(/t\.me\/([A-Za-z0-9_]+)/);
    if (m) {
      contactFormatted = `<a href="https://t.me/${m[1]}">@${m[1]}</a>`;
    }
  } else if (/^[A-Za-z0-9_]{5,32}$/.test(cleanContact)) {
    contactFormatted = `<a href="https://t.me/${cleanContact}">@${cleanContact}</a>`;
  }

  // 📝 Збирання блоку деталізації по рівнях з емодзі
  const icons = { A1: "🌱", A2: "🌿", B1: "🌟", B2: "⭐", C1: "🔥", C2: "⚡" };
  let detailsText = "";
  Object.keys(levelStats).sort().forEach(lvl => {
    const icon = icons[lvl] || "📝";
    const stat = levelStats[lvl];
    detailsText += `${icon} Рівень ${lvl}: ${stat.correct} із ${stat.total} (${getRating(stat)})\n`;
  });

  // Новий розширений формат повідомлення для вашого Телеграм-бота (Варіант А)
  const message = `
<b>📊 НОВИЙ РЕЗУЛЬТАТ ТЕСТУВАННЯ 📊</b>
────────────────────────
👤 <b>Студент:</b> ${userName}
📱 <b>Контакт:</b> ${contactFormatted}
────────────────────────
📈 <b>Загальний результат:</b> ${score}/${questions.length} (${percentage}%)
🎯 <b>Орієнтовний рівень:</b> ${level.code} (${level.name})
────────────────────────
📝 <b>Деталізація по рівнях:</b>
${detailsText.trim()}
  `.trim();

  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID_HERE") {
    console.log("Telegram not configured yet.");
    return;
  }

  try {
    await fetch(
      "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML"
        })
      }
    );
  } catch (err) {
    console.error("Failed to send to Telegram:", err);
  }
}

const btnRestart = document.getElementById("btn-restart");
if (btnRestart) {
  btnRestart.addEventListener("click", () => {
    const contentEl = document.getElementById("result-content");
    if (contentEl) contentEl.classList.remove("visible");
    if (btnReveal) {
      btnReveal.style.display = "";
      btnReveal.disabled = false;
      btnReveal.textContent = "Дізнатися результат →";
    }
    showScreen("welcome");
  });
}
