import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { leaderboardService } from '../../services/leaderboard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Leaderboard.module.css';

const LEVEL_LABELS = {
  beginner:  { labelKey: 'dashboard.levelBeginner',  className: 'levelGray' },
  active:    { labelKey: 'dashboard.levelActive',    className: 'levelActive' },
  good:      { labelKey: 'dashboard.levelGood',      className: 'levelGray' },
  excellent: { labelKey: 'dashboard.levelExcellent', className: 'levelGold' },
};

const LIMIT_OPTIONS = [
  { value: 10,  labelKey: 'leaderboard.topN' },
  { value: 20,  labelKey: 'leaderboard.topN' },
  { value: 50,  labelKey: 'leaderboard.topN' },
  { value: 100, labelKey: 'leaderboard.topN' },
];

function getInitials(name = '') {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]) : name.slice(0, 2);
}

function Leaderboard() {
  const { t } = useLanguage();
  const [limit, setLimit] = useState(20);

  const fetchTop = useCallback(
    () => leaderboardService.getTop(limit),
    [limit],
  );
  const { data: res, loading, error, reload } = useAsyncData(fetchTop, {
    initialData: { data: [] },
  });
  const data = res?.data || [];

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const medalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.subtitle')}
        actions={
          <div className={styles.limitBox}>
            <label className={styles.limitLabel}>{t('leaderboard.show')}</label>
            <select
              className={styles.select}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {LIMIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey, { n: o.value })}</option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <SkeletonLoading variant="table" count={8} cols={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="🏆"
          title={t('leaderboard.emptyTitle')}
          message={t('leaderboard.emptyMsg')}
        />
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className={styles.podium}>
              {top3.map((u, idx) => {
                const rank = idx + 1;
                const placeClass = styles[`place${rank}`] || '';
                return (
                  <div key={u._id} className={`${styles.podiumCard} ${placeClass}`}>
                    <div className={styles.medal}>{medalIcon(rank)}</div>
                    <div className={styles.podiumAvatar}>{getInitials(u.username)}</div>
                    <h3 className={styles.podiumName}>{u.username}</h3>
                    <span className={`${styles.levelChip} ${styles[LEVEL_LABELS[u.level]?.className || '']}`}>
                      {LEVEL_LABELS[u.level] ? t(LEVEL_LABELS[u.level].labelKey) : u.level}
                    </span>
                    <div className={styles.podiumStats}>
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{Math.round(u.totalWeight)}</span>
                        <span className={styles.podiumStatLabel}>{t('dashboard.kg')}</span>
                      </div>
                      <div className={styles.podiumDivider} />
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{u.depositsCount}</span>
                        <span className={styles.podiumStatLabel}>{t('leaderboard.unitDeposits')}</span>
                      </div>
                      <div className={styles.podiumDivider} />
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{Math.round(u.totalAmount)}</span>
                        <span className={styles.podiumStatLabel}>{t('dashboard.egp')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of the leaderboard as a table */}
          {rest.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('leaderboard.thRank')}</th>
                    <th>{t('leaderboard.thUser')}</th>
                    <th>{t('leaderboard.thLevel')}</th>
                    <th>{t('leaderboard.thWeight')}</th>
                    <th>{t('leaderboard.thDeposits')}</th>
                    <th>{t('leaderboard.thRevenue')}</th>
                    <th>{t('leaderboard.thBalance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <span className={styles.rankBadge}>#{u.rank}</span>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{getInitials(u.username)}</div>
                          <div>
                            <div className={styles.userName}>{u.username}</div>
                            <div className={styles.userEmail} dir="ltr">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.levelChip} ${styles[LEVEL_LABELS[u.level]?.className || '']}`}>
                          {LEVEL_LABELS[u.level] ? t(LEVEL_LABELS[u.level].labelKey) : u.level}
                        </span>
                      </td>
                      <td className={styles.num}>{Math.round(u.totalWeight).toLocaleString('en-US')}</td>
                      <td className={styles.num}>{u.depositsCount}</td>
                      <td className={styles.num}>{Math.round(u.totalAmount).toLocaleString('en-US')}</td>
                      <td className={`${styles.num} ${styles.balance}`}>{(u.balance || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <HelpButton title={t('leaderboard.helpTitle')} body={t('leaderboard.helpBody')} />
    </PageLayout>
  );
}

export default Leaderboard;
