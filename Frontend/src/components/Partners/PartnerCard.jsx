import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Partners/Partners.module.css';
import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from '../../constants/categories';

/** فئات الشركاء → مفاتيح ترجمة (partners.cat*) */
const CATEGORY_KEYS = {
  supermarket: 'partners.catSupermarket',
  electronics: 'partners.catElectronics',
  pharmacy: 'partners.catPharmacy',
  fashion: 'partners.catFashion',
  food: 'partners.catFood',
  services: 'partners.catServices',
  other: 'partners.catOther',
};

/**
 * PartnerCard — كارت عرض شريك واحد في شبكة الشركاء.
 * مسؤولية العرض فقط: البيانات الواردة تُعرض كما هي بدون أي منطق جلب/تعديل.
 *
 * @param {object}   p            بيانات الشريك
 * @param {boolean}  canManage    إظهار أزرار التعديل
 * @param {boolean}  canDelete    إظهار زر الحذف
 * @param {function} onEdit       استدعاء عند طلب التعديل
 * @param {function} onDelete     استدعاء عند طلب الحذف
 */
function PartnerCard({ p, canManage, canDelete, onEdit, onDelete }) {
  const { t, lang } = useLanguage();
  const offers = p.discountOffers || [];

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.logoBox}>
          {CATEGORY_ICONS[p.category] || DEFAULT_CATEGORY_ICON}
        </div>
        <div className={styles.cardHeadText}>
          <h3 className={styles.name}>{p.name}</h3>
          <span className={styles.category}>
            {CATEGORY_KEYS[p.category] ? t(CATEGORY_KEYS[p.category]) : p.category}
          </span>
        </div>
        <span className={`${styles.statusChip} ${p.isActive ? styles.active : styles.inactive}`}>
          {p.isActive ? t('partners.statusActive') : t('partners.statusInactive')}
        </span>
      </div>

      <div className={styles.metaList}>
        {p.contactEmail && (
          <div className={styles.metaRow}>
            <span>✉</span><span dir="ltr">{p.contactEmail}</span>
          </div>
        )}
        {p.contactPhone && (
          <div className={styles.metaRow}>
            <span>📞</span><span dir="ltr">{p.contactPhone}</span>
          </div>
        )}
        {p.address && (
          <div className={styles.metaRow}>
            <span>📍</span>
            <span>{p.address}{p.governorate ? `${lang === 'ar' ? '، ' : ', '}${p.governorate}` : ''}</span>
          </div>
        )}
      </div>

      {offers.length > 0 && (
        <div className={styles.offersBox}>
          <p className={styles.offersTitle}>{t('partners.offersTitle', { n: offers.length })}</p>
          {offers.slice(0, 2).map((o, i) => (
            <div key={o._id || i} className={styles.offer}>
              <span className={styles.offerBadge}>
                {o.discountType === 'percentage' ? `${o.discountValue}%` : `${o.discountValue} ${t('partners.egpShort')}`}
              </span>
              <span className={styles.offerTitle}>{o.title}</span>
            </div>
          ))}
          {offers.length > 2 && (
            <p className={styles.moreOffers}>{t('partners.moreOffers', { n: offers.length - 2 })}</p>
          )}
        </div>
      )}

      {canManage && (
        <div className={styles.cardActions}>
          <button className={styles.editBtn} onClick={() => onEdit(p)}>{t('common.edit')}</button>
          {canDelete && (
            <button className={styles.deleteBtn} onClick={() => onDelete(p)}>{t('common.delete')}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default PartnerCard;
