import { Icon } from '../ui/Icon';
import styles from './StatsCard.module.css';

/** بطاقة إحصائية — تخطيط الديزاين: شريحة أيقونة نعناعية يسارًا + label يمينًا + الرقم + حبة اتجاه */
function StatsCard({ label, value, trend, trendDir = 'up', icon = 'users', iconBg }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon} style={iconBg ? { background: iconBg } : undefined}>
          <Icon name={icon} size={19} />
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      <p className={styles.value}>{value}</p>
      {trend && (
        <span className={`${styles.trend} ${trendDir === 'down' ? styles.trendDown : ''}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            {trendDir === 'down' ? (
              <path d="M5 9L1 3h8L5 9z" fill="currentColor" />
            ) : (
              <path d="M5 1l4 6H1L5 1z" fill="currentColor" />
            )}
          </svg>
          {trend}
        </span>
      )}
    </div>
  );
}

export default StatsCard;
