document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.getElementById("language-switcher");
  if (!switcher) return;

  // 🔥 SINCRONIZZA LINGUA SALVATA
  const savedLang = localStorage.getItem("lang") || "it";
  setLanguage(savedLang);
  switcher.value = savedLang;

  // 🔥 applica subito le traduzioni della pagina
  if (window.pageTranslations) {
    translateStatic(window.pageTranslations);
  }

  switcher.addEventListener("change", e => {
    setLanguage(e.target.value);

    if (window.pageTranslations) {
      translateStatic(window.pageTranslations);
    }

    if (window.onLanguageChange) {
      window.onLanguageChange();
    }
  });
});