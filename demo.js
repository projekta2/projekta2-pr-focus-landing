// demo.js - toda la lógica de la demo interactiva (sin inline)
(function() {
  const DRAFTS = [
    "Thanks for working on this OAuth 2.0 + PKCE migration.\n\nThe integration tests are failing in the session revocation suite — specifically around optional token_hint handling. I'd add an explicit test case for revocation without token_hint before merging.\n\nAlso, the access_token expiry is hardcoded to 3600s in auth_config.py — worth moving to an env variable for production flexibility.\n\nRequesting changes on those two points. 🔄",
    "Good implementation of the Redis cache layer. The 5-minute TTL seems reasonable for catalog data.\n\nOne suggestion: consider adding a hit/miss ratio metric to the cache middleware — it's one line with your existing instrumentation and will help you monitor cache effectiveness in production.\n\nApproved with that optional addition in mind. ✅",
    "Documentation looks accurate and aligns with the v3 API changes.\n\nMinor suggestion: adding an example of the X-RateLimit-Remaining header response in the anonymous client section would help developers know how to monitor their quota. Not a blocker.\n\nApproved. ✅"
  ];

  const CAPTIONS = [
    { icon: '🔴', text: '<strong>Step 1 — AI Risk Detection.</strong> PR Focus scores this auth PR at 87/100. CI is failing and it touches authentication — it auto-rises to the top of your inbox.' },
    { icon: '💡', text: '<strong>Step 2 — AI Summary.</strong> Without opening GitHub, you instantly understand what changed and why it matters. Generated directly from the git diff.' },
    { icon: '✨', text: '<strong>Step 3 — AI Draft Review.</strong> One click generates a professional, code-specific review. You edit, then submit to GitHub without switching tabs.' },
    { icon: '🟡', text: '<strong>Step 4 — Medium risk PR.</strong> Redis caching PR scores 48/100. CI still running, infra change. The AI drafts an approval with a concrete code suggestion.' },
    { icon: '🟢', text: '<strong>Step 5 — Low risk, approve fast.</strong> Docs-only PR with green CI scores just 12/100. The AI confirms it\'s safe and drafts a quick approval so you can move on.' },
    { icon: '🎉', text: '<strong>Demo complete.</strong> Three PRs reviewed, zero GitHub tabs opened. This is your new morning routine.' }
  ];

  let timers = [];
  let ctaShown = false;

  const SEQUENCE = [
    { delay: 0,    fn: () => { highlightCard(0); showTooltip(0); setCaption(0); setDot(0); } },
    { delay: 2200, fn: () => { clearTooltips(); glowSummary(0); setCaption(1); setDot(1); } },
    { delay: 2000, fn: () => { openDraft(0); setCaption(2); setDot(2); typeText(0); } },
    { delay: 4200, fn: () => { closeDraft(0); unhighlight(); } },
    { delay: 800,  fn: () => { highlightCard(1); glowSummary(1); showTooltip(1); setCaption(3); setDot(3); } },
    { delay: 2200, fn: () => { clearTooltips(); openDraft(1); typeText(1); setDot(4); } },
    { delay: 3800, fn: () => { closeDraft(1); unhighlight(); } },
    { delay: 700,  fn: () => { highlightCard(2); glowSummary(2); setCaption(4); setDot(4); } },
    { delay: 1800, fn: () => { openDraft(2); typeText(2); } },
    { delay: 3500, fn: () => { closeDraft(2); unhighlight(); setCaption(5); setDot(5); showCTA(); } },
  ];

  function runSequence(steps, i) {
    if (i >= steps.length) return;
    const t = setTimeout(() => {
      steps[i].fn();
      runSequence(steps, i + 1);
    }, steps[i].delay);
    timers.push(t);
  }

  function highlightCard(id) {
    unhighlight();
    const c = document.getElementById('card' + id);
    if (c) {
      c.classList.add('highlighted');
      setTimeout(() => c.classList.add('pulse'), 50);
    }
  }
  function unhighlight() {
    [0,1,2].forEach(i => {
      const c = document.getElementById('card' + i);
      if (c) c.classList.remove('highlighted', 'pulse');
    });
  }
  function showTooltip(id) {
    clearTooltips();
    const t = document.getElementById('tooltip' + id);
    if (t) t.style.display = 'block';
  }
  function clearTooltips() {
    document.querySelectorAll('.tour-tooltip').forEach(t => t.style.display = 'none');
  }
  function glowSummary(id) {
    const s = document.getElementById('summary' + id);
    if (!s) return;
    s.style.boxShadow = '0 0 0 2px var(--accent)';
    const t = setTimeout(() => { if (s) s.style.boxShadow = ''; }, 1600);
    timers.push(t);
  }
  function openDraft(id) {
    closeDraftAll();
    highlightCard(id);
    const btn = document.getElementById('draft' + id);
    if (btn) btn.classList.add('active');
    const ov = document.getElementById('overlay' + id);
    if (ov) ov.classList.add('open');
    const card = document.getElementById('card' + id);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function closeDraft(id) {
    const btn = document.getElementById('draft' + id);
    if (btn) btn.classList.remove('active');
    const ov = document.getElementById('overlay' + id);
    if (ov) ov.classList.remove('open');
    const ta = document.getElementById('draftText' + id);
    if (ta) ta.value = '';
  }
  function closeDraftAll() { [0,1,2].forEach(closeDraft); }
  function typeText(id) {
    const ta = document.getElementById('draftText' + id);
    if (!ta) return;
    ta.value = '';
    const text = DRAFTS[id];
    let i = 0;
    function type() {
      if (i < text.length) {
        ta.value += text[i++];
        ta.scrollTop = ta.scrollHeight;
        const t = setTimeout(type, 18);
        timers.push(t);
      }
    }
    type();
  }
  function setCaption(idx) {
    const icon = document.getElementById('captionIcon');
    const text = document.getElementById('captionText');
    if (!icon || !text || !CAPTIONS[idx]) return;
    icon.textContent = CAPTIONS[idx].icon;
    text.innerHTML = CAPTIONS[idx].text;
  }
  function setDot(idx) {
    for (let i = 0; i < 6; i++) {
      const d = document.getElementById('dot' + i);
      if (d) d.classList.toggle('active', i === idx);
    }
  }
  function showCTA() {
    if (ctaShown) return;
    ctaShown = true;
    showToast('🎉 Demo complete — ready to try it for real?');
  }
  function triggerDraft(id) {
    clearTimers();
    clearTooltips();
    closeDraftAll();
    openDraft(id);
    typeText(id);
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function resetDemo() {
    clearTimers();
    closeDraftAll();
    unhighlight();
    clearTooltips();
    ctaShown = false;
    setDot(0);
    setCaption(0);
    const intro = document.getElementById('introOverlay');
    intro.classList.remove('hidden');
    intro.style.opacity = '1';
    const fill = intro.querySelector('.intro-bar-fill');
    if (fill) {
      fill.style.animation = 'none';
      void fill.offsetWidth;
      fill.style.animation = 'barFill 3s linear forwards';
    }
    const t = setTimeout(startDemo, 3200);
    timers.push(t);
  }
  function startDemo() {
    const intro = document.getElementById('introOverlay');
    if (!intro) {
      console.warn('Intro overlay not found, retrying...');
      setTimeout(startDemo, 200);
      return;
    }
    intro.style.transition = 'opacity .4s';
    intro.style.opacity = '0';
    setTimeout(() => {
      intro.classList.add('hidden');
      setCaption(0);
      runSequence(SEQUENCE, 0);
    }, 420);
  }
  function initDemo() {
    clearTimers();
    setTimeout(startDemo, 500);
  }
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3200);
  }

  // Inicialización cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }

  // Asignación de eventos (después de cargar el DOM)
  document.addEventListener('DOMContentLoaded', function() {
    // Botones draft
    document.getElementById('draft0')?.addEventListener('click', (e) => { e.stopPropagation(); triggerDraft(0); });
    document.getElementById('draft1')?.addEventListener('click', (e) => { e.stopPropagation(); triggerDraft(1); });
    document.getElementById('draft2')?.addEventListener('click', (e) => { e.stopPropagation(); triggerDraft(2); });

    // Acciones en overlays
    document.querySelectorAll('.draft-send-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('🔧 Simulated action — in the real extension this submits directly to GitHub');
        const id = btn.getAttribute('data-id');
        if (id !== null) closeDraft(parseInt(id));
      });
    });
    document.querySelectorAll('[data-action="post"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('🔧 Simulated action — posts as a PR comment via GitHub API');
        const id = btn.getAttribute('data-id');
        if (id !== null) closeDraft(parseInt(id));
      });
    });
    document.querySelectorAll('[data-action="dismiss"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (id !== null) closeDraft(parseInt(id));
      });
    });

    // Botones flotantes
    document.getElementById('restartDemoBtn')?.addEventListener('click', resetDemo);
    document.getElementById('forceStartBtn')?.addEventListener('click', resetDemo);
    document.getElementById('floatAddToChrome')?.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      } else {
        alert('Please install the extension first.');
      }
    });
    document.getElementById('openOptionsBtn')?.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      } else {
        alert('Please install the extension first from the Chrome Web Store.');
      }
    });
  });
})();