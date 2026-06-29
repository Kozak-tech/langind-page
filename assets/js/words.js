// ─── CONFIG SUPABASE ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lnrfpdddnakbkvcxxjgb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmZwZGRkbmFrYmt2Y3h4amdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTA0ODEsImV4cCI6MjA5NTYyNjQ4MX0.RcTFo2_Dh_Sfo4SuuPHXDODiec9eTrwT6oZKwjnwaN8";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── СТАН ДОДАТКУ ─────────────────────────────────────────────────────────────
let userWords = []; // Картки, які зараз на вивченні (status === 'learning')
let currentCardIndex = 0;
let currentSetId = null;
let currentUserId = null;
let currentAudio = null; // Для контролю програвання аудіофайлів з Dictionary API

// ─── ЕЛЕМЕНТИ DOM ─────────────────────────────────────────────────────────────
const authSection = document.getElementById('auth-section');
const platformSection = document.getElementById('platform-section');
const setsSidebar = document.getElementById('sets-sidebar');
const authError = document.getElementById('auth-error');
const userDisplay = document.getElementById('user-display');

const tabCardsBtn = document.getElementById('tab-cards-btn');
const tabImportBtn = document.getElementById('tab-import-btn');
const tabDictionaryBtn = document.getElementById('tab-dictionary-btn');

const tabCards = document.getElementById('tab-cards');
const tabImport = document.getElementById('tab-import');
const tabDictionary = document.getElementById('tab-dictionary');

const setsListEl = document.getElementById('sets-list');
const btnAddSet = document.getElementById('btn-add-set');
const currentSetTitleEl = document.getElementById('current-set-title');

const dictionaryTbody = document.getElementById('dictionary-tbody');
const dictEmptyMsg = document.getElementById('dict-empty-msg');

// ─── СИСТЕМА ОЗВУЧУВАННЯ СЛІВ (AUDIO & TTS) ───────────────────────────────────

// 1. Озвучування англійською (Жива мова носіїв з Dictionary API + фоллбек на TTS)
async function speakEnglish(word) {
  if (!word) return;

  // Зупиняємо системне мовлення та попередні аудіофайли перед новим відтворенням
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  try {
    const cleanWord = word.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    
    if (!response.ok) throw new Error("Слово не знайдено в словниковому API");
    
    const data = await response.json();
    
    // Шукаємо робоче mp3-посилання у масиві фонетики
    let audioUrl = "";
    if (data && data[0] && data[0].phonetics) {
      const phoneticWithAudio = data[0].phonetics.find(p => p.audio && p.audio.trim() !== "");
      if (phoneticWithAudio) {
        audioUrl = phoneticWithAudio.audio;
      }
    }

    if (audioUrl) {
      currentAudio = new Audio(audioUrl);
      await currentAudio.play();
    } else {
      // Якщо у базі словника немає звуку для цього слова — вмикаємо системний TTS
      speakEnglishFallback(word);
    }
  } catch (error) {
    console.warn("Словникове API недоступне або слово рідкісне. Фоллбек на Web Speech API:", error.message);
    speakEnglishFallback(word);
  }
}

// Запасний варіант для англійської (Web Speech API)
function speakEnglishFallback(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Трохи повільніше для кращого сприйняття студентами
  window.speechSynthesis.speak(utterance);
}

