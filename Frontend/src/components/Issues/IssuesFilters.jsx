import { useLanguage } from '../../context/LanguageContext';
import { TYPE_OPTIONS, STATUS_OPTIONS, PRIORITY_OPTIONS } from './issueMeta';
import styles from './IssuesFilters.module.css';

/**
 * فلاتر بلاغات الأعطال: الحالة / النوع / الأولوية.
 * تحكم كامل من الصفحة عبر props (قيمة + onchange) — تغيير أي
 * فلتر يُرجع الصفحة الأولى تلقائيًا (مسؤولية الصفحة).
 */
function IssuesFilters({ status = '', onStatus, type = '', onType, priority = '', onPriority }) {
  const { t, dir } = useLanguage();
  return (
    <div className={styles.filters}>
      <select
        className={styles.select}
        dir={dir}
        value={status}
        onChange={(e) => onStatus?.(e.target.value)}
      >
        <option value="">{t('issues.allStatuses')}</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
        ))}
      </select>

      <select
        className={styles.select}
        dir={dir}
        value={type}
        onChange={(e) => onType?.(e.target.value)}
      >
        <option value="">{t('issues.allTypes')}</option>
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
        ))}
      </select>

      <select
        className={styles.select}
        dir={dir}
        value={priority}
        onChange={(e) => onPriority?.(e.target.value)}
      >
        <option value="">{t('issues.allPriorities')}</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
        ))}
      </select>
    </div>
  );
}

export default IssuesFilters;
