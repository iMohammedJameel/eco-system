import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/OpsDashboard/OpsDashboard.module.css';

/**
 * OpsListPanel — كارت قسم موحّد لكل قوائم لوحة العمليات
 * (ماكينات تحتاج تفريغ / بلاغات / تنبؤات / معاملات مشتبهة).
 *
 * @param {string|node} title     عنوان القسم (نص مترجم أو عناصر — مثل أيقونة + نص)
 * @param {any}        badge     شارة العدد (نص أو رقم) أو { text, bg, color }
 * @param {string}     emptyKey  مفتاح i18n لنص الفراغ (يُترجم داخل المكوّن)
 * @param {Array}      items     العناصر
 * @param {(item) => JSX} renderItem يرسم صفًا واحدًا
 */
export default function OpsListPanel({ title, badge, emptyKey, items, renderItem }) {
  const { t } = useLanguage();

  const badgeStyle = badge && typeof badge === 'object'
    ? { background: badge.bg, color: badge.color }
    : undefined;

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {badge != null && (
          <span
            className={styles.countBadge}
            style={badgeStyle}
          >
            {typeof badge === 'object' ? badge.text : badge}
          </span>
        )}
      </div>
      <div className={styles.sectionBody}>
        {items.length === 0 ? (
          <p className={styles.emptyText}>{t(emptyKey)}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}
