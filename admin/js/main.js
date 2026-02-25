document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#righe tbody");
  const totaleView = document.querySelector("#totaleView");
  const addRowBtn = document.querySelector("#addRow");
  const saveBtn = document.querySelector("#saveBtn");
  const status = document.querySelector("#status");

  // refresh globale UI
  window.UI.refresh = () => {
    window.UI.updateTotals(tbody, totaleView);
  };

  // aggiungi riga iniziale
  window.UI.addRow(tbody, { descrizione: "Dolce", quantita: 1, prezzo: 0 });
  window.UI.refresh();

  addRowBtn.addEventListener("click", () => {
    window.UI.addRow(tbody, { descrizione: "", quantita: 1, prezzo: 0 });
    window.UI.refresh();
  });

  saveBtn.addEventListener("click", async () => {
    try {
      setBusy(true, "Salvataggio in corso...");

      const payload = collectFormPayload(tbody);

      // validazioni minime
      if (!payload.cliente.nome) {
        alert("Inserisci Nome e Cognome del cliente.");
        return;
      }
      if (!payload.righe.length) {
        alert("Inserisci almeno una riga valida.");
        return;
      }

      await window.API.saveInvoice(payload);

      const invoiceData = {
        ...payload,
      };

      // genera HTML fattura e apri finestra stampa
      const invoiceHtml = window.INVOICE.renderInvoiceHTML(invoiceData);

      window.INVOICE.openPrintWindow(
        invoiceHtml,
        `Fattura_${payload.numeroFattura}`
      );

      setBusy(false, `Salvato. Numero fattura: ${payload.numeroFattura}`);
    } catch (err) {
      console.error(err);
      setBusy(false, "");
      alert("Errore: " + err.message);
    } finally {
      // ripristina pulsante anche se return prima
      setBusy(false, status.textContent);
    }
  });

  function setBusy(isBusy, msg) {
    saveBtn.disabled = isBusy;
    status.textContent = msg || "";
  }

  function yyyymmdd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function nextInvoiceNumber() {
  const day = yyyymmdd();
  const key = `SF_INVOICE_COUNTER_${day}`;

  const current = Number(localStorage.getItem(key) || "0");
  const next = current + 1;

  localStorage.setItem(key, String(next));

  // formato: YYYYMMDD-###
  return `${day}-${String(next).padStart(3, "0")}`;
}


  function collectFormPayload(tbodyEl) {
    const { token } = window.APP_CONFIG;

    const rows = window.UI.readRows(tbodyEl);
    const total = window.UI.calcGrandTotal(rows);
    const numeroFattura = nextInvoiceNumber();
    
    return {
      token,
      numeroFattura,
      dataISO: new Date().toISOString(),
      cliente: {
        nome: document.querySelector("#clienteNome").value.trim(),
        email: document.querySelector("#clienteEmail").value.trim(),
        indirizzo: document.querySelector("#clienteIndirizzo").value.trim()
      },
      note: document.querySelector("#note").value.trim(),
      righe: rows,
      totale: total
    };
  }
});