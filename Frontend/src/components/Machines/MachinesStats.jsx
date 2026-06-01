import styles from './MachinesStats.module.css';

const stats = [
  { label: 'نشطة', value: 5, icon: '✔', iconBg: '#e8f5e9', iconColor: '#1a5c3a' },
  { label: 'تحذيرات', value: 2, icon: '⚠', iconBg: '#fff8e1', iconColor: '#f59e0b' },
  { label: 'غير متصلة', value: 1, icon: '✖', iconBg: '#fce4ec', iconColor: '#e53935' },
  { label: 'متوسط الامتلاء', value: '56%', icon: '⚙', iconBg: '#f5f5f5', iconColor: '#555' },
];

function MachinesStats() {
  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.right}>
            <p className={styles.label}>{s.label}</p>
            <p className={styles.value}>{s.value}</p>
          </div>
          <div className={styles.icon} style={{ background: s.iconBg, color: s.iconColor }}>
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MachinesStats;
