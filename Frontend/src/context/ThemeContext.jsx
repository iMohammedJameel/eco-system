import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

/**
 * ThemeContext — الوضع الليلي / النهاري
 * - يثبّت الاختيار في localStorage
 * - يبدأ من تفضيل النظام (prefers-color-scheme) في أول زيارة
 * - يضبط data-theme على <html> — كل تصميم الواجهة مبني على CSS variables
 *   فتبديل التوكنات في [data-theme='dark'] يقلب التيمة كاملة
 */
const THEME_KEY = 'ecocycle_theme';

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* private mode */ }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // ميتا ثيم الموبايل يتزامن مع لون الشريط
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b1a12' : '#f4f9f5');
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* noop */ }
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next === 'dark' || next === 'light') setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
