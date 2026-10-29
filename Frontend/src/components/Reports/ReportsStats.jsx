import { useLanguage } from '../../context/LanguageContext';
import styles from './ReportsStats.module.css';

function ReportsStats({ overview = null }) {
  const { t } = useLanguage();

  const totalRevenue = overview?.recycling?.totalRevenue ?? 0;
  const totalWithdrawals = overview?.recycling?.totalWithdrawals ?? 0;
  const netRevenue = totalRevenue - totalWithdrawals;
  const totalTransactions = overview?.transactions?.total ?? 0;

  // الوحدة (ج.م / EGP) من القاموس الرئيسي — dashboard.egp
  const egp = t('dashboard.egp');
  const stats = [
    { label: t('reports.statRevenue', { unit: egp }), value: Math.round(totalRevenue).toLocaleString('en-US'), icon: '$', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
    { label: t('reports.statWithdrawals', { unit: egp }), value: Math.round(totalWithdrawals).toLocaleString('en-US'), icon: '↗', iconBg: '#f9e8e6', iconColor: '#b3261e' },
    { label: t('reports.statNetRevenue', { unit: egp }), value: Math.round(netRevenue).toLocaleString('en-US'), icon: '∆', iconBg: '#f4efe2', iconColor: '#a06a10' },
    { label: t('reports.statTransactions'), value: totalTransactions.toLocaleString('en-US'), icon: '⇄', iconBg: '#dcf0dc', iconColor: '#0d6c3d' },
  ];

  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.right}>
            <p className={styles.label}>{s.label}</p>
            <p className={styles.value} style={{ color: s.iconColor }}>{s.value}</p>
          </div>
          <div className={styles.icon} style={{ background: s.iconBg, color: s.iconColor }}>
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportsStats;
