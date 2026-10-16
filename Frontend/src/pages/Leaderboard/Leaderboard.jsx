import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { leaderboardService } from '../../services/leaderboard';
import styles from './Leaderboard.module.css';

const LEVEL_LABELS = {
  beginner:  { text: 'مبتدئ',  className: 'levelGray' },
  active:    { text: 'نشط',    className: 'levelActive' },
  good:      { text: 'خيّر',   className: 'levelGray' },
  excellent: { text: 'متميز',  className: 'levelGold' },
};

const LIMIT_OPTIONS = [
  { value: 10,  label: 'أفضل 10' },
  { value: 20,  label: 'أفضل 20' },
  { value: 50,  label: 'أفضل 50' },
  { value: 100, label: 'أفضل 100' },
];

function getInitials(name = '') {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]) : name.slice(0, 2);
}

function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaderboardService.getTop(limit);
      setData(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(); }, [load]);

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
        title="لوحة المتصدرين"
        subtitle="أعلى المستخدمين نشاطاً في إعادة التدوير — مرتبين حسب إجمالي الوزن المُعاد"
        actions={
          <div className={styles.limitBox}>
            <label className={styles.limitLabel}>عرض</label>
            <select
              className={styles.select}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {LIMIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <SkeletonLoading variant="table" count={8} cols={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="لا توجد بيانات"
          message="لم يتم تسجيل أي عمليات تدوير بعد."
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
                      {LEVEL_LABELS[u.level]?.text || u.level}
                    </span>
                    <div className={styles.podiumStats}>
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{Math.round(u.totalWeight)}</span>
                        <span className={styles.podiumStatLabel}>كجم</span>
                      </div>
                      <div className={styles.podiumDivider} />
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{u.depositsCount}</span>
                        <span className={styles.podiumStatLabel}>عملية</span>
                      </div>
                      <div className={styles.podiumDivider} />
                      <div className={styles.podiumStat}>
                        <span className={styles.podiumStatValue}>{Math.round(u.totalAmount)}</span>
                        <span className={styles.podiumStatLabel}>ج.م</span>
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
                    <th>الترتيب</th>
                    <th>المستخدم</th>
                    <th>المستوى</th>
                    <th>الوزن المُعاد (كجم)</th>
                    <th>عدد العمليات</th>
                    <th>الإيرادات (ج.م)</th>
                    <th>الرصيد الحالي</th>
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
                          {LEVEL_LABELS[u.level]?.text || u.level}
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

      <button className={styles.helpBtn} title="مساعدة">?</button>
    </PageLayout>
  );
}

export default Leaderboard;
