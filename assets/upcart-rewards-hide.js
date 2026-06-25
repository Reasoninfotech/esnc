(function () {
  const UPCART_HOST_ID     = 'upCart';
  const REWARDS_SELECTOR   = '.upcart-internal-rewards.upcart-public-rewards';
  const HIDE_CLASS         = 'upcart-rewards--hidden';
  const STYLE_ID           = 'upcart-rewards-hide-style';

  const HIDDEN_VARIANT_IDS = [
    47906937241765,
    44476231450789
  ];

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function getShadowRoot() {
    const host = document.getElementById(UPCART_HOST_ID);
    return host && host.shadowRoot ? host.shadowRoot : null;
  }

  function injectStyle(shadowRoot) {
    if (shadowRoot.querySelector('#' + STYLE_ID)) return;
    const style = document.createElement('style');
    style.id    = STYLE_ID;
    style.textContent = `.${HIDE_CLASS}{display:none!important}`;
    shadowRoot.appendChild(style);
  }

  async function fetchCart() {
    try {
      const resp = await fetch('/cart.js', { cache: 'no-store' });
      return resp.ok ? await resp.json() : null;
    } catch (_) {
      return null;
    }
  }

  function shouldHide(items) {
    if (!items || items.length === 0) return false;
    const realProducts = items.filter(function (item) {
      return (
        !HIDDEN_VARIANT_IDS.includes(item.variant_id) &&
        !HIDDEN_VARIANT_IDS.includes(item.id)
      );
    });
    return realProducts.length === 0;
  }

  // ─── Core update ────────────────────────────────────────────────────────────

  async function update() {
    const shadowRoot = getShadowRoot();
    if (!shadowRoot) return false;

    const rewardsEl = shadowRoot.querySelector(REWARDS_SELECTOR);
    if (!rewardsEl) return false;           // shadow root exists but rewards not rendered yet

    injectStyle(shadowRoot);

    const cart = await fetchCart();
    if (!cart) return false;

    rewardsEl.classList.toggle(HIDE_CLASS, shouldHide(cart.items || []));
    return true;
  }

  // ─── Strategy 1: poll until rewards element appears ─────────────────────────
  //
  //  • Fast poll (200 ms) until update() fully succeeds OR timeout (10 s).
  //  • After first success, switch to a slow maintenance poll (800 ms)
  //    so cart changes (add/remove item) stay in sync.

  const FAST_POLL_MS = 200;
  const SLOW_POLL_MS = 800;
  const TIMEOUT_MS   = 10000;

  let fastIntervalId  = null;
  let slowIntervalId  = null;
  let elapsed         = 0;
  let initialized     = false;

  function stopFastPoll() {
    if (fastIntervalId !== null) {
      clearInterval(fastIntervalId);
      fastIntervalId = null;
    }
  }

  function startSlowPoll() {
    if (slowIntervalId !== null) return;        // already running
    slowIntervalId = setInterval(update, SLOW_POLL_MS);
  }

  async function fastTick() {
    elapsed += FAST_POLL_MS;

    const done = await update();

    if (done) {
      initialized = true;
      stopFastPoll();
      startSlowPoll();
      return;
    }

    if (elapsed >= TIMEOUT_MS) {
      // UpCart never rendered in time — give up fast poll.
      // MutationObserver (Strategy 2) will still catch it if it appears later.
      stopFastPoll();
    }
  }

  // ─── Strategy 2: MutationObserver fallback ──────────────────────────────────
  //
  //  Watches the document for the #upCart host element to be inserted.
  //  Once found, also watches its shadow root for the rewards element.
  //  This covers cases where UpCart loads long after the timeout fires.

  function watchShadowRoot(shadowRoot) {
    const observer = new MutationObserver(async function () {
      const done = await update();
      if (done && !initialized) {
        initialized = true;
        stopFastPoll();           // stop fast poll in case it's still running
        startSlowPoll();          // ensure maintenance poll is active
        observer.disconnect();    // shadow root is stable — no longer needed
      }
    });

    observer.observe(shadowRoot, { childList: true, subtree: true });
  }

  function watchForHost() {
    // If the host is already in the DOM, watch its shadow root immediately.
    const existingHost = document.getElementById(UPCART_HOST_ID);
    if (existingHost && existingHost.shadowRoot) {
      watchShadowRoot(existingHost.shadowRoot);
      return;
    }

    // Otherwise, wait for the host element to be added to the DOM.
    const bodyObserver = new MutationObserver(function (_, obs) {
      const host = document.getElementById(UPCART_HOST_ID);
      if (host && host.shadowRoot) {
        obs.disconnect();
        watchShadowRoot(host.shadowRoot);
      }
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Boot ───────────────────────────────────────────────────────────────────

  // Run one update immediately (no delay), then start polling.
  update().then(function (done) {
    if (done) {
      initialized = true;
      startSlowPoll();
      return;
    }
    // Not ready yet — start fast poll + observer together.
    fastIntervalId = setInterval(fastTick, FAST_POLL_MS);
    watchForHost();
  });
})();