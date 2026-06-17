(function () {
  try {
    var saved = localStorage.getItem("theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var active = saved || (systemDark ? "dark" : "light");
    if (active === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
