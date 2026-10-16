import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import styles from './RecyclingChart.module.css';

const filters = ['يوم', 'أسبوع', 'شهر'];

/* توليد بيانات اليوم/الأسبوع من بيانات الشهر (تجربة تفاعلية زي الديزاين) */
function useSlicedData(data, range) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      const n = range === 'يوم' ? 12 : range === 'أسبوع' ? 7 : 12;
      return Array.from({ length: n }, (_, i) => ({ x: `${i + 1}`, y: 0 }));
    }
    if (range === 'شهر') return data;
    if (range === 'أسبوع') {
      const week = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      return week.map((d, i) => {
        const src = data[data.length - 1];
        const factor = [0.75, 1.1, 0.9, 1.25, 0.8, 1.05, 0.95][i];
        return { x: d, y: Math.round((src?.y || 0) * factor * 0.28) };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const src = data[data.length - 1];
      const factor = 0.55 + Math.sin(i * 1.1) * 0.22 + i * 0.04;
      return { x: `${i + 8}:00`, y: Math.max(0, Math.round((src?.y || 0) * factor * 0.09)) };
    });
  }, [data, range]);
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipLabel}>{label}</span>
      <span className={styles.tooltipValue}>{payload[0].value.toLocaleString('en-US')} كجم</span>
    </div>
  );
}

function RecyclingChart({ data = [] }) {
  const [active, setActive] = useState('شهر');
  const displayData = useSlicedData(data, active);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>الوزن المجمّع (كجم)</h3>
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${active === f ? styles.activeFilter : ''}`}
              onClick={() => setActive(f)}
              type="button"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={displayData} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="ecAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d6c3d" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0d6c3d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3ece5" vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 11, fill: '#8a9990', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8a9990', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="y"
            name="الوزن (كجم)"
            stroke="#0d6c3d"
            strokeWidth={2.5}
            fill="url(#ecAreaFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#0d6c3d', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RecyclingChart;
