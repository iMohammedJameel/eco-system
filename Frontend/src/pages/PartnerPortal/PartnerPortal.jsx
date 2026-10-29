import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonLoading, ErrorState, EmptyState } from '../../components/ui/EmptyState';
import OfferForm from '../../components/PartnerPortal/OfferForm';
import OfferCard from '../../components/PartnerPortal/OfferCard';
import PartnerCouponsPanel from '../../components/PartnerPortal/PartnerCouponsPanel';
import { partnersService } from '../../services/partners';
import { partnerPortalService } from '../../services/partnerPortal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { CATEGORY_LABELS, CATEGORY_LABELS_EN } from '../../constants/categories';
import styles from './PartnerPortal.module.css';

function PartnerPortal() {
  const toast = useToast();
  const { t, lang } = useLanguage();
  const { role } = useAuth();
  // الشريك الحقيقي يدخل بوابطته — الأدمن يدخل في وضع الإدارة
  const isPartner = role === 'partner';
  // تسمية فئة الشريك حسب اللغة الحالية
  const categoryLabels = lang === 'ar' ? CATEGORY_LABELS : CATEGORY_LABELS_EN;

  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  // الشريك: بروفايله من /partner-portal/me — الأدمن: قائمة الشركاء
  const fetchPartners = useCallback(
    () => (isPartner ? partnerPortalService.getMe() : partnersService.getAll({ limit: 100 })),
    [isPartner],
  );
  const { data: partnersRes, loading, error, reload } = useAsyncData(fetchPartners, {
    initialData: { data: null },
  });

  // في وضع الشريك: { partner, stats } من الـ endpoint بتاعه
  // في وضع الأدمن: قائمة الشركاء
  const partners = isPartner ? [] : (partnersRes?.data || []);
  const myPartner = isPartner ? partnersRes?.data?.partner : null;
  const myStats = isPartner ? partnersRes?.data?.stats : null;

  // الشريك الفعلي مشاهدته:
  // الشريك الحقيقي → سجله هو | الأدمن → المختار أو أول واحد (قيمة مشتقة أثناء الـ render)
  const activePartnerId = isPartner ? (myPartner?.id || '') : (selectedPartnerId || partners[0]?._id || '');
  const partner = isPartner ? myPartner : (partners.find((p) => p._id === activePartnerId) || null);

  // ── إدارة العروض — عمليات ذرّية بالمعرّف (_id) على السيرفر ──
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'toggle-<id>' | 'delete'
  const [deleteOffer, setDeleteOffer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateOffer = () => {
    setEditingOffer(null);
    setOfferModalOpen(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (payload) => {
    setSubmitting(true);
    try {
      if (editingOffer) {
        if (isPartner) await partnerPortalService.updateOffer(editingOffer._id, payload);
        else await partnersService.updateOffer(partner._id, editingOffer._id, payload);
        toast.success(t('portal.updatedToast'));
      } else {
        if (isPartner) await partnerPortalService.addOffer(payload);
        else await partnersService.addOffer(partner._id, payload);
        toast.success(t('portal.addedToast'));
      }
      setOfferModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('portal.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteOffer) return;
    setDeleting(true);
    try {
      if (isPartner) await partnerPortalService.removeOffer(deleteOffer._id);
      else await partnersService.removeOffer(partner._id, deleteOffer._id);
      toast.success(t('portal.deletedToast'));
      setDeleteOffer(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('portal.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleOfferActive = async (offer) => {
    setActionLoading(`toggle-${offer._id}`);
    try {
      if (isPartner) await partnerPortalService.updateOffer(offer._id, { isActive: !offer.isActive });
      else await partnersService.updateOffer(partner._id, offer._id, { isActive: !offer.isActive });
      toast.success(t('portal.statusToast'));
      await reload();
    } catch (err) {
      toast.error(err.message || t('portal.toggleFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  // ── حالات العرض ──
  if (loading) {
    return (
      <PageLayout>
        <PageHeader title={t('portal.title')} subtitle={t('portal.subtitle')} />
        <SkeletonLoading variant="cards" count={3} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title={t('portal.title')} subtitle={t('portal.subtitle')} />
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  if (!isPartner && partners.length === 0) {
    return (
      <PageLayout>
        <PageHeader title={t('portal.title')} subtitle={t('portal.subtitle')} />
        <EmptyState
          icon="partners"
          title={t('portal.noPartnersTitle')}
          message={t('portal.noPartnersMsg')}
        />
      </PageLayout>
    );
  }

  if (isPartner && !myPartner) {
    return (
      <PageLayout>
        <PageHeader title={t('portal.title')} subtitle={t('portal.subtitle')} />
        <EmptyState
          icon="store"
          title={t('portal.noAccountTitle')}
          message={t('portal.noAccountMsg')}
        />
      </PageLayout>
    );
  }

  const offers = partner?.discountOffers || [];
  const activeOffers = offers.filter((o) => o.isActive);

  return (
    <PageLayout>
      <PageHeader
        title={t('portal.headerTitle', { name: partner?.name || '' })}
        subtitle={t('portal.headerSubtitle', {
          category: categoryLabels[partner?.category] || partner?.category || '',
          n: activeOffers.length,
        })}
        actions={<Button onClick={openCreateOffer} icon="add">{t('portal.addOffer')}</Button>}
      />

      {/* اختيار الشريك — للأدمن فقط (الشريك الحقيقي يشوف سجله هو) */}
      {!isPartner && (
        <div className={styles.partnerPicker}>
          <Input
            as="select"
            label={t('portal.pickerLabel')}
            value={activePartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            options={partners.map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>
      )}

      {/* إحصائيات الشريك الحقيقي — من /partner-portal/me */}
      {isPartner && myStats && (
        <div className={styles.partnerStatsRow}>
          <div className={styles.partnerStat}>
            <span className={styles.partnerStatValue}>{myStats.activeCoupons}</span>
            <span className={styles.partnerStatLabel}>{t('portal.statActive')}</span>
          </div>
          <div className={styles.partnerStat}>
            <span className={styles.partnerStatValue}>{myStats.redeemedCoupons}</span>
            <span className={styles.partnerStatLabel}>{t('portal.statRedeemed')}</span>
          </div>
          <div className={styles.partnerStat}>
            <span className={styles.partnerStatValue}>{myStats.expiredCoupons}</span>
            <span className={styles.partnerStatLabel}>{t('portal.statExpired')}</span>
          </div>
          <div className={styles.partnerStat}>
            <span className={styles.partnerStatValue}>{myStats.redeemedPoints}</span>
            <span className={styles.partnerStatLabel}>{t('portal.statPoints')}</span>
          </div>
        </div>
      )}

      {/* Partner Info Card */}
      <div className={styles.partnerInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('common.email')}</span>
          <span className={styles.infoValue}>{partner?.contactEmail || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('common.phone')}</span>
          <span className={styles.infoValue}>{partner?.contactPhone || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('common.address')}</span>
          <span className={styles.infoValue}>{partner?.address || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('machines.thGovernorate')}</span>
          <span className={styles.infoValue}>{partner?.governorate || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('common.status')}</span>
          <span className={`${styles.statusChip} ${partner?.isActive ? styles.activeStatus : styles.inactiveStatus}`}>
            {partner?.isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </div>

      {/* ═══ كوبونات الشريك — استبدال نقاط المستخدمين ═══ */}
      <PartnerCouponsPanel partnerId={activePartnerId} asPartner={isPartner} />

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <EmptyState
          icon="tag"
          title={t('portal.offersEmptyTitle')}
          message={t('portal.offersEmptyMsg')}
          onAction={openCreateOffer}
          actionLabel={t('portal.offersEmptyAction')}
        />
      ) : (
        <div className={styles.offersGrid}>
          {offers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              actionLoading={actionLoading}
              onEdit={openEditOffer}
              onToggle={toggleOfferActive}
              onDelete={setDeleteOffer}
            />
          ))}
        </div>
      )}

      {/* Offer Modal — key بيعيد تهيئة النموذج مع كل هدف */}
      <OfferForm
        key={editingOffer?._id || 'new'}
        open={offerModalOpen}
        editing={editingOffer}
        submitting={submitting}
        onSubmit={handleSaveOffer}
        onClose={() => setOfferModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteOffer}
        title={t('portal.deleteOfferTitle')}
        message={t('portal.deleteOfferMsg', { title: deleteOffer?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDeleteOffer}
        onClose={() => setDeleteOffer(null)}
      />

      <HelpButton title={t('portal.helpTitle')} body={t('portal.helpBody')} />
    </PageLayout>
  );
}

export default PartnerPortal;
