import { Icon } from '../ui/Icon';
import styles from './RecentActivity.module.css';

const MATERIAL_LABELS = {
  plastic: 'بلاستيك',
  glass: 'زجاج',
  cardboard: 'كرتون',
  paper: 'ورق',
};

function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'منذ لحظات';
  if (min < 60) return `منذ ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  return `منذ ${day} يوم`;
}

function activityFromTx(t) {
  const userName = typeof t.user === 'object' ? t.user?.username : t.user;
  const machineName = typeof t.machine === 'object' ? t.machine?.name : t.machine;

  if (t.type === 'deposit') {
    return {
      icon: 'recycle',
      title: `إيداع ${MATERIAL_LABELS[t.materialType] || t.materialType || ''}`,
      desc: `${userName || '—'} • ${machineName || '—'} • ${t.weightKg ?? 0} كجم • ${formatRelative(t.createdAt)}`,
    };
  }
  if (t.withdrawalMethod === 'coupon') {
    return {
      icon: 'ticket',
      title: 'كوبون شريك',
      desc: `${userName || '—'} • استبدل ${t.amount ?? 0} نقطة • ${formatRelative(t.createdAt)}`,
    };
  }
  return {
    icon: 'banknote',
    title: 'سحب رصيد',
    desc: `${userName || '—'} • ${t.amount ?? 0} ج.م • ${formatRelative(t.createdAt)}`,
  };
}

/** أحدث النشاطات — أيقونات lucide زي الديزاين */
function RecentActivity({ activities = [], title = 'أحدث النشاطات' }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.viewAll}>عرض الكل</span>
      </div>
      <div className={styles.list}>
        {activities.length === 0 && <p className={styles.empty}>لا يوجد نشاط حالياً</p>}
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
              <Icon name="chevronLeft" size={14} className={styles.chev} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;
