import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { localizeName } from '../../../utils/localizeName';
import { Icon } from '../../ui/Icon';
import styles from './Navbar.module.css';

function Navbar({ onToggleSidebar, onOpenMobileMenu, sidebarCollapsed }) {
  const { profile, role, logout } = useAuth();
  const { t, dir, toggleLang, lang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // عنوان الصفحة الحالي — مع fallback لو المسار غير معروف
  const pageKey = `navbar.pages.${location.pathname}`;
  const pageTitle = t(`${pageKey}.title`);
  const pageSub = t(`${pageKey}.subtitle`);
  const page = pageTitle !== `${pageKey}.title` ? pageTitle : 'EcoCycle';
  const subtitle = pageSub !== `${pageKey}.subtitle` ? pageSub : '';

  const roleLabel =
    role === 'superAdmin' ? t('navbar.roleSuperAdmin') :
    role === 'operationsManager' ? t('navbar.roleOperations') :
    role === 'partner' ? t('navbar.rolePartner') :
    role === 'user' ? t('navbar.roleCitizen') :
    t('navbar.roleSupervisor');

  // اسم متناسق مع لغة الواجهة — نفس منطق تحية الهيرو:
  // اسم عربي في واجهة إنجليزية → لقب الدور المترجم، والعكس صحيح
  const displayName = localizeName(profile?.username || profile?.name, profile?.role, lang, t)
    || roleLabel;

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
    <header className={styles.navbar} dir={dir}>
      {/* watermark ورقي — زي الديزاين */}
      <svg className={styles.watermark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 21c3 0 7-1.5 9-5.5C17.5 11 17 6.5 14.5 4c.5 4-1 7-3.5 8.5C8.5 14 6.5 16 6 19z" fill="#eaf4ec" />
        <path d="M4 21c1.5-4 4-7 8-9-2 4-4.5 7-8 9z" fill="#dceee1" />
      </svg>

      {/* يمين: البحث + القائمة */}
      <div className={styles.rightSection}>
        {/* زر فتح درج الموبايل — يظهر فقط ≤1024px (فوق كده السايدبار ثابت والزر ميت) */}
        <button
          className={`${styles.iconBtn} ${styles.mobileOnly}`}
          onClick={onOpenMobileMenu}
          aria-label={t('navbar.openMenu')}
          title={t('navbar.menu')}
        >
          <Icon name="menu" size={20} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.desktopOnly}`}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          title={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          <Icon name={sidebarCollapsed ? 'chevronsRight' : 'chevronsLeft'} size={18} />
        </button>

        {/* حبة البحث — رمادي #F0F4F3 بدون إطار (زي الديزاين) */}
        <button
          className={styles.searchPill}
          onClick={() => window.dispatchEvent(new CustomEvent('ecocycle:open-command-palette'))}
          title={t('navbar.quickSearch')}
          aria-label={t('palette.ariaLabel')}
        >
          <Icon name="search" size={17} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>{t('navbar.searchPlaceholder')}</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
      </div>

      {/* يسار: عنوان الصفحة + منطقة المستخدم */}
      <div className={styles.leftSection}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>{page}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.userZone} ref={menuRef}>
          {/* الوضع الليلي — تبديل فوري للثيم كامل */}
          <button
            className={styles.langBtn}
            onClick={toggleTheme}
            aria-label={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}
            title={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={15} className={styles.langIcon} />
          </button>

          {/* تبديل اللغة — عربي/إنجليزي */}
          <button
            className={styles.langBtn}
            onClick={toggleLang}
            aria-label={t('auth.changeLang')}
            title={t('auth.changeLang')}
          >
            <Icon name="globe" size={15} className={styles.langIcon} />
            <span className={styles.langLabel}>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          <button
            className={styles.avatarBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t('navbar.accountMenu')}
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
                {displayName !== roleLabel && (
                  <span className={styles.userMenuRole}>{roleLabel}</span>
                )}
              </div>
              {role === 'user' ? (
                <>
                  <button
                    className={styles.userMenuItem}
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate('/my-coupons'); }}
                  >
                    <Icon name="ticket" size={17} />
                    <span>{t('navbar.myCoupons')}</span>
                  </button>
                  <button
                    className={styles.userMenuItem}
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate('/my-profile'); }}
                  >
                    <Icon name="userCircle" size={17} />
                    <span>{t('navbar.myProfile')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.userMenuItem}
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate(role === 'partner' ? '/partner-portal' : '/coupons'); }}
                  >
                    <Icon name="ticket" size={17} />
                    <span>{role === 'partner' ? t('navbar.portalHome') : t('navbar.coupons')}</span>
                  </button>
                  {role !== 'partner' && (
                    <button
                      className={styles.userMenuItem}
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); navigate('/audit-logs'); }}
                    >
                      <Icon name="history" size={17} />
                      <span>{t('navbar.auditLogs')}</span>
                    </button>
                  )}
                </>
              )}
              <div className={styles.userMenuDivider} />
              <button
                className={`${styles.userMenuItem} ${styles.logoutItem}`}
                role="menuitem"
                onClick={handleLogout}
              >
                <Icon name="logout" size={17} />
                <span>{t('navbar.logout')}</span>
              </button>
            </div>
          )}

          <span className={styles.divider} />

          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            {displayName !== roleLabel && (
              <span className={styles.userRole}>{roleLabel}</span>
            )}
          </div>

          <span className={styles.divider} />

          <button
            className={styles.iconBtn}
            aria-label={t('navbar.notifications')}
            title={t('navbar.notifications')}
            onClick={() => navigate('/notifications')}
          >
            <Icon name="bellRing" size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
