/* main.js (extraoficial) - mejoras UX sin cambiar HTML/CSS */

/* 1) Carrusel automático (radios) */
(function autoCarousel() {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const radios = Array.from(carousel.querySelectorAll('input[name="carousel"]'));
  if (radios.length < 2) return;

  let index = radios.findIndex(r => r.checked);
  if (index < 0) index = 0;

  let userInteracted = false;
  let timer = null;
  const intervalMs = 5000; // 5s

  const next = () => {
    index = (index + 1) % radios.length;
    radios[index].checked = true;
  };

  const start = () => {
    stop();
    timer = setInterval(next, intervalMs);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  // Interacción del usuario: reinicia el tiempo
  carousel.addEventListener("click", (e) => {
    if (e.target.matches(".carousel__dot")) {
      userInteracted = true;
      // actualiza index al radio seleccionado
      const forId = e.target.getAttribute("for");
      const i = radios.findIndex(r => r.id === forId);
      if (i >= 0) index = i;
      start();
    }
  });

  // Si cambian radios por teclado
  radios.forEach((r, i) => {
    r.addEventListener("change", () => {
      index = i;
      userInteracted = true;
      start();
    });
  });

  // Pausa cuando el mouse está encima (PC)
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", () => start());

  start();
})();

/* 2) Dropdowns: cerrar al hacer clic fuera y dejar solo uno abierto */
(function dropdownBehavior() {
  const dropdowns = Array.from(document.querySelectorAll(".nav-dd"));
  if (!dropdowns.length) return;

  // Solo uno abierto a la vez
  dropdowns.forEach(d => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      dropdowns.forEach(other => {
        if (other !== d) other.open = false;
      });
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", (e) => {
    const clickedInside = e.target.closest(".nav-dd");
    if (clickedInside) return;
    dropdowns.forEach(d => d.open = false);
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    dropdowns.forEach(d => d.open = false);
  });
})();

(function closeOnMouseLeave() {
  const items = document.querySelectorAll(".nav-item");
  if (!items.length) return;

  items.forEach(item => {
    const d = item.querySelector(".nav-dd");
    const panel = item.querySelector(".nav-panel");
    if (!d) return;

    let t = null;
    const closeLater = () => {
      clearTimeout(t);
      t = setTimeout(() => { d.open = false; }, 180); // retardo corto
    };
    const cancelClose = () => {
      clearTimeout(t);
      t = null;
    };

    // Si sales del área del item, programa cierre
    item.addEventListener("mouseleave", closeLater);

    // Si vuelves a entrar (o entras al panel), cancela el cierre
    item.addEventListener("mouseenter", cancelClose);
    if (panel) {
      panel.addEventListener("mouseenter", cancelClose);
      panel.addEventListener("mouseleave", closeLater);
    }
  });
})();

(function loadBannersMock() {
  const inPages = location.pathname.includes("/pages/");
  const base = inPages ? ".." : "."; // desde pages/* sube a raíz

  const banners = [
    { imgUrl: "", linkUrl: `${base}/pages/oferta.html`, alt: "Oferta educativa" },
    { imgUrl: "", linkUrl: `${base}/pages/aspirantes.html`, alt: "Admisión" },
    { imgUrl: "", linkUrl: `${base}/pages/institucion.html`, alt: "Conócenos" },
    { imgUrl: "", linkUrl: `${base}/pages/alumnos.html`, alt: "Servicios para alumnos" },
    { imgUrl: "", linkUrl: `${base}/pages/vinculacion.html`, alt: "Vinculación" }
  ];

  const slides = Array.from(document.querySelectorAll(".carousel__slide"));
  slides.forEach((slide, i) => {
    const data = banners[i];
    if (!data) return;

    const link = slide.querySelector("[data-banner-link]");
    const img = slide.querySelector("[data-banner-img]");

    if (link) link.href = data.linkUrl || "#";
    if (img) {
      img.alt = data.alt || "";
      if (data.imgUrl) img.src = data.imgUrl;
    }
  });
})();

