import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Pricing/Pricing.module.css';
import { MATERIAL_OPTIONS, MATERIAL_LABEL_KEYS, MATERIAL_COLORS } from './pricingMeta';

/** كارت سعر مادة واحدة — عرض فقط، الإجراءات عبر props */
export default function PricingCard({ pricing: p, canEdit, canDelete, onEdit, onToggle, onDelete }) {
  const { t, lang } = useLanguage();

  const meta = MATERIAL_OPTIONS.find((o) => o.value === p.materialType)
    || { icon: '♻', color: '#888' };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.materialIcon} style={{ background: `${MATERIAL_COLORS[p.materialType]}22`, color: MATERIAL_COLORS[p.materialType] }}>
          {meta.icon}
        </span>
        <span className={`${styles.statusChip} ${p.isActive ? styles.active : styles.inactive}`}>
          {p.isActive ? t('pricing.statusActive') : t('pricing.statusInactive')}
        </span>
      </div>
      <h3 className={styles.materialName}>
        {MATERIAL_LABEL_KEYS[p.materialType] ? t(MATERIAL_LABEL_KEYS[p.materialType]) : p.materialType}
      </h3>
      <div className={styles.priceRow}>
        <span className={styles.price}>{p.pricePerKg}</span>
        <span className={styles.currency}>{p.currency || 'EGP'} {t('pricing.perKg')}</span>
      </div>
      <p className={styles.meta}>
        {t('pricing.lastUpdate', {
          date: new Date(p.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'),
        })}
      </p>
      <div className={styles.cardActions}>
        {canEdit && (
          <button className={styles.editBtn} onClick={() => onEdit(p)}>{t('common.edit')}</button>
        )}
        {canEdit && (
          <button className={styles.toggleBtn} onClick={() => onToggle(p)}>
            {p.isActive ? t('pricing.deactivate') : t('pricing.activate')}
          </button>
        )}
        {canDelete && (
          <button className={styles.deleteBtn} onClick={() => onDelete(p)}>{t('common.delete')}</button>
        )}
      </div>
    </div>
  );
}
