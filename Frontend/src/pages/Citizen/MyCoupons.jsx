import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, SkeletonLoading, EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { citizenService } from '../../services/citizen';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORY_LABELS, CATEGORY_LABELS_EN } from '../../constants/categories';
import styles from './MyCoupons.module.css';

/**
 * كوبوناتي — المواطن يشوف كوبوناته وحالتها وتاريخ انتهائها
 * الكوبون النشط يُعرض بـ QR-like code ليقرؤه الكاشير عند الشريك
 */
function couponStatus(coupon, now) {
  if (coupon.status === 'redeemed') return 'redeemed';
  if (coupon.status === 'cancelled') return 'cancelled';
  if (new Date(coupon.expiresAt) <= now) return 'expired';
  return 'active';
}

function MyCoupons() {
  const { t, lang } = useLanguage();
  const categoryLabels = lang === 'ar' ? CATEGORY_LABELS : CATEGORY_LABELS_EN;

  const fetchCoupons = useCallback(() => citizenService.getMyCoupons(), []);
  const { data, loading, error, reload } = useAsyncData(fetchCoupons, { initialData: { data: [] } });

  const coupons = data?.data || [];
  // "الآن" تُقرأ مرة واحدة عند تركيب الكومبوننت (نظام ساعة السيرفر له الأولوية)
  // — استدعاء Date.now() مباشرة في جسم الـ render يكسر قواعد نقاء React
  const [now] = useState(() => new Date(data?.serverTime || Date.now()));

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const statusMeta = {
    active: { key: 'coupons.stIssued', cls: 'stActive' },
    redeemed: { key: 'coupons.stRedeemed', cls: 'stRedeemed' },
    expired: { key: 'coupons.stExpired', cls: 'stExpired' },
    cancelled: { key: 'coupons.stCancelled', cls: 'stCancelled' },
  };

  return (
    <PageLayout>
      <PageHeader title={t('mycoupons.title')} subtitle={t('mycoupons.subtitle')} />

      {loading ? (
        <SkeletonLoading variant="cards" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon="ticket"
          title={t('mycoupons.emptyTitle')}
          message={t('mycoupons.emptyMsg')}
        />
      ) : (
        <div className={styles.grid}>
          {coupons.map((c) => {
            const st = statusMeta[couponStatus(c, now)];
            return (
              <div key={c._id} className={`${styles.card} ${styles[st.cls]}`}>
                <div className={styles.cardTop}>
                  <div className={styles.partner}>
                    <span className={styles.partnerIcon}><Icon name="store" size={18} /></span>
                    <div>
                      <span className={styles.partnerName}>{c.partner?.name || '—'}</span>
                      <span className={styles.partnerCat}>
                        {categoryLabels[c.partner?.category] || c.partner?.category || ''}
                      </span>
                    </div>
                  </div>
                  <span className={`${styles.statusChip} ${styles[st.cls]}`}>{t(st.key)}</span>
                </div>

                <div className={styles.offerBox}>
                  <span className={styles.offerTitle}>{c.offer?.title}</span>
                  <span className={styles.offerValue}>
                    {c.offer?.discountType === 'percentage'
                      ? `${c.offer?.discountValue}%`
                      : `${c.offer?.discountValue} ${t('common.egp')}`}
                    {c.offer?.minSpend > 0 && (
                      <small> · {t('mycoupons.minSpend')}: {c.offer.minSpend} {t('common.egp')}</small>
                    )}
                  </span>
                </div>

                <div className={styles.codeRow}>
                  <span className={styles.code} dir="ltr">{c.code}</span>
                  <span className={styles.expires}>
                    <Icon name="clock" size={13} />
                    {t('mycoupons.expires')}: {fmtDate(c.expiresAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

export default MyCoupons;
