/* =========================================================
   Black Pork — Carta digital
   Carga menu.json y renderiza la carta
   ========================================================= */

const MENU_URL = "data/menu.json";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- Utilidades ----------

const slug = (str) =>
  str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatPrice = (value, currency = "EUR") => {
  if (value == null || isNaN(value)) return "";
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} €`;
  }
};

// Si el texto está mayoritariamente en mayúsculas, marcamos para suavizar visualmente
const isShouty = (str) => {
  if (!str) return false;
  const letters = str.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "");
  return upper.length / letters.length > 0.7;
};

const escapeHTML = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Numeración romana para las secciones
const toRoman = (num) => {
  const map = [
    ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
  ];
  let res = "";
  for (const [r, v] of map) {
    while (num >= v) { res += r; num -= v; }
  }
  return res;
};

// ---------- Render ----------

const renderProduct = (product) => {
  const {
    name = "",
    description = "",
    base_price,
    currency = "EUR",
    variants = [],
    image_url,
  } = product;

  const nameClass = isShouty(name) ? "product__name is-shouty" : "product__name";
  const descClass = isShouty(description) ? "product__desc is-shouty" : "product__desc";

  const img = image_url
    ? `<img class="product__img" src="${escapeHTML(image_url)}" alt="" loading="lazy" decoding="async"
        onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'product__img product__img--placeholder',textContent:'Black Pork'}))" />`
    : `<div class="product__img product__img--placeholder">Black Pork</div>`;

  const price = base_price != null
    ? `<span class="product__price">${formatPrice(base_price, currency)}</span>`
    : "";

  const variantsHTML = variants && variants.length
    ? `<ul class="variants">${variants
        .map(
          (v) => `
            <li>
              <span class="v-name">${escapeHTML(v.value || v.attribute || "")}</span>
              <span class="v-price">${formatPrice(v.price, currency)}</span>
            </li>`
        )
        .join("")}</ul>`
    : "";

  // Datos para búsqueda
  const haystack = [
    name,
    description,
    ...(variants || []).map((v) => `${v.attribute || ""} ${v.value || ""}`),
  ]
    .join(" ")
    .toLowerCase();

  return `
    <article class="product" data-search="${escapeHTML(haystack)}">
      ${img}
      <div class="product__body">
        <div class="product__top">
          <h4 class="${nameClass}">${escapeHTML(name)}</h4>
          <span class="product__lead" aria-hidden="true"></span>
          ${price}
        </div>
        ${description ? `<p class="${descClass}">${escapeHTML(description)}</p>` : ""}
        ${variantsHTML}
      </div>
    </article>
  `;
};

const renderSubsection = (sub) => {
  const products = (sub.products || []).filter(
    (p) => p && (p.name || p.description)
  );
  if (!products.length) return ""; // ocultamos subsecciones vacías

  return `
    <div class="subsection" data-sub="${escapeHTML(slug(sub.name))}">
      <header class="subsection__head">
        <h3 class="subsection__title">${escapeHTML(sub.name)}</h3>
        <span class="subsection__count">${products.length} ${
          products.length === 1 ? "referencia" : "referencias"
        }</span>
      </header>
      <div class="products">
        ${products.map(renderProduct).join("")}
      </div>
    </div>
  `;
};

const renderSection = (section, idx) => {
  const subs = (section.subsections || [])
    .map(renderSubsection)
    .filter(Boolean)
    .join("");
  if (!subs) return "";

  const id = slug(section.name);
  return `
    <section class="section" id="${id}" data-section="${id}" data-name="${escapeHTML(
    section.name
  )}">
      <header class="section__head">
        <span class="section__num">Capítulo ${toRoman(idx + 1)}</span>
        <h2 class="section__title">${escapeHTML(section.name)}</h2>
        <div class="section__deco" aria-hidden="true">
          <span></span><em>✦</em><span></span>
        </div>
      </header>
      ${subs}
    </section>
  `;
};

const renderNav = (sections) => {
  const nav = $("#sectionNav");
  nav.innerHTML = sections
    .map(
      (s) =>
        `<a href="#${slug(s.name)}" data-target="${slug(s.name)}">${escapeHTML(
          s.name
        )}</a>`
    )
    .join("");
};