// 2. Озвучування українською (Через Google Translate TTS для стабільної роботи на всіх пристроях)
function speakUkrainian(text) {
  if (!text) return;

  // Зупиняємо попередні аудіопотоки та системне мовлення
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Формуємо прямий URL до Google Translate TTS API для української мови (tl=uk)
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uk&client=tw-ob&q=${encodeURIComponent(text)}`;
  
  currentAudio = new Audio(url);
  currentAudio.play().catch(err => console.error("Помилка відтворення українського аудіо:", err));
}


// ─── 1. АВТОРИЗАЦІЯ ───────────────────────────────────────────────────────────
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    const emailEl = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    
    if (!emailEl || !passwordEl) {
      alert("Помилка: Елементи форми входу не знайдені в HTML!");
      return;
    }

    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();
    
    if (authError) authError.classList.add('hidden');

    if (!email || !password) {
      showAuthError("Будь ласка, заповніть усі поля.");
      return;
    }

    btnLogin.textContent = "Вхід...";
    btnLogin.disabled = true;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    btnLogin.textContent = "Увійти →";
    btnLogin.disabled = false;

    if (error) {
      showAuthError("Невірний логін або пароль. Спробуйте ще раз.");
      console.error("Помилка автентифікації:", error.message);
    } else {
      initPlatform(data.user);
    }
  });
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.reload();
  });
}

function showAuthError(msg) {
  if (authError) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
  } else {
    alert(msg);
  }
}

async function checkUserSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    initPlatform(session.user);
  }
}
checkUserSession();

async function initPlatform(user) {
  currentUserId = user.id;
  if (userDisplay) userDisplay.textContent = `Студент: ${user.email}`;
  if (authSection) authSection.classList.add('hidden');
  if (platformSection) platformSection.classList.remove('hidden');
  if (setsSidebar) setsSidebar.classList.remove('hidden');
  
  await loadWordSets();
}

// ─── 2. КЕРУВАННЯ СЕТАМИ (WORD SETS) ──────────────────────────────────────────
async function loadWordSets() {
  if (!currentUserId || !setsListEl) return;
  
  // Додано фільтр .eq('user_id', currentUserId) щоб завантажувати тільки сети поточного студента
  const { data, error } = await supabaseClient
    .from('word_sets')
    .select('*')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Помилка завантаження сетів:", error.message);
    return;
  }

  setsListEl.innerHTML = '';
  
  if (!data || data.length === 0) {
    setsListEl.innerHTML = '<p style="font-size:0.85rem; color:var(--muted); padding:10px 0;">У вас немає створених сетів.</p>';
    return;
  }

  data.forEach(set => {
    const setItem = document.createElement('div');
    setItem.className = `set-item ${currentSetId === set.id ? 'active' : ''}`;
    
    setItem.innerHTML = `
      <input type="text" class="set-editable-input" value="${set.title}" data-id="${set.id}" />
      <button class="btn-delete-set" data-id="${set.id}">🗑️</button>
    `;

    setItem.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && !e.target.classList.contains('btn-delete-set')) {
        selectSet(set.id, set.title);
      }
    });

    const inputEl = setItem.querySelector('.set-editable-input');
    if (inputEl) {
      inputEl.addEventListener('blur', () => updateSetTitle(set.id, inputEl.value));
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') inputEl.blur();
      });
    }

    const deleteBtn = setItem.querySelector('.btn-delete-set');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteWordSet(set.id, set.title);
      });
    }

    setsListEl.appendChild(setItem);
  });
}

if (btnAddSet) {
  btnAddSet.addEventListener('click', async () => {
    if (!currentUserId) return;
    
    const count = setsListEl ? setsListEl.querySelectorAll('.set-item').length + 1 : 1;
    const defaultTitle = "Новий сет " + count;
    
    const { data, error } = await supabaseClient
      .from('word_sets')
      .insert([{ user_id: currentUserId, title: defaultTitle }])
      .select();

    if (!error && data && data.length > 0) {
      await loadWordSets();
      selectSet(data[0].id, data[0].title);
    } else {
      alert("Помилка при створенні сету: " + (error ? error.message : "невідома помилка"));
    }
  });
}

async function updateSetTitle(setId, newTitle) {
  if (!newTitle.trim()) return;
  const { error } = await supabaseClient
    .from('word_sets')
    .update({ title: newTitle.trim() })
    .eq('id', setId);

  if (!error && currentSetId === setId) {
    if (currentSetTitleEl) currentSetTitleEl.textContent = newTitle.trim();
  }
}

async function deleteWordSet(setId, title) {
  if (!confirm(`Ви впевнені, що хочете видалити сет "${title}" разом з усіма його словами?`)) return;

  const { error } = await supabaseClient
    .from('word_sets')
    .delete()
    .eq('id', setId);

  if (!error) {
    if (currentSetId === setId) {
      currentSetId = null;
      if (currentSetTitleEl) currentSetTitleEl.textContent = "Оберіть сет зліва";
      userWords = [];
      renderCard();
    }
    await loadWordSets();
  } else {
    alert("Помилка при видаленні сету: " + error.message);
  }
}

function selectSet(setId, title) {
  currentSetId = setId;
  if (currentSetTitleEl) currentSetTitleEl.textContent = title;
  
  if (setsListEl) {
    const items = setsListEl.querySelectorAll('.set-item');
    items.forEach(item => {
      const input = item.querySelector('.set-editable-input');
      if (input && input.getAttribute('data-id') === setId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  if (tabCardsBtn && tabCardsBtn.classList.contains('active')) {
    loadUserWords();
  } else if (tabDictionaryBtn && tabDictionaryBtn.classList.contains('active')) {
    loadDictionary();
  } else {
    loadUserWords(); 
  }
}

// ─── 3. ЗАВАНТАЖЕННЯ СЛІВ ДЛЯ ОБРАНОГО СЕТУ (РЕЖИМ ВИВЧЕННЯ) ─────────────────
async function loadUserWords() {
  if (!currentSetId || !currentUserId) return;

  // Додано фільтр .eq('user_id', currentUserId) для ізоляції слів студента
  const { data, error } = await supabaseClient
    .from('student_words')
    .select('*')
    .eq('set_id', currentSetId)
    .eq('user_id', currentUserId)
    .eq('status', 'learning')
    .order('created_at', { ascending: false });

  if (!error) {
    userWords = data || [];
    currentCardIndex = 0;
    renderCard();
  }
}

// ─── 4. РОБОТА З КАРТКАМИ ТА СВАЙПИ ──────────────────────────────────────────
const flashcardElement = document.getElementById('flashcard-element');

let startX = 0;
let currentX = 0;
let isMoving = false;

if (flashcardElement) {
  flashcardElement.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    currentX = e.touches[0].clientX;
    isMoving = true;
  }, { passive: true });

  flashcardElement.addEventListener('touchmove', (e) => {
    if (!isMoving) return;
    currentX = e.touches[0].clientX;
  }, { passive: true });

  flashcardElement.addEventListener('touchend', () => {
    if (!isMoving) return;
    isMoving = false;
    processGesture();
  });

  flashcardElement.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    currentX = e.clientX;
    isMoving = true;
    e.preventDefault(); 
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMoving) return;
    currentX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    if (!isMoving) return;
    isMoving = false;
    processGesture();
  });
}

function processGesture() {
  const diffX = currentX - startX;
  const threshold = 60; 

  if (Math.abs(diffX) > threshold) {
    if (diffX < 0) {
      handleNextCard(); 
    } else {
      goToPrevCard(); 
    }
  } else {
    if (flashcardElement) {
      flashcardElement.classList.toggle('flipped');
      
      // 🔥 АВТОВІДТВОРЕННЯ ПРИ КЛІКУ / ПЕРЕВЕРТАННІ КАРТКИ НА ІНШУ СТОРОНУ
      const isFlipped = flashcardElement.classList.contains('flipped');
      if (userWords.length > 0 && userWords[currentCardIndex]) {
        if (isFlipped) {
          speakUkrainian(userWords[currentCardIndex].translation);
        } else {
          speakEnglish(userWords[currentCardIndex].word);
        }
      }
    }
  }
  startX = 0;
  currentX = 0;
}

function handleNextCard() {
  if (userWords.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % userWords.length;
  renderCard();
}

function goToPrevCard() {
  if (userWords.length === 0) return;
  currentCardIndex = (currentCardIndex - 1 + userWords.length) % userWords.length;
  renderCard();
}

async function handleMarkAsLearned() {
  if (userWords.length === 0) return;
  
  const currentWord = userWords[currentCardIndex];
  
  const { error } = await supabaseClient
    .from('student_words')
    .update({ status: 'learned' })
    .eq('id', currentWord.id);

  if (error) {
    console.error("Помилка збереження прогресу слова:", error.message);
    alert("Не вдалося зберегти статус слова в базі даних.");
    return;
  }

  userWords.splice(currentCardIndex, 1);

  if (currentCardIndex >= userWords.length) {
    currentCardIndex = 0;
  }

  renderCard();
}

const btnNext = document.getElementById('btn-next');
if (btnNext) btnNext.addEventListener('click', handleNextCard);

const btnPrev = document.getElementById('btn-prev');
if (btnPrev) btnPrev.addEventListener('click', goToPrevCard);

const btnLearned = document.getElementById('btn-learned');
if (btnLearned) btnLearned.addEventListener('click', handleMarkAsLearned);

function renderCard() {
  const gameWrapper = document.getElementById('cards-game-wrapper');
  const noWordsMsg = document.getElementById('no-words-msg');
  const noWordsText = document.getElementById('no-words-text');
  
  if (flashcardElement) flashcardElement.classList.remove('flipped');

  if (!currentSetId) {
    if (gameWrapper) gameWrapper.classList.add('hidden');
    if (noWordsMsg) noWordsMsg.classList.remove('hidden');
    if (noWordsText) noWordsText.textContent = "Будь ласка, оберіть або створить сет зліва 🌱";
    return;
  }

  if (userWords.length === 0) {
    if (gameWrapper) gameWrapper.classList.add('hidden');
    if (noWordsMsg) noWordsMsg.classList.remove('hidden');
    if (noWordsText) noWordsText.textContent = "У цьому сеті немає слів для вивчення. Перейдіть у вкладку 'Імпорт списку', щоб додати слова! 🚀";
    return;
  }

  if (gameWrapper) gameWrapper.classList.remove('hidden');
  if (noWordsMsg) noWordsMsg.classList.add('hidden');

  const counterEl = document.getElementById('card-counter');
  if (counterEl) counterEl.textContent = `Слово ${currentCardIndex + 1} з ${userWords.length}`;
  
  setTimeout(() => {
    const wordEnEl = document.getElementById('word-en');
    const wordUaEl = document.getElementById('word-ua');
    if (wordEnEl) wordEnEl.textContent = userWords[currentCardIndex].word;
    if (wordUaEl) wordUaEl.textContent = userWords[currentCardIndex].translation;

    // 🔥 АВТОВІДТВОРЕННЯ АНГЛІЙСЬКОГО СЛОВА ПРИ ПЕРЕХОДІ ВПЕРЕД / НАЗАД
    speakEnglish(userWords[currentCardIndex].word);
  }, 150);
}

// ─── 5. ПЕРЕМИКАННЯ ВКЛАДОК (ВКЛЮЧАЮЧИ МІЙ СЛОВНИК) ───────────────────────────
if (tabCardsBtn && tabImportBtn && tabDictionaryBtn && tabCards && tabImport && tabDictionary) {
  
  tabCardsBtn.addEventListener('click', () => {
    tabCardsBtn.classList.add('active');
    tabImportBtn.classList.remove('active');
    tabDictionaryBtn.classList.remove('active');
    
    tabCards.classList.remove('hidden');
    tabImport.classList.add('hidden');
    tabDictionary.classList.add('hidden');
    
    loadUserWords();
  });

  tabImportBtn.addEventListener('click', () => {
    if (!currentSetId) {
      alert("Спочатку оберіть або створіть сет зліва!");
      return;
    }
    tabImportBtn.classList.add('active');
    tabCardsBtn.classList.remove('active');
    tabDictionaryBtn.classList.remove('active');
    
    tabImport.classList.remove('hidden');
    tabCards.classList.add('hidden');
    tabDictionary.classList.add('hidden');
  });

  tabDictionaryBtn.addEventListener('click', () => {
    if (!currentSetId) {
      alert("Спочатку оберіть або створить сет зліва!");
      return;
    }
    tabDictionaryBtn.classList.add('active');
    tabCardsBtn.classList.remove('active');
    tabImportBtn.classList.remove('active');
    
    tabDictionary.classList.remove('hidden');
    tabCards.classList.add('hidden');
    tabImport.classList.add('hidden');
    
    loadDictionary();
  });
}

// ─── 6. ЛОГІКА ТАБЛИЦІ «МІЙ СЛОВНИК» (ЗАВАНТАЖЕННЯ ТА ВИДАЛЕННЯ СЛІВ) ──────────
async function loadDictionary() {
  if (!currentSetId || !dictionaryTbody || !currentUserId) return;

  dictionaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--muted);">Завантаження словника...</td></tr>';
  if (dictEmptyMsg) dictEmptyMsg.classList.add('hidden');

  // Додано фільтр .eq('user_id', currentUserId) для завантаження слів саме цього студента
  const { data, error } = await supabaseClient
    .from('student_words')
    .select('*')
    .eq('set_id', currentSetId)
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Помилка завантаження словника:", error.message);
    dictionaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#ff4a4a;">Не вдалося завантажити дані.</td></tr>';
    return;
  }

  dictionaryTbody.innerHTML = '';

  if (!data || data.length === 0) {
    if (dictEmptyMsg) dictEmptyMsg.classList.remove('hidden');
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    
    const isLearned = item.status === 'learned';
    const badgeBg = isLearned ? 'rgba(46, 196, 182, 0.15)' : 'rgba(255, 159, 28, 0.15)';
    const badgeColor = isLearned ? '#2ec4b6' : '#ff9f1c';
    const badgeText = isLearned ? 'Вивчено' : 'Вчу';

    tr.innerHTML = `
      <td style="font-weight: 600;">${item.word}</td>
      <td style="color: var(--muted);">${item.translation}</td>
      <td>
        <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; border: 1px solid ${badgeColor}44; display: inline-block;">
          ${badgeText}
        </span>
      </td>
      <td style="text-align: center;">
        <button class="btn-delete-single-word" data-id="${item.id}" style="background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.6; transition: opacity 0.2s;">🗑️</button>
      </td>
    `;

    const deleteBtn = tr.querySelector('.btn-delete-single-word');
    if (deleteBtn) {
      deleteBtn.addEventListener('mouseover', () => deleteBtn.style.opacity = '1');
      deleteBtn.addEventListener('mouseout', () => deleteBtn.style.opacity = '0.6');
      deleteBtn.addEventListener('click', () => deleteStudentWord(item.id, item.word));
    }

    dictionaryTbody.appendChild(tr);
  });
}

async function deleteStudentWord(wordId, wordText) {
  if (!confirm(`Ви впевнені, що хочете видалити слово "${wordText}" з цього сету?`)) return;

  const { error } = await supabaseClient
    .from('student_words')
    .delete()
    .eq('id', wordId);

  if (!error) {
    await loadDictionary();
    const { data } = await supabaseClient
      .from('student_words')
      .select('*')
      .eq('set_id', currentSetId)
      .eq('user_id', currentUserId) // Додано фільтр при перечитці стану після видалення
      .eq('status', 'learning')
      .order('created_at', { ascending: false });
    if (data) userWords = data;
  } else {
    alert("Помилка при видаленні слова: " + error.message);
  }
}

// ─── 7. ІМПОРТ СЛІВ З СУВОРОЮ ПЕРЕВІРКОЮ ФОРМАТУ ТА СЕТУ ───────────────────────
const btnSubmitImport = document.getElementById('btn-submit-import');
if (btnSubmitImport) {
  btnSubmitImport.addEventListener('click', async () => {
    const importTextEl = document.getElementById('import-text');
    if (!importTextEl) return;

    if (!currentSetId) {
      alert("Помилка: Сет не обрано! Будь ласка, виберіть тему у лівій панелі перед завантаженням слів.");
      return;
    }
    
    const text = importTextEl.value;
    if (!text.trim()) {
      alert("Будь ласка, введіть хоча б одне слово.");
      return;
    }

    const lines = text.split(/[\r\n]+/);
    const wordsToInsert = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return; 
      
      let parts = cleanLine.split(/ [-–—] /); 
      if (parts.length !== 2) {
        parts = cleanLine.split('-');
      }

      if (parts.length === 2) {
        const word = parts[0].trim();
        const translation = parts[1].trim();
        
        if (word && translation) {
          wordsToInsert.push({
            user_id: currentUserId,
            set_id: currentSetId, 
            word: word,
            translation: translation,
            status: 'learning'
          });
        }
      }
    });

    if (wordsToInsert.length === 0) {
      alert("Не вдалося розпізнати слова. Перевірте формат. Кожен рядок має бути у вигляді: Слово - Переклад");
      return;
    }

    const { error } = await supabaseClient.from('student_words').insert(wordsToInsert);

    if (error) {
      console.error("Supabase Import Error:", error);
      alert(`Помилка бази даних при збереженні слів:\n${error.message}`);
    } else {
      alert(`Успішно імпортовано слів: ${wordsToInsert.length}!`);
      importTextEl.value = '';
      if (tabDictionaryBtn) {
        tabDictionaryBtn.click(); 
      }
    }
  });
}