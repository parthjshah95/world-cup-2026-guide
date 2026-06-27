(function () {
  const WC26 = window.WC26 || (window.WC26 = {});
  const { escapeHtml, labelize, uniqueSorted } = WC26.Utils;
  const { renderPlayerCard } = WC26.Components;

  function renderControls(state, teams, rows, includeTeam) {
    const teamControl = includeTeam ? `
      <div class="control">
        <label for="teamFilter">Team</label>
        <select id="teamFilter" data-filter="team">
          <option value="">All teams</option>
          ${teams.map((team) => `<option value="${escapeHtml(team.name)}" ${state.filters.team === team.name ? "selected" : ""}>${escapeHtml(team.name)}</option>`).join("")}
        </select>
      </div>
    ` : "";

    return `
      <section class="controls-panel" aria-label="Player filters">
        <div class="control">
          <label for="searchInput">Search</label>
          <input id="searchInput" data-search type="search" value="${escapeHtml(state.search)}" placeholder="Player, club, position, age, notes">
        </div>
        ${teamControl}
        ${renderSelect(state, "club_country", "Club Country", "All club countries", uniqueSorted(rows, "club_country"))}
        ${renderSelect(state, "position_group", "Position Group", "All position groups", uniqueSorted(rows, "_position_group"))}
      </section>
    `;
  }

  function renderSelect(state, key, label, allLabel, values) {
    return `
      <div class="control">
        <label for="${key}">${escapeHtml(label)}</label>
        <select id="${key}" data-filter="${key}">
          <option value="">${escapeHtml(allLabel)}</option>
          ${values.map((value) => `<option value="${escapeHtml(value)}" ${state.filters[key] === value ? "selected" : ""}>${escapeHtml(labelize(value))}</option>`).join("")}
        </select>
      </div>
    `;
  }

  function renderPlayerList(rows, title, countText, options = {}) {
    const columnOptions = {
      showTeam: true,
      showReset: true,
      ...options
    };

    return `
      <section class="player-list-panel">
        <div class="list-head">
          <div>
            <div class="list-title">${escapeHtml(title)}</div>
            <div class="result-count">${escapeHtml(countText)}</div>
          </div>
          <div class="list-actions">
            ${renderSortControls(columnOptions)}
            ${columnOptions.showReset ? `<button class="ghost-button" type="button" data-reset-filters>Reset filters</button>` : ""}
          </div>
        </div>
        ${rows.length ? `
          <div class="player-card-grid">
            ${rows.map((row, index) => renderPlayerCard(row, index, columnOptions)).join("")}
          </div>
        ` : `<div class="empty-state">No players match the current filters.</div>`}
      </section>
    `;
  }

  function renderSortControls(options) {
    const state = options.state || { sortKey: "fc26_ovr", sortDir: "desc" };
    const fields = [
      { key: "fc26_ovr", label: "OVR" },
      { key: "player", label: "Player" },
      ...(options.showTeam ? [{ key: "team", label: "Country" }] : []),
      { key: "position", label: "Position" },
      { key: "age", label: "Age" },
      { key: "club_with_country", label: "Club" }
    ];
    return `
      <div class="sort-controls" aria-label="Sort players">
        <span class="sort-label">Sort</span>
        ${fields.map((field) => renderSortButton(field, state)).join("")}
      </div>
    `;
  }

  function renderSortButton(field, state) {
    const active = state.sortKey === field.key;
    const direction = active ? state.sortDir.toUpperCase() : "";
    return `
      <button class="sort-button ${active ? "active" : ""}" type="button" data-sort="${escapeHtml(field.key)}" aria-pressed="${active}">
        ${escapeHtml(field.label)}${active ? ` <span>${escapeHtml(direction)}</span>` : ""}
      </button>
    `;
  }

  function clearFilters(state) {
    state.search = "";
    state.filters = {
      team: "",
      club_country: "",
      position_group: ""
    };
    state.sortKey = "fc26_ovr";
    state.sortDir = "desc";
  }

  WC26.Components = WC26.Components || {};
  WC26.Components.clearFilters = clearFilters;
  WC26.Components.renderControls = renderControls;
  WC26.Components.renderPlayerList = renderPlayerList;
  WC26.Components.renderSortControls = renderSortControls;
})();
