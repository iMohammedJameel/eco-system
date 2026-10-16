import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './RevenueChart.module.css';

const monthLabels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function RevenueChart({ monthly = [] }) {
  const data = (monthly || []).map((m) => ({
    month: monthLabels[(m._id?.month || 1) - 1] || `${m._id?.month}`,
    إيرادات: Math.round(m.totalAmount || 0),
    وزن: Math.round(m.totalWeight || 0),
  }));

  const display = data.length > 0 ? data : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>آخر {data.length} شهر</p>
        <h3 className={styles.title}>الإيرادات والوزن المُعاد تدويره شهرياً</h3>
      </div>
      {display.length === 0 ? (
        <p className={styles.empty}>لا توجد بيانات كافية</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={display} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf2ed" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="إيرادات" fill="#0d6c3d" radius={[4,4,0,0]} />
            <Bar dataKey="وزن" fill="#a06a10" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default RevenueChart;
