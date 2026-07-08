// ===================== NAV HIDE ON SCROLL =====================
const nav = document.querySelector('nav');
let lastY = 0;
let scrollTimer;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 80) {
    nav.classList.add('nav-hidden');
  } else {
    nav.classList.remove('nav-hidden');
  }
  lastY = y;
}, { passive: true });

// ===================== LOADER =====================
const loader = document.getElementById('loader');
const counter = document.getElementById('loaderCounter');

// ─── SHATTER GRID BUILD ───
const shatterGrid = document.getElementById('shatterGrid');
const COLS = 6, ROWS = 5;
for (let i = 0; i < COLS * ROWS; i++) {
  const shard = document.createElement('div');
  shard.className = 'shard';
  // each shard flies in a unique direction
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const cx = (col / COLS - 0.5) * 2;  // -1 to 1
  const cy = (row / ROWS - 0.5) * 2;
  const dist = 60 + Math.random() * 80;
  const rot  = (Math.random() - 0.5) * 30;
  const delay = Math.random() * 0.18;
  shard.style.setProperty('--tx', (cx * dist) + 'px');
  shard.style.setProperty('--ty', (cy * dist) + 'px');
  shard.style.setProperty('--rot', rot + 'deg');
  shard.style.setProperty('--delay', delay + 's');
  shard.style.transitionDelay = delay + 's';
  shatterGrid.appendChild(shard);
}

// inject per-shard keyframe via style tag
const shatterStyle = document.createElement('style');
shatterStyle.textContent = `
  #loader.loader-out .shard {
    transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.6);
    opacity: 0;
  }
`;
document.head.appendChild(shatterStyle);

function runLoader() {
  // Minimum display time: 1800ms
  const MIN = 1800;
  const start = performance.now();
  let count = 0;

  const tick = () => {
    count = Math.min(count + Math.floor(Math.random() * 7) + 2, 100);
    counter.textContent = String(count).padStart(3, '0');
    if (count < 100) {
      setTimeout(tick, 18 + Math.random() * 25);
    }
  };
  tick();

  // Trigger animate class immediately for text reveal
  requestAnimationFrame(() => loader.classList.add('loader-animate'));

  const dismiss = () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN - elapsed);
    setTimeout(() => {
      counter.textContent = '100';
      setTimeout(() => {
        // 1. shatter the grid outward
        loader.classList.add('loader-out');
        document.body.style.overflow = '';
      }, 200);
    }, wait);
  };

  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss, { once: true });
  }
}

// Prevent scroll during load
document.body.style.overflow = 'hidden';
runLoader();

// ===================== CURSOR =====================
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 4 + 'px';
  cursor.style.top = my - 4 + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .interest-item, .popup-card, .game-row, .camera-card, .code-card, .media-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// ===================== SCROLL REVEAL =====================
const quoteSection = document.getElementById('quoteSection');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.2 });
observer.observe(quoteSection);

const items = document.querySelectorAll('.interest-item');
const itemObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const idx = [...items].indexOf(e.target);
      e.target.style.opacity = '0';
      e.target.style.transform = 'translateY(20px)';
      setTimeout(() => {
        e.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.4s';
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }, idx * 60);
      itemObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
items.forEach(item => itemObs.observe(item));

// ===================== MARQUEE =====================
const marqueeTrack = document.getElementById('marqueeTrack');
const marqueeSection = document.getElementById('marqueeSection');
marqueeSection.addEventListener('mouseenter', () => marqueeTrack.classList.add('paused'));
marqueeSection.addEventListener('mouseleave', () => marqueeTrack.classList.remove('paused'));

document.querySelectorAll('.marquee-item[data-word]').forEach(item => {
  item.addEventListener('mouseenter', () => {
    ring.classList.add('hover');
    document.querySelectorAll('.marquee-item[data-word]').forEach(other => {
      if (other !== item) other.style.opacity = '0.35';
    });
  });
  item.addEventListener('mouseleave', () => {
    ring.classList.remove('hover');
    document.querySelectorAll('.marquee-item[data-word]').forEach(other => other.style.opacity = '');
  });
});

