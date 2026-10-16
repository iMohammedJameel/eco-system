import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './RevenueDonut.module.css';

const MATERIAL_LABELS = {
  plastic: 'بلاستيك',
  glass: 'زجاج',
  cardboard: 'كرتون',
  paper: 'ورق',
};

const MATERIAL_COLORS = {
  plastic: '#0d6c3d',
  glass: '#0d6c3d',
  cardboard: '#a06a10',
  paper: '#9e9e9e',
};

function RevenueDonut({ materials = [] }) {
  const total = (materials || []).reduce((s, m) => s + (m.totalWeight || 0), 0);

  const data = (materials || []).map((m) => ({
    name: MATERIAL_LABELS[m._id] || m._id,
    value: Math.round(m.totalWeight || 0),
    color: MATERIAL_COLORS[m._id] || '#888',
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>توزيع المواد المُعاد تدويرها</h3>
      {data.length === 0 ? (
        <p className={styles.empty}>لا توجد بيانات كافية</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} كجم`} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {data.map((d) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: d.color }} />
                  <span className={styles.legendName}>{d.name}</span>
                  <span className={styles.legendPct}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default RevenueDonut;
