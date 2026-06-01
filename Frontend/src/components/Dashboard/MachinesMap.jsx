import styles from './MachinesMap.module.css';

const machines = [
  { name: 'ماكينة المترو - مصر الجديدة', color: '#2e7d32', pct: 67, top: '30%', left: '55%' },
  { name: 'ماكينة سوق العتبة', color: '#f59e0b', pct: 89, top: '60%', left: '45%' },
  { name: 'ماكينة محطة رمسيس', color: '#e53935', pct: null, top: '70%', left: '25%' },
];

function MachinesMap() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>خريطة الماكينات</h3>
      <div className={styles.map}>
        {machines.map((m) => (
          <span
            key={m.name}
            className={styles.dot}
            style={{ background: m.color, top: m.top, left: m.left }}
          />
        ))}
        <div className={styles.pin}>📍</div>
      </div>
      <div className={styles.legend}>
        {machines.map((m) => (
          <div key={m.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: m.color }} />
            <span className={styles.legendName}>{m.name}</span>
            {m.pct && <span className={styles.legendPct}>{m.pct}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachinesMap;
