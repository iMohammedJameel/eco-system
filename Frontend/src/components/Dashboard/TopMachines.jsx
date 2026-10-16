import styles from './TopMachines.module.css';

/** أفضل المواقع أداءً — أشرطة تدرج زي الديزاين */
function TopMachines({ machines = [], title = 'أفضل المواقع أداءً' }) {
  const sorted = [...machines]
    .sort((a, b) => (b.totalCollected || 0) - (a.totalCollected || 0))
    .slice(0, 5);

  const max = sorted.length > 0 ? sorted[0].totalCollected || 1 : 1;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.unit}>كجم</span>
      </div>
      <div className={styles.list}>
        {sorted.length === 0 && <p className={styles.empty}>لا توجد بيانات</p>}
        {sorted.map((m, i) => {
          const pct = max > 0 ? Math.round(((m.totalCollected || 0) / max) * 100) : 0;
          return (
            <div key={m._id} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.name}>{m.name}</span>
                <span className={styles.val}>{Math.round(m.totalCollected || 0).toLocaleString('en-US')}</span>
              </div>
              <div className={styles.barBg}>
                <div
                  className={styles.bar}
                  style={{ width: `${pct}%`, background: i === 0 ? 'linear-gradient(90deg, #0d6c3d, #166d37)' : undefined }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopMachines;