// ===================== POPUP SYSTEM =====================
const overlay = document.getElementById('popupOverlay');
const popupTitle = document.getElementById('popupTitle');
const popupBody = document.getElementById('popupBody');
const popupClose = document.getElementById('popupClose');

// Content definitions
const popups = {

  coding: {
    title: 'coding.exe',
    html: `
      <div class="popup-section-title">My Code</div>
      <div class="popup-section-desc">Projects, experiments, and things I've built. Clean code, deliberate architecture, obsessive about the details.</div>
      <div class="popup-grid">
        <div class="code-card">
          <div class="code-card-header">
            <div class="code-lang-dot" style="background:#f7df1e"></div>
            <span class="code-card-name">portfolio / index.html</span>
          </div>
          <div class="code-card-body">
            <span class="cm">// this very site</span><br>
            <span class="kw">const</span> <span class="fn">avishkar</span> = {<br>
            &nbsp;&nbsp;stack: [<span class="str">'HTML'</span>, <span class="str">'CSS'</span>, <span class="str">'JS'</span>],<br>
            &nbsp;&nbsp;vibes: <span class="str">'minimal'</span><br>
            };
          </div>
          <div class="code-card-footer">
            <span class="code-tag">HTML / CSS / JS</span>
            <span class="code-tag">2026</span>
          </div>
        </div>
        <div class="code-card">
          <div class="code-card-header">
            <div class="code-lang-dot" style="background:#3178c6"></div>
            <span class="code-card-name">project-alpha / main.ts</span>
          </div>
          <div class="code-card-body">
            <span class="cm">// coming soon</span><br>
            <span class="kw">async function</span> <span class="fn">build</span>() {<br>
            &nbsp;&nbsp;<span class="kw">await</span> <span class="fn">think</span>();<br>
            &nbsp;&nbsp;<span class="kw">return</span> <span class="fn">ship</span>();<br>
            }
          </div>
          <div class="code-card-footer">
            <span class="code-tag">TypeScript</span>
            <span class="code-tag">WIP</span>
          </div>
        </div>
        <div class="code-card">
          <div class="code-card-header">
            <div class="code-lang-dot" style="background:#3572A5"></div>
            <span class="code-card-name">scripts / automate.py</span>
          </div>
          <div class="code-card-body">
            <span class="cm"># small tools, big impact</span><br>
            <span class="kw">def</span> <span class="fn">automate</span>(life):<br>
            &nbsp;&nbsp;<span class="kw">return</span> life.<span class="fn">filter</span>(<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="str">"boring"</span>)<br>
          </div>
          <div class="code-card-footer">
            <span class="code-tag">Python</span>
            <span class="code-tag">Personal</span>
          </div>
        </div>
        <div class="code-card" style="border-style:dashed; opacity:0.4">
          <div class="code-card-header">
            <div class="code-lang-dot" style="background:#333"></div>
            <span class="code-card-name">??? / ???</span>
          </div>
          <div class="code-card-body">
            <span class="cm">// in progress...</span><br>
            <span class="cm">// add your projects here</span>
          </div>
          <div class="code-card-footer">
            <span class="code-tag">Soon™</span>
          </div>
        </div>
      </div>
    `
  },

  gaming: {
    title: 'gaming_history.log',
    html: `
      <div class="popup-section-title">Games I've Played</div>
      <div class="popup-section-desc">A record of time well spent. Every game has a memory attached to it — a place, a mood, a era.</div>
      <div class="game-list">
        <div class="game-row">
          <div>
            <div class="game-row-name">Valorant</div>
            <span class="game-genre-tag">FPS · Tactical</span>
          </div>
          <div class="game-row-platform">PC</div>
          <div class="game-row-years">2023 – present</div>
        </div>
        <div class="game-row">
          <div>
            <div class="game-row-name">Genshin Impact</div>
            <span class="game-genre-tag">RPG · Open World</span>
          </div>
          <div class="game-row-platform">PC / Mobile</div>
          <div class="game-row-years">2022 – 2024</div>
        </div>
        <div class="game-row">
          <div>
            <div class="game-row-name">Rocket League</div>
            <span class="game-genre-tag">Sports · Competitive</span>
          </div>
          <div class="game-row-platform">PC</div>
          <div class="game-row-years">~5–9 months</div>
        </div>
        <div class="game-row">
          <div>
            <div class="game-row-name">CS:GO</div>
            <span class="game-genre-tag">FPS · Tactical</span>
          </div>
          <div class="game-row-platform">PC</div>
          <div class="game-row-years">~2–3 months</div>
        </div>
        <div class="game-row">
          <div>
            <div class="game-row-name">Free Fire</div>
            <span class="game-genre-tag">Battle Royale · Mobile</span>
          </div>
          <div class="game-row-platform">Mobile</div>
          <div class="game-row-years">2018 – 2023</div>
        </div>
        <div class="game-row">
          <div>
            <div class="game-row-name">Minecraft</div>
            <span class="game-genre-tag">Sandbox · Survival</span>
          </div>
          <div class="game-row-platform">PC / Mobile</div>
          <div class="game-row-years">2018 – 2022</div>
        </div>
      </div>
    `
  },

  setup: {
    title: 'minimal_setup.txt',
    html: `
      <div class="setup-wip">
        <div class="setup-wip-icon">▣</div>
        <div class="setup-wip-text">WORK IN PROGRESS</div>
        <div class="setup-wip-sub">curating the perfect setup</div>
        <div class="setup-progress"><div class="setup-progress-bar"></div></div>
        <div style="font-size:10px; color:#333; letter-spacing:0.15em; margin-top:16px;">check back soon</div>
      </div>
    `
  },

  drawing: {
    title: 'drawings.sketchbook',
    html: `
      <div class="popup-section-title">Drawings</div>
      <div class="popup-section-desc">Sketches, concepts, and ideas made visible. Everything starts on paper.</div>
      <div class="media-grid">
        ${Array.from({length: 9}, (_, i) => `
          <div class="media-card">
            <div class="media-card-placeholder">
              <div class="media-card-placeholder-icon">✎</div>
              <div class="media-card-placeholder-text">Add drawing<br>${i + 1}</div>
            </div>
            <div class="media-card-label">sketch_${String(i+1).padStart(2,'0')}</div>
          </div>
        `).join('')}
      </div>
    `
  },

  photography: {
    title: 'photographs.gallery',
    html: `
      <div class="popup-section-title">Photography</div>
      <div class="popup-section-desc">Freezing moments. Light, shadow, and the decisive fraction of a second.</div>
      <div class="media-grid">
        ${Array.from({length: 12}, (_, i) => `
          <div class="media-card">
            <div class="media-card-placeholder">
              <div class="media-card-placeholder-icon">◉</div>
              <div class="media-card-placeholder-text">Add photo<br>${i + 1}</div>
            </div>
            <div class="media-card-label">frame_${String(i+1).padStart(3,'0')}</div>
          </div>
        `).join('')}
      </div>
    `
  },

  cars: {
    title: 'dream_garage.exe',
    html: `
      <div class="popup-section-title">Dream Garage</div>
      <div class="popup-section-desc">Engineering as sculpture. The intersection of mechanics and pure feeling. These live rent-free in my head.</div>
      <div class="cars-grid">
        <div class="car-card">
          <div class="car-card-inner">
            <span class="car-index">01</span>
            <div class="car-name">Nissan GT-R R35</div>
            <span class="car-spec">VR38DETT · 565hp · AWD</span>
          </div>
          <span class="car-arrow">↗</span>
        </div>
        <div class="car-card">
          <div class="car-card-inner">
            <span class="car-index">02</span>
            <div class="car-name">Toyota Supra MK4</div>
            <span class="car-spec">2JZ-GTE · 320hp · RWD</span>
          </div>
          <span class="car-arrow">↗</span>
        </div>
        <div class="car-card">
          <div class="car-card-inner">
            <span class="car-index">03</span>
            <div class="car-name">BMW M4</div>
            <span class="car-spec">S58 · 510hp · RWD</span>
          </div>
          <span class="car-arrow">↗</span>
        </div>
        <div class="car-card">
          <div class="car-card-inner">
            <span class="car-index">04</span>
            <div class="car-name">Porsche 911</div>
            <span class="car-spec">3.0 Flat-6 · 443hp · RWD</span>
          </div>
          <span class="car-arrow">↗</span>
        </div>
        <div class="car-card car-card--wide">
          <div class="car-card-inner">
            <span class="car-index">05 — hero car</span>
            <div class="car-name">Porsche 911 GT3 RS</div>
            <span class="car-spec">4.0 Flat-6 NA · 518hp · Track Weapon · 0–100 in 3.2s</span>
          </div>
          <span class="car-arrow">↗</span>
        </div>
      </div>
    `
  },

  music: {
    title: 'music.playlist',
    html: `
      <div class="popup-section-title">What I Listen To</div>
      <div class="popup-section-desc">Sound as architecture. My Spotify and YouTube screenshots, saved moments, and playlists that defined each era.</div>
      <div class="media-grid">
        ${Array.from({length: 8}, (_, i) => `
          <div class="media-card">
            <div class="media-card-placeholder">
              <div class="media-card-placeholder-icon">♩</div>
              <div class="media-card-placeholder-text">Add screenshot<br>${i + 1}</div>
            </div>
            <div class="media-card-label">${i < 4 ? 'spotify' : 'youtube'}_${String(i+1).padStart(2,'0')}</div>
          </div>
        `).join('')}
      </div>
    `
  },

  tech: {
    title: 'tech_owned.inventory',
    html: `
      <div class="popup-section-title">Tech I Own</div>
      <div class="popup-section-desc">The hardware and software that powers everything. Obsessed with what's next.</div>
      <div class="popup-grid">
        <div class="popup-card">
          <div class="popup-card-label">Computing</div>
          <div class="popup-card-title">Add your PC<br>specs here</div>
          <div class="popup-card-sub">CPU · GPU · RAM<br>Storage · Display</div>
        </div>
        <div class="popup-card">
          <div class="popup-card-label">Mobile</div>
          <div class="popup-card-title">Add your<br>phone here</div>
          <div class="popup-card-sub">Model · Year<br>Accessories</div>
        </div>
        <div class="popup-card">
          <div class="popup-card-label">Audio</div>
          <div class="popup-card-title">Add your<br>headphones</div>
          <div class="popup-card-sub">Model · Driver<br>Use case</div>
        </div>
        <div class="popup-card">
          <div class="popup-card-label">Peripherals</div>
          <div class="popup-card-title">Keyboard,<br>mouse, etc.</div>
          <div class="popup-card-sub">Switches · DPI<br>Form factor</div>
        </div>
        <div class="popup-card" style="border-style:dashed;opacity:0.4">
          <div class="popup-card-label">More</div>
          <div class="popup-card-title">Add more<br>gear</div>
          <div class="popup-card-sub">Your tech here</div>
        </div>
      </div>
    `
  },

  camera: {
    title: 'camera.kit',
    html: `
      <div class="popup-section-title">Camera Kit</div>
      <div class="popup-section-desc">The glass and the sensor. Gear as craft, not just tools. Click a camera to explore its interactive 3D model.</div>
      <div class="cam-kit-grid">
        <a href="camera.html" class="cam-kit-card" target="_blank">
          <div class="cam-kit-photo-wrap">
            <img src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=85&auto=format&fit=crop" alt="Nikon D40x" class="cam-kit-photo" />
            <div class="cam-kit-overlay"></div>
            <div class="cam-kit-badge">
              <span class="cam-kit-badge-dot"></span>
              3D Model
            </div>
          </div>
          <div class="cam-kit-info">
            <div class="cam-kit-name">Nikon D40x</div>
            <div class="cam-kit-spec">10.2MP · APS-C · F-Mount · 2007</div>
            <div class="cam-kit-hint">click to explore in 3D ↗</div>
          </div>
        </a>
      </div>
    `
  }

};

// Open popup
function openPopup(key) {
  const data = popups[key];
  if (!data) return;
  popupTitle.textContent = data.title;
  popupBody.innerHTML = data.html;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Re-attach cursor hover to new elements
  popupBody.querySelectorAll('.popup-card, .game-row, .camera-card, .code-card, .media-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

function closePopup() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { popupBody.innerHTML = ''; }, 350);
}

// Click on interest items
document.querySelectorAll('.interest-item[data-popup]').forEach(item => {
  item.addEventListener('click', () => openPopup(item.dataset.popup));
});

popupClose.addEventListener('click', closePopup);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
