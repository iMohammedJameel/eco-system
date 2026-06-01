import styles from './UsersStats.module.css';

const stats = [
  { label: 'إجمالي المستخدمين', value: '8', icon: '👥', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'إجمالي الإيداعات', value: '1,471', icon: '↗', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'متوسط الإيداعات', value: '184', icon: '🎖', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'إجمالي الأرصدة', value: '368.50', valueColor: '#f59e0b', icon: '$', iconBg: '#fff8e1', iconColor: '#f59e0b' },
];

function UsersStats() {
  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.right}>
            <p className={styles.label}>{s.label}</p>
            <p className={styles.value} style={{ color: s.valueColor || '#1a1a1a' }}>{s.value}</p>
          </div>
          <div className={styles.icon} style={{ background: s.iconBg, color: s.iconColor }}>
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersStats;
