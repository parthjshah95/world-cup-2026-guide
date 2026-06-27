(async function () {
  const WC26 = window.WC26;
  const {
    renderComparePlayerCards,
    renderCountryCard,
    renderDistribution,
    renderMetric,
    renderTopbar,
    styleVars
  } = WC26.Components;
  const { animateCounters, bindDynamicEffects, escapeHtml, formatNumber, readParams, renderAge, setUrlParams, teamUrl } = WC26.Utils;
  const { loadTeam, loadTeamsSummary, showLoadError } = WC26.Data;
  const { teamStats } = WC26.Stats;

  const state = {
    teamA: "",
    teamB: "",
    pickerSearchA: "",
    pickerSearchB: ""
  };

  let teams = [];
  let teamMap = new Map();

  function loadStateFromUrl() {
    const params = readParams();
    state.teamA = params.get("teamA") || "";
    state.teamB = params.get("teamB") || "";
  }

  function updateCompareUrl() {
    const params = new URLSearchParams();
    if (state.teamA) params.set("teamA", state.teamA);
    if (state.teamB) params.set("teamB", state.teamB);
    setUrlParams(params);
  }

  async function render() {
    const app = document.getElementById("app");
    const [sideA, sideB] = await Promise.all([
      renderCompareSide("A", state.teamA, state.pickerSearchA),
      renderCompareSide("B", state.teamB, state.pickerSearchB)
    ]);

    app.innerHTML = `
      <section class="view compare-view">
        <div class="hero-copy">
          <h1>Compare countries side by side.</h1>
        </div>
        <div class="compare-layout">
          ${sideA}
          ${sideB}
        </div>
      </section>
    `;
    bindDynamicEffects(app);
    animateCounters(app);
  }

  async function renderCompareSide(side, team, search) {
    if (!team) return renderTeamPicker(side, search);
    const teamData = await loadTeam(team);
    state[`team${side}`] = teamData.summary.name;
    return renderSelectedTeam(side, teamData.summary, teamData.rows);
  }

  function renderTeamPicker(side, search) {
    const q = search.trim().toLowerCase();
    const filteredTeams = teams.filter((team) => {
      return !q || team.name.toLowerCase().includes(q) || team.code.toLowerCase().includes(q);
    });

    return `
      <section class="compare-side">
        <div class="compare-picker-head">
          <div>
            <div class="eyebrow">Team ${side}</div>
            <h2>Select country</h2>
          </div>
        </div>
        <input type="search" data-picker-search="${side}" value="${escapeHtml(search)}" placeholder="Search countries">
        <div class="mini-grid">
          ${filteredTeams.map((team, index) => renderMiniCompareCard(team, side, index)).join("")}
        </div>
      </section>
    `;
  }

  function renderMiniCompareCard(team, side, index) {
    return renderCountryCard(team, index, {
      size: "mini",
      attrs: {
        "data-compare-team": team.name,
        "data-side": side
      }
    });
  }

  function renderSelectedTeam(side, summary, rows) {
    const stats = teamStats(summary.name, rows);
    return `
      <section class="compare-side">
        <article class="selected-team-panel">
          <div class="selected-team-flag" style="${styleVars(summary)}">
            <div class="selected-team-title">
              <div>
                <h2>${escapeHtml(summary.name)}</h2>
              </div>
            </div>
          </div>
          <div class="metrics-grid">
            ${renderMetric("Avg OVR", formatNumber(stats.average), "Mean of rated rows")}
            ${renderMetric("Median OVR", formatNumber(stats.median), "Middle rating")}
            ${renderMetric("Top Player", stats.top ? stats.top.player : "—", stats.top ? `${stats.top._ovr} OVR · ${renderAge(stats.top)}` : "No rating")}
            ${renderMetric("85+ / 90+", `${stats.stars85} / ${stats.elite90}`, "Star and elite counts")}
          </div>
          <div class="compare-section compare-actions">
            <button class="ghost-button" type="button" data-change-side="${side}">Change team</button>
            <a class="solid-button" href="${teamUrl(summary)}">View team home</a>
          </div>
          <div class="compare-section">
            <h3>Top 5 Players</h3>
            ${renderComparePlayerCards(stats.topFive, teamMap)}
          </div>
          <div class="compare-section">
            <h3>Position Groups</h3>
            <div class="distribution-grid">
              ${["GK", "DEF", "MID", "ATT"].map((key) => `<div class="distribution-row"><span>${key}</span><strong>${stats.positionCounts[key] || 0}</strong></div>`).join("")}
            </div>
          </div>
          <div class="compare-section">
            <h3>Club Countries</h3>
            <div class="distribution-grid">
              ${renderDistribution(stats.clubCountryCounts, 6)}
            </div>
          </div>
        </article>
      </section>
    `;
  }

  function restoreFocus(selector) {
    window.requestAnimationFrame(() => {
      const node = document.querySelector(selector);
      if (!node) return;
      node.focus();
      const valueLength = node.value ? node.value.length : 0;
      if (typeof node.setSelectionRange === "function") node.setSelectionRange(valueLength, valueLength);
    });
  }

  function bindEvents() {
    const app = document.getElementById("app");

    app.addEventListener("click", async (event) => {
      const compareCard = event.target.closest("[data-compare-team]");
      if (compareCard) {
        const side = compareCard.dataset.side;
        if (side === "A") state.teamA = compareCard.dataset.compareTeam;
        else state.teamB = compareCard.dataset.compareTeam;
        updateCompareUrl();
        await render();
        return;
      }

      const changeButton = event.target.closest("[data-change-side]");
      if (!changeButton) return;
      if (changeButton.dataset.changeSide === "A") state.teamA = "";
      else state.teamB = "";
      updateCompareUrl();
      await render();
    });

    app.addEventListener("input", async (event) => {
      const picker = event.target.closest("[data-picker-search]");
      if (!picker) return;
      if (picker.dataset.pickerSearch === "A") state.pickerSearchA = picker.value;
      else state.pickerSearchB = picker.value;
      await render();
      restoreFocus(`[data-picker-search="${picker.dataset.pickerSearch}"]`);
    });

    window.addEventListener("popstate", async () => {
      loadStateFromUrl();
      await render();
    });
  }

  renderTopbar("compare");

  try {
    loadStateFromUrl();
    teams = await loadTeamsSummary();
    teamMap = new Map(teams.map((team) => [team.name, team]));
    document.getElementById("loadState").hidden = true;
    await render();
    bindEvents();
  } catch (error) {
    showLoadError(error);
  }
})();
