import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import AchievementCard from '../../components/Achievements/AchievementCard';
import AchievementFormModal from '../../components/Achievements/AchievementFormModal';
import { achievementsService } from '../../services/achievements';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './Achievements.module.css';

function Achievements() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const canManage = role === 'superAdmin';
  const canDelete = role === 'superAdmin';

  const fetchAchievements = useCallback(() => achievementsService.getAll(), []);
  const { data: res, loading, error, reload } = useAsyncData(fetchAchievements, {
    initialData: { data: [] },
  });
  const achievements = res?.data || [];

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

  const openEdit = (a) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await achievementsService.update(editing._id, payload);
        toast.success(t('achievements.updated'));
      } else {
        await achievementsService.create(payload);
        toast.success(t('achievements.added'));
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('achievements.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await achievementsService.remove(deleteTarget._id);
      toast.success(t('achievements.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('achievements.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (a) => {
    try {
      await achievementsService.update(a._id, { isActive: !a.isActive });
      toast.success(a.isActive ? t('achievements.deactivated') : t('achievements.activated'));
      await reload();
    } catch (err) {
      toast.error(err.message || t('achievements.updateFailed'));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('achievements.title')}
        subtitle={t('achievements.subtitle', { n: achievements.length })}
        actions={canManage && <Button onClick={openCreate} icon="add">{t('achievements.add')}</Button>}
      />

      {loading ? (
        <SkeletonLoading variant="cards" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon="🏆"
          title={t('achievements.emptyTitle')}
          message={canManage ? t('achievements.emptyAdd') : undefined}
          onAction={canManage ? openCreate : undefined}
          actionLabel={t('achievements.emptyAction')}
        />
      ) : (
        <div className={styles.grid}>
          {achievements.map((a) => (
            <AchievementCard
              key={a._id}
              achievement={a}
              canManage={canManage}
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
        <AchievementFormModal
          open={modalOpen}
          editing={editing}
          submitting={submitting}
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('achievements.deleteTitle')}
        message={t('achievements.deleteMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('achievements.helpTitle')} body={t('achievements.helpBody')} />
    </PageLayout>
  );
}

export default Achievements;
