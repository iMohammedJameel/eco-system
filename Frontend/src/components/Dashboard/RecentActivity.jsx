import styles from './RecentActivity.module.css';

const activities = [
  { icon: '♻', iconBg: '#e8f5e9', iconColor: '#1a5c3a', title: 'إيداع عنصر جديد', desc: 'أحمد محمد • ماكينة المترو • منذ دقيقتين' },
  { icon: '$', iconBg: '#fff8e1', iconColor: '#f59e0b', title: 'سحب رصيد', desc: 'فاطمة علي • 50 ج.م • منذ 5 دقائق' },
  { icon: '👥', iconBg: '#e8f5e9', iconColor: '#1a5c3a', title: 'تسجيل مستخدم جديد', desc: 'محمد حسن • منذ 8 دقائق' },
  { icon: '⚙', iconBg: '#fce4ec', iconColor: '#e53935', title: 'تنبيه صيانة', desc: 'ماكينة سوق العتبة • منذ 15 دقيقة' },
  { icon: '♻', iconBg: '#e8f5e9', iconColor: '#1a5c3a', title: 'إيداع عنصر جديد', desc: 'سارة محمود • ماكينة رمسيس • منذ 20 دقيقة' },
];

function RecentActivity() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>النشاط الأخير</h3>
      <div className={styles.list}>
        {activities.map((a, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.icon} style={{ background: a.iconBg, color: a.iconColor }}>
              {a.icon}
            </div>
            <div className={styles.text}>
              <p className={styles.actTitle}>{a.title}</p>
              <p className={styles.actDesc}>{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
