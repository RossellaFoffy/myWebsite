document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.translateStatic === "function") {
  window.translateStatic(window.pageTranslations);
}

  const products = [
    {
      art_number: "0001",
      title: {
              it: "Crostata alla Crema di Nocciole",
              en: "Hazelnut Cream Tart",
              de: "Haselnusscreme-Mürbeteig-Tarte"
      },
      description: {
              it: "Crostata cotta, fatta di pasta frolla e farcita con Nutella®",
              en: "Baked shortcrust tart, filled with Nutella®",
              de: "Gebackene Mürbeteig-Tarte, gefüllt mit Nutella®"
      },
      image: "assets/products/cards/Crostata-nutella-card.jpg",
      cost: "43.50",
      vat: 0.026,
      mwst: {
              it: "escluso IVA",
              en: "VAT excluded",
              de: "exklusiv MwST"
      }
    },
    {
      art_number: "0002",
      title: {
              it: "Crostata alla Marmellata di Ciliegie",
              en: "Cherry-Jam Tart",
              de: "Kirschkonfitüre-Mürbeteig-Tarte"
      },
      description: {
              it: "Crostata cotta, fatta di pasta frolla e farcita con Marmellata di Ciliegie",
              en: "Baked shortcrust tart, filled with Cherry-Jam",
              de: "Gebackene Mürbeteig-Tarte, gefüllt mit Kirschkonfitüre"
      },
      image: "assets/products/cards/Crostata-marmellata-card.jpg",
      cost: "39.50",
      vat: 0.026,
      mwst: {
              it: "escluso IVA",
              en: "VAT excluded",
              de: "exklusiv MwST"
      }

    },
    {
      art_number: "0003",
      title: {
              it: "Crostata alla Crema di Pistacchio",
              en: "Pistache-Cream Tart",
              de: "Pistaziencreme-Mürbeteig-Tarte"
      },
      description: {
              it: "Crostata cotta, fatta di pasta frolla e farcita con Crema di Pistacchi",
              en: "Baked shortcrust tart, filled with Pistache-Cream",
              de: "Gebackene Mürbeteig-Tarte, gefüllt mit Pistaziencreme"
      },
      image: "assets/products/cards/Crostata-pistacchio-card.jpg",
      cost: "54.50",
      vat: 0.026,
      mwst: {
              it: "escluso IVA",
              en: "VAT excluded",
              de: "exklusiv MwST"
      }
    },
    {
      art_number: "0004",
      title: {
              it: "Bocconotto alla Crema Pasticcera",
              en: "Cream Bocconotto",
              de: "Creme-Mürbeteig-Bocconotto"
      },
      description: {
              it: "Bocconotto cotto, fatto di pasta frolla e farcito con Crema Pasticcera",
              en: "Baked bocconotto made from shortcrust tart, filled with pastry cream",
              de: "Gebackener Bocconotto aus Mürbeteig, gefüllt mit Konditorcreme"
      },
      image: "assets/products/cards/Bocconotto-crema-card.jpg",
      cost: "44.50",
      vat: 0.026,
      mwst: {
              it: "escluso IVA",
              en: "VAT excluded",
              de: "exklusiv MwST"
      }
    },
  ];

  window.PRODUCTS = products;

  // Rendering automatico
  const container = document.getElementById("products-list");

  function renderProducts() {

    // 👉 SE NON SIAMO NEL SITO (es. admin) NON FARE NIENTE
    if (!container) return;

    container.innerHTML = ""; // PRIMA PULISCE

    products.forEach(prod => {
      const box = document.createElement("div");
      box.classList.add("product-box");

      box.innerHTML = `
        <h2>${prod.title[lang]}</h2>
        <p>${prod.description[lang]}</p>
        <br/>
        <img class="card-image" src="${prod.image}"/>
        <br/>
        <h3 class="card-cost"><b>${prod.cost} chf</b></h3>
        <p>${prod.mwst[lang]}</p>
      `;

      container.appendChild(box);
    });
  };

  if (container) renderProducts();

  // Hook per cambio lingua
  window.onLanguageChange = () => {
    if (container) renderProducts();
  }
});