(async function () {
  const WC26 = window.WC26;
  const { renderHeroStat, renderPlayerList, renderTopbar, styleVars } = WC26.Components;
  const { animateCounters, compareRowsForState, compareUrl, escapeHtml, formatNumber, readParams, renderAge } = WC26.Utils;
  const { loadTeam, loadTeamsSummary, showLoadError } = WC26.Data;
  const { teamStats } = WC26.Stats;

  const state = {
    sortKey: "fc26_ovr",
    sortDir: "desc"
  };

  function renderNewPageIcon() {
    return `
      <svg class="button-icon new-page-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 3h6v6"></path>
        <path d="M10 14 21 3"></path>
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>
      </svg>
    `;
  }

  function loadStateFromUrl() {
    const params = readParams();
    state.sortKey = params.get("sort") || "fc26_ovr";
    state.sortDir = params.get("dir") || "desc";
    return params.get("team") || "";
  }

  function render(summary, rows, teamMap) {
    const stats = teamStats(summary.name, rows);
    const sortedRows = [...rows].sort(compareRowsForState(state));
    const app = document.getElementById("app");

    app.innerHTML = `
      <section class="view team-view">
        <section class="team-hero" style="${styleVars(summary)}">
          <div class="team-hero-content">
            <div>
              <h1 class="team-title">${escapeHtml(summary.name)}</h1>
              <div class="team-hero-actions">
                <a class="solid-button hero-action-button" href="${compareUrl(summary)}" aria-label="Compare ${escapeHtml(summary.name)} with another team">
                  <span>Compare ${escapeHtml(summary.name)} with ...</span>
                  ${renderNewPageIcon()}
                </a>
              </div>
            </div>
            <div class="hero-stats">
              ${renderHeroStat("Avg OVR", formatNumber(stats.average), "Blank ratings excluded")}
              ${renderHeroStat("Top Player", stats.top ? stats.top._ovr : "—", stats.top ? `${stats.top.player} · ${renderAge(stats.top)}` : "No rating")}
            </div>
          </div>
        </section>
        ${renderPlayerList(sortedRows, `${summary.name} Player Cards`, `${stats.count} players in dataset`, {
          showTeam: false,
          showReset: false,
          state,
          teamMap
        })}
        <p class="fine-print">Future iterations can add per-row source URLs for stricter provenance.</p>
      </section>
    `;
    animateCounters(app);
  }

  function bindEvents(summary, rows, teamMap) {
    document.getElementById("app").addEventListener("click", (event) => {
      const sortControl = event.target.closest("[data-sort]");
      if (!sortControl) return;
      const key = sortControl.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "fc26_ovr" ? "desc" : "asc";
      }
      render(summary, rows, teamMap);
    });
  }

  renderTopbar("");

  try {
    const requestedTeam = loadStateFromUrl();
    const [teams, teamData] = await Promise.all([
      loadTeamsSummary(),
      loadTeam(requestedTeam)
    ]);
    const teamMap = new Map(teams.map((team) => [team.name, team]));
    document.getElementById("loadState").hidden = true;
    render(teamData.summary, teamData.rows, teamMap);
    bindEvents(teamData.summary, teamData.rows, teamMap);
  } catch (error) {
    showLoadError(error);
  }
})();
