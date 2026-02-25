(function(){

  function renderInvoiceHTML(data) {
  const tpl = document.querySelector("#invoiceTemplate");
  const htmlText = tpl.innerHTML;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  // ✅ helper PRIMA di usarli
  const setText = (bind, value) => {
    const el = doc.querySelector(`[data-bind="${bind}"]`);
    if (el) el.textContent = value ?? "";
  };

  const setHTML = (bind, value) => {
    const el = doc.querySelector(`[data-bind="${bind}"]`);
    if (el) el.innerHTML = value ?? "";
  };

  const setAttr = (bind, attr, value) => {
    const el = doc.querySelector(`[data-bind="${bind}"]`);
    if (el && value) el.setAttribute(attr, value);
    };

  // ✅ AZIENDA (da config.js)
  const company = window.APP_CONFIG.company || {};

    setText("companyName", company.name || "");
    setText("companyLine1", company.line1 || "");
    setText("companyLine2", company.line2 || "");

    // ✅ LOGO
    setAttr("companyLogo", "src", company.logo || "");

    if (!company.logo) {
        const img = doc.querySelector('[data-bind="companyLogo"]');
        if (img) img.style.display = "none";
    }

  // ✅ DATI BASE
  setText("invoiceNumber", data.numeroFattura || "");
  setText("invoiceDate", new Date(data.dataISO).toLocaleDateString("it-CH"));

  // ✅ CLIENTE
  setText("customerName", data.cliente?.nome || "");
  setText("customerAddress", data.cliente?.indirizzo || "");
  setText("customerEmail", data.cliente?.email || "");

  // ✅ RIGHE (IVA per riga)
    const rows = Array.isArray(data.righe) ? data.righe : [];

    let totalNet = 0;
    let totalVat = 0;

    const vatByRate = new Map(); // rate -> amount

    const rowsHtml = rows.map(r => {
        const artNo = (r.art_number || "").toString().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const qty = Number(r.quantita || 0);
        const cost = Number(r.prezzo || 0);
        const net = qty * cost;

        const rate = Number(r.iva || 0);         // <-- QUI: IVA scelta nel form
        const vat = net * rate;
        const gross = net + vat;

        totalNet += net;
        totalVat += vat;

        if(rate > 0 && vat > 0) {
            vatByRate.set(rate, (vatByRate.get(rate) || 0) + vat);
        }

        const desc = (r.descrizione || "")
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

        const rateLabel = `${(rate * 100).toFixed(1).replace(".0","")}%`;

        return `
            <tr>
                <td class="num">${artNo}</td>
                <td>${desc}</td>
                <td class="num">${qty}</td>
                <td class="num">${cost.toFixed(2)} CHF</td>
                <td class="num">${net.toFixed(2)} CHF</td>
                <td class="num">${rateLabel}</td>
                <td class="num">${vat.toFixed(2)} CHF</td>
                <td class="num">${gross.toFixed(2)} CHF</td>
            </tr>
        `;
    }).join("");

    setHTML("rows", rowsHtml);

// ✅ RIEPILOGO IVA PER ALIQUOTA (righe separate)
const vatSummaryHtml = [...vatByRate.entries()]
    .filter(([rate, amount]) => rate > 0 && amount > 0)
    .map(([rate, amount]) => {
    const label = `${(rate * 100).toFixed(1).replace(".0","")}%`;
    return `<div class="tot"><b>MwST ${label}:</b> CHF ${amount.toFixed(2)}</div>`;
  })
  .join("");

setHTML("vatSummary", vatSummaryHtml);

// ✅ TOTALI
const totalGross = totalNet + totalVat;

setText("totalNet", totalNet.toFixed(2));
setText("totalVat", totalVat.toFixed(2));
setText("totalGross", totalGross.toFixed(2));

  // ✅ NOTE
  const note = (data.note || "").trim();
  setHTML("noteBlock", note ? `<p><b>Bemerkungen:</b> ${note}</p>` : "");

  doc.title = data.numeroFattura ? `Rechnung_${data.numeroFattura}` : "Rechnung";

  return "<!doctype html>\n" + doc.documentElement.outerHTML;
}

function openPrintWindow(htmlString, title = "Rechnung") {

  const w = window.open("about:blank", "_blank");

  if (!w) {
    alert("Popup bloccato dal browser. Permetti i Popup per stampare il PDF.")
    return;
  }

  w.document.open();

  // ✅ documento HTML COMPLETO
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, Helvetica, sans-serif; padding:40px; }
          table { width:100%; border-collapse: collapse; }
          td, th { padding:8px; border-bottom:1px solid #ddd; }
          .num { text-align:right; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>
      <body>
        ${htmlString}
      </body>
    </html>
  `);

  w.document.close();

  // ⭐ IMPORTANTE: aspetta davvero che carichi
  setTimeout(() => {
    w.focus();
    w.print();
  }, 500);
}

  // ⭐ QUESTA RIGA È FONDAMENTALE
  window.INVOICE = {
    renderInvoiceHTML,
    openPrintWindow
  };

})();