(function markActiveNav() {
  const path = location.pathname.toLowerCase();
  const file = path.split("/").pop() || "index.html";

  // Limpia estados previos
  document.querySelectorAll(".nav-link.is-active").forEach(el => el.classList.remove("is-active"));
  document.querySelectorAll('[aria-current="page"]').forEach(el => el.removeAttribute("aria-current"));

  // Helpers
  const setActiveLink = (key) => {
    const a = document.querySelector(`[data-nav-link="${key}"]`);
    if (!a) return false;
    a.classList.add("is-active");
    a.setAttribute("aria-current", "page");
    return true;
  };

  const setActiveSummary = (key) => {
    const s = document.querySelector(`summary[data-nav="${key}"]`);
    if (!s) return false;
    s.classList.add("is-active");
    // opcional: abrir el dropdown en esa página (si quieres)
    // const d = s.closest("details"); if (d) d.open = true;
    return true;
  };

  // Mapeo: archivo -> item activo
  // Ajusta nombres según tus archivos reales
  if (file === "index.html" || file === "") {
    setActiveLink("inicio");
    return;
  }

  if (file === "oferta.html") {
    setActiveLink("oferta");
    return;
  }

  if (file === "contacto.html") {
    setActiveLink("contacto");
    return;
  }

  // Páginas que pertenecen a dropdowns
  const conocenosFiles = new Set(["institucion.html"]);
  const admisionFiles  = new Set(["aspirantes.html"]);
  const alumnosFiles   = new Set(["alumnos.html"]);
  const vinculacionFiles = new Set(["vinculacion.html"]);
  const docentesFiles  = new Set(["docentes.html"]);
  // Si tienes egresados.html, puedes agregarlo y crear su dropdown si aplica

  if (conocenosFiles.has(file)) { setActiveSummary("conocenos"); return; }
  if (admisionFiles.has(file))  { setActiveSummary("admision"); return; }
  if (alumnosFiles.has(file))   { setActiveSummary("alumnos"); return; }
  if (vinculacionFiles.has(file)) { setActiveSummary("vinculacion"); return; }
  if (docentesFiles.has(file))  { setActiveSummary("docentes"); return; }
})();

(function mobileMenu() {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".site-nav#site-menu") || document.querySelector(".site-nav");
  if (!btn || !menu) return;

  const open = () => {
    document.body.classList.add("nav-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Cerrar menú");
  };

  const close = () => {
    document.body.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Abrir menú");
  };

  btn.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("nav-open");
    isOpen ? close() : open();
  });

  // Cierra con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Cierra al hacer clic en un link del menú (móvil)
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    // si es link real, cerrar
    close();
  });

  // Si cambias a escritorio, asegura que no quede “pegado” abierto
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });
})();
window.googleTranslateElementInit = function () {
  const container = document.getElementById("google_translate_element");

  if (!container) {
    console.error("No existe #google_translate_element");
    return;
  }

  if (!window.google || !google.translate || !google.translate.TranslateElement) {
    console.error("Google Translate API no está disponible");
    return;
  }

  try {
    new google.translate.TranslateElement(
      {
        pageLanguage: "es",
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      },
      "google_translate_element"
    );

    console.log("Google Translate inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar Google Translate:", error);
  }
};

