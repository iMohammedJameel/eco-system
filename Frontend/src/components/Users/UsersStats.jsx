import { useLanguage } from '../../context/LanguageContext';
import styles from './UsersStats.module.css';

function UsersStats({ users = [] }) {
  const { t } = useLanguage();
  const total = users.length;
  const totalDeposits = users.reduce((s, u) => s + (u.totalDeposits || 0), 0);
  const avgDeposits = total > 0 ? Math.round(totalDeposits / total) : 0;
  const totalBalance = users.reduce((s, u) => s + (u.balance || 0), 0).toFixed(2);

  const stats = [
    { label: t('users.statTotal'), value: total.toLocaleString('en-US'), icon: '👥', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
    { label: `${t('users.statWeight')} (${t('users.kg')})`, value: Math.round(totalDeposits).toLocaleString('en-US'), icon: '↗', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
    { label: t('users.statAvg'), value: avgDeposits.toLocaleString('en-US'), icon: '🎖', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
    { label: `${t('users.statBalance')} (${t('users.egp')})`, value: totalBalance, valueColor: '#a06a10', icon: '$', iconBg: '#f4efe2', iconColor: '#a06a10' },
  ];

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
