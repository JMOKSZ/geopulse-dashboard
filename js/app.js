/**
 * Geopolitical Pulse — Main Application
 * Matches actual HTML structure from index.html
 */
(function () {
  'use strict';

  const STATE = {
    lang: localStorage.getItem('gp-lang') || 'en',
    dict: null,
    refreshTimer: null,
  };

  const LANG_ATTR_MAP = {
    'Switch language to Chinese': 'Switch language to English',
    'Switch language to English': 'Switch language to Chinese',
    '切换语言至英文': '切换语言至中文',
    '切换语言至中文': '切换语言至英文',
  };

  /* ─── PDF Export ─────────────────────────── */

  function exportPDF() {
    // Expand all layers before printing
    document.querySelectorAll('.layer').forEach(section => {
      const hdr = section.querySelector('.layer-header');
      const content = section.querySelector('.layer-content');
      section.setAttribute('aria-expanded', 'true');
      if (hdr) hdr.setAttribute('aria-expanded', 'true');
      if (content) content.hidden = false;
    });
    // Trigger browser print (Save as PDF)
    window.print();
  }

  /* ─── Trend Chart (canvas) ────────────────── */

  const TREND_DATA = [
    { year: '2018', label: 'Trump tariffs', labelZh: '特朗普关税', pct: 5 },
    { year: '2019', label: 'Escalation', labelZh: '贸易战升级', pct: 10 },
    { year: '2020', label: 'Phase 1 + COVID', labelZh: '第一阶段+疫情', pct: 12 },
    { year: '2021', label: 'Biden continues', labelZh: '拜登延续', pct: 15 },
    { year: '2022', label: 'CHIPS Act', labelZh: '芯片法案', pct: 20 },
    { year: '2023', label: 'Huawei 5G', labelZh: '华为5G回归', pct: 25 },
    { year: '2024', label: 'AI arms race', labelZh: 'AI军备竞赛', pct: 28 },
    { year: '2025', label: 'DeepSeek + tariffs', labelZh: 'DeepSeek+关税', pct: 32 },
    { year: '2026', label: 'Hormuz crisis', labelZh: '霍尔木兹危机', pct: 38 },
  ];

  function renderTrendChart() {
    const canvas = document.getElementById('trend-canvas');
    if (!canvas) return;

    const wrapper = document.getElementById('trend-chart-wrapper');
    if (!wrapper) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();
    const w = rect.width || 600;
    const h = 200;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Padding — more room for labels
    const pad = { left: 36, right: 16, top: 24, bottom: 28 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const isZh = STATE.lang === 'zh';

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines (horizontal — subtle)
    ctx.strokeStyle = '#E8DCC9';
    ctx.lineWidth = 0.5;
    [0, 10, 20, 30, 38, 50, 75, 100].forEach(pct => {
      const y = pad.top + chartH * (1 - pct / 100);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    });

    // Data points
    const points = TREND_DATA.map((d, i) => ({
      x: pad.left + (i / (TREND_DATA.length - 1)) * chartW,
      y: pad.top + chartH * (1 - d.pct / 100),
      ...d
    }));

    // Fill area under line
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 75, 49, 0.06)';
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#C84B31';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots + annotations
    const isLast = i => i === points.length - 1;

    // Tracks used y-ranges for label collision avoidance
    const usedRanges = [];

    function labelFits(y, labelH) {
      const top = y - labelH - 2;
      const bot = y + 2;
      return !usedRanges.some(r => top < r[1] && bot > r[0]);
    }

    function reserveRange(y, labelH, offset) {
      usedRanges.push([y - labelH - offset - 2, y - offset + 2]);
    }

    points.forEach((p, i) => {
      const isCurrent = isLast(i);
      const dotRadius = isCurrent ? 5 : 3;
      const dotColor = isCurrent ? '#C84B31' : '#8B7355';

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      if (isCurrent) {
        // Glow ring around current dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 75, 49, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Milestone label — place above dot for early pts, below for later
      // Alternate: above for even i, below for odd, current gets special
      const eventLabel = isZh ? p.labelZh || p.label : p.label;

      // Year always below
      ctx.fillStyle = isCurrent ? '#C84B31' : '#A0907A';
      ctx.font = isCurrent ? 'bold 10px -apple-system, sans-serif' : '9px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(p.year, p.x, pad.top + chartH + 4);

      // Event label — alternate above/below for readability
      let labelAbove = (i % 2 === 0) || isCurrent;
      // For dense middle section, push key ones only
      if (i === 1 || i === 3 || i === 5 || i === 7) labelAbove = false;

      const fontSize = isCurrent ? 11 : 9;
      const fontWeight = isCurrent ? 'bold' : 'normal';
      ctx.font = fontWeight + ' ' + fontSize + 'px -apple-system, sans-serif';
      ctx.textAlign = 'center';

      if (labelAbove) {
        ctx.textBaseline = 'bottom';
        const labelY = p.y - dotRadius - 4;
        // Badge background for the current point
        if (isCurrent) {
          const tw = ctx.measureText(eventLabel).width;
          const bx = p.x - tw / 2 - 6, by = labelY - fontSize - 4, bw = tw + 12, bh = fontSize + 8;
          ctx.fillStyle = '#C84B31';
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 4);
          ctx.fill();
          ctx.fillStyle = '#FFF';
          ctx.fillText(eventLabel, p.x, labelY - 2);
        } else {
          ctx.fillStyle = '#4A3F2E';
          ctx.fillText(eventLabel, p.x, labelY);
        }
      } else {
        ctx.textBaseline = 'top';
        const labelY = p.y + dotRadius + 4;
        ctx.fillStyle = '#4A3F2E';
        ctx.fillText(eventLabel, p.x, labelY + 12); // below year
      }

      // For key milestones, draw a small connecting line to y-axis
      if (i === 0 || i === 4 || i === 6 || isCurrent) {
        ctx.strokeStyle = isCurrent ? 'rgba(200,75,49,0.2)' : 'rgba(139,115,85,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(pad.left, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Y-axis value label for key milestones
        ctx.fillStyle = isCurrent ? '#C84B31' : '#A0907A';
        ctx.font = isCurrent ? 'bold 9px -apple-system, sans-serif' : '8px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.pct + '%', pad.left - 4, p.y);
      }
    });

    // Y-axis labels (0%, 100%)
    ctx.fillStyle = '#A0907A';
    ctx.font = '8px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('0%', pad.left - 4, pad.top + chartH);
    ctx.fillText('100%', pad.left - 4, pad.top);
  }

  /* ─── Init ─────────────────────────────────── */

  async function loadLang(lang) {
    try {
      const r = await fetch('lang/' + lang + '.json');
      if (!r.ok) throw Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      console.warn('Lang load failed', e);
      return null;
    }
  }

  function resolveKey(path, dict) {
    if (!dict) return null;
    // Flat key lookup — both HTML and JSON use flat keys now
    if (path in dict) return dict[path];
    return null;
  }

  async function applyLanguage(lang) {
    STATE.lang = lang;
    localStorage.setItem('gp-lang', lang);

    const dict = await loadLang(lang);
    STATE.dict = dict;
    if (!dict) return;

    // data-i18n elements — preserve child elements, only replace text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      let text = resolveKey(key, dict);
      if (!text) return;

      // Check if element has element children — if so, only update text nodes
      const hasChildElements = Array.from(el.childNodes).some(n => n.nodeType === 1);
      if (hasChildElements) {
        // Walk text nodes and replace the first non-empty one
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let first = true;
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.trim()) {
            node.textContent = first ? text : '';
            first = false;
          }
        }
      } else {
        el.textContent = text;
      }
    });

    // data-i18n-attr elements (aria-label etc)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attr = el.dataset.i18nAttr || 'aria-label';
      const key = el.dataset.i18nKey;
      if (key) {
        let text = resolveKey(key, dict);
        if (text) el.setAttribute(attr, text);
      }
    });

    // Update HTML lang
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dir = 'ltr';
  }

  /* ─── Collapsible Sections ─────────────────── */

  function initCollapsible() {
    document.querySelectorAll('.layer-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const section = hdr.closest('.layer');
        const content = section.querySelector('.layer-content');
        const isOpen = section.getAttribute('aria-expanded') === 'true';

        section.setAttribute('aria-expanded', String(!isOpen));
        hdr.setAttribute('aria-expanded', String(!isOpen));
        if (content) content.hidden = isOpen;

        // Restore section state
        try {
          const state = JSON.parse(sessionStorage.getItem('gp-layers') || '{}');
          state[section.id] = !isOpen;
          sessionStorage.setItem('gp-layers', JSON.stringify(state));
        } catch {}
      });
    });

    // Restore saved states
    try {
      const saved = JSON.parse(sessionStorage.getItem('gp-layers') || '{}');
      Object.keys(saved).forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;
        const hdr = section.querySelector('.layer-header');
        const content = section.querySelector('.layer-content');
        const open = saved[id];
        section.setAttribute('aria-expanded', String(open));
        if (hdr) hdr.setAttribute('aria-expanded', String(open));
        if (content) content.hidden = !open;
      });
    } catch {}
  }

  /* ─── Refresh Timestamp ────────────────────── */

  function updateTimestamp() {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const now = new Date();
    const fmt = STATE.lang === 'zh'
      ? now.toLocaleString('zh-CN', { hour12: false })
      : now.toLocaleString('en-US', { hour12: false, timeZoneName: 'short' });
    el.textContent = (STATE.lang === 'zh' ? '最后更新: ' : 'Last updated: ') + fmt;
  }

  /* ─── Data Loading (from JSON files) ─────────── */

  async function loadLayerData(layerId) {
    try {
      const r = await fetch('data/' + layerId + '.json');
      if (r.ok) return await r.json();
    } catch {}
    return null;
  }

  function findIndicator(card, layers) {
    // Card data-indicator like "hrmz-war-risk"
    const indicatorKey = card.dataset.indicator;
    if (!indicatorKey) return null;

    // Map HTML indicator key -> layer JSON key
    // pattern: {layer_prefix}-{indicator_slug}
    // e.g. "hrmz-war-risk" -> look in layer1 for indicator
    const layerMap = {
      'hrmz': 'layer1', 'usd': 'layer2', 'chn': 'layer3', 'ai': 'layer4', 'wild': 'layer5'
    };
    const prefix = indicatorKey.split('-')[0];
    const layerId = layerMap[prefix];
    if (!layerId || !layers[layerId]) return null;

    const layerData = layers[layerId];
    const indicators = layerData.indicators || {};
    // Find matching indicator by checking key patterns
    for (const [k, v] of Object.entries(indicators)) {
      // Normalize: "indicatorKey" -> remove prefix, compare camelCase/snake
      const cardSlug = indicatorKey.replace(/^[^-]+-/, ''); // "war-risk" from "hrmz-war-risk"
      const dataSlug = k.replace(/_/g, '-').replace(/([A-Z])/g, '-$1').toLowerCase(); // "war-risk-premium" -> try matching
      if (dataSlug.includes(cardSlug) || cardSlug.includes(dataSlug)) {
        return v;
      }
    }
    return null;
  }

  async function refreshData() {
    const layerIds = ['layer1', 'layer2', 'layer3', 'layer4', 'layer5'];
    const layers = {};

    for (const id of layerIds) {
      layers[id] = await loadLayerData(id);
    }

    // Update indicator cards
    document.querySelectorAll('.card[data-indicator]').forEach(card => {
      const indicator = findIndicator(card, layers);
      if (!indicator) return;

      // Value
      const valEl = card.querySelector('.card-value');
      if (valEl && indicator.value) {
        const v = STATE.lang === 'zh' ? (indicator.value_zh || indicator.value) : indicator.value;
        valEl.textContent = v;
      }

      // Trend
      const trendEl = card.querySelector('.card-trend');
      if (trendEl && indicator.trend) {
        const map = { rising: '↑ Increasing', falling: '↓ Decreasing', stable: '→ Stable', volatile: '↕ Volatile' };
        const mapZh = { rising: '↑ 上升', falling: '↓ 下降', stable: '→ 平稳', volatile: '↕ 波动' };
        const m = STATE.lang === 'zh' ? mapZh : map;
        trendEl.textContent = m[indicator.trend] || '';
        trendEl.className = 'card-trend';
        if (indicator.trend === 'rising') trendEl.classList.add('card-trend--up');
        else if (indicator.trend === 'falling') trendEl.classList.add('card-trend--down');
        else trendEl.classList.add('card-trend--flat');
      }

      // Source link
      const srcEl = card.querySelector('.card-source a');
      if (srcEl && indicator.sourceUrl) {
        srcEl.href = indicator.sourceUrl;
      }
      if (srcEl && indicator.source) {
        srcEl.textContent = indicator.source;
      }

      // Status
      const statusEl = card.querySelector('.card-status');
      if (statusEl && indicator.status) {
        const map = { critical: '🔴', warning: '🟡', normal: '🟢', unknown: '⚪' };
        const zhMap = { critical: '🔴', warning: '🟡', normal: '🟢', unknown: '⚪' };
        statusEl.textContent = map[indicator.status] || '⚪';
        statusEl.setAttribute('aria-label', 'Status: ' + indicator.status);
      }

      // Threshold
      const threshEl = card.querySelector('.card-threshold');
      if (threshEl && indicator.threshold) {
        const t = STATE.lang === 'zh' ? (indicator.threshold_zh || indicator.threshold) : indicator.threshold;
        threshEl.innerHTML = 'Threshold: ' + t;
      }
    });

    updateTimestamp();
    generateSummary();
    renderTrendChart();
  }

  /* ─── Auto-Generated Strategic Summary ──────── */

  function getIndicatorValue(indicatorKey, field) {
    // Read from the DOM — already updated with latest data
    const card = document.querySelector(`.card[data-indicator="${indicatorKey}"]`);
    if (!card) return null;
    if (field === 'value') {
      const el = card.querySelector('.card-value');
      return el ? el.textContent.trim() : null;
    }
    if (field === 'trend') {
      const el = card.querySelector('.card-trend');
      return el ? el.textContent.trim() : null;
    }
    return null;
  }

  function generateSummary() {
    const el = document.getElementById('summary-text');
    if (!el) return;

    const tradeSurplus = getIndicatorValue('chn-trade-surplus', 'value') || '$105.4B';
    const cfets = getIndicatorValue('chn-cfets', 'value') || '101.41';
    const throughput = getIndicatorValue('hrmz-throughput', 'value') || '<0.5 mb/d';
    const throughputTrend = getIndicatorValue('hrmz-throughput', 'trend') || '↓';
    const gold = getIndicatorValue('usd-cb-gold', 'value') || '17t+';
    const gpuPremium = getIndicatorValue('ai-gpu-premium', 'value') || '2-3x MSRP';

    // Determine dominant trend word
    const isZh = STATE.lang === 'zh';

    if (isZh) {
      el.textContent =
        `霍尔木兹通过量${throughputTrend}至${throughput}，封锁持续。` +
        `中国5月顺差${tradeSurplus}创纪录，CFETS指数${cfets}近四年新高。` +
        `央行购金${gold}持续，GPU黑市${gpuPremium}反映芯片瓶颈。` +
        `当前阶段：美元中心秩序加速侵蚀，中国相对优势在扩大但尚未进入拐点。` +
        `关键变量：霍尔木兹封锁持续时间。`;
    } else {
      el.textContent =
        `Hormuz throughput ${throughputTrend} to ${throughput} — blockade persists. ` +
        `China trade surplus hit ${tradeSurplus} (record), CFETS at ${cfets} (4yr high). ` +
        `Central bank gold buying ${gold}, GPU black market ${gpuPremium}. ` +
        `Phase: Accelerated erosion of dollar-centric order. China's relative advantage widening but not yet at inflection. ` +
        `Key variable: duration of Hormuz closure.`;
    }
  }

  async function init() {
    // Init UI first (collapsible works without data)
    initCollapsible();
    updateTimestamp();

    // Load language
    await applyLanguage(STATE.lang);
    updateTimestamp();

    // Try to load data from JSON files
    await refreshData();
    renderTrendChart();

    // Hide loading overlay
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => { overlay.style.display = 'none'; }, 600);
    }

    // Lang toggle button
    const toggle = document.getElementById('btn-lang-toggle');
    if (toggle) {
      toggle.addEventListener('click', async () => {
        const newLang = STATE.lang === 'en' ? 'zh' : 'en';
        await applyLanguage(newLang);
        updateTimestamp();
        generateSummary();
        renderTrendChart();
        // Re-render data in new language
        await refreshData();
        renderTrendChart();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('spinning');
        await refreshData();
        renderTrendChart();
        // Also re-apply language labels
        await applyLanguage(STATE.lang);
        setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
      });
    }

    // PDF export button
    const pdfBtn = document.getElementById('btn-export-pdf');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', exportPDF);
    }

    // Trend chart
    renderTrendChart();
    window.addEventListener('resize', () => renderTrendChart());

    // Auto-refresh every 30 min
    STATE.refreshTimer = setInterval(refreshData, 30 * 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