const renderMenu = (data) => {
  const root = $("#menu");
  root.removeAttribute("aria-busy");

  // Aplanamos: cogemos el primer restaurante / primer menú (estructura del JSON dado)
  const restaurant = data[0];
  if (!restaurant) {
    root.innerHTML = `<div class="error">El JSON está vacío.</div>`;
    return;
  }
  const menu = restaurant.menus && restaurant.menus[0];
  if (!menu) {
    root.innerHTML = `<div class="error">No se ha encontrado ningún menú dentro del JSON.</div>`;
    return;
  }

  const sections = (menu.sections || []).filter((s) => s.subsections?.length);

  // Actualizamos cabecera con el nombre real si existe
  const titleEl = document.querySelector(".masthead__sub");
  if (restaurant.restaurant && titleEl) {
    titleEl.textContent = restaurant.restaurant;
  }
  const docTitle = restaurant.restaurant
    ? `${restaurant.restaurant} — Carta`
    : "Carta";
  document.title = docTitle;

  renderNav(sections);

  root.innerHTML = sections.map(renderSection).join("") ||
    `<div class="empty">Aún no hay platos publicados en esta carta.</div>`;

  initObservers();
};

// ---------- Búsqueda ----------

const setupSearch = () => {
  const input = $("#search");
  const clearBtn = $("#searchClear");
  let timer;

  const apply = (q) => {
    const query = q.trim().toLowerCase();
    clearBtn.hidden = !query;

    const products = $$(".product");
    products.forEach((el) => {
      const hay = el.dataset.search || "";
      el.classList.toggle("is-hidden", query && !hay.includes(query));
    });

    // Ocultar subsecciones / secciones vacías
    $$(".subsection").forEach((sub) => {
      const visible = $$(".product:not(.is-hidden)", sub).length;
      sub.classList.toggle("is-hidden", query && visible === 0);
    });
    $$(".section").forEach((sec) => {
      const visible = $$(".subsection:not(.is-hidden)", sec).length;
      sec.classList.toggle("is-hidden", query && visible === 0);
    });

    // Mostrar mensaje si no hay nada
    let empty = $("#emptyResults");
    const anyVisible = $$(".section:not(.is-hidden)").length;
    if (query && !anyVisible) {
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "emptyResults";
        empty.className = "empty";
        $("#menu").appendChild(empty);
      }
      empty.textContent = `No hemos encontrado nada para «${q.trim()}».`;
    } else if (empty) {
      empty.remove();
    }
  };

  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => apply(e.target.value), 80);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    apply("");
    input.focus();
  });
};

// ---------- Scroll spy + botón volver arriba ----------

const initObservers = () => {
  const navLinks = $$("#sectionNav a");
  const sections = $$(".section");
  if (!sections.length) return;

  const byId = new Map(navLinks.map((a) => [a.dataset.target, a]));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("is-active"));
          const link = byId.get(e.target.id);
          if (link) {
            link.classList.add("is-active");
            // scroll del nav para mantener el activo a la vista
            link.scrollIntoView({ block: "nearest", inline: "center" });
          }
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));

  // Botón volver arriba
  const toTop = $("#toTop");
  window.addEventListener(
    "scroll",
    () => {
      toTop.hidden = window.scrollY < 600;
    },
    { passive: true }
  );
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
};

// ---------- Arranque ----------

const showError = (msg) => {
  $("#menu").innerHTML = `<div class="error">${msg}</div>`;
};

const boot = async () => {
  setupSearch();
  try {
    const res = await fetch(MENU_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderMenu(data);
  } catch (err) {
    console.error(err);
    const isFile = location.protocol === "file:";
    showError(
      isFile
        ? `No se puede cargar <code>menu.json</code> abriendo el archivo localmente con <code>file://</code> por las restricciones de CORS del navegador. Súbelo a GitHub Pages o sírvelo con un servidor local (por ejemplo <code>python3 -m http.server</code>).`
        : `No se ha podido cargar <code>menu.json</code>. Comprueba que existe junto a <code>index.html</code>. Detalle: ${escapeHTML(
            err.message
          )}`
    );
  }
};

boot();
