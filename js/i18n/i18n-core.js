const defaultLang = "it";
let lang = localStorage.getItem("lang") || defaultLang;

function getLanguage() {
  return lang;
}

function setLanguage(newLang) {
  lang = newLang;
  localStorage.setItem("lang", lang);
}

function translateStatic(translations) {
  if (!translations || !translations[lang]) return;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}