import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ar, en } from '../i18n/translations';

/**
 * LanguageContext — نظام ثنائي اللغة (عربي RTL / إنجليزي LTR)
 * - يثبّت الاختيار في localStorage
 * - يحدّث <html lang dir> تلقائيًا مع كل تبديل
 * - t(key, vars) بترجّم أي مفتاح نقاطي مع دعم {placeholders}
 */
const LANG_KEY = 'ecocycle_lang';
const DICTS = { ar, en };

const LanguageContext = createContext(null);

function getInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch { /* private mode */ }
  return 'ar';
}

const lookup = (dict, key) => {
  let node = dict;
  for (const part of String(key).split('.')) {
    node = node?.[part];
    if (node === undefined) return undefined;
  }
  return node; // نص أو مصفوفة (مثل أسماء الشهور)
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* noop */ }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === 'ar' || next === 'en') setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((l) => (l === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback((key, vars) => {
    let str = lookup(DICTS[lang], key) ?? lookup(DICTS.ar, key) ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.split(`{${k}}`).join(String(v));
      }
    }
    return str;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      isRTL: lang === 'ar',
    }),
    [lang, setLang, toggleLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
