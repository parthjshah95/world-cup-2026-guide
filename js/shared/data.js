(function () {
  const WC26 = window.WC26 || (window.WC26 = {});
  const { parseRating, positionGroup, slugify } = WC26.Utils;
  const jsonCache = new Map();
  let teamsSummaryPromise = null;
  let playersPromise = null;

  async function loadJson(path) {
    if (!jsonCache.has(path)) {
      jsonCache.set(path, fetch(path).then((response) => {
        if (!response.ok) throw new Error(`${path} request failed: ${response.status}`);
        return response.json();
      }));
    }
    return jsonCache.get(path);
  }

  function normalizeRows(data) {
    if (Array.isArray(data)) return data.map(normalizeRow);
    if (!data || !Array.isArray(data.rows)) return [];
    if (!Array.isArray(data.fields)) return data.rows.map(normalizeRow);

    return data.rows.map((cells) => {
      const row = {};
      data.fields.forEach((field, index) => {
        row[field] = cells[index] ?? "";
      });
      return normalizeRow(row);
    });
  }

  function normalizeRow(row) {
    const normalized = { ...row };
    normalized._id = normalized._id || `${normalized.team || "team"}-${normalized.player || "player"}`;
    normalized._ovr = normalized._ovr === "" || normalized._ovr === undefined ? parseRating(normalized.fc26_ovr) : Number(normalized._ovr);
    if (!Number.isFinite(normalized._ovr)) normalized._ovr = null;
    normalized._position_group = normalized._position_group || positionGroup(normalized.position);
    return normalized;
  }

  function compareTeamSummaries(a, b) {
    if (a.strengthComplete !== b.strengthComplete) return a.strengthComplete ? -1 : 1;
    if (a.strengthScore !== b.strengthScore) return (b.strengthScore || -1) - (a.strengthScore || -1);
    return a.name.localeCompare(b.name);
  }

  async function loadTeamsSummary() {
    if (!teamsSummaryPromise) {
      teamsSummaryPromise = loadJson("data/teams-summary.json").then((teams) => [...teams].sort(compareTeamSummaries));
    }
    return teamsSummaryPromise;
  }

  async function loadPlayers() {
    if (!playersPromise) {
      playersPromise = loadJson("data/players-lite.json").then(normalizeRows);
    }
    return playersPromise;
  }

  async function resolveTeam(value) {
    const teams = await loadTeamsSummary();
    const requested = String(value || "").trim();
    if (!requested) return teams[0] || null;
    const requestedSlug = slugify(requested);
    return teams.find((team) => team.slug === requestedSlug || team.name === requested) || teams[0] || null;
  }

  async function loadTeam(value) {
    const summary = await resolveTeam(value);
    if (!summary) return { summary: null, rows: [] };
    const data = await loadJson(`data/teams/${summary.slug}.json`);
    return {
      summary,
      rows: normalizeRows(data)
    };
  }

  function showLoadError(error) {
    const loadState = document.getElementById("loadState");
    if (!loadState) return;
    loadState.hidden = false;
    loadState.textContent = "Player data could not be loaded. Run a static server from this folder and refresh.";
    console.error(error);
  }

  WC26.Data = {
    compareTeamSummaries,
    loadPlayers,
    loadTeam,
    loadTeamsSummary,
    normalizeRows,
    resolveTeam,
    showLoadError
  };
})();
