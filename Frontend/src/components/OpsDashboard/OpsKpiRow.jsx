import { Icon } from '../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/OpsDashboard/OpsDashboard.module.css';

/**
 * صف مؤشرات الأداء (KPI) أعلى لوحة العمليات.
 * kpis: [{ icon, value, labelKey, bg, color }]
 * labelKey مفتاح i18n (namespace: ops) — الترجمة داخل المكوّن.
 */
export default function OpsKpiRow({ kpis }) {
  const { t } = useLanguage();

  return (
    <div className={styles.kpiRow}>
      {kpis.map((kpi) => (
        <div key={kpi.labelKey} className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: kpi.bg, color: kpi.color }}>
            <Icon name={kpi.icon} size={22} />
          </div>
          <div>
            <p className={styles.kpiValue}>{kpi.value}</p>
            <p className={styles.kpiLabel}>{t(kpi.labelKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
