(function () {
  const WC26 = window.WC26 || (window.WC26 = {});
  const { escapeHtml, initials, ratingBand, renderAge } = WC26.Utils;
  const { styleVars } = WC26.Components;

  function teamMetaForRow(row, teamMap) {
    return teamMap?.get(row.team) || {
      name: row.team || "",
      colors: ["#101828", "#667085"],
      flagUrl: ""
    };
  }

  function renderPlayerPhoto(row, teamMap) {
    const headshot = row.headshot_url || "";
    const fallback = escapeHtml(initials(row.player));
    const meta = teamMetaForRow(row, teamMap);
    const img = headshot ? `<img src="${escapeHtml(headshot)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span>${fallback}</span>'">` : `<span>${fallback}</span>`;
    return `<div class="player-photo" style="${styleVars(meta)}" aria-hidden="true">${img}</div>`;
  }

  function renderOvr(row) {
    const band = ratingBand(row._ovr);
    const display = row._ovr === null ? "—" : row._ovr;
    return `<span class="ovr ${band.className}" title="${escapeHtml(band.label)}">${display}</span>`;
  }

  function renderNotes(notes) {
    return escapeHtml(String(notes || ""));
  }

  function renderCardMeta(label, value) {
    return `
      <div class="card-meta-item">
        <b>${escapeHtml(label)}</b>
        <div class="card-meta-value">${value || "—"}</div>
      </div>
    `;
  }

  function renderClubChip(row) {
    const club = escapeHtml(row.club || "Club unknown");
    const country = row.club_country ? `<small> · ${escapeHtml(row.club_country)}</small>` : "";
    return `<span class="club-chip"><span>${club}</span>${country}</span>`;
  }

  function renderPlayerCard(row, index, options = {}) {
    const position = escapeHtml(row.position || "Position unknown");
    const team = escapeHtml(row.team || "—");
    return `
      <article class="player-card" style="--i: ${index};">
        ${renderPlayerPhoto(row, options.teamMap)}
        <div class="player-card-content">
          <div class="player-card-heading">
            <div>
              <div class="player-name">${escapeHtml(row.player)}</div>
            </div>
            ${renderOvr(row)}
          </div>
          <div class="card-meta-grid">
            ${options.showTeam ? renderCardMeta("Country", team) : ""}
            ${renderCardMeta("Position", position)}
            ${renderCardMeta("Age", renderAge(row))}
            ${renderCardMeta("Club", renderClubChip(row))}
          </div>
          <div class="notes">${renderNotes(row.notes)}</div>
        </div>
      </article>
    `;
  }

  function renderComparePlayerCard(row, index, teamMap) {
    return `
      <article class="player-card compare-player-card" style="--i: ${index};">
        <div class="compare-player-media">
          <span class="compare-player-rank">#${index + 1}</span>
          ${renderPlayerPhoto(row, teamMap)}
        </div>
        <div class="player-card-content">
          <div class="player-card-heading">
            <div>
              <div class="player-name">${escapeHtml(row.player)}</div>
              <div class="meta">${escapeHtml(row.position || "Position unknown")} · ${renderAge(row)}</div>
            </div>
            ${renderOvr(row)}
          </div>
          <div class="card-meta-grid compare-player-meta">
            ${renderCardMeta("Club", renderClubChip(row))}
          </div>
          <div class="notes">${renderNotes(row.notes)}</div>
        </div>
      </article>
    `;
  }

  WC26.Components = WC26.Components || {};
  WC26.Components.renderCardMeta = renderCardMeta;
  WC26.Components.renderClubChip = renderClubChip;
  WC26.Components.renderComparePlayerCard = renderComparePlayerCard;
  WC26.Components.renderNotes = renderNotes;
  WC26.Components.renderOvr = renderOvr;
  WC26.Components.renderPlayerCard = renderPlayerCard;
  WC26.Components.renderPlayerPhoto = renderPlayerPhoto;
})();
