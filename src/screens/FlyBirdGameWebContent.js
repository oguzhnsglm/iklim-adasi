const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flappy Bird ++</title>
  <style>
    :root {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color-scheme: light dark;
    }

    body {
      margin: 0;
      background: var(--bg, linear-gradient(180deg, #4ec0ca 0%, #ffffff 100%));
      color: var(--fg, #0b1d2a);
      height: 100vh;
    }

    .app {
      display: grid;
      grid-template-rows: auto 1fr;
      grid-template-columns: 3fr minmax(280px, 1fr);
      gap: 1rem;
      padding: 1rem;
      height: 100%;
      box-sizing: border-box;
      transition: background 0.4s ease, color 0.4s ease;
    }

    .hud {
      grid-column: 1 / 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .hud__scores {
      display: flex;
      gap: 1rem;
    }

    .hud__score {
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 0.75rem;
      border-radius: 0.75rem;
      backdrop-filter: blur(8px);
    }

    .hud__score .label {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .hud__score .value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .hud__actions {
      display: flex;
      gap: 0.5rem;
    }

    .canvas-wrapper {
      position: relative;
      grid-row: 2 / 3;
      grid-column: 1 / 2;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
      overflow: hidden;
    }

    canvas {
      max-width: min(100%, 480px);
      width: 100%;
      height: auto;
      background: transparent;
    }

    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      transform: translateZ(0);
      justify-content: center;
      align-items: center;
      background: rgba(10, 10, 10, 0.45);
      backdrop-filter: blur(4px);
      transition: opacity 0.3s ease;
    }

    .overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .overlay__content {
      text-align: center;
      background: rgba(255, 255, 255, 0.85);
      color: #042539;
      padding: 2rem;
      border-radius: 1.5rem;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.35);
      min-width: 18rem;
    }

    .btn {
      border: none;
      border-radius: 0.75rem;
      padding: 0.65rem 1.1rem;
      font-weight: 600;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.2);
      color: inherit;
      transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .btn.primary {
      background: linear-gradient(135deg, #ffb347, #ffcc33);
      color: #041019;
    }

    .btn.large {
      font-size: 1.15rem;
      padding: 0.75rem 1.5rem;
    }

    .btn.full-width {
      width: 100%;
    }

    .panel {
      grid-row: 1 / 3;
      grid-column: 2 / 3;
      background: rgba(255, 255, 255, 0.85);
      color: #042539;
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.25);
      overflow-y: auto;
      max-height: 100%;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .panel.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateX(10%);
    }

    .panel h2 {
      margin-top: 0;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .field.checkbox {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }

    fieldset {
      border: 1px solid rgba(4, 37, 57, 0.2);
      border-radius: 1rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    legend {
      padding: 0 0.5rem;
      font-weight: 600;
    }

    input,
    select {
      border: 1px solid rgba(4, 37, 57, 0.25);
      border-radius: 0.75rem;
      padding: 0.6rem;
      font: inherit;
      background: rgba(255, 255, 255, 0.8);
    }

    .leaderboard {
      margin-bottom: 1.5rem;
    }

    .leaderboard ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .leaderboard li {
      margin-bottom: 0.5rem;
    }

    .debug-overlay {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: rgba(0, 0, 0, 0.55);
      color: #e4f6ff;
      padding: 0.5rem 0.75rem;
      font-family: 'Fira Code', monospace;
      border-radius: 0.75rem;
      font-size: 0.75rem;
      line-height: 1.35;
      pointer-events: none;
    }

    .debug-overlay.hidden {
      display: none;
    }

    @media (max-width: 960px) {
      .app {
        grid-template-columns: 1fr;
      }

      .panel {
        grid-row: auto;
        grid-column: 1 / 2;
        position: fixed;
        inset: 1rem;
        z-index: 5;
      }
    }

    @media (max-width: 600px) {
      body {
        background: #042539;
      }

      .app {
        gap: 0.75rem;
        padding: 0.75rem;
      }

      .hud {
        flex-direction: column;
        align-items: stretch;
      }

      .hud__actions {
        justify-content: space-between;
      }
    }

    .app[data-theme='classic'] {
      --bg: linear-gradient(180deg, #4ec0ca 0%, #ffffff 90%);
      --fg: #042539;
    }

    .app[data-theme='neon'] {
      --bg: linear-gradient(200deg, #010018 0%, #120247 35%, #fb00ff 100%);
      --fg: #e9f9ff;
    }

    .app[data-theme='dark'] {
      --bg: linear-gradient(180deg, #0f0f10 0%, #1f2933 100%);
      --fg: #f7f9fb;
    }
  </style>
</head>
<body>
  <main class="app" data-theme="classic">
    <header class="hud">
      <div class="hud__scores">
        <div class="hud__score">
          <span class="label">Skor</span>
          <span id="scoreValue" class="value">0</span>
        </div>
        <div class="hud__score">
          <span class="label">Rekor</span>
          <span id="highScoreValue" class="value">0</span>
        </div>
      </div>
      <div class="hud__actions">
        <button id="playButton" class="btn primary">Başla</button>
        <button id="pauseButton" class="btn">Durdur</button>
        <button id="restartButton" class="btn">Yeniden</button>
        <button id="settingsToggle" class="btn">Ayarlar</button>
      </div>
    </header>

    <section class="canvas-wrapper">
      <canvas id="gameCanvas" width="480" height="720" aria-label="Flappy Bird oyunu"></canvas>
      <div id="debugOverlay" class="debug-overlay hidden"></div>
      <div id="menuOverlay" class="overlay visible">
        <div class="overlay__content">
          <h1>Flappy Bird ++</h1>
          <p>Uzay boşluğunda kanat çırp ve borulardan kaç!</p>
          <button id="menuPlayButton" class="btn primary large">Oyna</button>
        </div>
      </div>
      <div id="gameOverOverlay" class="overlay hidden">
        <div class="overlay__content">
          <h2>Oyun Bitti</h2>
          <p>Skorun: <span id="finalScore">0</span></p>
          <p>En iyi skor: <span id="finalHighScore">0</span></p>
          <button id="retryButton" class="btn primary large">Tekrar oyna</button>
        </div>
      </div>
    </section>

    <aside id="settingsPanel" class="panel hidden" aria-label="Ayarlar paneli">
      <h2>Ayarlar</h2>
      <button id="closeSettings" class="btn full-width">Kapat</button>
      
      <fieldset>
        <legend>Genel</legend>
        <div class="field">
          <label for="difficultySelect">Zorluk</label>
          <select id="difficultySelect">
            <option value="normal">Normal</option>
            <option value="hard">Zor</option>
          </select>
        </div>
        <div class="field">
          <label for="themeSelect">Tema</label>
          <select id="themeSelect">
            <option value="classic">Klasik</option>
            <option value="neon">Neon</option>
            <option value="dark">Karanlık</option>
          </select>
        </div>
        <div class="field">
          <label for="volumeRange">Ses Seviyesi</label>
          <input type="range" id="volumeRange" min="0" max="1" step="0.1" />
        </div>
        <div class="field checkbox">
          <input type="checkbox" id="vsyncToggle" />
          <label for="vsyncToggle">VSync</label>
        </div>
        <div class="field checkbox">
          <input type="checkbox" id="debugToggle" />
          <label for="debugToggle">Debug Modu</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Oyun Parametreleri</legend>
        <div class="field">
          <label for="gravityInput">Yerçekimi</label>
          <input type="number" id="gravityInput" min="300" max="3000" step="50" />
        </div>
        <div class="field">
          <label for="jumpInput">Zıplama Gücü</label>
          <input type="number" id="jumpInput" min="-900" max="-80" step="10" />
        </div>
        <div class="field">
          <label for="speedInput">Boru Hızı</label>
          <input type="number" id="speedInput" min="80" max="500" step="10" />
        </div>
        <div class="field">
          <label for="gapInput">Boşluk Boyutu</label>
          <input type="number" id="gapInput" min="80" max="300" step="10" />
        </div>
      </fieldset>

      <div class="leaderboard">
        <h3>Lider Tablosu</h3>
        <ol id="leaderboardList">
          <li>Yükleniyor...</li>
        </ol>
      </div>
    </aside>
  </main>

  <script>
    (function() {
      'use strict';

      // ============= MATH UTILITIES =============
      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      const lerp = (start, end, t) => start + (end - start) * t;
      const randomRange = (min, max) => Math.random() * (max - min) + min;
      let uidCounter = 0;
      const uid = (prefix = 'id') => \`\${prefix}-\${++uidCounter}\`;

      // ============= STORAGE =============
      const SETTINGS_KEY = 'flappy:settings';
      const HIGHSCORE_KEY = 'flappy:highscore';
      
      const DIFFICULTY_PRESETS = {
        normal: { gravity: 1500, jumpImpulse: -420, pipeSpeed: 180, gapSize: 190 },
        hard: { gravity: 1650, jumpImpulse: -400, pipeSpeed: 220, gapSize: 150 }
      };

      const DEFAULT_SETTINGS = {
        difficulty: 'normal',
        theme: 'classic',
        volume: 0.6,
        debug: false,
        vsync: true,
        ...DIFFICULTY_PRESETS.normal
      };

      const loadSettings = () => {
        try {
          const raw = localStorage.getItem(SETTINGS_KEY);
          if (!raw) return { ...DEFAULT_SETTINGS };
          const stored = JSON.parse(raw);
          return normalizeSettings(stored);
        } catch {
          return { ...DEFAULT_SETTINGS };
        }
      };

      const saveSettings = (settings) => {
        const normalized = normalizeSettings(settings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
      };

      const applyDifficultyPreset = (settings, difficulty) => ({
        ...settings,
        difficulty,
        ...DIFFICULTY_PRESETS[difficulty]
      });

      const normalizeSettings = (settings) => {
        const preset = DIFFICULTY_PRESETS[settings.difficulty || DEFAULT_SETTINGS.difficulty];
        return {
          ...DEFAULT_SETTINGS,
          ...settings,
          volume: clamp(settings.volume ?? DEFAULT_SETTINGS.volume, 0, 1),
          gravity: clamp(settings.gravity ?? preset.gravity, 300, 3000),
          jumpImpulse: clamp(settings.jumpImpulse ?? preset.jumpImpulse, -900, -80),
          pipeSpeed: clamp(settings.pipeSpeed ?? preset.pipeSpeed, 80, 500),
          gapSize: clamp(settings.gapSize ?? preset.gapSize, 80, 300)
        };
      };

      const loadHighScore = () => {
        const raw = localStorage.getItem(HIGHSCORE_KEY);
        const value = raw ? parseInt(raw, 10) : 0;
        return isFinite(value) ? value : 0;
      };

      const saveHighScore = (score) => {
        localStorage.setItem(HIGHSCORE_KEY, String(Math.max(score, 0)));
      };

      // ============= AUDIO MANAGER =============
      class AudioManager {
        constructor(volume) {
          this.context = null;
          this.gainNode = null;
          this.volume = clamp(volume, 0, 1);
          this.soundMap = {
            flap: [
              { frequency: 660, type: 'square', duration: 0.08, gain: 0.9 },
              { frequency: 880, type: 'sine', duration: 0.05, gain: 0.6 }
            ],
            score: [{ frequency: 1046, type: 'triangle', duration: 0.12, gain: 0.7 }],
            hit: [
              { frequency: 180, type: 'sawtooth', duration: 0.18, gain: 0.9 },
              { frequency: 90, type: 'square', duration: 0.25, gain: 0.7 }
            ],
            click: [{ frequency: 320, type: 'square', duration: 0.05, gain: 0.5 }]
          };
        }

        setVolume(volume) {
          this.volume = clamp(volume, 0, 1);
          if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
          }
        }

        async unlock() {
          this.ensureContext();
          if (!this.context) return;
          if (this.context.state === 'suspended') {
            await this.context.resume();
          }
        }

        play(key) {
          if (this.volume <= 0) return;
          this.ensureContext();
          if (!this.context || !this.gainNode) return;
          const now = this.context.currentTime;
          const tones = this.soundMap[key];
          tones.forEach(({ frequency, type, duration, gain }, index) => {
            const oscillator = this.context.createOscillator();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            const gainNode = this.context.createGain();
            const startTime = now + index * 0.02;
            const totalGain = gain * this.volume;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(totalGain, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            oscillator.connect(gainNode).connect(this.gainNode);
            oscillator.start(startTime);
            oscillator.stop(startTime + duration + 0.02);
          });
        }

        ensureContext() {
          if (this.context) return;
          if (!window.AudioContext) return;
          this.context = new AudioContext();
          this.gainNode = this.context.createGain();
          this.gainNode.gain.value = this.volume;
          this.gainNode.connect(this.context.destination);
        }
      }

      // ============= GAME LOOP =============
      class GameLoop {
        constructor(updateCallback, options = {}) {
          this.update = updateCallback;
          this.running = false;
          this.rafId = 0;
          this.intervalId = null;
          this.lastTime = 0;
          this.stats = { delta: 0, fps: 0 };
          this.options = {
            vsync: options.vsync ?? true,
            targetFps: options.targetFps ?? 120,
            maxDelta: options.maxDelta ?? 0.0333
          };
        }

        setUpdate(callback) {
          this.update = callback;
        }

        setVSync(enabled) {
          if (this.options.vsync === enabled) return;
          this.options.vsync = enabled;
          if (this.running) {
            this.stop();
            this.start();
          }
        }

        getStats() {
          return this.stats;
        }

        start() {
          if (this.running) return;
          this.running = true;
          this.lastTime = performance.now();
          if (this.options.vsync) {
            this.rafId = requestAnimationFrame((time) => this.step(time));
          } else {
            const frameTime = 1000 / this.options.targetFps;
            this.intervalId = setInterval(() => {
              const now = performance.now();
              this.step(now);
            }, frameTime);
          }
        }

        stop() {
          if (!this.running) return;
          this.running = false;
          if (this.options.vsync) {
            cancelAnimationFrame(this.rafId);
          } else if (this.intervalId) {
            clearInterval(this.intervalId);
          }
          this.intervalId = null;
        }

        step(time) {
          if (!this.running) return;
          const deltaMs = time - this.lastTime;
          this.lastTime = time;
          const deltaSeconds = Math.min(deltaMs / 1000, this.options.maxDelta);
          this.stats.delta = deltaSeconds;
          this.stats.fps = deltaSeconds > 0 ? 1 / deltaSeconds : 0;
          this.update(deltaSeconds);
          if (this.options.vsync) {
            this.rafId = requestAnimationFrame((time) => this.step(time));
          }
        }
      }

      // ============= INPUT MANAGER =============
      class InputManager {
        constructor(canvas, callbacks) {
          this.canvas = canvas;
          this.callbacks = callbacks;
          this.jumpKeys = new Set(['Space', 'ArrowUp', 'KeyW']);
        }

        attach() {
          window.addEventListener('keydown', (e) => this.handleKeyDown(e));
          this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
          this.canvas.addEventListener('touchstart', (e) => this.handlePointer(e), { passive: false });
        }

        detach() {
          window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
          this.canvas.removeEventListener('mousedown', (e) => this.handleClick(e));
          this.canvas.removeEventListener('touchstart', (e) => this.handlePointer(e));
        }

        handleKeyDown(event) {
          if (event.repeat) return;
          switch (event.code) {
            case 'KeyP':
              event.preventDefault();
              this.callbacks.onPauseToggle();
              break;
            case 'KeyR':
              event.preventDefault();
              this.callbacks.onRestart();
              break;
            case 'KeyD':
              event.preventDefault();
              this.callbacks.onToggleDebug();
              break;
            default:
              if (this.jumpKeys.has(event.code)) {
                event.preventDefault();
                this.callbacks.onJump();
              }
              break;
          }
        }

        handleClick(event) {
          if (event.target !== this.canvas) return;
          this.handlePointer(event);
        }

        handlePointer(event) {
          if ('preventDefault' in event) {
            event.preventDefault();
          }
          if (this.callbacks.onInteraction) {
            this.callbacks.onInteraction();
          }
          this.callbacks.onJump();
        }
      }

      // ============= STATE MACHINE =============
      class GameStateMachine {
        constructor() {
          this.state = 'MENU';
          this.listeners = new Set();
        }

        get current() {
          return this.state;
        }

        set(next) {
          if (next === this.state) return;
          const prev = this.state;
          this.state = next;
          this.listeners.forEach(listener => listener(next, prev));
        }

        onChange(listener) {
          this.listeners.add(listener);
          return () => this.listeners.delete(listener);
        }

        is(state) {
          return this.state === state;
        }
      }

      // ============= COLLISION =============
      const aabbIntersect = (a, b) =>
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;

      const maskOverlap = (maskA, maskB) => {
        const left = Math.max(maskA.offsetX, maskB.offsetX);
        const right = Math.min(maskA.offsetX + maskA.width, maskB.offsetX + maskB.width);
        const top = Math.max(maskA.offsetY, maskB.offsetY);
        const bottom = Math.min(maskA.offsetY + maskA.height, maskB.offsetY + maskB.height);

        if (left >= right || top >= bottom) return false;

        for (let y = Math.floor(top); y < Math.ceil(bottom); y++) {
          const yA = Math.floor(y - maskA.offsetY);
          const yB = Math.floor(y - maskB.offsetY);
          if (yA < 0 || yA >= maskA.height || yB < 0 || yB >= maskB.height) continue;
          for (let x = Math.floor(left); x < Math.ceil(right); x++) {
            const xA = Math.floor(x - maskA.offsetX);
            const xB = Math.floor(x - maskB.offsetX);
            if (xA < 0 || xA >= maskA.width || xB < 0 || xB >= maskB.width) continue;
            const indexA = yA * maskA.width + xA;
            const indexB = yB * maskB.width + xB;
            if (maskA.data[indexA] && maskB.data[indexB]) return true;
          }
        }
        return false;
      };

      // ============= BIRD =============
      class Bird {
        constructor(x, y, config) {
          this.width = 48;
          this.height = 34;
          this.position = { x, y };
          this.velocity = 0;
          this.rotation = 0;
          this.mask = this.createMask();
          this.applyConfig(config);
        }

        reset(x, y, config) {
          this.position.x = x;
          this.position.y = y;
          this.velocity = 0;
          this.rotation = 0;
          this.applyConfig(config);
        }

        setPhysics(config) {
          this.applyConfig(config);
        }

        update(delta) {
          this.velocity += this.gravity * delta;
          this.position.y += this.velocity * delta;
          const tilt = clamp(this.velocity / 600, -0.45, 1.2);
          this.rotation = clamp(tilt, -0.6, 1.2);
        }

        draw(ctx, theme, debug) {
          ctx.save();
          ctx.translate(this.position.x, this.position.y);
          ctx.rotate(this.rotation);
          const palette = this.getBirdPalette(theme);
          const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, this.height);
          gradient.addColorStop(0, palette.primary);
          gradient.addColorStop(1, palette.secondary);
          ctx.fillStyle = gradient;
          this.roundedRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 14);
          ctx.fill();
          // Eye
          ctx.fillStyle = palette.eyeWhite;
          ctx.beginPath();
          ctx.arc(this.width * 0.12, -this.height * 0.1, this.height * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = palette.eyeDark;
          ctx.beginPath();
          ctx.arc(this.width * 0.18, -this.height * 0.1, this.height * 0.1, 0, Math.PI * 2);
          ctx.fill();
          // Beak
          ctx.fillStyle = palette.beak;
          ctx.beginPath();
          ctx.moveTo(this.width * 0.25, 0);
          ctx.lineTo(this.width * 0.5, this.height * 0.08);
          ctx.lineTo(this.width * 0.25, this.height * 0.16);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          if (debug) {
            const bounds = this.getBounds();
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.restore();
          }
        }

        flap() {
          this.velocity = this.jumpImpulse;
        }

        getY() {
          return this.position.y;
        }

        getBounds() {
          return {
            x: this.position.x - this.width / 2,
            y: this.position.y - this.height / 2,
            width: this.width,
            height: this.height
          };
        }

        getMask() {
          const bounds = this.getBounds();
          return {
            width: 32,
            height: 24,
            data: this.mask,
            offsetX: bounds.x,
            offsetY: bounds.y
          };
        }

        applyConfig({ gravity, jumpImpulse }) {
          this.gravity = gravity;
          this.jumpImpulse = jumpImpulse;
        }

        createMask() {
          const maskWidth = 32;
          const maskHeight = 24;
          const data = new Uint8ClampedArray(maskWidth * maskHeight);
          const radiusX = maskWidth / 2;
          const radiusY = maskHeight / 2;
          for (let y = 0; y < maskHeight; y++) {
            for (let x = 0; x < maskWidth; x++) {
              const normX = (x - radiusX) / radiusX;
              const normY = (y - radiusY) / radiusY;
              const ellipse = normX * normX + normY * normY;
              const index = y * maskWidth + x;
              data[index] = ellipse <= 1 ? 1 : 0;
            }
          }
          return data;
        }

        roundedRect(ctx, x, y, width, height, radius) {
          const r = Math.min(radius, width / 2, height / 2);
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + width, y, x + width, y + height, r);
          ctx.arcTo(x + width, y + height, x, y + height, r);
          ctx.arcTo(x, y + height, x, y, r);
          ctx.arcTo(x, y, x + width, y, r);
          ctx.closePath();
        }

        getBirdPalette(theme) {
          switch (theme) {
            case 'neon':
              return {
                primary: '#ff68ff',
                secondary: '#4d8dff',
                eyeWhite: '#f8faff',
                eyeDark: '#20062e',
                beak: '#ffd166'
              };
            case 'dark':
              return {
                primary: '#ffa552',
                secondary: '#ff4f79',
                eyeWhite: '#fdf9f3',
                eyeDark: '#1b1b1f',
                beak: '#ffc857'
              };
            default:
              return {
                primary: '#ffe066',
                secondary: '#ff7b54',
                eyeWhite: '#fefefe',
                eyeDark: '#1f3b57',
                beak: '#ff9561'
              };
          }
        }
      }

      // ============= PIPES =============
      class PipesManager {
        constructor(sceneWidth, sceneHeight) {
          this.sceneWidth = sceneWidth;
          this.sceneHeight = sceneHeight;
          this.pipes = [];
          this.pipeSpeed = 180;
          this.baseGap = 190;
          this.maskCache = new Map();
          this.nextId = 0;
          this.pipeWidth = 84;
          this.pipeSpacing = 280;
          this.minGap = 110;
          for (let i = 0; i < 3; i++) {
            this.pipes.push(this.spawnPipe(i * this.pipeSpacing));
          }
        }

        reset(speed, gapSize) {
          this.pipeSpeed = speed;
          this.baseGap = gapSize;
          this.pipes.forEach((pipe, index) => {
            pipe.x = this.sceneWidth + index * this.pipeSpacing;
            pipe.gapCenter = this.randomGapCenter();
            pipe.gapSize = this.baseGap;
            pipe.scored = false;
          });
        }

        configure(speed, gapSize) {
          this.pipeSpeed = speed;
          this.baseGap = gapSize;
          this.pipes.forEach(pipe => {
            pipe.gapSize = clamp(pipe.gapSize, this.minGap, this.baseGap);
          });
        }

        update(delta, birdX, score) {
          let scoreDelta = 0;
          const dynamicGap = clamp(this.baseGap - score * 3, this.minGap, this.baseGap);
          this.pipes.forEach(pipe => {
            pipe.x -= this.pipeSpeed * delta;
            pipe.gapSize = dynamicGap;
            if (!pipe.scored && pipe.x + this.pipeWidth / 2 < birdX) {
              pipe.scored = true;
              scoreDelta += 1;
            }
          });
          const rightmost = Math.max(...this.pipes.map(pipe => pipe.x));
          this.pipes.forEach(pipe => {
            if (pipe.x + this.pipeWidth < 0) {
              pipe.x = rightmost + this.pipeSpacing;
              pipe.gapCenter = this.randomGapCenter();
              pipe.scored = false;
            }
          });
          return scoreDelta;
        }

        draw(ctx, theme, debug) {
          this.pipes.forEach(pipe => {
            this.drawPipe(ctx, pipe, theme);
            if (debug) {
              const { top, bottom } = this.getBoundsFor(pipe);
              ctx.save();
              ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
              ctx.strokeRect(top.x, top.y, top.width, top.height);
              ctx.strokeRect(bottom.x, bottom.y, bottom.width, bottom.height);
              ctx.restore();
            }
          });
        }

        getHitboxes() {
          return this.pipes.flatMap(pipe => {
            const { top, bottom } = this.getBoundsFor(pipe);
            return [top, bottom];
          });
        }

        getMasks() {
          return this.pipes.flatMap(pipe => {
            const { top, bottom } = this.getBoundsFor(pipe);
            return [this.getMask(top), this.getMask(bottom)];
          });
        }

        spawnPipe(initialX) {
          return {
            id: this.nextId++,
            x: initialX,
            gapCenter: this.randomGapCenter(),
            gapSize: this.baseGap,
            scored: false
          };
        }

        randomGapCenter() {
          const margin = 80;
          return randomRange(margin + this.baseGap / 2, this.sceneHeight - margin - this.baseGap / 2);
        }

        getBoundsFor(pipe) {
          const topHeight = pipe.gapCenter - pipe.gapSize / 2;
          const bottomY = pipe.gapCenter + pipe.gapSize / 2;
          const bottomHeight = this.sceneHeight - bottomY;
          return {
            top: {
              x: pipe.x,
              y: 0,
              width: this.pipeWidth,
              height: Math.max(0, topHeight)
            },
            bottom: {
              x: pipe.x,
              y: bottomY,
              width: this.pipeWidth,
              height: Math.max(0, bottomHeight)
            }
          };
        }

        getMask(bounds) {
          const width = Math.max(1, Math.round(bounds.width));
          const height = Math.max(1, Math.round(bounds.height));
          const key = \`\${width}x\${height}\`;
          let template = this.maskCache.get(key);
          if (!template) {
            template = new Uint8ClampedArray(width * height);
            template.fill(1);
            this.maskCache.set(key, template);
          }
          return {
            width,
            height,
            data: template,
            offsetX: bounds.x,
            offsetY: bounds.y
          };
        }

        drawPipe(ctx, pipe, theme) {
          const palette = this.getPipePalette(theme);
          const topHeight = pipe.gapCenter - pipe.gapSize / 2;
          const bottomY = pipe.gapCenter + pipe.gapSize / 2;
          const bottomHeight = this.sceneHeight - bottomY;
          const top = { x: pipe.x, y: 0, width: this.pipeWidth, height: Math.max(0, topHeight) };
          const bottom = { x: pipe.x, y: bottomY, width: this.pipeWidth, height: Math.max(0, bottomHeight) };
          ctx.fillStyle = palette.body;
          ctx.fillRect(top.x, top.y, top.width, top.height);
          ctx.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
          ctx.fillStyle = palette.lip;
          ctx.fillRect(top.x - 4, top.height - 12, top.width + 8, 12);
          ctx.fillRect(bottom.x - 4, bottom.y, bottom.width + 8, 12);
          ctx.fillStyle = palette.shade;
          ctx.fillRect(top.x + 6, top.y, 12, top.height);
          ctx.fillRect(bottom.x + 6, bottom.y, 12, bottom.height);
        }

        getPipePalette(theme) {
          switch (theme) {
            case 'neon':
              return { body: '#3df7ff', lip: '#ffffff', shade: '#ff43c7' };
            case 'dark':
              return { body: '#36485c', lip: '#00d1d1', shade: '#1b2735' };
            default:
              return { body: '#5bd85b', lip: '#bde55f', shade: '#2b8a3e' };
          }
        }
      }

      // ============= GROUND =============
      class Ground {
        constructor(sceneWidth, sceneHeight, height = 96) {
          this.sceneWidth = sceneWidth;
          this.sceneHeight = sceneHeight;
          this.height = height;
          this.segments = [];
          this.speed = 180;
          for (let i = 0; i < 3; i++) {
            this.segments.push({ x: i * sceneWidth });
          }
        }

        reset(speed) {
          this.speed = speed;
          this.segments.forEach((segment, index) => {
            segment.x = index * this.sceneWidth;
          });
        }

        setSpeed(speed) {
          this.speed = speed;
        }

        update(delta, parallax = 1) {
          const actualSpeed = this.speed * delta * parallax;
          this.segments.forEach(segment => {
            segment.x -= actualSpeed;
          });
          const first = this.segments[0];
          if (first.x + this.sceneWidth < 0) {
            const last = this.segments.reduce((max, current) => (current.x > max.x ? current : max));
            first.x = last.x + this.sceneWidth;
            this.segments.push(this.segments.shift());
          }
        }

        draw(ctx, theme) {
          const palette = this.getGroundPalette(theme);
          ctx.fillStyle = palette.base;
          this.segments.forEach(segment => {
            ctx.fillRect(segment.x, this.sceneHeight - this.height, this.sceneWidth, this.height);
            const stripeHeight = this.height / 4;
            ctx.fillStyle = palette.shadow;
            ctx.fillRect(segment.x, this.sceneHeight - this.height + stripeHeight, this.sceneWidth, stripeHeight / 2);
            ctx.fillRect(segment.x, this.sceneHeight - stripeHeight / 2, this.sceneWidth, stripeHeight / 4);
            ctx.fillStyle = palette.highlight;
            ctx.fillRect(segment.x, this.sceneHeight - this.height, this.sceneWidth, stripeHeight / 4);
            ctx.fillStyle = palette.base;
          });
        }

        getBounds() {
          return {
            x: 0,
            y: this.sceneHeight - this.height,
            width: this.sceneWidth,
            height: this.height
          };
        }

        getGroundPalette(theme) {
          switch (theme) {
            case 'neon':
              return { base: '#0f1130', shadow: '#07081a', highlight: '#1f1b7b' };
            case 'dark':
              return { base: '#1f2a36', shadow: '#11161d', highlight: '#2e3d4c' };
            default:
              return { base: '#deba75', shadow: '#be9146', highlight: '#f6d58c' };
          }
        }
      }

      // ============= BACKGROUND =============
      class Background {
        constructor(sceneWidth, sceneHeight) {
          this.sceneWidth = sceneWidth;
          this.sceneHeight = sceneHeight;
          this.layers = [
            { speed: 8, offset: 0, color: '#ffffff', alpha: 0.35 },
            { speed: 16, offset: 0, color: '#f5f5f5', alpha: 0.25 },
            { speed: 24, offset: 0, color: '#ffffff', alpha: 0.15 }
          ];
        }

        update(delta) {
          this.layers.forEach(layer => {
            layer.offset = (layer.offset - layer.speed * delta) % this.sceneWidth;
          });
        }

        draw(ctx, theme) {
          const gradient = ctx.createLinearGradient(0, 0, 0, this.sceneHeight);
          const palette = this.getBackgroundPalette(theme);
          gradient.addColorStop(0, palette.top);
          gradient.addColorStop(1, palette.bottom);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, this.sceneWidth, this.sceneHeight);
          this.layers.forEach(layer => {
            ctx.save();
            ctx.globalAlpha = layer.alpha;
            ctx.fillStyle = layer.color;
            const count = Math.floor(this.sceneWidth / 80);
            for (let i = -1; i < count + 1; i++) {
              const x = ((i * 150 + layer.offset) % (this.sceneWidth + 150)) - 75;
              const y = 120 + ((i * 37) % (this.sceneHeight / 2));
              ctx.beginPath();
              ctx.arc(x, y, 12, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });
        }

        getBackgroundPalette(theme) {
          switch (theme) {
            case 'neon':
              return { top: '#03001e', bottom: '#7303c0' };
            case 'dark':
              return { top: '#0b1320', bottom: '#1f2a38' };
            default:
              return { top: '#87ceeb', bottom: '#e0f7ff' };
          }
        }
      }

      // ============= SCORE MANAGER =============
      class ScoreManager {
        constructor() {
          this.score = 0;
          this.highScore = loadHighScore();
        }

        getScore() {
          return this.score;
        }

        getHighScore() {
          return this.highScore;
        }

        increment() {
          this.score += 1;
          if (this.score > this.highScore) {
            this.highScore = this.score;
            saveHighScore(this.highScore);
          }
          return { score: this.score, highScore: this.highScore };
        }

        reset() {
          this.score = 0;
          return { score: this.score, highScore: this.highScore };
        }
      }

      // ============= DEBUG OVERLAY =============
      class DebugOverlay {
        constructor(element) {
          this.element = element;
          this.visible = false;
        }

        setVisible(show) {
          this.visible = show;
          this.element.classList.toggle('hidden', !show);
        }

        update(data) {
          if (!this.visible) return;
          this.element.textContent = [
            \`FPS: \${data.fps.toFixed(1)}\`,
            \`Δt: \${(data.delta * 1000).toFixed(2)} ms\`,
            \`Y: \${data.birdY.toFixed(1)}\`,
            \`Hitbox sayısı: \${data.hitboxes.length}\`
          ].join('\\n');
        }
      }

      // ============= CONTROLS PANEL =============
      class ControlsPanel {
        constructor(settings, callbacks) {
          this.settings = settings;
          this.callbacks = callbacks;
          this.panel = document.getElementById('settingsPanel');
          this.difficultySelect = document.getElementById('difficultySelect');
          this.themeSelect = document.getElementById('themeSelect');
          this.volumeRange = document.getElementById('volumeRange');
          this.debugToggle = document.getElementById('debugToggle');
          this.vsyncToggle = document.getElementById('vsyncToggle');
          this.gravityInput = document.getElementById('gravityInput');
          this.jumpInput = document.getElementById('jumpInput');
          this.speedInput = document.getElementById('speedInput');
          this.gapInput = document.getElementById('gapInput');
          this.list = document.getElementById('leaderboardList');
          this.populate(settings);
          this.bindEvents();
        }

        toggle(show) {
          this.panel.classList.toggle('hidden', !show);
        }

        sync(settings) {
          this.settings = settings;
          this.populate(settings);
        }

        renderLeaderboard(entries) {
          this.list.innerHTML = '';
          if (!entries.length) {
            const item = document.createElement('li');
            item.textContent = 'Henüz kayıt yok';
            this.list.appendChild(item);
          } else {
            entries.forEach(entry => {
              const item = document.createElement('li');
              item.textContent = \`\${entry.player} — \${entry.score}\`;
              this.list.appendChild(item);
            });
          }
        }

        populate(settings) {
          this.difficultySelect.value = settings.difficulty;
          this.themeSelect.value = settings.theme;
          this.volumeRange.value = String(settings.volume);
          this.debugToggle.checked = settings.debug;
          this.vsyncToggle.checked = settings.vsync;
          this.gravityInput.value = String(settings.gravity);
          this.jumpInput.value = String(settings.jumpImpulse);
          this.speedInput.value = String(settings.pipeSpeed);
          this.gapInput.value = String(settings.gapSize);
        }

        bindEvents() {
          document.getElementById('closeSettings').addEventListener('click', () => {
            this.toggle(false);
            this.callbacks.onClose();
          });

          this.difficultySelect.addEventListener('change', () => {
            const next = applyDifficultyPreset(this.settings, this.difficultySelect.value);
            this.update(next);
          });

          this.themeSelect.addEventListener('change', () => {
            const next = { ...this.settings, theme: this.themeSelect.value };
            this.update(next);
          });

          this.volumeRange.addEventListener('input', () => {
            const next = { ...this.settings, volume: parseFloat(this.volumeRange.value) };
            this.update(next);
          });

          this.debugToggle.addEventListener('change', () => {
            const next = { ...this.settings, debug: this.debugToggle.checked };
            this.update(next);
          });

          this.vsyncToggle.addEventListener('change', () => {
            const next = { ...this.settings, vsync: this.vsyncToggle.checked };
            this.update(next);
          });

          const numericHandler = () => {
            const next = {
              ...this.settings,
              gravity: parseFloat(this.gravityInput.value),
              jumpImpulse: parseFloat(this.jumpInput.value),
              pipeSpeed: parseFloat(this.speedInput.value),
              gapSize: parseFloat(this.gapInput.value)
            };
            this.update(next);
          };

          [this.gravityInput, this.jumpInput, this.speedInput, this.gapInput].forEach(input =>
            input.addEventListener('change', numericHandler)
          );
        }

        update(next, persist = true) {
          this.settings = next;
          if (persist) {
            saveSettings(this.settings);
          }
          this.callbacks.onSettingsChange(this.settings);
          this.populate(this.settings);
        }
      }

      // ============= MAIN GAME =============
      const CANVAS_WIDTH = 480;
      const CANVAS_HEIGHT = 720;
      const BIRD_START_X = CANVAS_WIDTH * 0.35;
      const BIRD_START_Y = CANVAS_HEIGHT * 0.45;

      const canvas = document.getElementById('gameCanvas');
      const context = canvas.getContext('2d', { alpha: true });
      const appElement = document.querySelector('.app');
      const scoreElement = document.getElementById('scoreValue');
      const highScoreElement = document.getElementById('highScoreValue');
      const playButton = document.getElementById('playButton');
      const pauseButton = document.getElementById('pauseButton');
      const restartButton = document.getElementById('restartButton');
      const settingsToggle = document.getElementById('settingsToggle');
      const menuOverlay = document.getElementById('menuOverlay');
      const menuPlayButton = document.getElementById('menuPlayButton');
      const gameOverOverlay = document.getElementById('gameOverOverlay');
      const finalScoreElement = document.getElementById('finalScore');
      const finalHighScoreElement = document.getElementById('finalHighScore');
      const retryButton = document.getElementById('retryButton');

      let settings = loadSettings();
      const audio = new AudioManager(settings.volume);
      const stateMachine = new GameStateMachine();
      const loop = new GameLoop(handleUpdate, { vsync: settings.vsync, maxDelta: 0.05 });
      const background = new Background(CANVAS_WIDTH, CANVAS_HEIGHT);
      const ground = new Ground(CANVAS_WIDTH, CANVAS_HEIGHT);
      const pipes = new PipesManager(CANVAS_WIDTH, CANVAS_HEIGHT);
      const bird = new Bird(BIRD_START_X, BIRD_START_Y, {
        gravity: settings.gravity,
        jumpImpulse: settings.jumpImpulse
      });
      const scoreManager = new ScoreManager();
      const debugOverlay = new DebugOverlay(document.getElementById('debugOverlay'));
      const controlsPanel = new ControlsPanel(settings, {
        onSettingsChange: applySettings,
        onClose: () => {}
      });
      const input = new InputManager(canvas, {
        onJump: handleJump,
        onPauseToggle: togglePause,
        onRestart: restartGame,
        onToggleDebug: () => setDebug(!settings.debug),
        onInteraction: () => audio.unlock()
      });

      let idleTime = 0;

      function initialize() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        setTheme(settings.theme);
        updateScoreboard(0, scoreManager.getHighScore());
        background.draw(context, settings.theme);
        ground.reset(settings.pipeSpeed);
        pipes.reset(settings.pipeSpeed, settings.gapSize);
        loop.start();
        input.attach();
        bindUi();
        stateMachine.set('MENU');
        showMenu('Flappy Bird ++', 'Oyna');
        debugOverlay.setVisible(settings.debug);
      }

      function bindUi() {
        playButton.addEventListener('click', () => {
          audio.play('click');
          startGame();
        });

        pauseButton.addEventListener('click', () => {
          audio.play('click');
          togglePause();
        });

        restartButton.addEventListener('click', () => {
          audio.play('click');
          restartGame();
        });

        settingsToggle.addEventListener('click', () => {
          audio.play('click');
          controlsPanel.toggle(true);
        });

        menuPlayButton.addEventListener('click', () => {
          audio.play('click');
          if (stateMachine.is('MENU') || stateMachine.is('GAMEOVER')) {
            startGame();
          } else if (stateMachine.is('PAUSE')) {
            resumeGame();
          }
        });

        retryButton.addEventListener('click', () => {
          audio.play('click');
          restartGame();
        });
      }

      function startGame() {
        hideOverlays();
        stateMachine.set('PLAYING');
        const { score, highScore } = scoreManager.reset();
        updateScoreboard(score, highScore);
        bird.reset(BIRD_START_X, BIRD_START_Y, {
          gravity: settings.gravity,
          jumpImpulse: settings.jumpImpulse
        });
        pipes.reset(settings.pipeSpeed, settings.gapSize);
        ground.reset(settings.pipeSpeed);
      }

      function restartGame() {
        startGame();
      }

      function togglePause() {
        if (stateMachine.is('PLAYING')) {
          pauseGame();
        } else if (stateMachine.is('PAUSE')) {
          resumeGame();
        }
      }

      function pauseGame() {
        stateMachine.set('PAUSE');
        showMenu('Duraklatıldı', 'Devam Et');
      }

      function resumeGame() {
        hideOverlays();
        stateMachine.set('PLAYING');
      }

      function handleJump() {
        if (stateMachine.is('MENU')) {
          startGame();
          return;
        }
        if (stateMachine.is('PLAYING')) {
          bird.flap();
          audio.play('flap');
        }
      }

      function setDebug(enabled) {
        settings = { ...settings, debug: enabled };
        saveSettings(settings);
        controlsPanel.sync(settings);
        debugOverlay.setVisible(enabled);
      }

      function handleUpdate(delta) {
        idleTime += delta;
        background.update(delta * 0.5);

        const hitboxes = [];
        if (stateMachine.is('PLAYING')) {
          bird.update(delta);
          const gained = pipes.update(delta, BIRD_START_X, scoreManager.getScore());
          ground.update(delta, 1);

          if (gained > 0) {
            for (let i = 0; i < gained; i++) {
              const { score, highScore } = scoreManager.increment();
              updateScoreboard(score, highScore);
              audio.play('score');
            }
          }

          if (detectCollision(hitboxes)) {
            audio.play('hit');
            handleGameOver();
          }
        } else if (stateMachine.is('MENU')) {
          ground.update(delta * 0.6, 0.4);
          const bob = Math.sin(idleTime * 2) * 20;
          bird.reset(BIRD_START_X, CANVAS_HEIGHT * 0.45 + bob, {
            gravity: settings.gravity,
            jumpImpulse: settings.jumpImpulse
          });
        }

        if (!stateMachine.is('PLAYING')) {
          hitboxes.push(bird.getBounds(), ground.getBounds(), ...pipes.getHitboxes());
        }

        render();

        if (settings.debug) {
          debugOverlay.update({
            fps: clamp(loop.getStats().fps, 0, 240),
            delta,
            birdY: bird.getY(),
            hitboxes: hitboxes
          });
        }
      }

      function render() {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        background.draw(context, settings.theme);
        pipes.draw(context, settings.theme, settings.debug);
        bird.draw(context, settings.theme, settings.debug);
        ground.draw(context, settings.theme);
      }

      function detectCollision(hitboxes) {
        const birdBounds = bird.getBounds();
        const groundBounds = ground.getBounds();
        hitboxes.push(birdBounds, groundBounds);

        if (birdBounds.y < -100 || birdBounds.y + birdBounds.height > CANVAS_HEIGHT) {
          return true;
        }

        if (aabbIntersect(birdBounds, groundBounds)) {
          return true;
        }

        const pipeHitBoxes = pipes.getHitboxes();
        const pipeMasks = pipes.getMasks();
        const birdMask = bird.getMask();
        for (let index = 0; index < pipeHitBoxes.length; index++) {
          const box = pipeHitBoxes[index];
          hitboxes.push(box);
          if (!aabbIntersect(birdBounds, box)) {
            continue;
          }
          const mask = pipeMasks[index];
          if (!mask) {
            return true;
          }
          if (maskOverlap(birdMask, mask)) {
            return true;
          }
        }

        return false;
      }

      function handleGameOver() {
        stateMachine.set('GAMEOVER');
        showGameOver();
      }

      function showMenu(title, buttonLabel) {
        menuOverlay.querySelector('h1').textContent = title;
        menuPlayButton.textContent = buttonLabel;
        menuOverlay.classList.remove('hidden');
        menuOverlay.classList.add('visible');
        gameOverOverlay.classList.add('hidden');
      }

      function showGameOver() {
        finalScoreElement.textContent = scoreManager.getScore().toString();
        finalHighScoreElement.textContent = scoreManager.getHighScore().toString();
        gameOverOverlay.classList.remove('hidden');
        gameOverOverlay.classList.add('visible');
        menuOverlay.classList.remove('visible');
        menuOverlay.classList.add('hidden');
      }

      function hideOverlays() {
        menuOverlay.classList.add('hidden');
        menuOverlay.classList.remove('visible');
        gameOverOverlay.classList.add('hidden');
        gameOverOverlay.classList.remove('visible');
      }

      function applySettings(next) {
        settings = next;
        setTheme(settings.theme);
        audio.setVolume(settings.volume);
        loop.setVSync(settings.vsync);
        bird.setPhysics({
          gravity: settings.gravity,
          jumpImpulse: settings.jumpImpulse
        });
        pipes.configure(settings.pipeSpeed, settings.gapSize);
        ground.setSpeed(settings.pipeSpeed);
      }

      function updateScoreboard(score, highScore) {
        scoreElement.textContent = score.toString();
        highScoreElement.textContent = highScore.toString();
      }

      function setTheme(theme) {
        appElement.dataset.theme = theme;
      }

      initialize();
    })();
  </script>
</body>
</html>
`;
export default html;
