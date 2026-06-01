import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './RevenueChart.module.css';

const data = [
  { month: 'يناير',   إيرادات: 220000, مصروفات: 75900 },
  { month: 'فبراير',  إيرادات: 242000, مصروفات: 80050 },
  { month: 'مارس',    إيرادات: 248000, مصروفات: 85100 },
  { month: 'أبريل',   إيرادات: 256000, مصروفات: 83250 },
  { month: 'مايو',    إيرادات: 270000, مصروفات: 89250 },
  { month: 'يونيو',   إيرادات: 278000, مصروفات: 91000 },
  { month: 'يوليو',   إيرادات: 282000, مصروفات: 92500 },
  { month: 'أغسطس',   إيرادات: 300000, مصروفات: 95000 },
  { month: 'سبتمبر',  إيرادات: 290000, مصروفات: 93000 },
  { month: 'أكتوبر',  إيرادات: 295000, مصروفات: 94000 },
  { month: 'نوفمبر',  إيرادات: 310000, مصروفات: 96000 },
  { month: 'ديسمبر',  إيرادات: 305000, مصروفات: 95500 },
];

function RevenueChart() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>آخر 12 شهر</p>
        <h3 className={styles.title}>الإيرادات مقابل المصروفات</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="إيرادات" fill="#1a5c3a" radius={[4,4,0,0]} />
          <Bar dataKey="مصروفات" fill="#e53935" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;
