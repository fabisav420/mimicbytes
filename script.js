document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const main = document.getElementById("main");
  const navLinks = document.querySelectorAll(".header-nav a");
  const cache = {}; // hält bereits geladene Subpages

  // === Dark Mode ===
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved === "light") body.classList.add("light");
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
  });

  // === Basis-URL bestimmen (Root oder Subdir?) ===
  // Wenn wir uns auf einer Subpage befinden, müssen wir zurück ins Root für fetch()
  const basePath = window.location.pathname.includes("/subpages/")
    ? "../"
    : "./";

  // === Subpages vorladen ===
  const subpages = ["about", "projects", "contact"];
  subpages.forEach(page => {
    fetch(`${basePath}subpages/${page}.html`)
      .then(res => res.text())
      .then(html => (cache[page] = html))
      .catch(() => console.warn(`Konnte ${page}.html nicht vorladen.`));
  });

  // === Navigation (Klick auf Menü) ===
  navLinks.forEach(link => {
    link.addEventListener("click", ev => {
      const href = link.getAttribute("href");
      if (!href.startsWith("subpages/")) return; // nur Subpages abfangen
      ev.preventDefault();

      const pageKey = href.replace("subpages/", "").replace(".html", "");

      // Hauptinhalt ersetzen
      if (cache[pageKey]) {
        updateMainFromCache(pageKey);
        window.history.pushState({ page: pageKey }, "", href); // <-- wichtig!
      } else {
        // Falls nicht vorgeladen: normal weiterleiten
        window.location.href = href;
      }
    });
  });

  // === Browser-Zurück-Button ===
  window.addEventListener("popstate", event => {
    if (event.state && event.state.page && cache[event.state.page]) {
      updateMainFromCache(event.state.page);
    }
  });

  // === Hilfsfunktion: Main aktualisieren ===
  function updateMainFromCache(pageKey) {
    const temp = document.createElement("div");
    temp.innerHTML = cache[pageKey];
    const newMain = temp.querySelector("main");
    if (newMain) {
      main.innerHTML = newMain.innerHTML;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // === Kontaktformular ===
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", ev => {
    ev.preventDefault();

    const name = contactForm.querySelector("#name").value.trim();
    const email = contactForm.querySelector("#email").value.trim();
    const message = contactForm.querySelector("#message").value.trim();
    const status = document.getElementById("formStatus");

    // einfache Validierung
    if (!name || !email || !message) {
      status.textContent = "Bitte fülle alle Felder aus.";
      status.classList.remove("sr-only");
      status.style.color = "orange";
      return;
    }

    // sehr einfache E-Mail-Prüfung
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
      status.classList.remove("sr-only");
      status.style.color = "orange";
      return;
    }

    // hier könntest du später fetch() zum Backend einfügen
    status.textContent = "Nachricht erfolgreich gesendet. Wir melden uns bald bei dir!";
    status.classList.remove("sr-only");
    status.style.color = "limegreen";

    contactForm.reset();
  });
}

  // === Jahr im Footer ===
  const yearEl = document.getElementById("copyrightYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
