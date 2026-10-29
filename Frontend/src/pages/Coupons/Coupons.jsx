import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import CouponsTable from '../../components/Coupons/CouponsTable';
import IssueCouponModal from '../../components/Coupons/IssueCouponModal';
import { STATUS_META, EMPTY_LIST } from '../../components/Coupons/couponMeta';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import { couponsService } from '../../services/coupons';
import styles from './Coupons.module.css';

function Coupons() {
  const { t } = useLanguage();
  const toast = useToast();

  // ── قائمة الكوبونات ──
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCoupons = useCallback(
    () => couponsService.getAll({ page, limit: 12, status: statusFilter }),
    [page, statusFilter],
  );
  const { data, loading, error, reload } = useAsyncData(fetchCoupons, { initialData: EMPTY_LIST });

  // ── نموذج الإصدار ──
  const [issueOpen, setIssueOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const handleIssue = async (payload) => {
    setIssuing(true);
    try {
      const res = await couponsService.issue(payload);
      toast.success(t('coupons.issuedToast', { code: res.data.coupon.code, balance: res.data.newBalance }));
      reload();
    } finally {
      setIssuing(false);
    }
  };

  const handleRedeem = async (code) => {
    try {
      await couponsService.redeem(code);
      toast.success(t('coupons.redeemedToast'));
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── إلغاء كوبون — بنافذة تأكيد موحّدة بدل window.confirm ──
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await couponsService.cancel(cancelTarget._id);
      toast.success(t('coupons.cancelledToast'));
      setCancelTarget(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const coupons = data.data || [];

  return (
    <PageLayout>
      <PageHeader
        title={t('coupons.title')}
        subtitle={t('coupons.subtitle')}
        actions={
          <button className={styles.issueBtn} onClick={() => setIssueOpen(true)}>
            <Icon name="add" size={16} />
            {t('coupons.issue')}
          </button>
        }
      />

      {/* إحصائيات سريعة */}
      <div className={styles.quickStats}>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{data.stats?.issued ?? 0}</span>
          <span className={styles.qsLabel}>{t('coupons.qsRedeemable')}</span>
        </div>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{data.stats?.redeemed ?? 0}</span>
          <span className={styles.qsLabel}>{t('coupons.qsRedeemed')}</span>
        </div>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{(data.stats?.totalPoints ?? 0).toLocaleString('en-US')}</span>
          <span className={styles.qsLabel}>{t('coupons.qsTotalPoints')}</span>
        </div>
      </div>

      {/* فلاتر — "منتهي" حالة محسوبة لكل صف (لا تُدعم كفلتر سيرفر) */}
      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${statusFilter === '' ? styles.chipActive : ''}`}
          onClick={() => { setStatusFilter(''); setPage(1); }}
        >
          {t('common.all')}
        </button>
        {['issued', 'redeemed', 'cancelled'].map((key) => (
          <button
            key={key}
            className={`${styles.chip} ${statusFilter === key ? styles.chipActive : ''}`}
            onClick={() => { setStatusFilter(key); setPage(1); }}
          >
            {t(STATUS_META[key].labelKey)}
          </button>
        ))}
      </div>

      {loading && <SkeletonLoading variant="table" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          {coupons.length === 0 ? (
            <EmptyState
              title={t('coupons.emptyTitle')}
              message={t('coupons.emptyDesc')}
              icon="ticket"
            />
          ) : (
            <CouponsTable coupons={coupons} onRedeem={handleRedeem} onCancel={setCancelTarget} />
          )}

          {/* كان بيبعت props غلط (currentPage/totalPages/onPageChange)
              فالترقيم عمره ما كان بيظهر — الأسماء الصح: page/pages/onChange */}
          <Pagination
            page={data.pagination?.page || 1}
            pages={data.pagination?.pages || 1}
            total={data.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      {/* ═══ نموذج الإصدار — يُركَّب عند الفتح فقط لتبدأ الحالة نظيفة ═══ */}
      {issueOpen && (
        <IssueCouponModal
          open={issueOpen}
          submitting={issuing}
          onIssue={handleIssue}
          onClose={() => setIssueOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title={t('coupons.cancelTitle')}
        message={t('coupons.cancelMsg', { code: cancelTarget?.code ?? '', points: cancelTarget?.pointsCost ?? 0 })}
        confirmLabel={t('coupons.cancelConfirm')}
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </PageLayout>
  );
}

export default Coupons;
