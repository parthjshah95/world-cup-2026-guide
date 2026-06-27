(async function () {
  const WC26 = window.WC26;
  const { renderCountryCard, renderTopbar } = WC26.Components;
  const { bindDynamicEffects } = WC26.Utils;
  const { loadTeamsSummary, showLoadError } = WC26.Data;

  function redirectLegacyRoute() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const team = params.get("team");

    if (view === "players" || view === "top") {
      params.delete("view");
      const query = params.toString();
      window.location.replace(`players.html${query ? `?${query}` : ""}`);
      return true;
    }

    if (view === "compare") {
      params.delete("view");
      const query = params.toString();
      window.location.replace(`compare.html${query ? `?${query}` : ""}`);
      return true;
    }

    if (view === "team" || team) {
      params.delete("view");
      const query = params.toString();
      window.location.replace(`team.html${query ? `?${query}` : ""}`);
      return true;
    }

    return false;
  }

  function render(teams) {
    const app = document.getElementById("app");
    app.innerHTML = `
      <section class="view home-hero">
        <div class="country-grid">
          ${teams.map((team, index) => renderCountryCard(team, index, {
            href: `team.html?team=${encodeURIComponent(team.slug)}`
          })).join("")}
        </div>
      </section>
    `;
    bindDynamicEffects(app);
  }

  if (redirectLegacyRoute()) return;
  renderTopbar("home");

  try {
    const teams = await loadTeamsSummary();
    document.getElementById("loadState").hidden = true;
    render(teams);
  } catch (error) {
    showLoadError(error);
  }
})();
