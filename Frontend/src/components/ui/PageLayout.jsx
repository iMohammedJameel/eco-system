import { useEffect } from 'react';
import Sidebar, { useSidebarState } from '../layout/Sidebar/Sidebar';
import Navbar from '../layout/Navbar/Navbar';
import styles from './PageLayout.module.css';

/**
 * PageLayout — wraps every authenticated page.
 * Manages sidebar collapse state, mobile drawer, and skip-to-content link.
 */
export default function PageLayout({ children }) {
  const { collapsed, toggleCollapse, mobileOpen, openMobile, closeMobile } = useSidebarState();

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMobile(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <div className={`${styles.layout} ${collapsed ? styles.collapsed : ''}`}>
      <a href="#main-content" className="ec-skip-link">تخطّي إلى المحتوى الرئيسي</a>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className={styles.rightSide}>
        <Navbar
          onToggleSidebar={toggleCollapse}
          onOpenMobileMenu={openMobile}
          sidebarCollapsed={collapsed}
        />

        <main id="main-content" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
