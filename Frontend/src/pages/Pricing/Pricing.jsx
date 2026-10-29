import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import PricingCard from '../../components/Pricing/PricingCard';
import PricingFormModal from '../../components/Pricing/PricingFormModal';
import { MATERIAL_LABEL_KEYS } from '../../components/Pricing/pricingMeta';
import { pricingService } from '../../services/pricing';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './Pricing.module.css';

function Pricing() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const canCreate = role === 'superAdmin';
  const canEdit = role === 'superAdmin';
  const canDelete = role === 'superAdmin';

  const fetchPricings = useCallback(() => pricingService.getAll(), []);
  const { data: res, loading, error, reload } = useAsyncData(fetchPricings, {
    initialData: { data: [] },
  });
  const pricings = res?.data || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await pricingService.update(editing._id, payload);
        toast.success(t('pricing.updated'));
      } else {
        await pricingService.create(payload);
        toast.success(t('pricing.added'));
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('pricing.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await pricingService.remove(deleteTarget._id);
      toast.success(t('pricing.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('pricing.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await pricingService.update(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? t('pricing.deactivated') : t('pricing.activated'));
      await reload();
    } catch (err) {
      toast.error(err.message || t('pricing.updateFailed'));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('pricing.title')}
        subtitle={t('pricing.subtitle')}
        actions={canCreate && <Button onClick={openCreate} icon="add">{t('pricing.add')}</Button>}
      />

      {loading ? (
        <SkeletonLoading variant="cards" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : pricings.length === 0 ? (
        <EmptyState
          icon="$"
          title={t('pricing.emptyTitle')}
          message={canCreate ? t('pricing.emptyAdd') : undefined}
          onAction={canCreate ? openCreate : undefined}
          actionLabel={t('pricing.emptyAction')}
        />
      ) : (
        <div className={styles.grid}>
          {pricings.map((p) => (
            <PricingCard
              key={p._id}
              pricing={p}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEdit}
              onToggle={toggleActive}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* يُركّب عند الفتح فقط — يبدأ النموذج نظيفًا مع كل إضافة/تعديل */}
      {modalOpen && (
        <PricingFormModal
          open={modalOpen}
          editing={editing}
          existingMaterials={pricings.map((p) => p.materialType)}
          submitting={submitting}
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('pricing.deleteTitle')}
        message={t('pricing.deleteMsg', {
          material: MATERIAL_LABEL_KEYS[deleteTarget?.materialType]
            ? t(MATERIAL_LABEL_KEYS[deleteTarget.materialType])
            : (deleteTarget?.materialType ?? ''),
        })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('pricing.helpTitle')} body={t('pricing.helpBody')} />
    </PageLayout>
  );
}

export default Pricing;
