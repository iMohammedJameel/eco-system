import { useState, useCallback, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { couponsService } from '../../services/coupons';
import { partnerPortalService } from '../../services/partnerPortal';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/PartnerPortal/PartnerPortal.module.css';

/* مفاتيح حالات الكوبون — القيمة غير المعروفة ترجع لملغي (كما في الأصل) */
const COUPON_STATUS_KEYS = {
  issued: 'portal.couponIssued',
  redeemed: 'portal.couponRedeemed',
  cancelled: 'portal.couponCancelled',
};

/**
 * PartnerCouponsPanel — قسم كوبونات الشريك (استبدال نقاط المستخدمين).
 * asPartner=true → الشريك الحقيقي: الجلب والاستبدال عبر /partner-portal/*
 * (مقيّد بسجل الشريك نفسه على السيرفر)؛ false → وضع الأدمن.
 */
function PartnerCouponsPanel({ partnerId, asPartner = false }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  // null = لا خطأ، '' = خطأ بدون رسالة (يُعرض النص الاحتياطي المُترجم وقت العرض)، نص = رسالة السيرفر
  const [error, setError] = useState(null);

  // كل تحديثات الحالة جوا callbacks غير متزامنة
  const fetchCoupons = useCallback((id) => {
    Promise.resolve()
      .then(() => {
        setLoading(true);
        // الشريك يجلب كوبوناته هو؛ الأدمن يجلب كوبونات الشريك المحدد
        return asPartner ? partnerPortalService.getCoupons() : couponsService.getPartnerCoupons(id);
      })
      .then((res) => {
        setCoupons(res.data || []);
        setError(null);
      })
      .catch((err) => {
        // كان الخطأ بيُبتلع بصمت — المستخدم يشوف سبب فراغ القائمة
        // (رسالة السيرفر تُخزَّن خام، والنص الاحتياطي يُترجم وقت العرض حسب اللغة)
        setError(err?.message || '');
      })
      .finally(() => setLoading(false));
  }, [asPartner]);

  useEffect(() => {
    if (asPartner || partnerId) fetchCoupons(partnerId);
  }, [partnerId, asPartner, fetchCoupons]);

  const confirmRedeem = async (code) => {
    try {
      // الشريك يستبدل عبر بوابطته (السيرفر يتأكد أن الكوبون له فعلاً)
      if (asPartner) await partnerPortalService.redeem(code);
      else await couponsService.redeem(code);
      toast.success(t('portal.redeemedToast', { code }));
      fetchCoupons(partnerId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.couponsSection}>
      <div className={styles.couponsHeader}>
        <h3 className={styles.couponsTitle}>
          <Icon name="ticket" size={17} /> {t('portal.couponsTitle')}
        </h3>
        <span className={styles.couponsCount}>{t('portal.couponsCount', { n: coupons.length })}</span>
      </div>
      {loading ? (
        <p className={styles.couponsEmpty}>{t('portal.couponsLoading')}</p>
      ) : error !== null ? (
        <p className={styles.couponsEmpty}>{error || t('portal.couponsLoadFailed')}</p>
      ) : coupons.length === 0 ? (
        <p className={styles.couponsEmpty}>{t('portal.couponsEmpty')}</p>
      ) : (
        <div className={styles.couponsList}>
          {coupons.map((c) => (
            <div key={c._id} className={`${styles.couponRow} ${c.status !== 'issued' ? styles.couponDone : ''}`}>
              <span className={styles.couponCode}>{c.code}</span>
              <div className={styles.couponUser}>
                <span>{c.user?.username || '—'}</span>
                <small>{c.offer?.title || ''}</small>
              </div>
              <span className={styles.couponPoints}>{t('portal.pointsCost', { n: c.pointsCost })}</span>
              <span className={`${styles.couponStatus} ${styles[`st_${c.status}`] || ''}`}>
                {t(COUPON_STATUS_KEYS[c.status] || 'portal.couponCancelled')}
              </span>
              {c.status === 'issued' && (
                <button
                  type="button"
                  className={styles.couponConfirm}
                  onClick={() => confirmRedeem(c.code)}
                >
                  <Icon name="check" size={13} /> {t('portal.confirmRedeem')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PartnerCouponsPanel;
