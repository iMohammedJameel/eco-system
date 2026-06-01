import styles from './StatsCard.module.css';

function StatsCard({ label, value, badge, icon, iconBg }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.badge}>↑ {badge}</span>
        <div className={styles.icon} style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}

export default StatsCard;
