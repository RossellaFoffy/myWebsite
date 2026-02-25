document.addEventListener("DOMContentLoaded", () => {
  // 🔥 traduzioni statiche della pagina
  translateStatic(window.pageTranslations);

  // 🔥 hook per cambio lingua
  window.onLanguageChange = () => {
    translateStatic(window.pageTranslations);
  };
});