import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import styles from './CommandPalette.module.css';

const COMMANDS = [
  { id: 'dashboard',     label: 'الرئيسية',                subtitle: 'نظرة شاملة على أداء النظام',               icon: 'home',          path: '/dashboard' },
  { id: 'ops-dashboard', label: 'لوحة العمليات',            subtitle: 'المهام والمؤشرات ومراقبة الأعطال',          icon: 'gauge',         path: '/ops-dashboard' },
  { id: 'partner-portal',label: 'بوابة الشركاء',            subtitle: 'إدارة العروض واستبدال الكوبونات',           icon: 'partners',      path: '/partner-portal' },
  { id: 'machines',      label: 'الماكينات',                subtitle: 'مراقبة وإدارة ماكينات التدوير',             icon: 'building',      path: '/machines' },
  { id: 'users',         label: 'المستخدمين',               subtitle: 'عرض وإدارة حسابات المستخدمين',              icon: 'users',         path: '/users' },
  { id: 'transactions',  label: 'المعاملات',                subtitle: 'كل عمليات الإيداع والسحب',                  icon: 'transactions',  path: '/transactions' },
  { id: 'pricing',       label: 'الأسعار',                  subtitle: 'أسعار الخامات والمكافآت',                   icon: 'pricing',       path: '/pricing' },
  { id: 'partners',      label: 'الشركاء',                  subtitle: 'المتاجر الشريكة وعروض الخصم',               icon: 'partners',      path: '/partners' },
  { id: 'coupons',       label: 'الكوبونات',                subtitle: 'استبدال نقاط المستخدمين بكوبونات',           icon: 'ticket',        path: '/coupons' },
  { id: 'audit-logs',    label: 'سجل النظام',               subtitle: 'سجل تدقيق عمليات الإدارة',                  icon: 'history',       path: '/audit-logs' },
  { id: 'leaderboard',   label: 'المتصدرون',                subtitle: 'أفضل المستخدمين في إعادة التدوير',          icon: 'leaderboard',   path: '/leaderboard' },
  { id: 'achievements',  label: 'الإنجازات',                subtitle: 'الشارات ونظام التحفيز',                     icon: 'achievements',  path: '/achievements' },
  { id: 'notifications', label: 'الإشعارات',                subtitle: 'بث الإشعارات وسجلها',                       icon: 'notifications', path: '/notifications' },
  { id: 'issues',        label: 'بلاغات الأعطال',            subtitle: 'بلاغات الماكينات وسير الصيانة',             icon: 'issues',        path: '/issues' },
  { id: 'reports',       label: 'التقارير المالية',          subtitle: 'تحليلات الإيرادات والتدوير',                icon: 'reports',       path: '/reports' },
  { id: 'deposit',       label: 'صفحة الإيداع (PWA)',       subtitle: 'رابط مسح QR للموبايل — بدون تسجيل دخول',    icon: 'qrCode',        path: '/deposit' },
];

const ACTIONS = [
  { id: 'action:add-machine',  label: 'إضافة ماكينة جديدة',     subtitle: 'انتقل لصفحة الماكينات وأضف واحدة',     icon: 'add',      path: '/machines' },
  { id: 'action:add-user',     label: 'إضافة مستخدم جديد',       subtitle: 'انتقل لصفحة المستخدمين وأضف واحداً',    icon: 'add',      path: '/users' },
  { id: 'action:add-partner',  label: 'إضافة شريك جديد',         subtitle: 'انتقل لصفحة الشركاء وأضف شريكاً',       icon: 'add',      path: '/partners' },
  { id: 'action:issue-coupon', label: 'إصدار كوبون لمستخدم',     subtitle: 'انتقل لصفحة الكوبونات',                icon: 'ticket',   path: '/coupons' },
  { id: 'action:send-notif',   label: 'إرسال إشعار',             subtitle: 'انتقل لصفحة الإشعارات وأرسل إشعاراً',   icon: 'bellRing', path: '/notifications' },
  { id: 'action:add-achievement', label: 'إضافة إنجاز جديد',     subtitle: 'انتقل لصفحة الإنجازات وأضف واحداً',     icon: 'add',      path: '/achievements' },
];

const ALL_ITEMS = [...COMMANDS, ...ACTIONS];

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

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
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

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
      aria-label="البحث السريع"
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
            placeholder="ابحث عن صفحة أو إجراء..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir="rtl"
            aria-label="بحث"
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.list} ref={listRef}>
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <Icon name="search" size={24} />
              <p>لا توجد نتائج لـ "{query}"</p>
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
                <Icon name="arrowLeft" size={14} />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↑</kbd>
            <kbd className={styles.footerKbd}>↓</kbd>
            للتنقل
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↵</kbd>
            للاختيار
          </span>
          <span className={styles.footerBrand}>EcoCycle Admin</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
