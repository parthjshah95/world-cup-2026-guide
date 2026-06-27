(function () {
  const WC26 = window.WC26 || (window.WC26 = {});

  const navItems = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "compare", label: "Compare", href: "compare.html" },
    { key: "players", label: "Top Players", href: "players.html" }
  ];

  function renderTopbar(activePage) {
    const mount = document.getElementById("topbar");
    if (!mount) return;
    mount.innerHTML = `
      <header class="topbar">
        <a class="brand" href="index.html" aria-label="World Cup 2026 home">
          <img class="brand-mark" src="assets/worldcup-2026-ball.webp" alt="" aria-hidden="true">
          <span class="brand-wordmark">WC26</span>
        </a>
        <nav class="nav" aria-label="Primary navigation">
          ${navItems.map((item) => `
            <a class="nav-button ${activePage === item.key ? "active" : ""}" href="${item.href}" ${activePage === item.key ? "aria-current=\"page\"" : ""}>${item.label}</a>
          `).join("")}
        </nav>
        <div class="top-actions">
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="false" title="Switch to dark mode">
            <span class="theme-toggle-icon sun" aria-hidden="true"></span>
            <span class="theme-toggle-icon moon" aria-hidden="true"></span>
          </button>
        </div>
      </header>
    `;
    WC26.Theme.bindThemeToggle();
  }

  WC26.Components = WC26.Components || {};
  WC26.Components.renderTopbar = renderTopbar;
})();