(function () {
  const root = document.documentElement;
  const body = document.body;

  const FONT_STEP = 0.1;
  const FONT_MIN = 0.85;
  const FONT_MAX = 1.35;
  const FONT_DEFAULT = 1;

  function setFontScale(value) {
    const safeValue = Math.max(FONT_MIN, Math.min(FONT_MAX, value));
    root.style.fontSize = safeValue + "rem";
    localStorage.setItem("site-font-scale", String(safeValue));
  }

  function getCurrentFontScale() {
    const saved = parseFloat(localStorage.getItem("site-font-scale"));
    return Number.isFinite(saved) ? saved : FONT_DEFAULT;
  }

  function applySavedPreferences() {
    const savedScale = getCurrentFontScale();
    setFontScale(savedScale);

    const contrastEnabled = localStorage.getItem("site-contrast") === "true";
    body.classList.toggle("high-contrast", contrastEnabled);
  }

  function toggleContrast() {
    body.classList.toggle("high-contrast");
    localStorage.setItem(
      "site-contrast",
      body.classList.contains("high-contrast")
    );
  }

  function increaseFont() {
    setFontScale(getCurrentFontScale() + FONT_STEP);
  }

  function decreaseFont() {
    setFontScale(getCurrentFontScale() - FONT_STEP);
  }

  function resetFont() {
    setFontScale(FONT_DEFAULT);
  }

function setTranslateCookie(value) {
  document.cookie = "googtrans=" + value + ";path=/";

  const host = location.hostname;
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    document.cookie = "googtrans=" + value + ";path=/;domain=" + host;

    const parts = host.split(".");
    if (parts.length >= 2) {
      const rootDomain = "." + parts.slice(-2).join(".");
      document.cookie = "googtrans=" + value + ";path=/;domain=" + rootDomain;
    }
  }
}

function changeLanguage(lang) {
  const cookieValue = lang === "es" ? "/es/es" : "/es/" + lang;

  setTranslateCookie(cookieValue);
  localStorage.setItem("site-language", lang);
  window.location.reload();
}

  document.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-action]");
    const languageButton = event.target.closest(".lang-btn");

    if (actionButton) {
      const action = actionButton.dataset.action;

      if (action === "contrast") {
        toggleContrast();
      }

      if (action === "increase-font") {
        increaseFont();
      }

      if (action === "decrease-font") {
        decreaseFont();
      }

      if (action === "reset-font") {
        resetFont();
      }
    }

    if (languageButton) {
      event.preventDefault();
      const lang = languageButton.dataset.lang;
      changeLanguage(lang);
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  applySavedPreferences();
});
})();
/*Buscador*/
(function siteSearch() {
  const form = document.getElementById("siteSearchForm");
  const input = document.getElementById("siteSearchInput");
  const results = document.getElementById("siteSearchResults");

  if (!form || !input || !results) return;

  let abortController = null;
  let debounceTimer = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showContainer() {
    results.hidden = false;
  }

  function hideContainer() {
    results.hidden = true;
    results.innerHTML = "";
  }

  function renderMessage(className, message) {
    results.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
    showContainer();
  }

  function resolveExcerpt(hit) {
    const highlighted =
      hit._formatted?.content ||
      hit._formatted?.description ||
      hit.description ||
      hit.content ||
      "";

    const clean = String(highlighted).trim();
    if (!clean) return "Sin extracto disponible.";
    return clean.length > 260 ? `${clean.slice(0, 260)}…` : clean;
  }

  function renderHits(hits) {
    if (!hits.length) {
      renderMessage("search-empty", "No se encontraron resultados.");
      return;
    }

    results.innerHTML = hits
      .map((hit) => {
        const title = hit._formatted?.title || hit.title || "Sin título";
        const excerpt = resolveExcerpt(hit);
        const meta = hit.category ? escapeHtml(hit.category) : "General";

        return `
          <a class="search-result" href="${escapeHtml(hit.url)}">
            <h3 class="search-result__title">${title}</h3>
            <p class="search-result__meta">${meta}</p>
            <p class="search-result__excerpt">${excerpt}</p>
          </a>
        `;
      })
      .join("");

    showContainer();
  }

const SEARCH_API_URL = "http://localhost:5000/api/search";

async function doSearch(query) {

  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();

  if (!query) {
    hideContainer();
    return;
  }

  renderMessage("search-loading", "Buscando...");

  try {

    const response = await fetch(
      `${SEARCH_API_URL}?q=${encodeURIComponent(query)}&limit=8`,
      { signal: abortController.signal }
    );

    if (!response.ok) {
      throw new Error("Respuesta no válida del servidor");
    }

    const data = await response.json();

    renderHits(data.hits || []);

  } catch (error) {

    if (error.name === "AbortError") return;

    console.error("Error de búsqueda:", error);

    renderMessage(
      "search-error",
      "No fue posible realizar la búsqueda."
    );

  }

}

  input.addEventListener("input", function () {
    const query = input.value.trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doSearch(query);
    }, 220);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstResult = results.querySelector(".search-result");
    if (firstResult) {
      window.location.href = firstResult.getAttribute("href");
      return;
    }

    const query = input.value.trim();
    if (query) {
      doSearch(query);
    }
  });

  document.addEventListener("click", function (event) {
    const inside = event.target.closest(".header-search");
    if (!inside) {
      hideContainer();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hideContainer();
    }
  });
})();

/* Barra azul fija estable */
(function setupStickyNav() {
  const root = document.documentElement;
  const siteNav = document.querySelector(".site-nav");

  if (!siteNav) return;

  let placeholder = document.querySelector(".site-nav-placeholder");

  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "site-nav-placeholder";
    siteNav.parentNode.insertBefore(placeholder, siteNav);
  }

  function recalc() {
    siteNav.classList.remove("is-fixed");
    placeholder.classList.remove("active");

    const navHeight = Math.round(siteNav.getBoundingClientRect().height);
    const navTop = Math.round(siteNav.getBoundingClientRect().top + window.scrollY);

    root.style.setProperty("--site-nav-height", `${navHeight}px`);
    placeholder.style.height = `${navHeight}px`;
    siteNav.dataset.originalTop = String(navTop);
  }

  function onScroll() {
    const gobmxOffset = parseInt(
      getComputedStyle(root).getPropertyValue("--gobmx-offset"),
      10
    ) || 48;

    const navOriginalTop = parseInt(siteNav.dataset.originalTop || "0", 10);
    const triggerPoint = navOriginalTop - gobmxOffset;

    if (window.scrollY >= triggerPoint) {
      siteNav.classList.add("is-fixed");
      placeholder.classList.add("active");
    } else {
      siteNav.classList.remove("is-fixed");
      placeholder.classList.remove("active");
    }
  }

  function init() {
    recalc();
    onScroll();
  }

  window.addEventListener("load", init);
  window.addEventListener("resize", init);
  window.addEventListener("scroll", onScroll, { passive: true });

  setTimeout(init, 200);
  setTimeout(init, 800);
})();