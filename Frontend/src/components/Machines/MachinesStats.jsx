import styles from './MachinesStats.module.css';

function MachinesStats({ machines = [] }) {
  const active = machines.filter((m) => m.status === 'active').length;
  const warning = machines.filter((m) => m.status === 'nearlyFull').length;
  const offline = machines.filter((m) => m.status === 'offline').length;
  const avgFill = machines.length > 0
    ? Math.round(machines.reduce((s, m) => s + (m.fillPercentage || 0), 0) / machines.length)
    : 0;

  const stats = [
    { label: 'نشطة', value: active, icon: '✔', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
    { label: 'تحذيرات', value: warning, icon: '⚠', iconBg: '#f4efe2', iconColor: '#a06a10' },
    { label: 'غير متصلة', value: offline, icon: '✖', iconBg: '#f9e8e6', iconColor: '#b3261e' },
    { label: 'متوسط الامتلاء', value: `${avgFill}%`, icon: '⚙', iconBg: '#f0f4f3', iconColor: '#555' },
  ];

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
