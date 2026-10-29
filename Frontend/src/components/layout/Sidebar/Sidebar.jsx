import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import cityArt from '../../../assets/sidebar-city.png';
import styles from './Sidebar.module.css';

/* عناصر التنقل — التسميات عبر i18n (عربي/إنجليزي) */
const adminNavItems = [
  { icon: 'home',          labelKey: 'sidebar.home',          path: '/dashboard' },
  { icon: 'users',         labelKey: 'sidebar.users',         path: '/users' },
  { icon: 'building',      labelKey: 'sidebar.machines',      path: '/machines' },
  { icon: 'transactions',  labelKey: 'sidebar.transactions',  path: '/transactions' },
  { icon: 'pricing',       labelKey: 'sidebar.pricing',       path: '/pricing' },
  { icon: 'partners',      labelKey: 'sidebar.partners',      path: '/partners' },
  { icon: 'achievements',  labelKey: 'sidebar.achievements',  path: '/achievements' },
  { icon: 'notifications', labelKey: 'sidebar.notifications', path: '/notifications' },
  { icon: 'issues',        labelKey: 'sidebar.issues',        path: '/issues' },
  { icon: 'reports',       labelKey: 'sidebar.reports',       path: '/reports' },
];

/* قائمة المواطن — بوابة المواطن (محفظة/سجل/كوبونات/بروفايل) */
const citizenNavItems = [
  { icon: 'wallet',    labelKey: 'sidebar.myWallet',    path: '/my-wallet' },
  { icon: 'history',   labelKey: 'sidebar.myHistory',   path: '/my-history' },
  { icon: 'ticket',    labelKey: 'sidebar.myCoupons',   path: '/my-coupons' },
  { icon: 'user',      labelKey: 'sidebar.myProfile',   path: '/my-profile' },
];

/* قائمة الشريك — بوابة الشركاء */
const partnerNavItems = [
  { icon: 'store',     labelKey: 'sidebar.partnerPortal', path: '/partner-portal' },
];

function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { t } = useLanguage();
  const { role } = useAuth();

  // القائمة تتغير حسب الدور — المواطن والشريك يشوفوا ما يخصهم فقط
  const navItems = role === 'user' ? citizenNavItems
    : role === 'partner' ? partnerNavItems
    : adminNavItems;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onCloseMobile) onCloseMobile(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCloseMobile]);

  return (
    <>
      {mobileOpen && (
        <div className={styles.overlay} onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        aria-label={t('sidebar.ariaLabel')}
      >
        {/* ═══ الشعار ═══ */}
        <div className={styles.brand}>
          <button
            className={styles.collapseBtn}
            onClick={onToggleCollapse}
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {/* نفس اتجاه زر الطي في النافبار: موسّع ← « (اطوِ ناحية الحافة)، مطوي ← » (وسّع ناحية المحتوى) */}
            <Icon name={collapsed ? 'chevronsRight' : 'chevronsLeft'} size={16} />
          </button>

          <div className={styles.logoRow}>
            {/* حلقة أسهم إعادة التدوير + ورقة نعناع — زي الديزاين */}
            <svg className={styles.logoMark} viewBox="0 0 60 60" fill="none" aria-hidden="true">
              <path
                d="M30 8a22 22 0 0 1 19.05 11.02l-4.3 2.48A17 17 0 0 0 30 13"
                stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round"
              />
              <path d="M50.2 20.4l1.3 6.9-6.6-2.5 5.3-4.4z" fill="#79c032" />
              <path
                d="M51.5 30a21.5 21.5 0 0 1-10.6 18.6l-2.4-4.4A17 17 0 0 0 46.6 30"
                stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round"
              />
              <path d="M40.6 50.1l-6.4 2.9.9-7 5.5 4.1z" fill="#79c032" />
              <path
                d="M30 51.5a21.6 21.6 0 0 1-17.6-9.1l4.1-2.9A17 17 0 0 0 30 46.5"
                stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round"
              />
              <path d="M11.6 43.4l-1.9-6.8 6.7 2.1-4.8 4.7z" fill="#79c032" />
              {/* ورقة نعناع في المنتصف */}
              <path
                d="M30 25.5c5.5-4.2 11.5-3.6 14.5-3.1.6 3.3.3 9.6-5 13.7-4.2 3.2-8.3 2.3-10.5 1.5-1.9-3-2.3-8.7 1-12.1z"
                fill="#79c032"
              />
              <path d="M31.8 27.4c2.7 1.7 5 4.4 6.2 7.6" stroke="#043722" strokeWidth="1.4" strokeLinecap="round" />
            </svg>

            {!collapsed && (
              <span className={styles.logoText}>
                <span className={styles.logoEco}>Eco</span><span className={styles.logoCycle}>Cycle</span>
              </span>
            )}
          </div>
          {!collapsed && (
            <p className={styles.logoSubtitle}>
              {role === 'user' ? t('sidebar.citizenSubtitle')
                : role === 'partner' ? t('sidebar.portalSubtitle')
                : t('sidebar.brandSubtitle')}
            </p>
          )}
        </div>

        {/* ═══ التنقل ═══ */}
        <nav className={styles.nav} aria-label={t('sidebar.navLabel')}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (mobileOpen && onCloseMobile) onCloseMobile(); }}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size={19} />
              </span>
              {!collapsed && <span className={styles.navLabel}>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ═══ رسمة المدينة + الشعار ═══ */}
        <div className={styles.bottomArt}>
          <img src={cityArt} alt="" className={styles.cityImg} aria-hidden="true" />
          {!collapsed && <p className={styles.slogan}>{t('sidebar.slogan')}</p>}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
