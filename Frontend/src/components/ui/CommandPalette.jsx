import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useLanguage } from '../../context/LanguageContext';
import styles from './CommandPalette.module.css';

/* الأوامر — التسميات تُحل عبر i18n وقت العرض (عربي/إنجليزي) */
const COMMANDS = [
  { id: 'dashboard',      icon: 'home',          path: '/dashboard',      labelKey: 'palette.dashboard',      subKey: 'palette.dashboardSub' },
  { id: 'ops-dashboard',  icon: 'gauge',         path: '/ops-dashboard',  labelKey: 'palette.opsDashboard',  subKey: 'palette.opsDashboardSub' },
  { id: 'partner-portal', icon: 'partners',      path: '/partner-portal', labelKey: 'palette.partnerPortal', subKey: 'palette.partnerPortalSub' },
  { id: 'machines',       icon: 'building',      path: '/machines',       labelKey: 'palette.machines',      subKey: 'palette.machinesSub' },
  { id: 'users',          icon: 'users',         path: '/users',          labelKey: 'palette.users',         subKey: 'palette.usersSub' },
  { id: 'transactions',   icon: 'transactions',  path: '/transactions',   labelKey: 'palette.transactions',  subKey: 'palette.transactionsSub' },
  { id: 'pricing',        icon: 'pricing',       path: '/pricing',        labelKey: 'palette.pricing',       subKey: 'palette.pricingSub' },
  { id: 'partners',       icon: 'partners',      path: '/partners',       labelKey: 'palette.partners',      subKey: 'palette.partnersSub' },
  { id: 'coupons',        icon: 'ticket',        path: '/coupons',        labelKey: 'palette.coupons',       subKey: 'palette.couponsSub' },
  { id: 'audit-logs',     icon: 'history',       path: '/audit-logs',     labelKey: 'palette.auditLogs',     subKey: 'palette.auditLogsSub' },
  { id: 'leaderboard',    icon: 'leaderboard',   path: '/leaderboard',    labelKey: 'palette.leaderboard',   subKey: 'palette.leaderboardSub' },
  { id: 'achievements',   icon: 'achievements',  path: '/achievements',   labelKey: 'palette.achievements',  subKey: 'palette.achievementsSub' },
  { id: 'notifications',  icon: 'notifications', path: '/notifications',  labelKey: 'palette.notifications', subKey: 'palette.notificationsSub' },
  { id: 'issues',         icon: 'issues',        path: '/issues',         labelKey: 'palette.issues',        subKey: 'palette.issuesSub' },
  { id: 'reports',        icon: 'reports',       path: '/reports',        labelKey: 'palette.reports',       subKey: 'palette.reportsSub' },
  { id: 'deposit',        icon: 'qrCode',        path: '/deposit',        labelKey: 'palette.deposit',       subKey: 'palette.depositSub' },
];

const ACTIONS = [
  { id: 'action:add-machine',    icon: 'add',      path: '/machines',       labelKey: 'palette.actAddMachine',    subKey: 'palette.actAddMachineSub' },
  { id: 'action:add-user',       icon: 'add',      path: '/users',          labelKey: 'palette.actAddUser',       subKey: 'palette.actAddUserSub' },
  { id: 'action:add-partner',    icon: 'add',      path: '/partners',       labelKey: 'palette.actAddPartner',    subKey: 'palette.actAddPartnerSub' },
  { id: 'action:issue-coupon',   icon: 'ticket',   path: '/coupons',        labelKey: 'palette.actIssueCoupon',   subKey: 'palette.actIssueCouponSub' },
  { id: 'action:send-notif',     icon: 'bellRing', path: '/notifications',  labelKey: 'palette.actSendNotif',     subKey: 'palette.actSendNotifSub' },
  { id: 'action:add-achievement',icon: 'add',      path: '/achievements',   labelKey: 'palette.actAddAchievement',subKey: 'palette.actAddAchievementSub' },
];

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  // العناصر مترجمة باللغة الحالية — تتغير مع تبديل اللغة
  const allItems = useMemo(
    () => [...COMMANDS, ...ACTIONS].map((item) => ({
      ...item,
      label: t(item.labelKey),
      subtitle: t(item.subKey),
    })),
    [t],
  );

  // Listen for open event from anywhere
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setQuery('');
      setActiveIdx(0);
    };
    window.addEventListener('ecocycle:open-command-palette', handler);
    return () => window.removeEventListener('ecocycle:open-command-palette', handler);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  // ESC to close + lock scroll when open + arrow keys to navigate
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIdx];
        if (item) {
          navigate(item.path);
          setOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, activeIdx, filtered, navigate]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.children[activeIdx];
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  const handleSelect = (item) => {
    navigate(item.path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.ariaLabel')}
    >
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.inputRow}>
          <Icon name="search" size={18} className={styles.inputIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={t('palette.placeholder')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            dir={dir}
            aria-label={t('palette.search')}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.list} ref={listRef}>
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <Icon name="search" size={24} />
              <p>{t('palette.noResults', { query })}</p>
            </div>
          )}
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              className={`${styles.item} ${idx === activeIdx ? styles.active : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIdx(idx)}
              type="button"
            >
              <span className={styles.itemIcon}>
                <Icon name={item.icon} size={18} />
              </span>
              <div className={styles.itemText}>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemSubtitle}>{item.subtitle}</span>
              </div>
              <span className={styles.itemArrow}>
                <Icon name={dir === 'rtl' ? 'arrowLeft' : 'arrowRight'} size={14} />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↑</kbd>
            <kbd className={styles.footerKbd}>↓</kbd>
            {t('palette.navigate')}
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↵</kbd>
            {t('palette.select')}
          </span>
          <span className={styles.footerBrand}>EcoCycle Admin</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
