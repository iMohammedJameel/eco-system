import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { leaderboardService } from '../../services/leaderboard';
import styles from './LeaderboardCard.module.css';

const LEVEL_LABELS = {
  beginner: 'مبتدئ',
  active: 'نشط',
  good: 'جيد',
  excellent: 'متميز',
};

/** المتصدرون هذا الأسبوع — مراتب بالتاج والميداليات زي الديزاين */
function LeaderboardCard({ limit = 5 }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await leaderboardService.getAll({ limit });
        if (!cancelled) setEntries(res.data || []);
      } catch {
        /* صامت — الكارت اختياري */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  const rankIcon = (rank) => {
    if (rank === 1) return <Icon name="crown" size={16} className={styles.rankGold} />;
    if (rank === 2) return <Icon name="medal" size={15} className={styles.rankSilver} />;
    if (rank === 3) return <Icon name="medal" size={15} className={styles.rankBronze} />;
    return <span className={styles.rankNum}>{rank}</span>;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>المتصدرون هذا الأسبوع</h3>
        <Icon name="trophy" size={17} className={styles.trophy} />
      </div>

      <div className={styles.list}>
        {loading && <p className={styles.empty}>جارٍ التحميل...</p>}
        {!loading && entries.length === 0 && <p className={styles.empty}>لا توجد بيانات</p>}
        {!loading && entries.map((e, i) => (
          <div key={e._id || i} className={`${styles.item} ${i === 0 ? styles.topItem : ''}`}>
            <span className={styles.rank}>{rankIcon(e.rank || i + 1)}</span>
            <div className={styles.userInfo}>
              <span className={styles.name}>{e.username || '—'}</span>
              <span className={styles.level}>{LEVEL_LABELS[e.level] || ''} • {e.depositsCount || 0} إيداع</span>
            </div>
            <span className={styles.weight}>
              {Math.round(e.totalWeight || 0).toLocaleString('en-US')}
              <small> كجم</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardCard;
