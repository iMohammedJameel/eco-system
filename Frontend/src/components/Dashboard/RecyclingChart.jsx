import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './RecyclingChart.module.css';

const data = [
  { x: '١', y: 3100 }, { x: '٢', y: 3300 }, { x: '٣', y: 3800 },
  { x: '٤', y: 4200 }, { x: '٥', y: 3200 }, { x: '٦', y: 3600 },
  { x: '٧', y: 4500 }, { x: '٨', y: 5800 }, { x: '٩', y: 4700 },
  { x: '١٠', y: 4600 }, { x: '١١', y: 4300 }, { x: '١٢', y: 5900 },
];

const filters = ['سنة', 'شهر', 'أسبوع', 'اليوم'];

function RecyclingChart() {
  const [active, setActive] = useState('سنة');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${active === f ? styles.activeFilter : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <h3 className={styles.title}>العناصر المجمّعة يومياً</h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#1a5c3a" strokeWidth={2.5} dot={{ r: 4, fill: '#1a5c3a' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RecyclingChart;
