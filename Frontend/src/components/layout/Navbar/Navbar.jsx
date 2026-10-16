import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icon } from '../../ui/Icon';
import styles from './Navbar.module.css';

const pageTitles = {
  '/dashboard':      { title: 'الرئيسية',            subtitle: 'نظرة شاملة على أداء النظام' },
  '/ops-dashboard':  { title: 'لوحة العمليات',        subtitle: 'المهام ومؤشرات الأداء ومراقبة الأعطال' },
  '/partner-portal': { title: 'بوابة الشركاء',        subtitle: 'إدارة العروض واستبدال الكوبونات' },
  '/machines':       { title: 'الماكينات',            subtitle: 'مراقبة وإدارة ماكينات إعادة التدوير' },
  '/users':          { title: 'المستخدمين',           subtitle: 'عرض وإدارة حسابات المستخدمين' },
  '/transactions':   { title: 'المعاملات',            subtitle: 'كل عمليات الإيداع والسحب' },
  '/pricing':        { title: 'الأسعار',              subtitle: 'ضبط أسعار الخامات والمكافآت' },
  '/partners':       { title: 'الشركاء',              subtitle: 'المتاجر الشريكة وعروض الخصم' },
  '/coupons':        { title: 'الكوبونات',            subtitle: 'استبدال نقاط المستخدمين بكوبونات الشركاء' },
  '/audit-logs':     { title: 'سجل النظام',           subtitle: 'سجل تدقيق كل عمليات الإدارة' },
  '/leaderboard':    { title: 'المتصدرون',            subtitle: 'أفضل المستخدمين في إعادة التدوير' },
  '/achievements':   { title: 'الإنجازات',            subtitle: 'الشارات ونظام التحفيز' },
  '/notifications':  { title: 'الإشعارات',            subtitle: 'بث الإشعارات وسجلها' },
  '/issues':         { title: 'بلاغات الأعطال',        subtitle: 'بلاغات الماكينات وسير الصيانة' },
  '/reports':        { title: 'التقارير المالية',      subtitle: 'تحليلات الإيرادات والتدوير' },
};

function Navbar({ onToggleSidebar, onOpenMobileMenu, sidebarCollapsed }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const meta = pageTitles[location.pathname] || { title: 'EcoCycle', subtitle: '' };

  const roleLabel =
    profile?.role === 'superAdmin' ? 'مدير عام' :
    profile?.role === 'operationsManager' ? 'مشرف عمليات' :
    'مشرف';

  const displayName = profile?.username || profile?.name || roleLabel;

  // ===== قائمة الأفاتار =====
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ecocycle:open-command-palette'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.navbar} dir="rtl">
      {/* watermark ورقي — زي الديزاين */}
      <svg className={styles.watermark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 21c3 0 7-1.5 9-5.5C17.5 11 17 6.5 14.5 4c.5 4-1 7-3.5 8.5C8.5 14 6.5 16 6 19z" fill="#eaf4ec" />
        <path d="M4 21c1.5-4 4-7 8-9-2 4-4.5 7-8 9z" fill="#dceee1" />
      </svg>

      {/* يمين: البحث + القائمة */}
      <div className={styles.rightSection}>
        <button
          className={styles.iconBtn}
          onClick={onOpenMobileMenu}
          aria-label="فتح القائمة"
          title="القائمة"
        >
          <Icon name="menu" size={20} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.desktopOnly}`}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          title={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          <Icon name={sidebarCollapsed ? 'chevronsRight' : 'chevronsLeft'} size={18} />
        </button>

        {/* حبة البحث — رمادي #F0F4F3 بدون إطار (زي الديزاين) */}
        <button
          className={styles.searchPill}
          onClick={() => window.dispatchEvent(new CustomEvent('ecocycle:open-command-palette'))}
          title="بحث سريع (Ctrl+K)"
          aria-label="بحث سريع"
        >
          <Icon name="search" size={17} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>بحث عن مستخدم، مكان، أو معلومات...</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
      </div>

      {/* يسار: عنوان الصفحة + منطقة المستخدم */}
      <div className={styles.leftSection}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>{meta.title}</h2>
          {meta.subtitle && <p className={styles.subtitle}>{meta.subtitle}</p>}
        </div>

        <div className={styles.userZone} ref={menuRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="قائمة الحساب"
          >
            <Icon name="chevronDown" size={16} className={styles.chevron} />
            <span className={styles.avatar}>
              <Icon name="user" size={17} />
            </span>
          </button>

          {menuOpen && (
            <div className={styles.userMenu} role="menu">
              <div className={styles.userMenuHeader}>
                <span className={styles.userMenuName}>{displayName}</span>
                <span className={styles.userMenuRole}>{roleLabel}</span>
              </div>
              <button
                className={styles.userMenuItem}
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/coupons'); }}
              >
                <Icon name="ticket" size={17} />
                <span>الكوبونات</span>
              </button>
              <button
                className={styles.userMenuItem}
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/audit-logs'); }}
              >
                <Icon name="history" size={17} />
                <span>سجل النظام</span>
              </button>
              <div className={styles.userMenuDivider} />
              <button
                className={`${styles.userMenuItem} ${styles.logoutItem}`}
                role="menuitem"
                onClick={handleLogout}
              >
                <Icon name="logout" size={17} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}

          <span className={styles.divider} />

          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>

          <span className={styles.divider} />

          <button
            className={styles.iconBtn}
            aria-label="الإشعارات"
            title="الإشعارات"
            onClick={() => navigate('/notifications')}
          >
            <Icon name="bellRing" size={19} />
            <span className={styles.redBadge} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
