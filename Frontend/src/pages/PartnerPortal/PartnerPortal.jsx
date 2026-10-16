import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SkeletonLoading, ErrorState, EmptyState } from '../../components/ui/EmptyState';
import { partnersService } from '../../services/partners';
import { couponsService } from '../../services/coupons';
import { Icon } from '../../components/ui/Icon';
import { useToast } from '../../context/ToastContext';
import styles from './PartnerPortal.module.css';

const CATEGORY_LABELS = {
  supermarket: 'Supermarket',
  electronics: 'Electronics',
  pharmacy: 'Pharmacy',
  fashion: 'Fashion',
  food: 'Food & Beverage',
  services: 'Services',
  other: 'Other',
};

const EMPTY_OFFER = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minSpend: '',
  validUntil: '',
  isActive: true,
};

function PartnerPortal() {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'toggle-0', 'delete-0', etc.
  const [deleteOfferIndex, setDeleteOfferIndex] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const toast = useToast();

  // For the demo, we'll use the first partner in the system.
  // In production, this would be based on the logged-in partner's JWT.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersService.getAll({ limit: 1 });
      const p = (res.data || [])[0];
      if (p) {
        setPartner(p);
      } else {
        setError('No partner account found. Please contact the administrator.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const loadCoupons = useCallback(async (partnerId) => {
    if (!partnerId) return;
    setCouponsLoading(true);
    try {
      const res = await couponsService.getPartnerCoupons(partnerId);
      setCoupons(res.data || []);
    } catch { /* صامت */ }
    finally { setCouponsLoading(false); }
  }, []);

  useEffect(() => { if (partner?._id) loadCoupons(partner._id); }, [partner?._id, loadCoupons]);

  const confirmRedeem = async (code) => {
    try {
      await couponsService.redeem(code);
      toast.success(`تم تأكيد استبدال الكوبون ${code}`);
      loadCoupons(partner._id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm(EMPTY_OFFER);
    setOfferModalOpen(true);
  };

  const openEditOffer = (offer, index) => {
    setEditingOffer({ ...offer, index });
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue ?? '',
      minSpend: offer.minSpend ?? '',
      validUntil: offer.validUntil ? offer.validUntil.substring(0, 10) : '',
      isActive: offer.isActive ?? true,
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.title.trim() || !offerForm.discountValue) {
      toast.error('Title and discount value are required');
      return;
    }

    const newOffer = {
      title: offerForm.title.trim(),
      description: offerForm.description.trim(),
      discountType: offerForm.discountType,
      discountValue: Number(offerForm.discountValue),
      minSpend: offerForm.minSpend ? Number(offerForm.minSpend) : 0,
      validUntil: offerForm.validUntil ? new Date(offerForm.validUntil).toISOString() : undefined,
      isActive: offerForm.isActive,
    };

    setSubmitting(true);
    try {
      const currentOffers = partner.discountOffers || [];
      let updatedOffers;

      if (editingOffer) {
        updatedOffers = currentOffers.map((o, i) =>
          i === editingOffer.index ? newOffer : o
        );
      } else {
        updatedOffers = [...currentOffers, newOffer];
      }

      await partnersService.update(partner._id, {
        discountOffers: updatedOffers,
      });

      setPartner({
        ...partner,
        discountOffers: updatedOffers,
      });
      toast.success(editingOffer ? 'Offer updated' : 'Offer created');
      setOfferModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (deleteOfferIndex === null) return;
    const updatedOffers = (partner.discountOffers || []).filter(
      (_, i) => i !== deleteOfferIndex
    );
    try {
      await partnersService.update(partner._id, {
        discountOffers: updatedOffers,
      });
      setPartner({ ...partner, discountOffers: updatedOffers });
      toast.success('Offer deleted');
      setDeleteOfferIndex(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete offer');
    }
  };

  const toggleOfferActive = async (index) => {
    setActionLoading(`toggle-${index}`);
    const updatedOffers = (partner.discountOffers || []).map((o, i) =>
      i === index ? { ...o, isActive: !o.isActive } : o
    );
    try {
      await partnersService.update(partner._id, {
        discountOffers: updatedOffers,
      });
      setPartner({ ...partner, discountOffers: updatedOffers });
      toast.success('Offer status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update offer');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="Partner Portal" subtitle="Manage your discount offers and view performance" />
        <SkeletonLoading variant="cards" count={3} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Partner Portal" subtitle="Manage your discount offers and view performance" />
        <ErrorState message={error} onRetry={load} />
      </PageLayout>
    );
  }

  const offers = partner.discountOffers || [];
  const activeOffers = offers.filter(o => o.isActive);

  return (
    <PageLayout>
      <PageHeader
        title={`${partner.name} — بوابة الشريك`}
        subtitle={`${CATEGORY_LABELS[partner.category] || partner.category} · ${activeOffers.length} عرض نشط`}
        actions={<Button onClick={openCreateOffer} icon="add">إضافة عرض</Button>}
      />

      {/* Partner Info Card */}
      <div className={styles.partnerInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>البريد الإلكتروني</span>
          <span className={styles.infoValue}>{partner.contactEmail || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>التليفون</span>
          <span className={styles.infoValue}>{partner.contactPhone || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>العنوان</span>
          <span className={styles.infoValue}>{partner.address || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>المحافظة</span>
          <span className={styles.infoValue}>{partner.governorate || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>الحالة</span>
          <span className={`${styles.statusChip} ${partner.isActive ? styles.activeStatus : styles.inactiveStatus}`}>
            {partner.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>


      {/* ═══ كوبونات الشريك — استبدال نقاط المستخدمين ═══ */}
      <div className={styles.couponsSection}>
        <div className={styles.couponsHeader}>
          <h3 className={styles.couponsTitle}>
            <Icon name="ticket" size={17} /> كوبونات الشريك
          </h3>
          <span className={styles.couponsCount}>{coupons.length} كوبون</span>
        </div>
        {couponsLoading ? (
          <p className={styles.couponsEmpty}>جارٍ تحميل الكوبونات...</p>
        ) : coupons.length === 0 ? (
          <p className={styles.couponsEmpty}>لا توجد كوبونات بعد — أول ما الأدمن يصدر كوبون لمستخدم عندك هيظهر هنا</p>
        ) : (
          <div className={styles.couponsList}>
            {coupons.map((c) => (
              <div key={c._id} className={`${styles.couponRow} ${c.status !== 'issued' ? styles.couponDone : ''}`}>
                <span className={styles.couponCode}>{c.code}</span>
                <div className={styles.couponUser}>
                  <span>{c.user?.username || '—'}</span>
                  <small>{c.offer?.title || ''}</small>
                </div>
                <span className={styles.couponPoints}>{c.pointsCost} نقطة</span>
                <span className={`${styles.couponStatus} ${styles[`st_${c.status}`] || ''}`}>
                  {c.status === 'issued' ? 'مُصدر' : c.status === 'redeemed' ? 'مُستبدل' : 'ملغي'}
                </span>
                {c.status === 'issued' && (
                  <button
                    type="button"
                    className={styles.couponConfirm}
                    onClick={() => confirmRedeem(c.code)}
                  >
                    <Icon name="check" size={13} /> تأكيد الاستبدال
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <EmptyState
          icon="tag"
          title="لا توجد عروض بعد"
          message="أنشئ أول عرض خصم لك لجذب عملاء مهتمين بالبيئة."
          onAction={openCreateOffer}
          actionLabel="+ إضافة عرض"
        />
      ) : (
        <div className={styles.offersGrid}>
          {offers.map((offer, idx) => (
            <div key={`${offer.title}-${idx}`} className={`${styles.offerCard} ${!offer.isActive ? styles.inactive : ''}`}>
              <div className={styles.offerHeader}>
                <span className={styles.offerBadge}>
                  {offer.discountType === 'percentage'
                    ? `خصم ${offer.discountValue}%`
                    : `خصم ${offer.discountValue} ج.م`}
                </span>
                <span className={`${styles.offerStatus} ${offer.isActive ? styles.offerActive : styles.offerInactive}`}>
                  {offer.isActive ? 'نشط' : 'متوقف'}
                </span>
              </div>
              <h3 className={styles.offerTitle}>{offer.title}</h3>
              {offer.description && <p className={styles.offerDesc}>{offer.description}</p>}
              <div className={styles.offerMeta}>
                {offer.minSpend > 0 && <span>أقل مشتريات: {offer.minSpend} ج.م</span>}
                {offer.validUntil && (
                  <span>صالح حتى: {new Date(offer.validUntil).toLocaleDateString('ar-EG')}</span>
                )}
              </div>
              <div className={styles.offerActions}>
                <button className={styles.editBtn} onClick={() => openEditOffer(offer, idx)}>تعديل</button>
                <button
                  className={styles.toggleBtn}
                  onClick={() => toggleOfferActive(idx)}
                  disabled={actionLoading === `toggle-${idx}`}
                >
                  {actionLoading === `toggle-${idx}` ? '...' : offer.isActive ? 'إيقاف' : 'تنشيط'}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteOfferIndex(idx)}
                  disabled={actionLoading !== null}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      <Modal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={editingOffer ? 'Edit Offer' : 'Create New Offer'}
        size="md"
      >
        <form onSubmit={handleSaveOffer} className={styles.offerForm}>
          <Input
            label="Offer Title"
            value={offerForm.title}
            onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
            required
            placeholder="e.g. 10% off groceries"
          />
          <Input
            as="textarea"
            label="Description"
            value={offerForm.description}
            onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
            rows={2}
          />
          <div className={styles.formRow2}>
            <Input
              as="select"
              label="Discount Type"
              value={offerForm.discountType}
              onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value })}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Fixed Amount (EGP)' },
              ]}
            />
            <Input
              label="Discount Value"
              type="number"
              min="0"
              value={offerForm.discountValue}
              onChange={(e) => setOfferForm({ ...offerForm, discountValue: e.target.value })}
              required
            />
          </div>
          <div className={styles.formRow2}>
            <Input
              label="Min Spend (EGP)"
              type="number"
              min="0"
              value={offerForm.minSpend}
              onChange={(e) => setOfferForm({ ...offerForm, minSpend: e.target.value })}
            />
            <Input
              label="Valid Until"
              type="date"
              value={offerForm.validUntil}
              onChange={(e) => setOfferForm({ ...offerForm, validUntil: e.target.value })}
            />
          </div>
          <Input
            as="select"
            label="Status"
            value={offerForm.isActive ? 'true' : 'false'}
            onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Paused' },
            ]}
          />
          <div className={styles.formActions}>
            <Button type="submit" loading={submitting}>
              {editingOffer ? 'Save Changes' : 'Create Offer'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOfferModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOfferIndex !== null}
        title="Delete Offer"
        message="Are you sure you want to delete this offer? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteOffer}
        onClose={() => setDeleteOfferIndex(null)}
      />

      <button className={styles.helpBtn} title="Help" aria-label="Help">?</button>
    </PageLayout>
  );
}

export default PartnerPortal;
