import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import styles from './RevenueDonut.module.css';

/* مفاتيح تسميات المواد من القاموس الرئيسي (dashboard.matXxx) */
const MATERIAL_LABEL_KEYS = {
  plastic: 'dashboard.matPlastic',
  glass: 'dashboard.matGlass',
  cardboard: 'dashboard.matCardboard',
  paper: 'dashboard.matPaper',
};

const MATERIAL_COLORS = {
  plastic: '#0d6c3d',
  glass: '#0d6c3d',
  cardboard: '#a06a10',
  paper: '#9e9e9e',
};

function RevenueDonut({ materials = [] }) {
  const { t } = useLanguage();
  const kg = t('dashboard.kg');

  const total = (materials || []).reduce((s, m) => s + (m.totalWeight || 0), 0);

  // مفتاح مفقود يرجع نص المفتاح نفسه — فالمادة غير المعروفة تظهر بقيمتها الخام
  const data = (materials || []).map((m) => ({
    name: t(MATERIAL_LABEL_KEYS[m._id] || m._id),
    value: Math.round(m.totalWeight || 0),
    color: MATERIAL_COLORS[m._id] || '#888',
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{t('reports.donutTitle')}</h3>
      {data.length === 0 ? (
        <p className={styles.empty}>{t('reports.noData')}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} ${kg}`} />
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
