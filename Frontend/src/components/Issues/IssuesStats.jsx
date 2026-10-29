import { useLanguage } from '../../context/LanguageContext';
import styles from './IssuesStats.module.css';

/** صف بطاقات إحصائيات البلاغات — ألوان كل حالة من البيانات نفسها. */
function IssuesStats({ stats = null }) {
  const { t } = useLanguage();
  if (!stats) return null;

  const cards = [
    { label: t('issues.statsOpen'), value: stats.open, color: '#b3261e', bg: '#f9e8e6' },
    { label: t('issues.statsInProgress'), value: stats.in_progress, color: '#a06a10', bg: '#f4efe2' },
    { label: t('issues.statsResolved'), value: stats.resolved, color: '#0d6c3d', bg: '#dcf0dc' },
    { label: t('issues.statsDismissed'), value: stats.dismissed, color: '#9e9e9e', bg: '#f0f4f3' },
    { label: t('issues.statsHighOpen'), value: stats.high_priority_open, color: '#92231d', bg: '#ffebee' },
  ];

  return (
    <div className={styles.statsRow}>
      {cards.map((s) => (
        <div key={s.label} className={styles.statCard} style={{ background: s.bg }}>
          <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default IssuesStats;
