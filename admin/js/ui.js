(function(){

  function escapeHtml(s){
    return (s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  function money(n) {
    const { locale, currency } = window.APP_CONFIG;
    const value = Number(n || 0);
    // Formato: CHF 12.50 (semplice)
    return `${currency} ${value.toFixed(2)}`;
  }

  function readRows(tbody) {
    const trs = [...tbody.querySelectorAll("tr")];

    return trs.map(tr => {
      const productSel = tr.querySelector(".product");
      const titleFromSelect =
        productSel?.selectedOptions?.[0]?.textContent?.trim() || "";

      const art_number = productSel?.value?.trim()
        || tr.querySelector(".artNo")?.textContent?.trim()
        || "";

      const descInput = tr.querySelector(".desc");
      const manualDesc = descInput?.value?.trim() || "";
      const isManual = descInput?.dataset?.manual === "1";
      const hasProduct = (productSel?.value || "").trim() !== "";

      const descrizione = hasProduct
        ? (isManual ? manualDesc : titleFromSelect.trim())
        : manualDesc;

      const quantita = Number(tr.querySelector(".qty")?.value || 0);
      const prezzo = Number(tr.querySelector(".cost")?.value || 0);
      const iva = Number(tr.querySelector(".vat")?.value || 0);

      return { art_number, descrizione, quantita, prezzo, iva };
    }).filter(r => r.descrizione && r.quantita > 0);
  }

  function calcGrandTotal(rows) {
    return rows.reduce((sum, r) => {
      const net = r.quantita * r.prezzo;
      return sum + net + (net * (r.iva || 0));
    }, 0);
  }

  function updateTotals(tbody, totaleView) {
    const rows = readRows(tbody);
    const total = calcGrandTotal(rows);
    totaleView.textContent = money(total);

    // aggiorna totale riga per riga
    for (const tr of tbody.querySelectorAll("tr")) {
      const qty = Number(tr.querySelector(".qty")?.value || 0);
      const cost = Number(tr.querySelector(".cost")?.value || 0);
      const rate = Number(tr.querySelector(".vat")?.value || 0);

      const net = qty * cost;
      const gross = net + (net * rate);

      tr.querySelector(".lineNet").textContent = net.toFixed(2);
      tr.querySelector(".lineGross").textContent = gross.toFixed(2);
    }

    return { rows, total };
  }

  function getLang() {
    // APP_CONFIG.locale tipo "it-CH" -> "it"
    const loc = (window.APP_CONFIG?.locale || "it").toLowerCase();
    return loc.split("-")[0] || "it";
  }

  function pickI18n(value, lang) {
    // value può essere stringa o oggetto {it: "...", de:"..."}
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return (
        value[lang] ??
        value.it ??
        value.de ??
        value.en ??
        Object.values(value)[0] ??
        ""
      );
    }
    return String(value);
  }

  function getProductLabel(p) {
    const lang = getLang();
    // prova vari campi possibili
    const name =
      pickI18n(p.title, lang) ;

    return name || "";
  }

  function addRow(tbody, { descrizione="", quantita=1, prezzo=0, iva=0, art_number="" } = {}) {
    const tr = document.createElement("tr");

    const products = window.PRODUCTS || [];
    const options = [
      `<option value="">— scegli prodotto —</option>`,
      ...products.map(p => {
        const num = String(p.art_number ?? p.numero ?? "");
        const label = getProductLabel(p);
        return `<option value="${escapeHtml(num)}">${escapeHtml(label)}</option>`;
      })
    ].join("");

    tr.innerHTML = `
      <td class="num"><span class="artNo">${escapeHtml(art_number || "")}</span></td>

      <td>
        <select class="product">
          ${options}
        </select>
        <input class="desc" placeholder="Oppure scrivi a mano" value="${escapeHtml(descrizione)}" />
      </td>

      <td class="num"><input class="qty" type="number" min="1" value="${quantita}"></td>
      <td class="num"><input class="cost" type="number" step="0.05" min="0" value="${prezzo}"></td>

      <td class="num">
        <select class="vat">
          <option value="0" ${Number(iva)===0 ? "selected":""}>0%</option>
          <option value="0.026" ${Number(iva)===0.026 ? "selected":""}>2.6%</option>
          <option value="0.081" ${Number(iva)===0.081 ? "selected":""}>8.1%</option>
        </select>
      </td>

      <td class="num"><span class="lineNet">0.00</span></td>
      <td class="num"><span class="lineGross">0.00</span></td>

      <td><button type="button" class="del">x</button></td>
    `;

    const descInput = tr.querySelector(".desc");
    if (descInput) {
      descInput.addEventListener("input", () => {
        // appena l'utente modifica, diventa manuale
        descInput.dataset.manual = "1";
      });
    };

    // se vuoi preselezionare prodotto quando art_number già presente:
    if (art_number) {
      const sel = tr.querySelector(".product");
      if (sel) sel.value = String(art_number);
    };

    // quando selezioni un prodotto: riempi numero, descrizione, prezzo, iva
    tr.querySelector(".product").addEventListener("change", () => {
      const artNo = tr.querySelector(".product").value;
      const p = (window.PRODUCTS || []).find(x => String(x.art_number) === String(artNo));

      tr.querySelector(".artNo").textContent = artNo || "";

      if (p) {
        const lang = getLang();

        const descInput = tr.querySelector(".desc");
        if (descInput) {
          delete descInput.dataset.manual;          // RESET quando cambio prodotto
          descInput.value = p.title?.[lang] || "";  // AUTO: titolo del prodotto
        };

        const costInput = tr.querySelector(".cost");
        if (costInput) {
          // quando cambio prodotto: voglio auto-compilare il prezzo del prodotto
          delete costInput.dataset.manual;

          if (!costInput.dataset.manual) {
            const raw = (p.cost ?? p.prezzo ?? 0);
            // tiene numeri, . , -
            const cleaned = String(raw)
              .trim()
              .replace(/[^\d,.-]/g, "")
              .replace(/,/g, "."); // tutte le virgole -> punti
            const prodPrice = parseFloat(cleaned);
            costInput.value = (Number.isFinite(prodPrice) ? prodPrice : 0).toFixed(2);
          }

          // forza refresh (così aggiorna i totali subito)
          costInput.dispatchEvent(new Event("input", { bubbles: true }));
        };

        // p.vat è percento (2.6) -> select usa decimale (0.026)
        const rate = Number(p.vat ?? 0) / 100;
        tr.querySelector(".vat").value = String(rate);
        
        window.UI.refresh();
      }
    });

    tr.querySelector(".del").addEventListener("click", () => tr.remove());

    // ricalcolo live
    tr.querySelector(".qty").addEventListener("input", () => window.UI.refresh());
    tr.querySelector(".cost").addEventListener("input", (e) => {
      // manuale SOLO se è input reale dell’utente
      if (e.isTrusted) e.target.dataset.manual = "1";
      window.UI.refresh();
    });
    tr.querySelector(".vat").addEventListener("change", () => window.UI.refresh());
    tr.querySelector(".desc").addEventListener("input", () => window.UI.refresh());

    tbody.appendChild(tr);
  }

  window.UI = {
    escapeHtml,
    money,
    readRows,
    calcGrandTotal,
    updateTotals,
    addRow,
    refresh: () => {} // verrà impostato in main.js
  };
})();