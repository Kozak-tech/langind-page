# Landing Page (HTML/CSS/JS)

Це односторінковий лендінг (scroll landing) для вчителя англійської.

## Структура
- `index.html` — розмітка
- `assets/css/style.css` — стилі
- `assets/js/script.js` — логіка (scroll, меню, theme editor)
- `assets/video/promo.mp4` — промо-відео
- `assets/img/*` — зображення
- `assets/icons/favicon.ico` — favicon

## Як запустити локально
Просто відкрий `index.html` у браузері.

## Як вставити відео
Поклади файл `promo.mp4` у `assets/video/` і переконайся, що в `index.html` є:
```html
<source src="assets/video/promo.mp4" type="video/mp4" />

##Запис на урок
ВАЖЛИВО: у script.js треба вказати твої контакти:

TEACHER_TG = "lvivenglishteacher" (або твій username)
TEACHER_VIBER_NUMBER = "+380..." (твій номер для Viber)