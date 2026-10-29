import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/PartnerPortal/PartnerPortal.module.css';

/**
 * OfferCard — كارت عرض خصم واحد في بوابة الشريك.
 *
 * @param {object}   offer        بيانات العرض (بمعرّف _id من الـ subdocument)
 * @param {string|null} actionLoading  معرّف العملية الجارية (يمنع الضعط المزدوج)
 * @param {function} onEdit       طلب التعديل
 * @param {function} onToggle     تفعيل/إيقاف
 * @param {function} onDelete     طلب الحذف
 */
function OfferCard({ offer, actionLoading, onEdit, onToggle, onDelete }) {
  const { t, lang } = useLanguage();
  const busy = actionLoading === `toggle-${offer._id}`;

  return (
    <div className={`${styles.offerCard} ${!offer.isActive ? styles.inactive : ''}`}>
      <div className={styles.offerHeader}>
        <span className={styles.offerBadge}>
          {offer.discountType === 'percentage'
            ? t('portal.discountPct', { n: offer.discountValue })
            : t('portal.discountFixed', { n: offer.discountValue, unit: t('dashboard.egp') })}
        </span>
        <span className={`${styles.offerStatus} ${offer.isActive ? styles.offerActive : styles.offerInactive}`}>
          {offer.isActive ? t('common.active') : t('portal.stopped')}
        </span>
      </div>
      <h3 className={styles.offerTitle}>{offer.title}</h3>
      {offer.description && <p className={styles.offerDesc}>{offer.description}</p>}
      <div className={styles.offerMeta}>
        {offer.minSpend > 0 && (
          <span>{t('portal.minSpend', { n: offer.minSpend, unit: t('dashboard.egp') })}</span>
        )}
        {offer.validUntil && (
          <span>
            {t('portal.validUntil', {
              date: new Date(offer.validUntil).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'),
            })}
          </span>
        )}
      </div>
      <div className={styles.offerActions}>
        <button className={styles.editBtn} onClick={() => onEdit(offer)}>{t('common.edit')}</button>
        <button
          className={styles.toggleBtn}
          onClick={() => onToggle(offer)}
          disabled={busy || actionLoading !== null}
        >
          {busy ? '...' : offer.isActive ? t('portal.deactivate') : t('portal.activate')}
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(offer)}
          disabled={actionLoading !== null}
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  );
}

export default OfferCard;
