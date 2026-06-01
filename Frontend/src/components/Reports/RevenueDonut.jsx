import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './RevenueDonut.module.css';

const data = [
  { name: 'إعلانات', value: 45, color: '#1a5c3a' },
  { name: 'شراكات B2B', value: 35, color: '#2ecc71' },
  { name: 'رصيد كربوني', value: 20, color: '#f59e0b' },
];

function RevenueDonut() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>توزيع مصادر الإيراد</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.legend}>
        {data.map((d) => (
          <div key={d.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: d.color }} />
            <span className={styles.legendName}>{d.name}</span>
            <span className={styles.legendPct}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueDonut;
