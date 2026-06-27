(function () {
  const WC26 = window.WC26 || (window.WC26 = {});
  const { escapeHtml, formatNumber, renderAge } = WC26.Utils;

  function styleVars(team) {
    const colors = team.colors || ["#101828", "#667085"];
    const fallback = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    const flagUrl = team.flagUrl?.startsWith("assets/") ? `../${team.flagUrl}` : team.flagUrl;
    const flagBg = flagUrl ? `url('${flagUrl}') center/cover no-repeat, ${fallback}` : fallback;
    return `--flag-bg: ${flagBg}; --team-a: ${colors[0]}; --team-b: ${colors[1]};`;
  }

  function attrsToString(attrs) {
    return Object.entries(attrs || {})
      .map(([key, value]) => {
        const escapedValue = key === "style" ? String(value || "").replace(/"/g, "&quot;") : escapeHtml(value);
        return `${key}="${escapedValue}"`;
      })
      .join(" ");
  }

  function renderCountryCard(team, index, options = {}) {
    const size = options.size || "large";
    const className = size === "mini" ? "mini-country-card" : "country-card";
    const score = formatNumber(team.strengthScore);
    const topPlayer = team.top ? `${team.top.player} · ${renderAge(team.top)}` : "—";
    const attrs = {
      class: className,
      style: `${styleVars(team)} --i: ${index};`,
      ...(options.href ? { href: options.href } : { type: "button" }),
      ...(options.attrs || {})
    };
    const tag = options.href ? "a" : "button";

    return `
      <${tag} ${attrsToString(attrs)}>
        ${size !== "mini" ? `
          <div class="hover-metadata">
            <span class="glass-pill">Top ${escapeHtml(topPlayer)}</span>
          </div>
        ` : ""}
        <span class="country-score" aria-label="Rating score ${score}">
          <strong>${score}</strong>
        </span>
        <span class="country-card-content">
          <span>
            <span class="country-name">${escapeHtml(team.name)}</span>
          </span>
        </span>
      </${tag}>
    `;
  }

  WC26.Components = WC26.Components || {};
  WC26.Components.renderCountryCard = renderCountryCard;
  WC26.Components.styleVars = styleVars;
})();
