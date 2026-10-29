import { useState, useEffect } from 'react';

const COLLAPSE_KEY = 'ecocycle_sidebar_collapsed';

/**
 * useSidebarState — إدارة حالة الشريط الجانبي (طي/توسيع + فتح الموبايل)
 * مع التخزين في localStorage.
 *
 * مفصولة في ملف مستقل حتى لا تمنع react-refresh لمكوّن Sidebar
 * (الملف الواحد لازم يصدّر مكوّنات فقط ليعمل التحديث السريع).
 */
export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((c) => !c);
  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return { collapsed, toggleCollapse, mobileOpen, openMobile, closeMobile };
}
