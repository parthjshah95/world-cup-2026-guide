(function () {
  const WC26 = window.WC26 || (window.WC26 = {});

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function labelize(value) {
    return String(value || "Unknown")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function slugify(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function parseRating(value) {
    const parsed = Number.parseInt(String(value || "").trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function positionGroup(position) {
    const p = String(position || "").toUpperCase();
    if (p.includes("GK")) return "GK";
    if (p.includes("CB") || p.includes("LB") || p.includes("RB") || p.includes("RWB") || p.includes("DEF") || p.includes("FULLBACK")) return "DEF";
    if (p.includes("CM") || p.includes("CDM") || p.includes("DM") || p.includes("AM") || p.includes("CAM") || p.includes("MID")) return "MID";
    if (p.includes("LW") || p.includes("RW") || p.includes("ST") || p.includes("CF") || p.includes("WINGER") || p.includes("FORWARD") || p.includes("STRIKER")) return "ATT";
    return "OTHER";
  }

  function ratingBand(rating) {
    if (rating === null) return { className: "unknown", label: "Unknown" };
    if (rating >= 90) return { className: "elite", label: "Elite" };
    if (rating >= 85) return { className: "star", label: "World-class / star" };
    if (rating >= 80) return { className: "strong", label: "Strong international" };
    if (rating >= 75) return { className: "rotation", label: "Squad / rotation" };
    return { className: "depth", label: "Depth / development" };
  }

  function formatNumber(value, decimals = 1) {
    return value === null || value === undefined ? "—" : Number(value).toFixed(decimals);
  }

  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function renderAge(row) {
    return row && row.age ? `Age ${escapeHtml(row.age)}` : "Age —";
  }

  function teamParam(team) {
    if (team && typeof team === "object") return team.slug || slugify(team.name);
    return slugify(team);
  }

  function teamUrl(team) {
    return `team.html?team=${encodeURIComponent(teamParam(team))}`;
  }

  function compareUrl(teamA, teamB = "") {
    const params = new URLSearchParams();
    if (teamA) params.set("teamA", teamParam(teamA));
    if (teamB) params.set("teamB", teamParam(teamB));
    const query = params.toString();
    return `compare.html${query ? `?${query}` : ""}`;
  }

  function uniqueSorted(rows, key) {
    return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function compareRowsForState(state) {
    return (a, b) => {
      const dir = state.sortDir === "asc" ? 1 : -1;
      if (state.sortKey === "fc26_ovr" || state.sortKey === "age") {
        const av = state.sortKey === "fc26_ovr" ? a._ovr : Number.parseInt(a.age || "", 10);
        const bv = state.sortKey === "fc26_ovr" ? b._ovr : Number.parseInt(b.age || "", 10);
        const aMissing = !Number.isFinite(av);
        const bMissing = !Number.isFinite(bv);
        if (aMissing && bMissing) return a.player.localeCompare(b.player);
        if (aMissing) return 1;
        if (bMissing) return -1;
        if (av !== bv) return (av - bv) * dir;
        return a.player.localeCompare(b.player);
      }
      const av = String(a[state.sortKey] || "").toLowerCase();
      const bv = String(b[state.sortKey] || "").toLowerCase();
      if (av === bv) return a.player.localeCompare(b.player);
      return av.localeCompare(bv) * dir;
    };
  }

  function filteredPlayerRows(baseRows, state, includeTeamFilter) {
    let rows = [...baseRows];
    if (includeTeamFilter && state.filters.team) rows = rows.filter((row) => row.team === state.filters.team);
    if (state.filters.club_country) rows = rows.filter((row) => row.club_country === state.filters.club_country);
    if (state.filters.position_group) rows = rows.filter((row) => row._position_group === state.filters.position_group);

    const q = state.search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => [
        row.player,
        row.team,
        row.club,
        row.club_country,
        row.club_with_country,
        row.position,
        row.age,
        row.notes
      ].some((value) => String(value || "").toLowerCase().includes(q)));
    }

    rows.sort(compareRowsForState(state));
    return rows;
  }

  function bindDynamicEffects(root = document) {
    root.querySelectorAll(".country-card, .mini-country-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
        card.style.setProperty("--tilt-x", `${((x - 50) / 50) * 0.2}deg`);
        card.style.setProperty("--tilt-y", `${((50 - y) / 50) * 0.2}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      });
    });
  }

  function animateCounters(root = document) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    root.querySelectorAll("[data-count]").forEach((node) => {
      if (!node.dataset.count.trim()) return;
      const target = Number(node.dataset.count);
      if (!Number.isFinite(target)) return;
      const decimals = String(node.textContent).includes(".") ? 1 : 0;
      const duration = 720;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(tick);
        else node.textContent = target.toFixed(decimals);
      };
      requestAnimationFrame(tick);
    });
  }

  function readParams() {
    return new URLSearchParams(window.location.search);
  }

  function setUrlParams(params) {
    const query = params.toString();
    window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  WC26.Utils = {
    animateCounters,
    bindDynamicEffects,
    compareRowsForState,
    compareUrl,
    escapeHtml,
    filteredPlayerRows,
    formatNumber,
    initials,
    labelize,
    parseRating,
    positionGroup,
    ratingBand,
    readParams,
    renderAge,
    setUrlParams,
    slugify,
    teamUrl,
    uniqueSorted
  };
})();
