import styles from './TopMachines.module.css';

const machines = [
  { name: 'ماكينة المترو - مصر الجديدة', value: 12450, pct: 100 },
  { name: 'ماكينة سوق العتبة', value: 10230, pct: 82 },
  { name: 'ماكينة محطة رمسيس', value: 8900, pct: 71 },
  { name: 'ماكينة التحرير', value: 7650, pct: 61 },
  { name: 'ماكينة مدينة نصر', value: 6420, pct: 51 },
];

function TopMachines() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>أفضل الماكينات أداءً</h3>
      <div className={styles.list}>
        {machines.map((m) => (
          <div key={m.name} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.val}>{m.value.toLocaleString()}</span>
            </div>
            <div className={styles.barBg}>
              <div className={styles.bar} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopMachines;
