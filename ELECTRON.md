# 🔌 Electron Integration Documentation

## Что такое Electron?

**Electron** — это фреймворк, который позволяет создавать нативные десктопные приложения (Windows, macOS, Linux), используя веб-технологии (JavaScript, HTML, CSS). По сути, он объединяет **Chromium** (для отображения интерфейса) и **Node.js** (для работы с файловой системой и ОС) в один исполняемый файл.

## 🏗️ Архитектура в проекте

В нашем проекте используется современная связка **Vite + Vue 3 + Electron**.

### Основные процессы

1. **Main Process (`electron/main.ts`)**:
    * Это "бэкенд" вашего десктопного приложения.
    * Запускается в среде Node.js.
    * Отвечает за создание окон, системные меню, работу с файловой системой, автообновления и взаимодействие с ОС.
    * В нашем случае он создает главное окно и загружает туда наше Vue приложение.

2. **Renderer Process (Ваше Vue приложение)**:
    * Это "фронтенд".
    * Отображает интерфейс (Vue компоненты, TailwindCSS).
    * Работает почти как обычный веб-сайт, но с возможностью общаться с Main Process.

3. **Preload Script (`electron/preload.ts`)**:
    * "Мостик" между Main и Renderer процессами.
    * Выполняется перед загрузкой веб-страницы.
    * Безопасно предоставляет доступ к API Node.js для фронтенда через `contextBridge`.
    * Мы экспонируем объект `window.ipcRenderer` для отправки сообщений.

## 📂 Структура файлов

```
/
├── electron/
│   ├── main.ts        # Точка входа Main Process
│   └── preload.ts     # Скрипт предварительной загрузки (IPC)
├── dist-electron/     # Скомпилированные файлы Electron (генерируется авто)
├── electron-builder.json # Конфигурация сборщика (иконки, имена, платформы)
└── vite.config.ts     # Настройка плагинов vite-plugin-electron
```

## 🚀 Запуск и Разработка

### Режим разработки (Dev)

Команда запускает Vite сервер и открывает окно Electron. Поддерживается Hot Module Replacement (HMR) как для Vue, так и перезагрузка для Electron процессов.

```bash
pnpm dev
```

### Сборка (Build)

Эта команда выполняет полный цикл: проверяет типы, собирает Vue приложение, компилирует Electron скрипты и упаковывает всё в установщик (dmg, exe, AppImage).

```bash
pnpm build:electron
```

Результаты сборки будут в папке `release/`.

## 📡 Взаимодействие (IPC)

Для общения между Vue (Renderer) и Electron (Main) используется IPC (Inter-Process Communication).

**Пример:**

1. **В Vue компоненте (отправка):**

    ```typescript
    // Отправить сообщение в Main процесс
    window.ipcRenderer.send('my-channel', { data: 123 });
    
    // Слушать ответ
    window.ipcRenderer.on('reply-channel', (event, arg) => {
      console.log(arg);
    });
    ```

2. **В `electron/main.ts` (обработка):**

    ```typescript
    import { ipcMain } from 'electron';

    ipcMain.on('my-channel', (event, arg) => {
      console.log('Получено:', arg);
      // Отправить ответ обратно
      event.reply('reply-channel', 'pong');
    });
    ```

## 🛠️ Конфигурация сборщика

Файл `electron-builder.json` управляет настройками установщика. Здесь вы можете изменить:

* `appId`: Уникальный ID приложения (важно для подписи кода и обновлений).
* `productName`: Имя приложения, видимое пользователю.
* `mac`, `win`, `linux`: Настройки специфичные для платформ (иконки, категории).
