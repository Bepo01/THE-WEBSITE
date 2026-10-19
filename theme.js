// ===================== THEME TOGGLE =====================
// Dark is the default. Choice is remembered across pages + visits.
// (The tiny inline script in each <head> applies the saved theme before paint.)
//
// Animation: a circular "ripple" expands from the switch and reveals the new
// theme (View Transitions API). Browsers without it, or users who prefer
// reduced motion, get a soft colour cross-fade instead.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  var ring = document.getElementById('cursorRing') || document.getElementById('ring');
  if (ring) {
    btn.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
    btn.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
  }

  function isLight() { return root.getAttribute('data-theme') === 'light'; }

  function sync() {
    btn.setAttribute('aria-checked', isLight() ? 'true' : 'false');
    btn.setAttribute('title', isLight() ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', theme); } catch (e) {}
    sync();
  }

  function setTheme(theme) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback: soft cross-fade
    if (!document.startViewTransition || reduce) {
      root.classList.add('theme-anim');
      applyTheme(theme);
      setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
      return;
    }

    // Ripple from the centre of the switch
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2;
    var y = r.top + r.height / 2;
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.classList.add('theme-vt');
    var transition = document.startViewTransition(function () { applyTheme(theme); });

    transition.ready.then(function () {
      root.animate(
        {
          clipPath: [
            'circle(0px at ' + x + 'px ' + y + 'px)',
            'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
          ]
        },
        {
          duration: 800,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(function () {});

    transition.finished.finally(function () { root.classList.remove('theme-vt'); });
  }

  btn.addEventListener('click', function () {
    setTheme(isLight() ? 'dark' : 'light');
  });

  sync();
})();
