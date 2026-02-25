(function(){
  async function saveInvoice(payload) {
    const { appsScriptUrl } = window.APP_CONFIG;

    const body = new URLSearchParams();
    body.set("payload", JSON.stringify(payload));

    // no-cors => zero problemi browser
    await fetch(appsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      body
    });

    // Non possiamo leggere la risposta, ma non serve più.
    return { ok: true };
  }

  window.API = { saveInvoice };
})();
