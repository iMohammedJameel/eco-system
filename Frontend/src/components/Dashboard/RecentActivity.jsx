import { Icon } from '../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
import styles from './RecentActivity.module.css';

const MATERIAL_KEYS = {
  plastic:   'dashboard.matPlastic',
  glass:     'dashboard.matGlass',
  cardboard: 'dashboard.matCardboard',
  paper:     'dashboard.matPaper',
};

function useRelativeTime() {
  const { t } = useLanguage();
  return (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t('dashboard.justNow');
    if (min < 60) return t('dashboard.minutesAgo', { n: min });
    const hr = Math.floor(min / 60);
    if (hr < 24) return t('dashboard.hoursAgo', { n: hr });
    const day = Math.floor(hr / 24);
    return t('dashboard.daysAgo', { n: day });
  };
}

function useActivityFromTx() {
  const { t } = useLanguage();
  const relTime = useRelativeTime();

  return (tx) => {
    const userName = typeof tx.user === 'object' ? tx.user?.username : tx.user;
    const machineName = typeof tx.machine === 'object' ? tx.machine?.name : tx.machine;
    const time = relTime(tx.createdAt);

    if (tx.type === 'deposit') {
      const matKey = MATERIAL_KEYS[tx.materialType];
      const material = matKey ? t(matKey) : (tx.materialType || '');
      return {
        icon: 'recycle',
        title: t('dashboard.actDeposit', { material }),
        desc: t('dashboard.actDepositDesc', {
          user: userName || '—',
          machine: machineName || '—',
          weight: tx.weightKg ?? 0,
          time,
        }),
      };
    }
    if (tx.withdrawalMethod === 'coupon') {
      return {
        icon: 'ticket',
        title: t('dashboard.actCoupon'),
        desc: t('dashboard.actCouponDesc', {
          user: userName || '—',
          amount: tx.amount ?? 0,
          time,
        }),
      };
    }
    return {
      icon: 'banknote',
      title: t('dashboard.actWithdraw'),
      desc: t('dashboard.actWithdrawDesc', {
        user: userName || '—',
        amount: tx.amount ?? 0,
        time,
      }),
    };
  };
}

/** أحدث النشاطات — أيقونات lucide زي الديزاين */
function RecentActivity({ activities = [], title }) {
  const { t, dir } = useLanguage();
  const activityFromTx = useActivityFromTx();
  const heading = title || t('dashboard.recentTitle');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{heading}</h3>
        <span className={styles.viewAll}>{t('dashboard.viewAll')}</span>
      </div>
      <div className={styles.list}>
        {activities.length === 0 && <p className={styles.empty}>{t('dashboard.recentEmpty')}</p>}
        {activities.map((a, i) => {
          const item = a.icon ? a : activityFromTx(a);
          return (
            <div key={a._id || i} className={styles.item}>
              <span className={styles.icon}>
                <Icon name={item.icon} size={15} />
              </span>
              <div className={styles.text}>
                <p className={styles.actTitle}>{item.title}</p>
                <p className={styles.actDesc}>{item.desc}</p>
              </div>
              <Icon name={dir === 'rtl' ? 'chevronLeft' : 'chevronRight'} size={14} className={styles.chev} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;
