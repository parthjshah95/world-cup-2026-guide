(function () {
  const WC26 = window.WC26 || (window.WC26 = {});
  const { escapeHtml, labelize } = WC26.Utils;
  const { renderComparePlayerCard } = WC26.Components;

  function renderHeroStat(label, value, detail) {
    return `
      <article class="hero-stat">
        <div class="hero-stat-label">${escapeHtml(label)}</div>
        <div class="hero-stat-value" data-count="${Number.isFinite(Number(value)) ? Number(value) : ""}">${escapeHtml(value)}</div>
        <div class="hero-stat-detail">${escapeHtml(detail)}</div>
      </article>
    `;
  }

  function renderMetric(label, value, detail) {
    const numeric = typeof value === "number" || /^[0-9.]+$/.test(String(value));
    return `
      <article class="metric-card">
        <div class="metric-label">${escapeHtml(label)}</div>
        <div class="metric-value" data-count="${numeric ? value : ""}">${escapeHtml(value)}</div>
        <div class="metric-detail">${escapeHtml(detail)}</div>
      </article>
    `;
  }

  function renderDistribution(counts, limit, labelValues = false) {
    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit);
    if (!entries.length) return `<div class="distribution-row"><span>None</span><strong>0</strong></div>`;
    return entries
      .map(([key, count], index) => `<div class="distribution-row" style="--i: ${index};"><span>${escapeHtml(labelValues ? labelize(key) : key)}</span><strong>${count}</strong></div>`)
      .join("");
  }

  function renderComparePlayerCards(rows, teamMap) {
    if (!rows.length) return `<div class="empty-state compact-empty-state">No players collected</div>`;
    return `
      <div class="compare-player-grid">
        ${rows.map((row, index) => renderComparePlayerCard(row, index, teamMap)).join("")}
      </div>
    `;
  }

  WC26.Components = WC26.Components || {};
  WC26.Components.renderComparePlayerCards = renderComparePlayerCards;
  WC26.Components.renderDistribution = renderDistribution;
  WC26.Components.renderHeroStat = renderHeroStat;
  WC26.Components.renderMetric = renderMetric;
})();
