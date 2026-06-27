(async function () {
  const WC26 = window.WC26;
  const { clearFilters, renderControls, renderPlayerList, renderTopbar } = WC26.Components;
  const { filteredPlayerRows, readParams } = WC26.Utils;
  const { loadPlayers, loadTeamsSummary, showLoadError } = WC26.Data;

  const state = {
    search: "",
    filters: {
      team: "",
      club_country: "",
      position_group: ""
    },
    sortKey: "fc26_ovr",
    sortDir: "desc"
  };

  let teams = [];
  let rows = [];
  let teamMap = new Map();

  function loadStateFromUrl() {
    const params = readParams();
    state.search = params.get("q") || "";
    state.sortKey = params.get("sort") || "fc26_ovr";
    state.sortDir = params.get("dir") || "desc";
    state.filters = {
      team: params.get("teamFilter") || params.get("team") || "",
      club_country: params.get("club_country") || "",
      position_group: params.get("position_group") || ""
    };
  }

  function render(focusSelector = "") {
    const visibleRows = filteredPlayerRows(rows, state, true);
    const app = document.getElementById("app");
    app.innerHTML = `
      <section class="view players-view">
        ${renderControls(state, teams, rows, true)}
        ${renderPlayerList(visibleRows, "All Players", `${visibleRows.length} visible players · ${rows.length} total`, {
          showTeam: true,
          showReset: true,
          state,
          teamMap
        })}
      </section>
    `;
    restoreFocus(focusSelector);
  }

  function restoreFocus(selector) {
    if (!selector) return;
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

    app.addEventListener("click", (event) => {
      const resetButton = event.target.closest("[data-reset-filters]");
      if (resetButton) {
        clearFilters(state);
        render();
        return;
      }

      const sortControl = event.target.closest("[data-sort]");
      if (!sortControl) return;

      const key = sortControl.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "fc26_ovr" ? "desc" : "asc";
      }
      render();
    });

    app.addEventListener("input", (event) => {
      const search = event.target.closest("[data-search]");
      if (!search) return;
      state.search = search.value;
      render("[data-search]");
    });

    app.addEventListener("change", (event) => {
      const filter = event.target.closest("[data-filter]");
      if (!filter) return;
      state.filters[filter.dataset.filter] = filter.value;
      render();
    });
  }

  renderTopbar("players");

  try {
    loadStateFromUrl();
    [teams, rows] = await Promise.all([
      loadTeamsSummary(),
      loadPlayers()
    ]);
    teamMap = new Map(teams.map((team) => [team.name, team]));
    document.getElementById("loadState").hidden = true;
    render();
    bindEvents();
  } catch (error) {
    showLoadError(error);
  }
})();
