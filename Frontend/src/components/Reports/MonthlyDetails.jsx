import { useLanguage } from '../../context/LanguageContext';
import styles from './MonthlyDetails.module.css';

function MonthlyDetails({ monthly = [] }) {
  const { t } = useLanguage();
  const monthLabels = t('dashboard.months');
  const egp = t('dashboard.egp');
  const kg = t('dashboard.kg');

  // Show last 6 months (most recent first when API returns oldest-first)
  const recent = [...monthly].slice(-6).reverse();
  const months = recent.map((m) => monthLabels[(m._id?.month || 1) - 1] || `${m._id?.month}`);

  const rows = [
    {
      label: t('reports.rowRevenue', { unit: egp }),
      values: recent.map((m) => Math.round(m.totalAmount || 0)),
      type: 'income',
    },
    {
      label: t('reports.rowWeight', { unit: kg }),
      values: recent.map((m) => Math.round(m.totalWeight || 0)),
      type: 'income',
    },
    {
      label: t('reports.rowOperations'),
      values: recent.map((m) => m.count || 0),
      type: 'total',
    },
  ];

  if (recent.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.sub}>{t('reports.noMonthlyData')}</p>
          <h3 className={styles.title}>{t('reports.monthlyTitle')}</h3>
        </div>
        <p className={styles.empty}>{t('reports.noData')}</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>{t('reports.lastMonthsPl', { n: recent.length })}</p>
        <h3 className={styles.title}>{t('reports.monthlyTitle')}</h3>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('reports.thCategory')}</th>
              {months.map((m) => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.type === 'total' ? styles.totalRow : ''}>
                <td className={styles.rowLabel}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className={row.type === 'total' ? styles.totalVal : styles.incomeVal}>
                    {v.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyDetails;
