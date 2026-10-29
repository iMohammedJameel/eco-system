import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { leaderboardService } from '../../services/leaderboard';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LeaderboardCard.module.css';

const LEVEL_KEYS = {
  beginner:  'dashboard.levelBeginner',
  active:    'dashboard.levelActive',
  good:      'dashboard.levelGood',
  excellent: 'dashboard.levelExcellent',
};

/** المتصدرون هذا الأسبوع — مراتب بالتاج والميداليات زي الديزاين */
function LeaderboardCard({ limit = 5 }) {
  const { t } = useLanguage();
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
        <h3 className={styles.title}>{t('dashboard.leaderboardTitle')}</h3>
        <Icon name="trophy" size={17} className={styles.trophy} />
      </div>

      <div className={styles.list}>
        {loading && <p className={styles.empty}>{t('common.loading')}</p>}
        {!loading && entries.length === 0 && <p className={styles.empty}>{t('dashboard.leaderboardEmpty')}</p>}
        {!loading && entries.map((e, i) => (
          <div key={e._id || i} className={`${styles.item} ${i === 0 ? styles.topItem : ''}`}>
            <span className={styles.rank}>{rankIcon(e.rank || i + 1)}</span>
            <div className={styles.userInfo}>
              <span className={styles.name}>{e.username || '—'}</span>
              <span className={styles.level}>
                {LEVEL_KEYS[e.level] ? t(LEVEL_KEYS[e.level]) : ''} • {t('dashboard.depositsCount', { n: e.depositsCount || 0 })}
              </span>
            </div>
            <span className={styles.weight}>
              {Math.round(e.totalWeight || 0).toLocaleString('en-US')}
              <small> {t('dashboard.kg')}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardCard;
