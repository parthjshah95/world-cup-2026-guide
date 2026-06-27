(function () {
  const WC26 = window.WC26 || (window.WC26 = {});

  function storedTheme() {
    try {
      return localStorage.getItem("wc26-theme");
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("wc26-theme", theme);
    } catch (error) {
      // Theme persistence is a convenience; the toggle still works without storage.
    }
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme, persist = true) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    if (persist) saveTheme(nextTheme);

    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    const isDark = nextTheme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    toggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  }

  function bindThemeToggle() {
    const toggle = document.querySelector("[data-theme-toggle]");
    toggle?.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", (event) => {
      if (storedTheme()) return;
      applyTheme(event.matches ? "dark" : "light", false);
    });

    applyTheme(currentTheme(), false);
  }

  WC26.Theme = {
    applyTheme,
    bindThemeToggle,
    currentTheme,
    storedTheme
  };
})();
