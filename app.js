/**
 * ============================================================================
 * KHU VƯỜN HOA HỒNG 20/10 — INTERACTIVE APPLICATION ENGINE
 * - Continuous Looping Growing Rose Tree Engine (Sprout -> Big Blooming Rose Tree -> Loop)
 * - 20/10 Sky Airplane & Fluttering Banner Integration
 * - Silent Cloud Order Sync & Live Order Viewer (Know immediately what she picked!)
 * - 60fps Falling Rose Petals Canvas + Touch Burst
 * - Bespoke Vector Drink & Gift Illustration Renderer
 * - Web Audio API Romantic Music Box & Chimes
 * ============================================================================
 */

(function () {
  "use strict";

  const DEFAULT_CONFIG = JSON.parse(JSON.stringify(window.ROSE_CONFIG));
  let config = JSON.parse(JSON.stringify(window.ROSE_CONFIG));

  function getOrCreateSessionTicketCode() {
    try {
      const existing = sessionStorage.getItem("rose_session_ticket_code_2010");
      if (existing) return existing;
      const created = "#2010-" + Math.floor(1000 + Math.random() * 9000);
      sessionStorage.setItem("rose_session_ticket_code_2010", created);
      return created;
    } catch (e) {
      return "#2010-" + Math.floor(1000 + Math.random() * 9000);
    }
  }

  const state = {
    currentStage: "intro",
    activeCategory: "all",
    selectedIds: [],
    customWishText: "",
    pendingWishGiftId: null,
    ticketCode: getOrCreateSessionTicketCode(),
    ticketTime: "",
    audioEnabled: true
  };

  // ==========================================================================
  // 1. URL & LOCALSTORAGE CONFIG LOADER
  // ==========================================================================
  function encodeConfigToUrlParam(cfgObj) {
    try {
      const compact = {
        m: cfgObj.maxSelections || 3,
        ch: cfgObj.orderChannelId || DEFAULT_CONFIG.orderChannelId,
        r: cfgObj.recipientName,
        s: cfgObj.senderName,
        g: cfgObj.letterGreeting,
        b: cfgObj.letterBody,
        items: cfgObj.gifts.map((item) => ({
          i: item.id,
          t: item.title,
          d: item.description,
          ic: item.icon,
          c: item.category || "fruit-tea",
          cw: item.isCustomInput ? 1 : 0
        }))
      };
      const jsonStr = JSON.stringify(compact);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = "";
      utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    } catch (e) {
      return "";
    }
  }

  function decodeConfigFromUrlParam(encoded) {
    try {
      let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      const compact = JSON.parse(jsonStr);
      if (compact && compact.r) {
        config.maxSelections = Number(compact.m) || 3;
        config.orderChannelId = compact.ch || DEFAULT_CONFIG.orderChannelId;
        config.recipientName = compact.r;
        config.senderName = compact.s || config.senderName;
        config.letterGreeting = compact.g || config.letterGreeting;
        config.letterBody = compact.b || config.letterBody;
        if (Array.isArray(compact.items) && compact.items.length >= 1) {
          config.gifts = compact.items.map((it, idx) => ({
            id: it.i || "item-" + idx,
            title: it.t || "Món #" + (idx + 1),
            subtitle: "Menu 20/10",
            description: it.d || "Món đặc biệt nhân ngày Phụ nữ Việt Nam 20/10.",
            icon: it.ic || "🧋",
            badge: it.cw ? "Tự chọn" : "20/10",
            category: it.c || "fruit-tea",
            isCustomInput: Boolean(it.cw)
          }));
        }
        return true;
      }
    } catch (e) {
      console.warn("Invalid URL config param:", e);
    }
    return false;
  }

  function loadInitialConfig() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1" || params.get("edit") === "1") {
      document.querySelectorAll(".creator-only-btn").forEach((btn) => {
        btn.classList.remove("hidden");
      });
    } else {
      document.querySelectorAll(".creator-only-btn").forEach((btn) => {
        btn.classList.add("hidden");
      });
    }

    const encoded = params.get("c");
    if (encoded && decodeConfigFromUrlParam(encoded)) {
      return;
    }

    try {
      // Clean up legacy test orders cache from development
      localStorage.removeItem("rose_orders_history_2010");
      const saved = localStorage.getItem("rose_menu_config_2010_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.recipientName && Array.isArray(parsed.gifts)) {
          if (parsed.orderChannelId === "rose2010-vibecode-86032005") {
            parsed.orderChannelId = "rose2010-vibecode-live-2010";
          }
          config = parsed;
        }
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 2. SILENT CLOUD ORDER TRACKER (CLEAN, DEDUPLICATED & MANAGEABLE)
  // ==========================================================================
  const ORDERS_STORAGE_KEY = "rose_orders_history_2010_v2";
  const ORDERS_CLEARED_AT_KEY = "rose_orders_cleared_at_2010";
  const ORDERS_DELETED_IDS_KEY = "rose_orders_deleted_ids_2010";

  function getCleanChannelId() {
    const raw = (
      config.orderChannelId ||
      DEFAULT_CONFIG.orderChannelId ||
      "rose2010-vibecode-live-2010"
    ).trim();
    const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "") || "rose2010-vibecode-live-2010";
    return cleaned === "rose2010-vibecode-86032005"
      ? "rose2010-vibecode-live-2010"
      : cleaned;
  }

  function buildOrderPayload(isNoteUpdate = false) {
    const ordererName =
      ((document.getElementById("orderer-name-input") || {}).value || "").trim() ||
      "Người nhận 💕";
    const noteText =
      ((document.getElementById("recipient-note-input") || {}).value || "").trim();

    const chosenItems = state.selectedIds.map((id) => {
      const gift = config.gifts.find((g) => g.id === id);
      if (!gift) return "Món đã chọn";
      return gift.isCustomInput && state.customWishText
        ? `${gift.icon} ${gift.title} (${state.customWishText})`
        : `${gift.icon} ${gift.title}`;
    });

    return {
      type: "ROSE_2010_ORDER",
      isUpdate: isNoteUpdate,
      ticketCode: state.ticketCode,
      createdAt: Date.now(),
      time: state.ticketTime || formatCurrentTimestamp(),
      who: ordererName,
      items: chosenItems,
      note: noteText
    };
  }

  async function sendOrderSilentlyToCloud(isNoteUpdate = false) {
    const payload = buildOrderPayload(isNoteUpdate);

    // 1. Save/Update in local history (deduplicated by ticketCode)
    try {
      const localList = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
      const existingIndex = localList.findIndex((o) => o.ticketCode === payload.ticketCode);
      if (existingIndex !== -1) {
        localList[existingIndex] = payload;
      } else {
        localList.unshift(payload);
      }
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localList.slice(0, 50)));
    } catch (e) {}

    // 2. Send silently to ntfy.sh public pub/sub channel
    const channelId = getCleanChannelId();
    try {
      await fetch(`https://ntfy.sh/${encodeURIComponent(channelId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Title: isNoteUpdate ? "Cap nhat ghi chu 20/10" : "Co don chon mon 20/10 moi!"
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    // 3. Optional custom webhook
    if (config.customWebhookUrl && config.customWebhookUrl.startsWith("http")) {
      try {
        await fetch(config.customWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: buildSummaryText(),
            order: payload
          })
        });
      } catch (e) {}
    }
  }

  async function clearAllOrdersOnCloud() {
    const nowTs = Date.now();
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      localStorage.setItem(ORDERS_CLEARED_AT_KEY, String(nowTs));
      localStorage.removeItem(ORDERS_DELETED_IDS_KEY);
    } catch (e) {}

    const channelId = getCleanChannelId();
    try {
      await fetch(`https://ntfy.sh/${encodeURIComponent(channelId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Title: "Xoa don cu 20/10"
        },
        body: JSON.stringify({
          type: "ROSE_2010_CLEAR_ALL",
          clearedAt: nowTs
        })
      });
    } catch (e) {}

    showToast("🗑️ Đã xóa sạch toàn bộ đơn cũ!");
    fetchAndRenderCloudOrders();
  }

  async function deleteSingleOrderOnCloud(ticketCode) {
    if (!ticketCode) return;
    try {
      const localList = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]").filter(
        (o) => o && o.ticketCode !== ticketCode
      );
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localList));

      const deletedIds = JSON.parse(localStorage.getItem(ORDERS_DELETED_IDS_KEY) || "[]");
      if (!deletedIds.includes(ticketCode)) {
        deletedIds.push(ticketCode);
        localStorage.setItem(ORDERS_DELETED_IDS_KEY, JSON.stringify(deletedIds));
      }
    } catch (e) {}

    const channelId = getCleanChannelId();
    try {
      await fetch(`https://ntfy.sh/${encodeURIComponent(channelId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Title: "Xoa 1 don 20/10"
        },
        body: JSON.stringify({
          type: "ROSE_2010_DELETE_ONE",
          ticketCode,
          deletedAt: Date.now()
        })
      });
    } catch (e) {}

    showToast(`🗑️ Đã xóa đơn ${ticketCode}!`);
    fetchAndRenderCloudOrders();
  }

  async function fetchAndRenderCloudOrders() {
    const container = document.getElementById("orders-list-container");
    const channelBadge = document.getElementById("display-channel-id");
    const channelId = getCleanChannelId();
    if (channelBadge) channelBadge.textContent = channelId;
    if (!container) return;

    container.innerHTML = `<p class="orders-empty-state">⏳ Đang tải danh sách món người ấy đã chọn...</p>`;

    const mergedMap = new Map();
    let clearedAt = Number(localStorage.getItem(ORDERS_CLEARED_AT_KEY) || 0);
    const deletedSet = new Set();

    try {
      const savedDeleted = JSON.parse(localStorage.getItem(ORDERS_DELETED_IDS_KEY) || "[]");
      savedDeleted.forEach((id) => deletedSet.add(id));
    } catch (e) {}

    // 1. Load local orders first
    try {
      const localList = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
      localList.forEach((o) => {
        if (o && o.ticketCode && !deletedSet.has(o.ticketCode)) {
          if (!o.createdAt || o.createdAt > clearedAt) {
            mergedMap.set(o.ticketCode, o);
          }
        }
      });
    } catch (e) {}

    // 2. Fetch live cloud orders & delete commands from ntfy.sh JSON feed
    try {
      const res = await fetch(
        `https://ntfy.sh/${encodeURIComponent(channelId)}/json?poll=1&since=72h`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        lines.forEach((line) => {
          try {
            const event = JSON.parse(line);
            if (event && event.event === "message" && event.message) {
              const data = JSON.parse(event.message);
              const eventTimeMs = (event.time || 0) * 1000;

              if (data && data.type === "ROSE_2010_CLEAR_ALL") {
                const cTime = data.clearedAt || eventTimeMs;
                if (cTime >= clearedAt) {
                  clearedAt = cTime;
                  mergedMap.clear();
                }
              } else if (data && data.type === "ROSE_2010_DELETE_ONE" && data.ticketCode) {
                deletedSet.add(data.ticketCode);
                mergedMap.delete(data.ticketCode);
              } else if (data && data.type === "ROSE_2010_ORDER" && data.ticketCode) {
                const ordTime = data.createdAt || eventTimeMs;
                if (ordTime > clearedAt && !deletedSet.has(data.ticketCode)) {
                  mergedMap.set(data.ticketCode, data);
                }
              }
            }
          } catch (innerErr) {}
        });
      }
    } catch (err) {
      console.warn("Could not fetch remote orders:", err);
    }

    const orders = Array.from(mergedMap.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="orders-empty-state">
          <p style="font-size: 1.5rem; margin-bottom: 8px;">🌹</p>
          <p><strong>Danh sách đơn đang trống (Chưa có đơn mới).</strong></p>
          <p style="margin-top: 6px; font-size: 0.78rem;">
            Ngay khi người ấy chọn món (từ 1 đến 3 món) và bấm <strong>"Chốt đơn"</strong>, đơn hàng sẽ tự động hiện ngay tại đây!
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    orders.forEach((ord) => {
      const card = document.createElement("div");
      card.className = "order-record-card";
      const itemsHtml = (ord.items || [])
        .map(
          (it, i) => `
          <div class="order-item-pill">
            <span class="order-item-num">${i + 1}</span>
            <span>${escapeHtml(it)}</span>
          </div>`
        )
        .join("");

      const statusText = ord.isUpdate ? "✨ Đã cập nhật ghi chú" : "✓ Đã chốt món";

      card.innerHTML = `
        <div class="order-record-top">
          <span class="order-record-who">👤 ${escapeHtml(ord.who || "Người nhận")} (${escapeHtml(
        ord.ticketCode
      )})</span>
          <span class="order-record-time">🕒 ${escapeHtml(ord.time || "")}</span>
        </div>
        <div class="order-record-items">
          ${itemsHtml}
        </div>
        ${
          ord.note
            ? `<div class="order-record-note">📝 Ghi chú: "${escapeHtml(ord.note)}"</div>`
            : ""
        }
        <div class="order-record-actions">
          <span class="order-status-tag">${statusText}</span>
          <div class="order-action-btns">
            <button type="button" class="order-card-btn copy-ord-btn">📋 Copy đơn</button>
            <button type="button" class="order-card-btn delete del-ord-btn">✕ Xóa</button>
          </div>
        </div>
      `;

      card.querySelector(".copy-ord-btn").addEventListener("click", () => {
        const text = [
          `🌹 ĐƠN QUÀ 20/10 (${ord.ticketCode})`,
          `👤 Người nhận: ${ord.who || "Người nhận"}`,
          `🕒 Thời gian: ${ord.time || ""}`,
          `🧋 Món đã chọn:\n${(ord.items || []).map((it, i) => `  ${i + 1}. ${it}`).join("\n")}`,
          ord.note ? `📝 Ghi chú: ${ord.note}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        copyTextToClipboard(text);
      });

      card.querySelector(".del-ord-btn").addEventListener("click", () => {
        deleteSingleOrderOnCloud(ord.ticketCode);
      });

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // 3. WEB AUDIO API ROMANTIC MUSIC BOX & CHIMES (AUTO-PLAY ON APP ENTRY)
  // ==========================================================================
  const SoundEngine = (function () {
    let ctx = null;
    let melodyTimer = null;
    let noteIndex = 0;

    const MELODY_NOTES = [
      523.25, 659.25, 783.99, 987.77, 783.99, 659.25,
      587.33, 698.46, 880.0, 1046.5, 880.0, 698.46,
      493.88, 659.25, 783.99, 987.77, 783.99, 659.25,
      523.25, 587.33, 659.25, 783.99, 1046.5, 783.99
    ];

    function ensureContext() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) ctx = new AudioCtx();
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function playTone(freq, duration, delay = 0, volume = 0.07, type = "sine") {
      const audio = ensureContext();
      if (!audio || audio.state !== "running") return;

      const startTime = audio.currentTime + delay;
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(audio.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.04);
    }

    function playChime(kind, step = 1) {
      try {
        if (kind === "select") {
          const base = step === 1 ? 587.33 : step === 2 ? 659.25 : 783.99;
          playTone(base, 0.32, 0, 0.075, "sine");
          playTone(base * 1.25, 0.45, 0.06, 0.075, "triangle");
        } else if (kind === "deselect") {
          playTone(523.25, 0.2, 0, 0.045, "sine");
          playTone(440.0, 0.25, 0.05, 0.04, "sine");
        } else if (kind === "limit") {
          playTone(349.23, 0.16, 0, 0.055, "sine");
          playTone(329.63, 0.2, 0.09, 0.055, "sine");
        } else if (kind === "celebrate") {
          const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
          chord.forEach((n, i) => playTone(n, 0.85, i * 0.075, 0.085, "triangle"));
        }
      } catch (e) {}
    }

    function startMusicBox() {
      ensureContext();
      state.audioEnabled = true;
      updateAudioUI();

      if (melodyTimer) return;
      melodyTimer = setInterval(() => {
        if (!state.audioEnabled) return;
        const audio = ensureContext();
        if (!audio || audio.state !== "running") return;
        const note = MELODY_NOTES[noteIndex % MELODY_NOTES.length];
        playTone(note, 0.95, 0, 0.032, "sine");
        if (noteIndex % 3 === 0) {
          playTone(note * 0.5, 1.3, 0, 0.018, "triangle");
        }
        noteIndex++;
      }, 500);
    }

    function stopMusicBox() {
      state.audioEnabled = false;
      if (melodyTimer) {
        clearInterval(melodyTimer);
        melodyTimer = null;
      }
      updateAudioUI();
    }

    function toggleMusicBox() {
      if (state.audioEnabled && ctx && ctx.state === "running") {
        stopMusicBox();
      } else {
        startMusicBox();
      }
    }

    function updateAudioUI() {
      const btn = document.getElementById("btn-toggle-audio");
      const label = document.getElementById("audio-label");
      if (!btn || !label) return;
      if (state.audioEnabled) {
        btn.classList.add("playing");
        label.textContent = "Nhạc";
      } else {
        btn.classList.remove("playing");
        label.textContent = "Tắt";
      }
    }

    // Automatically start music on entry + unlock AudioContext on first user touch/scroll if browser deferred autoplay
    function initAutoPlayOnEntry() {
      startMusicBox();
      const unlockEvents = ["pointerdown", "touchstart", "click", "scroll", "keydown"];
      const unlockHandler = () => {
        if (state.audioEnabled) {
          ensureContext();
        }
        if (ctx && ctx.state === "running") {
          unlockEvents.forEach((ev) =>
            window.removeEventListener(ev, unlockHandler, { passive: true })
          );
        }
      };
      unlockEvents.forEach((ev) =>
        window.addEventListener(ev, unlockHandler, { passive: true })
      );
    }

    return {
      playChime,
      startMusicBox,
      stopMusicBox,
      toggleMusicBox,
      initAutoPlayOnEntry
    };
  })();

  // ==========================================================================
  // 4. LIGHTWEIGHT 60FPS AMBIENT FALLING ROSE PETALS & TOUCH BURST ENGINE
  // ==========================================================================
  const RoseCanvas = (function () {
    const canvas = document.getElementById("rose-canvas");
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const PETAL_COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3"];

    const petals = [];
    const bursts = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize, { passive: true });

    function createPetal(randomY = false) {
      const size = 5.5 + Math.random() * 6.5;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20 - Math.random() * 30,
        size,
        speedY: 0.5 + Math.random() * 0.75,
        speedX: -0.25 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: -0.012 + Math.random() * 0.024,
        swayAmp: 0.35 + Math.random() * 0.65,
        swayPhase: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        alpha: 0.38 + Math.random() * 0.28
      };
    }

    // Keep particle count lightweight for silky 60fps on mobile
    const initialPetalCount = window.innerWidth < 600 ? 10 : 16;
    for (let i = 0; i < initialPetalCount; i++) {
      petals.push(createPetal(true));
    }

    function drawSinglePetal(x, y, s, angle, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.8, s, s * 0.45, 0, s);
      ctx.bezierCurveTo(-s, s * 0.45, -s * 0.9, -s * 0.8, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    function spawnBurst(x, y, count = 12) {
      const actualCount = Math.min(count, 14);
      for (let i = 0; i < actualCount; i++) {
        const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.35;
        const speed = 1.6 + Math.random() * 3.8;
        bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          gravity: 0.1,
          size: 4.5 + Math.random() * 5.5,
          angle: Math.random() * Math.PI * 2,
          spin: -0.06 + Math.random() * 0.12,
          alpha: 0.9,
          decay: 0.02 + Math.random() * 0.015,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.swayPhase += 0.016;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.swayPhase) * p.swayAmp;
        p.angle += p.spinSpeed;

        if (p.y > height + 24) {
          Object.assign(p, createPetal(false));
        }
        if (p.x > width + 24) p.x = -16;
        if (p.x < -24) p.x = width + 16;

        drawSinglePetal(p.x, p.y, p.size, p.angle, p.color, p.alpha);
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += b.gravity;
        b.vx *= 0.98;
        b.angle += b.spin;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        drawSinglePetal(b.x, b.y, b.size, b.angle, b.color, b.alpha);
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return {
      spawnBurst
    };
  })();

  // ==========================================================================
  // 5. SUBTLE WATERCOLOR ROSE TREE IN WHITE CARD BACKGROUND (ZERO-LAG, MONOCHROME BLUSH)
  //    - Grows softly inside the white greeting card (.letter-paper)
  //    - Cohesive soft blush-rose & sage tone (not garish or multi-colored)
  //    - Zero per-frame gradient/shadow allocations for locked 60fps on mobile
  // ==========================================================================
  (function initGrowingRoseTreeLoop() {
    const canvas = document.getElementById("rose-tree-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 460;
    let height = 520;
    let startTime = performance.now();

    const LOOP_DURATION = 9.0;

    let canes = [];
    let leaves = [];
    let roses = [];

    // Single harmonious, soft blush-rose & sage botanical palette (refined & never garish)
    const SOFT_ROSE_TONE = {
      stem: "#6b9080",
      leaf: "#84a98c",
      leafVein: "#cad2c5",
      sepal: "#6b9080",
      outer: "#e11d48",
      mid: "#f43f5e",
      inner: "#fb7185",
      rim: "#ffe4e6",
      core: "#be123c"
    };

    function getQuadPoint(x0, y0, cx, cy, x1, y1, t) {
      const mt = 1 - t;
      return {
        x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
        y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1
      };
    }

    function getQuadTangent(x0, y0, cx, cy, x1, y1, t) {
      const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
      const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
      return Math.atan2(dy, dx);
    }

    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    function easeOutBack(x) {
      const c1 = 1.45;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    function buildRoseBushGeometry() {
      canes = [];
      leaves = [];
      roses = [];

      const cx = width * 0.52;
      const groundY = height - 10;
      const scale = Math.min(width / 380, height / 460);

      function addRoseCane(x0, y0, ctrlX, ctrlY, x1, y1, rStart, rEnd, tStart, tDur, depth) {
        canes.push({
          x0,
          y0,
          ctrlX,
          ctrlY,
          x1,
          y1,
          rStart,
          rEnd,
          tStart,
          tDur,
          depth
        });

        const leafCount = depth === 0 ? 4 : 2;
        for (let i = 1; i <= leafCount; i++) {
          const u = (i / (leafCount + 1)) * 0.85 + 0.08;
          const pt = getQuadPoint(x0, y0, ctrlX, ctrlY, x1, y1, u);
          const tang = getQuadTangent(x0, y0, ctrlX, ctrlY, x1, y1, u);
          const side = i % 2 === 0 ? 1 : -1;
          leaves.push({
            x: pt.x,
            y: pt.y,
            angle: tang + side * 0.72,
            size: (depth === 0 ? 12.5 : 9.5) * scale,
            tStart: tStart + tDur * u + 0.08,
            tDur: 0.7
          });
        }
      }

      // 5 Graceful Arching Rose Stems growing inside the white card
      const mainCanes = [
        { ox: -10, ctrlX: -85, ctrlY: -120, dx: -118, dy: -210, r: 28, delay: 0.05 },
        { ox: -5, ctrlX: -48, ctrlY: -190, dx: -64, dy: -305, r: 34, delay: 0.14 },
        { ox: 0, ctrlX: 6, ctrlY: -220, dx: 0, dy: -355, r: 40, delay: 0.22 },
        { ox: 5, ctrlX: 50, ctrlY: -185, dx: 68, dy: -298, r: 34, delay: 0.14 },
        { ox: 10, ctrlX: 88, ctrlY: -118, dx: 120, dy: -205, r: 28, delay: 0.05 }
      ];

      mainCanes.forEach((mc, idx) => {
        const startX = cx + mc.ox * scale;
        const startY = groundY;
        const cX = cx + mc.ctrlX * scale;
        const cY = groundY + mc.ctrlY * scale;
        const endX = cx + mc.dx * scale;
        const endY = groundY + mc.dy * scale;

        addRoseCane(
          startX,
          startY,
          cX,
          cY,
          endX,
          endY,
          4.8 * scale,
          2.2 * scale,
          mc.delay,
          1.1,
          0
        );

        roses.push({
          x: endX,
          y: endY,
          radius: mc.r * scale,
          tStart: mc.delay + 0.85,
          tDur: 1.6,
          swayOffset: idx * 0.9,
          tilt: (idx - 2) * 0.1,
          isBudOnly: false
        });

        // Subtle side rose shoot
        const origin = getQuadPoint(startX, startY, cX, cY, endX, endY, 0.56);
        const dir = idx < 2 ? -1 : idx > 2 ? 1 : -1;
        const sx = origin.x + dir * 32 * scale;
        const sy = origin.y - 44 * scale;
        const sDelay = mc.delay + 0.45;

        addRoseCane(
          origin.x,
          origin.y,
          (origin.x + sx) * 0.5,
          origin.y - 22 * scale,
          sx,
          sy,
          2.6 * scale,
          1.4 * scale,
          sDelay,
          0.8,
          1
        );

        roses.push({
          x: sx,
          y: sy,
          radius: (idx === 2 ? 26 : 20) * scale,
          tStart: sDelay + 0.6,
          tDur: 1.45,
          swayOffset: idx * 1.3 + 0.5,
          tilt: dir * 0.15,
          isBudOnly: idx % 2 === 0
        });
      });

      roses.sort((a, b) => a.radius - b.radius);
    }

    function drawRoseCane(c, progress, swayX, treeAlpha) {
      const steps = 12;
      const maxStep = Math.max(1, Math.floor(steps * progress));

      ctx.save();
      ctx.globalAlpha = treeAlpha;
      ctx.lineCap = "round";
      ctx.strokeStyle = SOFT_ROSE_TONE.stem;

      for (let i = 0; i < maxStep; i++) {
        const u0 = (i / steps) * progress;
        const u1 = ((i + 1) / steps) * progress;
        const p0 = getQuadPoint(
          c.x0,
          c.y0,
          c.ctrlX + swayX * 0.45,
          c.ctrlY,
          c.x1 + swayX,
          c.y1,
          u0
        );
        const p1 = getQuadPoint(
          c.x0,
          c.y0,
          c.ctrlX + swayX * 0.45,
          c.ctrlY,
          c.x1 + swayX,
          c.y1,
          u1
        );

        const w = (c.rStart * (1 - u0) + c.rEnd * u0) * (0.5 + 0.5 * progress);
        ctx.lineWidth = Math.max(1.2, w);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawSingleRoseLeaflet(len, wid) {
      ctx.fillStyle = SOFT_ROSE_TONE.leaf;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.45, -wid * 0.85, len, 0);
      ctx.quadraticCurveTo(len * 0.45, wid * 0.85, 0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = SOFT_ROSE_TONE.leafVein;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len * 0.82, 0);
      ctx.stroke();
    }

    function drawCompoundRoseLeaf(leaf, progress, swayAngle, treeAlpha) {
      const scale = easeOutBack(Math.min(1, progress));
      if (scale <= 0.02) return;

      ctx.save();
      ctx.globalAlpha = treeAlpha;
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle + swayAngle * 0.45);
      ctx.scale(scale, scale);

      const s = leaf.size;

      ctx.save();
      ctx.translate(s * 0.2, 0);
      ctx.rotate(-0.72);
      drawSingleRoseLeaflet(s * 0.85, s * 0.42);
      ctx.restore();

      ctx.save();
      ctx.translate(s * 0.2, 0);
      ctx.rotate(0.72);
      drawSingleRoseLeaflet(s * 0.85, s * 0.42);
      ctx.restore();

      ctx.save();
      ctx.translate(s * 0.42, 0);
      drawSingleRoseLeaflet(s * 1.25, s * 0.56);
      ctx.restore();

      ctx.restore();
    }

    // Fast, zero-gradient sculpted rose petal with delicate blush rim
    function drawVelvetRosePetal(dist, widthP, heightP, fillCol, rimColor) {
      ctx.fillStyle = fillCol;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -widthP * 0.95,
        -dist * 0.35,
        -widthP * 1.1,
        -dist - heightP * 0.72,
        -widthP * 0.2,
        -dist - heightP * 0.96
      );
      ctx.quadraticCurveTo(0, -dist - heightP * 1.04, widthP * 0.2, -dist - heightP * 0.96);
      ctx.bezierCurveTo(
        widthP * 1.1,
        -dist - heightP * 0.72,
        widthP * 0.95,
        -dist * 0.35,
        0,
        0
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-widthP * 0.68, -dist - heightP * 0.5);
      ctx.quadraticCurveTo(0, -dist - heightP * 1.04, widthP * 0.68, -dist - heightP * 0.5);
      ctx.stroke();
    }

    function drawBloomingRose(rose, progress, swayX, swayY, treeAlpha) {
      if (progress <= 0) return;

      const x = rose.x + swayX;
      const y = rose.y + swayY;
      const maxR = rose.radius;

      ctx.save();
      ctx.globalAlpha = treeAlpha;
      ctx.translate(x, y);
      ctx.rotate(rose.tilt || 0);

      const budScale = easeOutCubic(Math.min(1, progress / 0.3));
      const sepalOpen = Math.min(1, progress * 1.15);

      ctx.fillStyle = SOFT_ROSE_TONE.sepal;
      for (let s = 0; s < 5; s++) {
        const ang = (s * Math.PI * 2) / 5 + 0.31;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        const sepalLen = maxR * (0.58 + 0.42 * sepalOpen) * budScale;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(maxR * 0.15, -sepalLen * 0.48, 0, -sepalLen);
        ctx.quadraticCurveTo(-maxR * 0.15, -sepalLen * 0.48, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      if (rose.isBudOnly) {
        const bProg = easeOutBack(Math.min(1, progress));
        ctx.scale(bProg, bProg);
        drawVelvetRosePetal(maxR * 0.12, maxR * 0.4, maxR * 0.68, SOFT_ROSE_TONE.outer, SOFT_ROSE_TONE.rim);
        ctx.rotate(0.42);
        drawVelvetRosePetal(maxR * 0.1, maxR * 0.34, maxR * 0.62, SOFT_ROSE_TONE.mid, SOFT_ROSE_TONE.rim);
        ctx.rotate(-0.84);
        drawVelvetRosePetal(maxR * 0.1, maxR * 0.34, maxR * 0.62, SOFT_ROSE_TONE.mid, SOFT_ROSE_TONE.rim);
        ctx.restore();
        return;
      }

      // Outer 5 Guard Petals
      if (progress > 0.12) {
        const outerP = easeOutBack(Math.min(1, (progress - 0.12) / 0.65));
        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5 + (1 - outerP) * 0.4;
          ctx.save();
          ctx.rotate(ang);
          drawVelvetRosePetal(
            maxR * 0.2 * outerP,
            maxR * 0.54 * outerP,
            maxR * 0.68 * outerP,
            SOFT_ROSE_TONE.outer,
            SOFT_ROSE_TONE.rim
          );
          ctx.restore();
        }
      }

      // Middle 5 Cupped Petals
      if (progress > 0.26) {
        const midP = easeOutBack(Math.min(1, (progress - 0.26) / 0.6));
        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5 + 0.62 - (1 - midP) * 0.32;
          ctx.save();
          ctx.rotate(ang);
          drawVelvetRosePetal(
            maxR * 0.15 * midP,
            maxR * 0.44 * midP,
            maxR * 0.55 * midP,
            SOFT_ROSE_TONE.mid,
            SOFT_ROSE_TONE.rim
          );
          ctx.restore();
        }
      }

      // Inner 5 Spiral Petals
      const innerP = easeOutCubic(Math.min(1, Math.max(0.28, progress)));
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5 + 1.24 + (1 - innerP) * 0.28;
        ctx.save();
        ctx.rotate(ang);
        drawVelvetRosePetal(
          maxR * 0.08 * innerP,
          maxR * 0.32 * innerP,
          maxR * 0.4 * innerP,
          SOFT_ROSE_TONE.inner,
          SOFT_ROSE_TONE.rim
        );
        ctx.restore();
      }

      // Spiral Rosebud Core
      const coreR = maxR * 0.28 * innerP;
      ctx.fillStyle = SOFT_ROSE_TONE.core;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = SOFT_ROSE_TONE.rim;
      ctx.lineCap = "round";
      for (let s = 0; s < 3; s++) {
        const sAng = (s * Math.PI * 2) / 3 + progress * 0.35;
        ctx.save();
        ctx.rotate(sAng);
        ctx.lineWidth = Math.max(1.0, maxR * 0.05);
        ctx.beginPath();
        ctx.arc(maxR * 0.035 * innerP, 0, coreR * 0.66, -0.25, Math.PI * 1.05);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    function resizeCanvas() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width || 460;
      height = rect.height || 520;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildRoseBushGeometry();
    }

    function renderFrame(now) {
      // Only render when Stage 1 (intro) is active to save 100% GPU when browsing Menu!
      if (state.currentStage !== "intro") {
        requestAnimationFrame(renderFrame);
        return;
      }

      let elapsed = (now - startTime) / 1000;
      if (elapsed >= LOOP_DURATION) {
        startTime = now;
        elapsed = 0;
      }

      let treeAlpha = 1;
      if (elapsed > LOOP_DURATION - 1.1) {
        treeAlpha = Math.max(0, (LOOP_DURATION - elapsed) / 1.1);
      }

      ctx.clearRect(0, 0, width, height);

      const breeze = Math.sin(now * 0.0016) * 3.0;

      for (let i = 0; i < canes.length; i++) {
        const c = canes[i];
        if (elapsed < c.tStart) continue;
        const prog = easeOutCubic(Math.min(1, (elapsed - c.tStart) / c.tDur));
        const caneSway = c.depth === 0 ? breeze * 0.5 : breeze * 0.85;
        drawRoseCane(c, prog, caneSway, treeAlpha);
      }

      for (let i = 0; i < leaves.length; i++) {
        const lf = leaves[i];
        if (elapsed < lf.tStart) continue;
        const prog = Math.min(1, (elapsed - lf.tStart) / lf.tDur);
        const swayAng = Math.sin(now * 0.002 + i) * 0.06;
        drawCompoundRoseLeaf(lf, prog, swayAng, treeAlpha);
      }

      for (let i = 0; i < roses.length; i++) {
        const r = roses[i];
        if (elapsed < r.tStart) continue;
        const prog = Math.min(1, (elapsed - r.tStart) / r.tDur);
        const rSwayX = breeze * 0.75 + Math.cos(now * 0.0018 + r.swayOffset) * 1.2;
        const rSwayY = Math.sin(now * 0.002 + r.swayOffset) * 1.0;
        drawBloomingRose(r, prog, rSwayX, rSwayY, treeAlpha);
      }

      requestAnimationFrame(renderFrame);
    }

    window.addEventListener("resize", resizeCanvas, { passive: true });
    setTimeout(() => {
      resizeCanvas();
      requestAnimationFrame(renderFrame);
    }, 30);
  })();

  // ==========================================================================
  // 6. BESPOKE SVG DRINK & GIFT ARTWORK GENERATOR
  // ==========================================================================
  function renderGiftArtworkSVG(gift) {
    const cat = gift.category || "fruit-tea";
    const id = (gift.id || "").toLowerCase();

    if (gift.isCustomInput) {
      return `
        <svg class="gift-art-svg" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#FFE4EC" />
          <path d="M32 14L35.5 25.5L47 29L35.5 32.5L32 44L28.5 32.5L17 29L28.5 25.5L32 14Z" fill="#E11D48" />
          <circle cx="46" cy="18" r="3" fill="#F59E0B" />
          <circle cx="18" cy="44" r="2.5" fill="#FB7185" />
        </svg>
      `;
    }

    if (id.includes("banh") || cat === "bakery") {
      return `
        <svg class="gift-art-svg" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="48" rx="22" ry="6" fill="#FCE7F3" />
          <path d="M16 32C16 24 23 19 32 19C41 19 48 24 48 32V43C48 45.2 46.2 47 44 47H20C17.8 47 16 45.2 16 43V32Z" fill="#FDE68A" stroke="#D97706" stroke-width="1.8"/>
          <path d="M16 31C21 34 26 29 32 32C38 35 43 30 48 32" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>
          <circle cx="32" cy="17" r="4.5" fill="#E11D48" />
          <path d="M32 13C34 10 37 10 38 12" stroke="#15803D" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    }

    if (id.includes("da-xay") || id.includes("sua-chua") || cat === "blended") {
      const isMatcha = id.includes("matcha");
      const bodyColor = isMatcha ? "#86EFAC" : "#FDA4AF";
      const deepColor = isMatcha ? "#15803D" : "#BE123C";
      return `
        <svg class="gift-art-svg" viewBox="0 0 64 64" fill="none">
          <path d="M38 10L33 24" stroke="${deepColor}" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 26H44L40 52C39.7 54 38 55.5 36 55.5H28C26 55.5 24.3 54 24 52L20 26Z" fill="${bodyColor}" opacity="0.85" stroke="${deepColor}" stroke-width="1.6"/>
          <path d="M19 26C19 19 25 14 32 14C39 14 45 19 45 26H19Z" fill="#FFFFFF" stroke="${deepColor}" stroke-width="1.6"/>
          <path d="M24 22C27 20 37 20 40 22" stroke="#FECDD3" stroke-width="2" stroke-linecap="round"/>
          <circle cx="32" cy="13" r="3" fill="#E11D48"/>
        </svg>
      `;
    }

    if (cat === "milk-tea" || id.includes("sua")) {
      const isMatcha = id.includes("matcha");
      const teaFill = isMatcha ? "#A7F3D0" : "#FDE68A";
      const strokeCol = isMatcha ? "#047857" : "#B45309";
      return `
        <svg class="gift-art-svg" viewBox="0 0 64 64" fill="none">
          <path d="M36 9L31 23" stroke="#9F1239" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M19 22H45L41 51C40.7 53.2 38.8 55 36.5 55H27.5C25.2 55 23.3 53.2 23 51L19 22Z" fill="${teaFill}" stroke="${strokeCol}" stroke-width="1.6"/>
          <path d="M17 22H47" stroke="${strokeCol}" stroke-width="2.4" stroke-linecap="round"/>
          <rect x="20" y="23" width="24" height="6" rx="2" fill="#FFFFFF" opacity="0.85"/>
          <circle cx="27" cy="48" r="2.6" fill="#451A03"/>
          <circle cx="33" cy="50" r="2.6" fill="#451A03"/>
          <circle cx="37" cy="47" r="2.6" fill="#451A03"/>
          <circle cx="29" cy="43" r="2.4" fill="#451A03"/>
        </svg>
      `;
    }

    return `
      <svg class="gift-art-svg" viewBox="0 0 64 64" fill="none">
        <path d="M37 9L32 23" stroke="#BE123C" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M19 22H45L41 51C40.7 53.2 38.8 55 36.5 55H27.5C25.2 55 23.3 53.2 23 51L19 22Z" fill="#FDA4AF" fill-opacity="0.55" stroke="#E11D48" stroke-width="1.6"/>
        <path d="M17 22H47" stroke="#E11D48" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="28" cy="34" r="5" fill="#FBBF24" opacity="0.9"/>
        <path d="M34 39C37 36 40 38 38 42C36 45 32 42 34 39Z" fill="#E11D48"/>
        <path d="M41 18C44 14 49 15 48 19C46 22 42 21 41 18Z" fill="#16A34A"/>
      </svg>
    `;
  }

  // ==========================================================================
  // 7. UI RENDERING & STATE MANAGEMENT
  // ==========================================================================
  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 2500);
  }

  function applyConfigToDOM() {
    const max = Number(config.maxSelections) || 3;
    config.maxSelections = max;

    document.getElementById("nav-occasion-text").textContent = "HOA HỒNG • 20/10";
    document.getElementById("intro-hero-title").textContent =
      config.heroTitle || "Khu Vườn Hoa Hồng & Quà Tặng 20/10";
    document.getElementById("intro-recipient-name").textContent = config.recipientName;
    document.getElementById("letter-greeting").textContent = config.letterGreeting;
    document.getElementById("letter-body").textContent = config.letterBody;
    document.getElementById("letter-signature").textContent = config.letterSignature;
    document.getElementById("letter-sender-name").textContent = "— " + config.senderName;

    const bannerTextEl = document.getElementById("airplane-banner-text");
    if (bannerTextEl) {
      bannerTextEl.textContent = `CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 • CHÚC ${config.recipientName.toUpperCase()} LUÔN RẠNG RỠ`;
    }

    const rosesWrap = document.getElementById("intro-token-roses");
    if (rosesWrap) {
      rosesWrap.innerHTML = Array.from({ length: max })
        .map(() => '<span class="token-rose-item">🌹</span>')
        .join("");
    }
    const tokenDesc = document.getElementById("intro-token-desc");
    if (tokenDesc) {
      tokenDesc.innerHTML = `Mời mọi người tự tay chọn <strong>từ 1 đến tối đa ${max} món yêu thích nhất</strong> ở bên dưới nhé!`;
    }
    const enterText = document.getElementById("btn-enter-boutique-text");
    if (enterText) {
      enterText.textContent = "Chọn Món Yêu Thích";
    }
    const maxLabel = document.getElementById("boutique-max-label");
    if (maxLabel) {
      maxLabel.textContent = `(Tối Đa ${max} Món)`;
    }
    const subText = document.getElementById("boutique-subtitle-text");
    if (subText) {
      subText.innerHTML = `Chọn <strong>1 món là có thể chốt đơn ngay</strong>, hoặc chọn tối đa <strong>${max} món</strong> bạn thích nhé!`;
    }

    renderCategoryTabs();
    renderGiftsGrid();
    updateSelectionDock();
  }

  const EXPIRED_MEME_VARIATIONS = [
    {
      top: "NGÀY 20/10 MỞ QUẦY THÌ KHÔNG THẤY ĐÂU...",
      bottom: "QUA NGÀY 20/10 MỚI TÌM TỚI TÔI SAO?!",
      roast:
        '💬 <strong>Chủ vườn nhắn:</strong> "Hôm 20/10 hoa nở tươi rói thì không thấy mặt mũi đâu, nay qua ngày rồi mới mò vào đòi chọn nước hả? 😒🧋"'
    },
    {
      top: "BẢO LÀ HÔM QUA BẬN QUÁ CHƯA KỊP BẤM...",
      bottom: "NHƯNG LƯỚT TIKTOK 3 TIẾNG THÌ KỊP?!",
      roast:
        '💬 <strong>Bào chữa thất bại #1:</strong> "Bấm chọn món mất đúng 5 giây thôi nha, đừng có đổ tại bận! 🤨💅"'
    },
    {
      top: "ĐỔ TẠI MẠNG LAG TỚI HÔM NAY MỚI LOAD XONG...",
      bottom: "AI TIN ĐƯỢC CÁI LÝ DO NÀY HẢ?!",
      roast:
        '💬 <strong>Bào chữa thất bại #2:</strong> "Cáp quang biển cũng không cứu nổi pha vào muộn sau ngày 20/10 này đâu nha! 🤥🥀"'
    },
    {
      top: "HOA HỒNG ĐỢI TỪ SÁNG TỚI ĐÊM 20/10...",
      bottom: "ĐỢI TỚI MỨC HÉO RỤNG HẾT CÁNH LUÔN RỒI!",
      roast:
        '💬 <strong>Bào chữa thất bại #3:</strong> "Cây hoa hồng trong thiệp đứng đợi mỏi cả gốc suốt 24 tiếng ngày 20/10 rồi đó! 😭🥀"'
    },
    {
      top: "QUA NGÀY 20/10 MỚI TÌM TỚI TÔI...",
      bottom: "THÌ CHỈ CÒN CÁI NỊT THÔI NHA! 😂",
      roast:
        '💬 <strong>Chốt hạ:</strong> "Muốn đặt bù chứ gì? Chụp màn hình meme này lại rồi nhắn tin năn nỉ chính chủ đi may ra còn kịp! 😏📲"'
    }
  ];

  function isPast2010() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "1") return false;
    if (params.get("late") === "1" || params.get("expired") === "1") return true;
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 9 is October
    const day = now.getDate();
    if (month === 9 && day > 20) return true;
    if (month > 9) return true;
    return false;
  }

  function switchStage(targetStage) {
    // If truly past 20/10 (and not unlocked via ?open=1), lock the app on the expired meme screen
    if (isPast2010() && !state.previewingExpired && targetStage !== "expired") {
      targetStage = "expired";
    }

    state.currentStage = targetStage;
    const stages = {
      intro: document.getElementById("stage-intro"),
      boutique: document.getElementById("stage-boutique"),
      voucher: document.getElementById("stage-voucher"),
      expired: document.getElementById("stage-expired")
    };
    Object.keys(stages).forEach((key) => {
      if (!stages[key]) return;
      if (key === targetStage) {
        stages[key].classList.add("active");
      } else {
        stages[key].classList.remove("active");
      }
    });

    const bannerTextEl = document.getElementById("airplane-banner-text");
    if (bannerTextEl) {
      if (targetStage === "expired") {
        bannerTextEl.textContent =
          "🥀 QUA NGÀY 20/10 MỚI TÌM TỚI TÔI SAO • QUẦY ĐÃ ĐÓNG CỬA NGHỈ BÁN RỒI NHA 🥀";
      } else {
        bannerTextEl.textContent = `CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 • CHÚC ${(
          config.recipientName || "MỌI NGƯỜI"
        ).toUpperCase()} LUÔN RẠNG RỠ`;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCategoryTabs() {
    const container = document.getElementById("category-tabs");
    if (!container) return;
    container.innerHTML = "";

    const categories = config.categories || DEFAULT_CONFIG.categories;
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-tab" + (state.activeCategory === cat.id ? " active" : "");
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        state.activeCategory = cat.id;
        renderCategoryTabs();
        renderGiftsGrid();
      });
      container.appendChild(btn);
    });
  }

  function renderGiftsGrid() {
    const grid = document.getElementById("gifts-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const maxReached = state.selectedIds.length >= config.maxSelections;
    grid.classList.toggle("max-reached", maxReached);

    const visibleGifts = config.gifts.filter(
      (g) => state.activeCategory === "all" || g.category === state.activeCategory
    );

    visibleGifts.forEach((gift) => {
      const selectedIdx = state.selectedIds.indexOf(gift.id);
      const isSelected = selectedIdx !== -1;

      const card = document.createElement("article");
      card.className = "gift-card" + (isSelected ? " selected" : "");
      card.dataset.giftId = gift.id;

      let customWishPreviewHTML = "";
      if (gift.isCustomInput && state.customWishText) {
        customWishPreviewHTML = `<div class="gift-custom-note-preview">✨ ${escapeHtml(
          state.customWishText
        )}</div>`;
      }

      const actionBadgeContent = isSelected
        ? `#${selectedIdx + 1}`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

      card.innerHTML = `
        <div class="gift-art-box">
          ${renderGiftArtworkSVG(gift)}
        </div>
        <div class="gift-info-col">
          <div class="gift-meta-top">
            <span class="gift-badge">${escapeHtml(gift.badge || "20/10")}</span>
            <span class="gift-subtitle">${escapeHtml(gift.subtitle || "Menu 20/10")}</span>
          </div>
          <h3 class="gift-title">${escapeHtml(gift.title)}</h3>
          <p class="gift-desc">${escapeHtml(gift.description)}</p>
          ${customWishPreviewHTML}
        </div>
        <div class="gift-action-circle" aria-label="${
          isSelected ? "Đã chọn món " + (selectedIdx + 1) : "Chọn món này"
        }">
          ${actionBadgeContent}
        </div>
      `;

      card.addEventListener("click", (e) => handleGiftCardClick(gift, card, e));
      grid.appendChild(card);
    });
  }

  function handleGiftCardClick(gift, cardEl, event) {
    const rect = cardEl.getBoundingClientRect();
    const clickX = event.clientX || rect.left + rect.width / 2;
    const clickY = event.clientY || rect.top + rect.height / 2;

    const existingIdx = state.selectedIds.indexOf(gift.id);

    if (existingIdx !== -1) {
      state.selectedIds.splice(existingIdx, 1);
      SoundEngine.playChime("deselect");
      renderGiftsGrid();
      updateSelectionDock();
      return;
    }

    if (state.selectedIds.length >= config.maxSelections) {
      SoundEngine.playChime("limit");
      cardEl.classList.remove("shake-limit");
      void cardEl.offsetWidth;
      cardEl.classList.add("shake-limit");
      showToast(
        `Tối đa ${config.maxSelections} món! Bạn có thể bấm Chốt đơn ngay hoặc bỏ chọn món cũ để đổi nhé.`
      );
      return;
    }

    if (gift.isCustomInput) {
      state.pendingWishGiftId = gift.id;
      const wishModal = document.getElementById("custom-wish-modal");
      const wishInput = document.getElementById("custom-wish-input");
      wishInput.value = state.customWishText || "";
      wishModal.classList.remove("hidden");
      setTimeout(() => wishInput.focus(), 80);
      return;
    }

    state.selectedIds.push(gift.id);
    SoundEngine.playChime("select", state.selectedIds.length);
    RoseCanvas.spawnBurst(clickX, clickY, 16);

    if (state.selectedIds.length === config.maxSelections) {
      showToast(`🎉 Đã chọn tối đa ${config.maxSelections} món! Bấm Chốt đơn bên dưới nhé.`);
    }

    renderGiftsGrid();
    updateSelectionDock();
  }

  function updateSelectionDock() {
    const count = state.selectedIds.length;
    const max = config.maxSelections || 3;

    const drawerEl = document.getElementById("dock-selected-drawer");
    const counterEl = document.getElementById("dock-counter");
    const statusLabelEl = document.getElementById("dock-status-label");
    const statusSubEl = document.getElementById("dock-status-sub");
    const slotsContainer = document.getElementById("rose-slots");
    const confirmBtn = document.getElementById("btn-confirm-gifts");
    const confirmText = document.getElementById("confirm-btn-text");

    if (counterEl) counterEl.textContent = `${count}/${max}`;
    if (drawerEl) drawerEl.classList.toggle("hidden", count === 0);

    if (statusLabelEl && statusSubEl) {
      if (count === 0) {
        statusLabelEl.textContent = "Chưa chọn món nào";
        statusSubEl.textContent = `Chọn từ 1 đến tối đa ${max} món`;
      } else if (count < max) {
        statusLabelEl.textContent = `Đã chọn ${count} món`;
        statusSubEl.textContent = `Chốt ngay hoặc chọn thêm ${max - count} món`;
      } else {
        statusLabelEl.textContent = `Đã chọn đủ ${count}/${max} món`;
        statusSubEl.textContent = "Sẵn sàng chốt đơn 20/10!";
      }
    }

    if (slotsContainer) {
      slotsContainer.innerHTML = "";
      state.selectedIds.forEach((giftId, idx) => {
        const gift = config.gifts.find((g) => g.id === giftId);
        if (!gift) return;
        const displayTitle =
          gift.isCustomInput && state.customWishText ? state.customWishText : gift.title;

        const slot = document.createElement("div");
        slot.className = "rose-slot filled";
        slot.innerHTML = `
          <div class="slot-item-info">
            <span class="slot-item-badge">${idx + 1}</span>
            <span class="slot-item-icon">${escapeHtml(gift.icon)}</span>
            <span class="slot-item-title">${escapeHtml(displayTitle)}</span>
          </div>
          <button type="button" class="slot-remove-btn" aria-label="Bỏ chọn">✕</button>
        `;
        slot.querySelector(".slot-remove-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          state.selectedIds.splice(idx, 1);
          SoundEngine.playChime("deselect");
          renderGiftsGrid();
          updateSelectionDock();
        });
        slotsContainer.appendChild(slot);
      });
    }

    if (confirmBtn && confirmText) {
      if (count < 1) {
        confirmBtn.disabled = true;
        confirmText.textContent = "Chọn món";
      } else {
        confirmBtn.disabled = false;
        confirmText.textContent = `Chốt đơn (${count})`;
      }
    }
  }

  function pickRandomGifts() {
    const standardGifts = config.gifts.filter((g) => !g.isCustomInput);
    const pool = [...standardGifts];
    const picked = [];

    while (picked.length < config.maxSelections && pool.length > 0) {
      const randIndex = Math.floor(Math.random() * pool.length);
      picked.push(pool[randIndex].id);
      pool.splice(randIndex, 1);
    }

    state.selectedIds = picked;
    state.activeCategory = "all";
    SoundEngine.playChime("celebrate");
    RoseCanvas.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 22);
    renderCategoryTabs();
    renderGiftsGrid();
    updateSelectionDock();
    showToast(`✨ Đã gợi ý ngẫu nhiên ${picked.length} món siêu ngon cho bạn!`);
  }

  // ==========================================================================
  // 8. STAGE 3: VOUCHER RENDERING & HIGH-DPI PNG GENERATOR
  // ==========================================================================
  function formatCurrentTimestamp() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${hh}:${mm} • ${dd}/${mo}/${yyyy}`;
  }

  function populateVoucherStage() {
    state.ticketTime = formatCurrentTimestamp();
    document.getElementById("ticket-code").textContent = state.ticketCode;
    document.getElementById("ticket-recipient").textContent = config.recipientName;
    document.getElementById("ticket-sender").textContent = config.senderName;
    document.getElementById("ticket-timestamp").textContent = state.ticketTime;

    const countPill = document.getElementById("ticket-count-pill");
    if (countPill) {
      countPill.textContent = `${state.selectedIds.length} món`;
    }

    const listEl = document.getElementById("ticket-gifts-list");
    listEl.innerHTML = "";

    state.selectedIds.forEach((id, idx) => {
      const gift = config.gifts.find((g) => g.id === id);
      if (!gift) return;
      const title =
        gift.isCustomInput && state.customWishText
          ? `Món tự chọn: ${state.customWishText}`
          : gift.title;
      const sub =
        gift.isCustomInput && state.customWishText
          ? "Món tự nhập theo sở thích ngày 20/10"
          : gift.description;
      const badgeText = gift.badge || gift.subtitle || "Menu 20/10";

      const row = document.createElement("div");
      row.className = "ticket-gift-row";
      row.innerHTML = `
        <div class="ticket-gift-visual">
          <span class="ticket-gift-num">${idx + 1}</span>
          ${renderGiftArtworkSVG(gift)}
        </div>
        <div class="ticket-gift-info">
          <div class="ticket-gift-meta">
            <span class="ticket-gift-tag">${escapeHtml(badgeText)}</span>
          </div>
          <div class="ticket-gift-title">${escapeHtml(title)}</div>
          <div class="ticket-gift-sub">${escapeHtml(sub)}</div>
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  function generateVoucherCanvas() {
    const c = document.createElement("canvas");
    const itemCount = state.selectedIds.length || 3;
    const extraHeight = Math.max(0, itemCount - 3) * 165;
    const w = 1080;
    const h = 1560 + extraHeight;
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");

    const bgGrad = g.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#fff5f8");
    bgGrad.addColorStop(0.5, "#ffe4ec");
    bgGrad.addColorStop(1, "#ffd0e0");
    g.fillStyle = bgGrad;
    g.fillRect(0, 0, w, h);

    const cardX = 64;
    const cardY = 65;
    const cardW = w - 128;
    const cardH = h - 130;

    g.save();
    g.shadowColor = "rgba(159, 18, 57, 0.18)";
    g.shadowBlur = 45;
    g.shadowOffsetY = 16;
    roundRect(g, cardX, cardY, cardW, cardH, 42);
    g.fillStyle = "#ffffff";
    g.fill();
    g.restore();

    g.save();
    roundRect(g, cardX, cardY, cardW, cardH, 42);
    g.lineWidth = 3.5;
    g.strokeStyle = "rgba(225, 29, 72, 0.35)";
    g.stroke();
    g.restore();

    g.textAlign = "center";
    g.fillStyle = "#be123c";
    g.font = "700 24px 'Be Vietnam Pro', sans-serif";
    g.fillText("ROSE PASS • 20.10", w / 2, cardY + 76);

    g.fillStyle = "#280814";
    g.font = "700 58px 'Cormorant Garamond', Georgia, serif";
    g.fillText("PHIẾU QUÀ & ĐỒ UỐNG 20/10", w / 2, cardY + 146);

    g.fillStyle = "#6e4f5b";
    g.font = "500 24px 'Be Vietnam Pro', sans-serif";
    g.fillText("Chúc Mọi Người Ngày Phụ Nữ Việt Nam 20/10 Rạng Rỡ!", w / 2, cardY + 190);

    const ordererName =
      ((document.getElementById("orderer-name-input") || {}).value || "").trim() ||
      config.recipientName;

    const metaX = cardX + 52;
    const metaY = cardY + 225;
    const metaW = cardW - 104;
    const metaH = 195;
    roundRect(g, metaX, metaY, metaW, metaH, 24);
    g.fillStyle = "#fff5f8";
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = "rgba(225, 29, 72, 0.18)";
    g.stroke();

    const drawMetaRow = (label, value, yPos) => {
      g.textAlign = "left";
      g.fillStyle = "#8c5e70";
      g.font = "500 25px 'Be Vietnam Pro', sans-serif";
      g.fillText(label, metaX + 30, yPos);

      g.textAlign = "right";
      g.fillStyle = "#280814";
      g.font = "700 26px 'Be Vietnam Pro', sans-serif";
      g.fillText(truncateText(value, 36), metaX + metaW - 30, yPos);
    };

    drawMetaRow("Người nhận:", ordererName, metaY + 54);
    drawMetaRow("Gửi từ:", config.senderName, metaY + 108);
    drawMetaRow("Thời gian chốt:", `${state.ticketTime} (${state.ticketCode})`, metaY + 162);

    g.textAlign = "center";
    g.fillStyle = "#be123c";
    g.font = "700 25px 'Be Vietnam Pro', sans-serif";
    g.fillText(`DANH SÁCH ${state.selectedIds.length} MÓN ĐÃ CHỌN`, w / 2, cardY + 515);

    let itemY = cardY + 550;
    state.selectedIds.forEach((id, idx) => {
      const gift = config.gifts.find((it) => it.id === id);
      if (!gift) return;

      const title =
        gift.isCustomInput && state.customWishText
          ? `Món tự chọn: ${state.customWishText}`
          : gift.title;
      const desc =
        gift.isCustomInput && state.customWishText
          ? "Món tự nhập theo sở thích ngày 20/10"
          : gift.description;

      roundRect(g, metaX, itemY, metaW, 146, 22);
      g.fillStyle = "#fff9fb";
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = "rgba(225, 29, 72, 0.22)";
      g.stroke();

      g.fillStyle = "#be123c";
      g.beginPath();
      g.arc(metaX + 54, itemY + 73, 24, 0, Math.PI * 2);
      g.fill();

      g.textAlign = "center";
      g.fillStyle = "#ffffff";
      g.font = "700 24px 'Be Vietnam Pro', sans-serif";
      g.fillText(`${idx + 1}`, metaX + 54, itemY + 82);

      g.font = "50px sans-serif";
      g.fillText(gift.icon || "🧋", metaX + 128, itemY + 90);

      g.textAlign = "left";
      g.fillStyle = "#280814";
      g.font = "700 30px 'Be Vietnam Pro', sans-serif";
      g.fillText(truncateText(title, 34), metaX + 180, itemY + 60);

      g.fillStyle = "#5c3443";
      g.font = "400 23px 'Be Vietnam Pro', sans-serif";
      g.fillText(truncateText(desc, 52), metaX + 180, itemY + 104);

      itemY += 166;
    });

    const noteText =
      (document.getElementById("recipient-note-input") || {}).value ||
      "Cảm ơn nhiều nhé! Chúc ngày 20/10 vui vẻ 🌹";

    const noteY = itemY + 10;
    roundRect(g, metaX, noteY, metaW, 122, 20);
    g.fillStyle = "#fff5f8";
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = "rgba(225, 29, 72, 0.24)";
    g.stroke();

    g.textAlign = "left";
    g.fillStyle = "#9f1239";
    g.font = "700 22px 'Be Vietnam Pro', sans-serif";
    g.fillText("Ghi chú (Size / Đường / Đá / Lời nhắn):", metaX + 26, noteY + 44);

    g.fillStyle = "#280814";
    g.font = "600 25px 'Be Vietnam Pro', sans-serif";
    g.fillText(`"${truncateText(noteText, 55)}"`, metaX + 26, noteY + 88);

    const footerY = cardY + cardH - 68;
    g.textAlign = "left";
    g.fillStyle = "#8c5e70";
    g.font = "700 21px monospace";
    g.fillText(`CODE: ${state.ticketCode} • VERIFIED 20/10`, metaX, footerY);

    g.save();
    g.translate(cardX + cardW - 190, footerY - 22);
    g.rotate(-0.12);
    roundRect(g, -130, -45, 260, 86, 14);
    g.fillStyle = "#fff1f4";
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = "#be123c";
    g.stroke();

    g.textAlign = "center";
    g.fillStyle = "#be123c";
    g.font = "800 19px 'Be Vietnam Pro', sans-serif";
    g.fillText("CONFIRMED • 20/10", 0, -10);
    g.font = "900 25px 'Be Vietnam Pro', sans-serif";
    g.fillText("HAPPY 20/10", 0, 24);
    g.restore();

    return c;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function truncateText(str, maxLen) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
  }

  function buildSummaryText() {
    const ordererName =
      ((document.getElementById("orderer-name-input") || {}).value || "").trim();
    const noteText =
      ((document.getElementById("recipient-note-input") || {}).value || "").trim();

    const chosenLines = state.selectedIds.map((id, i) => {
      const gift = config.gifts.find((g) => g.id === id);
      if (!gift) return "";
      const title =
        gift.isCustomInput && state.customWishText
          ? `${gift.title} (${state.customWishText})`
          : gift.title;
      return `${i + 1}. ${gift.icon} ${title}`;
    });

    return [
      `🌹 PHIẾU QUÀ & ĐỒ UỐNG 20/10 (${state.ticketCode}) 🌹`,
      ordererName ? `👤 Người chọn: ${ordererName}` : `👥 Dành tặng: ${config.recipientName}`,
      `✨ ${state.selectedIds.length} Món đã chọn:`,
      ...chosenLines,
      noteText ? `📝 Ghi chú: "${noteText}"` : ""
    ]
      .filter(Boolean)
      .join("\n");
  }

  function downloadVoucherImage() {
    sendOrderSilentlyToCloud(true);
    try {
      const canvas = generateVoucherCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Phieu-20-10-${state.ticketCode.replace("#", "")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      RoseCanvas.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 22);
      showToast("📸 Đã tải ảnh Phiếu 20/10 sắc nét về máy!");
    } catch (e) {
      showToast("Bạn có thể chụp màn hình tấm phiếu trực tiếp nhé 🌸");
    }
  }

  async function shareVoucherMobile() {
    sendOrderSilentlyToCloud(true);
    const summaryText = buildSummaryText();
    try {
      const canvas = generateVoucherCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.canShare) {
        const file = new File([blob], "Phieu-20-10.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "🌹 Phiếu Quà & Đồ Uống 20/10",
            text: summaryText,
            files: [file]
          });
          showToast("💝 Đã chia sẻ Phiếu 20/10 thành công!");
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({
          title: "🌹 Phiếu Quà & Đồ Uống 20/10",
          text: summaryText
        });
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }

    copyTextToClipboard(summaryText);
    downloadVoucherImage();
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("💬 Đã copy nội dung vào bộ nhớ tạm!"))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("💬 Đã copy nội dung vào bộ nhớ tạm!");
    } catch (e) {
      showToast("Không thể copy tự động, bạn hãy chụp màn hình tấm phiếu nhé!");
    }
    ta.remove();
  }

  // ==========================================================================
  // 9. BUILT-IN MENU CONFIGURATOR, PRESETS & BULK IMPORT
  // ==========================================================================
  function openCustomizerModal() {
    const modal = document.getElementById("customizer-modal");
    document.getElementById("cfg-max-select").value = String(config.maxSelections || 3);
    document.getElementById("cfg-recipient").value = config.recipientName;
    document.getElementById("cfg-sender").value = config.senderName;
    document.getElementById("cfg-channel").value = getCleanChannelId();
    document.getElementById("cfg-greeting").value = config.letterGreeting;
    document.getElementById("cfg-body").value = config.letterBody;

    const bulkEl = document.getElementById("cfg-bulk-textarea");
    if (bulkEl) {
      bulkEl.value = config.gifts
        .map((g) => `${g.icon} | ${g.title} | ${g.description}`)
        .join("\n");
    }

    renderCustomizerGiftRows();
    modal.classList.remove("hidden");
  }

  function renderCustomizerGiftRows() {
    const editor = document.getElementById("custom-gifts-editor");
    editor.innerHTML = "";

    config.gifts.forEach((gift, index) => {
      const row = document.createElement("div");
      row.className = "editor-gift-row";
      row.innerHTML = `
        <input type="text" class="editor-icon-input" value="${escapeHtml(
          gift.icon
        )}" maxlength="4" title="Icon/Emoji" />
        <div class="editor-text-col">
          <input type="text" class="editor-title-input" value="${escapeHtml(
            gift.title
          )}" maxlength="65" placeholder="Tên đồ uống / món quà..." />
          <input type="text" class="editor-desc-input" value="${escapeHtml(
            gift.description
          )}" maxlength="130" placeholder="Mô tả ngắn..." />
        </div>
        <button type="button" class="editor-delete-btn" title="Xóa món này">✕</button>
      `;

      row.querySelector(".editor-delete-btn").addEventListener("click", () => {
        if (config.gifts.length <= config.maxSelections) {
          showToast(`Cần giữ tối thiểu ${config.maxSelections} món trong Menu nhé!`);
          return;
        }
        syncEditorInputsToConfig();
        config.gifts.splice(index, 1);
        renderCustomizerGiftRows();
      });

      editor.appendChild(row);
    });
  }

  function syncEditorInputsToConfig() {
    config.maxSelections = Number(document.getElementById("cfg-max-select").value) || 3;
    config.recipientName =
      document.getElementById("cfg-recipient").value.trim() || DEFAULT_CONFIG.recipientName;
    config.senderName =
      document.getElementById("cfg-sender").value.trim() || DEFAULT_CONFIG.senderName;
    config.orderChannelId =
      document.getElementById("cfg-channel").value.trim() || DEFAULT_CONFIG.orderChannelId;
    config.letterGreeting =
      document.getElementById("cfg-greeting").value.trim() || DEFAULT_CONFIG.letterGreeting;
    config.letterBody =
      document.getElementById("cfg-body").value.trim() || DEFAULT_CONFIG.letterBody;

    const rows = document.querySelectorAll("#custom-gifts-editor .editor-gift-row");
    const updatedGifts = [];
    rows.forEach((row, idx) => {
      const icon = row.querySelector(".editor-icon-input").value.trim() || "🧋";
      const title =
        row.querySelector(".editor-title-input").value.trim() || `Món #${idx + 1}`;
      const desc =
        row.querySelector(".editor-desc-input").value.trim() ||
        "Món ngon ngày Phụ nữ Việt Nam 20/10.";
      const existing = config.gifts[idx] || {};
      updatedGifts.push({
        id: existing.id || "custom-item-" + Date.now() + "-" + idx,
        title,
        subtitle: existing.subtitle || "Menu 20/10",
        description: desc,
        icon,
        badge: existing.badge || "20/10",
        category: existing.category || "fruit-tea",
        isCustomInput: Boolean(existing.isCustomInput)
      });
    });

    if (updatedGifts.length >= 1) {
      config.gifts = updatedGifts;
    }
  }

  function applyBulkLinesToConfig() {
    const raw = (document.getElementById("cfg-bulk-textarea").value || "").trim();
    if (!raw) {
      showToast("Hãy nhập ít nhất 1 dòng tên món vào ô văn bản nhé!");
      return;
    }
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const newGifts = lines.map((line, idx) => {
      const parts = line.split("|").map((p) => p.trim());
      let icon = "🧋";
      let title = "";
      let desc = "Thức uống / Món ngon đặc biệt ngày 20/10.";

      if (parts.length >= 3) {
        icon = parts[0] || "🧋";
        title = parts[1] || `Món #${idx + 1}`;
        desc = parts.slice(2).join(" | ");
      } else if (parts.length === 2) {
        if (parts[0].length <= 4) {
          icon = parts[0];
          title = parts[1];
        } else {
          title = parts[0];
          desc = parts[1];
        }
      } else {
        title = parts[0];
      }

      return {
        id: "bulk-item-" + idx + "-" + Date.now(),
        title,
        subtitle: "Menu 20/10",
        description: desc,
        icon,
        badge: "20/10",
        category: "fruit-tea",
        isCustomInput:
          title.toLowerCase().includes("tự chọn") || title.toLowerCase().includes("tự nhập")
      };
    });

    config.gifts = newGifts;
    renderCustomizerGiftRows();
    showToast(`📥 Đã cập nhật ${newGifts.length} món từ văn bản!`);
  }

  // ==========================================================================
  // 10. EVENT LISTENERS & INITIALIZATION
  // ==========================================================================
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initEvents() {
    document.getElementById("btn-toggle-audio").addEventListener("click", () => {
      SoundEngine.toggleMusicBox();
    });

    // Tapping top-left logo 5 times unlocks creator buttons ("Xem đơn đặt" & "Cấu hình")
    let logoTapCount = 0;
    document.getElementById("btn-home-reset").addEventListener("click", () => {
      logoTapCount++;
      if (logoTapCount >= 5) {
        document.querySelectorAll(".creator-only-btn").forEach((b) => b.classList.remove("hidden"));
        showToast("✨ Đã mở khóa nút Xem đơn đặt & Cấu hình!");
        logoTapCount = 0;
      }
      switchStage("intro");
    });

    // Stage 1 -> Stage 2: Enter Boutique
    document.getElementById("btn-enter-boutique").addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      RoseCanvas.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
      SoundEngine.playChime("select", 2);
      if (!state.audioEnabled) {
        SoundEngine.startMusicBox();
      }
      switchStage("boutique");
    });

    // Stage 2: Random Pick & Clear
    document.getElementById("btn-random-pick").addEventListener("click", pickRandomGifts);

    document.getElementById("btn-clear-selection").addEventListener("click", () => {
      state.selectedIds = [];
      SoundEngine.playChime("deselect");
      renderGiftsGrid();
      updateSelectionDock();
    });

    // Stage 2 -> Stage 3: Confirm Selected Items (1 up to Max items!) + Auto Send Order Silently!
    document.getElementById("btn-confirm-gifts").addEventListener("click", (e) => {
      if (state.selectedIds.length < 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      RoseCanvas.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
      SoundEngine.playChime("celebrate");
      populateVoucherStage();
      switchStage("voucher");

      // Automatically send chosen items to cloud channel right away!
      sendOrderSilentlyToCloud(false);
    });

    // Stage 3: Quick Note Chips (1-tap mobile customization)
    document.querySelectorAll(".quick-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const noteVal = chip.dataset.note || "";
        const inputEl = document.getElementById("recipient-note-input");
        if (!inputEl || !noteVal) return;

        chip.classList.toggle("active");
        const current = inputEl.value.trim();
        if (current.toLowerCase().includes(noteVal.toLowerCase())) {
          return;
        }
        inputEl.value = current ? `${current}, ${noteVal}` : noteVal;
      });
    });

    // Stage 3: Send/Update Note Button
    document.getElementById("btn-send-order-note").addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      RoseCanvas.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
      SoundEngine.playChime("celebrate");
      sendOrderSilentlyToCloud(true);
      showToast("💝 Đã lưu & gửi ghi chú đơn hàng thành công!");
    });

    // Stage 3: Voucher Actions
    document
      .getElementById("btn-download-voucher")
      .addEventListener("click", downloadVoucherImage);
    document
      .getElementById("btn-share-voucher")
      .addEventListener("click", shareVoucherMobile);
    document.getElementById("btn-copy-summary").addEventListener("click", () => {
      sendOrderSilentlyToCloud(true);
      copyTextToClipboard(buildSummaryText());
    });
    document.getElementById("btn-back-to-boutique").addEventListener("click", () => {
      switchStage("boutique");
    });

    // Custom Wish Modal Events
    document.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.getElementById("custom-wish-input").value = chip.dataset.suggest || "";
      });
    });

    document.getElementById("btn-cancel-wish").addEventListener("click", () => {
      document.getElementById("custom-wish-modal").classList.add("hidden");
      state.pendingWishGiftId = null;
    });

    document.getElementById("btn-save-wish").addEventListener("click", () => {
      const val = document.getElementById("custom-wish-input").value.trim();
      state.customWishText = val || "Món tự chọn";
      document.getElementById("custom-wish-modal").classList.add("hidden");

      if (
        state.pendingWishGiftId &&
        !state.selectedIds.includes(state.pendingWishGiftId) &&
        state.selectedIds.length < config.maxSelections
      ) {
        state.selectedIds.push(state.pendingWishGiftId);
        SoundEngine.playChime("select", state.selectedIds.length);
        RoseCanvas.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
      }
      state.pendingWishGiftId = null;
      renderGiftsGrid();
      updateSelectionDock();
    });

    // Live Orders Viewer Modal Events
    document.getElementById("btn-open-orders").addEventListener("click", () => {
      document.getElementById("orders-modal").classList.remove("hidden");
      fetchAndRenderCloudOrders();
    });
    document.getElementById("btn-refresh-orders").addEventListener("click", () => {
      fetchAndRenderCloudOrders();
    });
    const clearAllOrdersBtn = document.getElementById("btn-clear-all-orders");
    if (clearAllOrdersBtn) {
      clearAllOrdersBtn.addEventListener("click", () => {
        clearAllOrdersOnCloud();
      });
    }
    document.getElementById("btn-close-orders").addEventListener("click", () => {
      document.getElementById("orders-modal").classList.add("hidden");
    });
    document.getElementById("btn-close-orders-bottom").addEventListener("click", () => {
      document.getElementById("orders-modal").classList.add("hidden");
    });

    // Customizer Modal Events
    document
      .getElementById("btn-open-customizer")
      .addEventListener("click", openCustomizerModal);

    document.getElementById("btn-close-customizer").addEventListener("click", () => {
      document.getElementById("customizer-modal").classList.add("hidden");
    });

    document.getElementById("cfg-preset").addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "phuclong") {
        config.heroTitle = DEFAULT_CONFIG.heroTitle;
        config.letterGreeting = DEFAULT_CONFIG.letterGreeting;
        config.letterBody = DEFAULT_CONFIG.letterBody;
        config.categories = JSON.parse(JSON.stringify(DEFAULT_CONFIG.categories));
        config.gifts = JSON.parse(JSON.stringify(DEFAULT_CONFIG.gifts));
      } else if (
        val === "gifts2010" &&
        DEFAULT_CONFIG.presets &&
        DEFAULT_CONFIG.presets.gifts2010
      ) {
        const p = DEFAULT_CONFIG.presets.gifts2010;
        config.heroTitle = p.heroTitle;
        config.letterGreeting = p.letterGreeting;
        config.letterBody = p.letterBody;
        config.categories = JSON.parse(JSON.stringify(p.categories));
        config.gifts = JSON.parse(JSON.stringify(p.gifts));
      }
      openCustomizerModal();
      showToast("✨ Đã nạp bộ Menu mẫu! Hãy bấm Lưu hoặc Copy Link nhé.");
    });

    document
      .getElementById("btn-apply-bulk-lines")
      .addEventListener("click", applyBulkLinesToConfig);

    document.getElementById("btn-add-custom-gift").addEventListener("click", () => {
      syncEditorInputsToConfig();
      config.gifts.push({
        id: "item-added-" + Date.now(),
        title: "Món Mới",
        subtitle: "Menu 20/10",
        description: "Thức uống / Món quà thơm ngon ngày 20/10.",
        icon: "🧋",
        badge: "New",
        category: "fruit-tea"
      });
      renderCustomizerGiftRows();
      const scrollBody = document.querySelector(".customizer-scroll-body");
      if (scrollBody) scrollBody.scrollTop = scrollBody.scrollHeight;
    });

    document.getElementById("btn-reset-default-cfg").addEventListener("click", () => {
      config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      state.selectedIds = [];
      localStorage.removeItem("rose_menu_config_2010_v3");
      window.history.replaceState({}, "", window.location.pathname);
      openCustomizerModal();
      applyConfigToDOM();
      showToast("Đã khôi phục cấu hình gốc!");
    });

    document.getElementById("btn-apply-cfg").addEventListener("click", () => {
      syncEditorInputsToConfig();
      try {
        localStorage.setItem("rose_menu_config_2010_v3", JSON.stringify(config));
      } catch (e) {}
      state.selectedIds = [];
      applyConfigToDOM();
      document.getElementById("customizer-modal").classList.add("hidden");
      showToast("✨ Đã lưu cấu hình Menu thành công!");
    });

    document.getElementById("btn-copy-gift-link").addEventListener("click", () => {
      syncEditorInputsToConfig();
      try {
        localStorage.setItem("rose_menu_config_2010_v3", JSON.stringify(config));
      } catch (e) {}
      state.selectedIds = [];
      applyConfigToDOM();
      const encoded = encodeConfigToUrlParam(config);
      const shareUrl = `${window.location.origin}${window.location.pathname}?c=${encoded}`;
      copyTextToClipboard(shareUrl);
      document.getElementById("customizer-modal").classList.add("hidden");
      showToast("🔗 Đã copy Link Gửi Tặng (Tự ẩn nút Xem đơn & Cấu hình với người nhận)!");
    });

    // ========================================================================
    // POST-20/10 MEME SCREEN EVENTS ("QUA NGÀY 20/10 MỚI TÌM TỚI TÔI SAO")
    // ========================================================================
    let memeVariationIndex = 0;
    let begTapCount = 0;

    const previewExpiredBtn = document.getElementById("btn-preview-expired");
    const exitPreviewBtn = document.getElementById("btn-exit-expired-preview");
    const excuseBtn = document.getElementById("btn-expired-excuse");
    const begBtn = document.getElementById("btn-expired-beg");

    if (previewExpiredBtn) {
      previewExpiredBtn.addEventListener("click", () => {
        if (state.currentStage === "expired") {
          state.previewingExpired = false;
          if (exitPreviewBtn) exitPreviewBtn.classList.add("hidden");
          switchStage("intro");
          showToast("🌹 Đã quay về giao diện ngày 20/10!");
        } else {
          state.previewingExpired = true;
          if (exitPreviewBtn) exitPreviewBtn.classList.remove("hidden");
          SoundEngine.playChime("limit");
          switchStage("expired");
          showToast("😂 Đang xem thử giao diện khi qua ngày 20/10!");
        }
      });
    }

    if (exitPreviewBtn) {
      exitPreviewBtn.addEventListener("click", () => {
        state.previewingExpired = false;
        exitPreviewBtn.classList.add("hidden");
        switchStage("intro");
        showToast("🌹 Đã quay về thiệp 20/10!");
      });
    }

    if (excuseBtn) {
      excuseBtn.addEventListener("click", () => {
        memeVariationIndex = (memeVariationIndex + 1) % EXPIRED_MEME_VARIATIONS.length;
        const v = EXPIRED_MEME_VARIATIONS[memeVariationIndex];

        const topEl = document.getElementById("meme-top-caption");
        const bottomEl = document.getElementById("meme-bottom-caption");
        const roastEl = document.getElementById("expired-roast-bubble");
        const frameEl = document.getElementById("meme-poster-frame");

        if (topEl) topEl.textContent = v.top;
        if (bottomEl) bottomEl.textContent = v.bottom;
        if (roastEl) roastEl.innerHTML = v.roast;

        if (frameEl) {
          frameEl.classList.remove("meme-pop");
          void frameEl.offsetWidth;
          frameEl.classList.add("meme-pop");
        }

        SoundEngine.playChime("limit");
      });
    }

    if (begBtn) {
      begBtn.addEventListener("click", (e) => {
        begTapCount++;
        const begTextEl = document.getElementById("expired-beg-text");
        const roastEl = document.getElementById("expired-roast-bubble");
        const rect = e.currentTarget.getBoundingClientRect();

        if (begTapCount < 5) {
          SoundEngine.playChime("select", Math.min(3, begTapCount));
          if (begTextEl) {
            begTextEl.textContent = `🥺 Năn nỉ mở lại quầy (${begTapCount}/5)`;
          }
          const messages = [
            "🥺 Mới năn nỉ 1 lần chưa đủ chân thành đâu nha!",
            "😒 Mèo vẫn đang lườm kìa, thành tâm bấm thêm đi!",
            "🥀 Hoa héo hơi rung rinh rồi đó, cố lên!",
            "🤭 Sắp mềm lòng rồi, thêm 1 phát nữa xem nào!"
          ];
          showToast(messages[(begTapCount - 1) % messages.length]);
        } else {
          SoundEngine.playChime("celebrate");
          RoseCanvas.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
          if (begTextEl) {
            begTextEl.textContent = "📲 Nhắn tin cho chủ vườn xin mở khóa nhé! 😜";
          }
          if (roastEl) {
            roastEl.innerHTML =
              '💬 <strong>Đã ghi nhận 5 lần năn nỉ thành tâm!</strong> Chụp màn hình meme này gửi ngay cho chủ vườn để xin đặc cách mở lại quầy nước 20/10 nha! 😂💝';
          }
          showToast("😂 Chụp màn hình gửi cho chủ vườn để xin mở quầy nhé!");
        }
      });
    }
  }

  // Initialize App
  loadInitialConfig();
  applyConfigToDOM();
  initEvents();
  if (isPast2010()) {
    switchStage("expired");
  }
  SoundEngine.initAutoPlayOnEntry();
})();
