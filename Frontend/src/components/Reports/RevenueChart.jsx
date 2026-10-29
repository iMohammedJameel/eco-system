import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import styles from './RevenueChart.module.css';

/* مفاتيح السلاسل محايدة لغويًا — التسميات تظهر في Legend/Tooltip عبر name */
function RevenueChart({ monthly = [] }) {
  const { t, isRTL } = useLanguage();
  const monthLabels = t('dashboard.months');

  const data = (monthly || []).map((m) => ({
    month: monthLabels[(m._id?.month || 1) - 1] || `${m._id?.month}`,
    revenue: Math.round(m.totalAmount || 0),
    weight: Math.round(m.totalWeight || 0),
  }));

  const display = data.length > 0 ? data : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>{t('reports.lastMonths', { n: data.length })}</p>
        <h3 className={styles.title}>{t('reports.chartTitle')}</h3>
      </div>
      {display.length === 0 ? (
        <p className={styles.empty}>{t('reports.noData')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          {/* RTL: الأشهر من اليمين لليسار (زي الديزاين) ومحور الأرقام يمين */}
          <BarChart
            data={display}
            margin={isRTL ? { top: 10, right: 0, left: 10, bottom: 0 } : { top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf2ed" />
            <XAxis dataKey="month" reversed={isRTL} tick={{ fontSize: 11 }} />
            <YAxis orientation={isRTL ? 'right' : 'left'} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" name={t('reports.seriesRevenue')} fill="#0d6c3d" radius={[4,4,0,0]} />
            <Bar dataKey="weight" name={t('reports.seriesWeight')} fill="#a06a10" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default RevenueChart;
