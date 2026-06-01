import styles from './ReportsStats.module.css';

const stats = [
  { label: 'إجمالي الإيرادات', value: '2,840,000', badge: '15%', sub: 'جنيه مصري', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'إيراد الإعلانات',  value: '1,278,000', badge: '12%', sub: 'جنيه مصري', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'مكافآت صُرفت',    value: '845,600',   badge: '8%',  sub: 'جنيه مصري', iconBg: '#fff8e1', iconColor: '#f59e0b' },
  { label: 'صافي الفائض',     value: '1,994,400', badge: '18%', sub: 'جنيه مصري', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
];

function ReportsStats() {
  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.top}>
            <span className={styles.badge}>↑ {s.badge}</span>
            <div className={styles.icon} style={{ background: s.iconBg, color: s.iconColor }}>$</div>
          </div>
          <p className={styles.label}>{s.label}</p>
          <p className={styles.value}>{s.value}</p>
          <p className={styles.sub}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

export default ReportsStats;
