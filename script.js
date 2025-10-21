document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const main = document.getElementById("main");
  const navLinks = document.querySelectorAll(".header-nav a");
  const cache = {};

  // === Dark Mode ===
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved === "light") body.classList.add("light");
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
  });

  // === Basis-URL bestimmen (Root oder Subdir?) ===
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
      if (!href.startsWith("subpages/")) return;
      ev.preventDefault();

      const pageKey = href.replace("subpages/", "").replace(".html", "");
      if (cache[pageKey]) {
        updateMainFromCache(pageKey);
        window.history.pushState({ page: pageKey }, "", href);
      } else {
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

  // === Kontaktformular (Formspree + Validierung) ===
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const status = document.getElementById("formStatus");

    contactForm.addEventListener("submit", async e => {
      e.preventDefault();

      const name = contactForm.querySelector("#name").value.trim();
      const email = contactForm.querySelector("#email").value.trim();
      const message = contactForm.querySelector("#message").value.trim();

      // --- einfache Validierung ---
      if (!name || !email || !message) {
        status.textContent = "Bitte fülle alle Felder aus.";
        status.style.color = "orange";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
        status.style.color = "orange";
        return;
      }

      // --- Daten an Formspree senden ---
      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });

        if (response.ok) {
          status.style.display = "block";
          status.textContent = "Nachricht erfolgreich gesendet – wir melden uns bald!";
          status.style.color = "limegreen";
          status.style.opacity = "0";
          setTimeout(() => {
            status.style.transition = "opacity 0.4s ease";
            status.style.opacity = "1";
          }, 10);
          contactForm.reset();
        } else {
          const data = await response.json();
          if (data.errors && data.errors.length > 0) {
            status.textContent = data.errors.map(err => err.message).join(", ");
          } else {
            status.textContent = "Fehler beim Senden. Bitte später erneut versuchen.";
          }
          status.style.color = "red";
        }
      } catch (err) {
        console.error("Formspree Error:", err);
        status.textContent = "Verbindungsfehler – bitte später erneut versuchen.";
        status.style.color = "red";
      }
    });
  }


  // === Project Gallery Carousels ===
const carousels = document.querySelectorAll(".carousel");
carousels.forEach(carousel => {
  const imagesContainer = carousel.querySelector(".carousel-images");
  const images = carousel.querySelectorAll("img");
  const prevBtn = carousel.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.querySelector(".carousel-btn.next");

  let index = 0;

  function updateCarousel() {
    imagesContainer.style.transform = `translateX(-${index * 100}%)`;
  }

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    updateCarousel();
  });

  // Optional: Swipe-Unterstützung (Touch-Geräte)
  let startX = 0;
  imagesContainer.addEventListener("touchstart", e => (startX = e.touches[0].clientX));
  imagesContainer.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    if (endX < startX - 50) nextBtn.click();
    else if (endX > startX + 50) prevBtn.click();
  });
});
  // === Jahr im Footer ===
  const yearEl = document.getElementById("copyrightYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
