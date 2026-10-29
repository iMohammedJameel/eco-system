import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import NotificationCard from '../../components/Notifications/NotificationCard';
import NotificationFormModal from '../../components/Notifications/NotificationFormModal';
import { TYPE_OPTIONS } from '../../components/Notifications/notificationMeta';
import { notificationsService } from '../../services/notifications';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './Notifications.module.css';

function Notifications() {
  const { role } = useAuth();
  const { t, dir } = useLanguage();
  const canSend = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchNotifications = useCallback(
    () => notificationsService.getAll({ page, limit: 10, type: typeFilter }),
    [page, typeFilter],
  );
  const { data, loading, error, reload } = useAsyncData(fetchNotifications, {
    initialData: { data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const openCreate = () => setModalOpen(true);

  const handleSend = async (payload) => {
    setSubmitting(true);
    try {
      const res = await notificationsService.create(payload);
      const recipientLabel = payload.recipient === 'all'
        ? t('notifications.sentToAll', { n: res.data?.recipientCount || 0 })
        : t('notifications.sentToSpecific');
      toast.success(recipientLabel);
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('notifications.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notificationsService.remove(deleteTarget._id);
      toast.success(t('notifications.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('notifications.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle', { n: data.pagination?.total ?? 0 })}
        actions={canSend && <Button onClick={openCreate} icon="bellRing">{t('notifications.send')}</Button>}
      />

      <div className={styles.filterRow}>
        <select
          className={styles.select}
          dir={dir}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t('notifications.allTypes')}</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoading variant="list" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (data.data || []).length === 0 ? (
        <EmptyState
          icon="🔔"
          title={t('notifications.emptyTitle')}
          message={canSend ? t('notifications.emptyAdd') : undefined}
          onAction={canSend ? openCreate : undefined}
          actionLabel={t('notifications.emptyAction')}
        />
      ) : (
        <>
          <div className={styles.list}>
            {(data.data || []).map((n) => (
              <NotificationCard key={n._id} notification={n} canDelete={canDelete} onDelete={setDeleteTarget} />
            ))}
          </div>
          <Pagination
            page={data.pagination?.page || 1}
            pages={data.pagination?.pages || 1}
            total={data.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      {/* يُركّب عند الفتح فقط — يبدأ النموذج نظيفًا مع كل إرسال */}
      {modalOpen && (
        <NotificationFormModal
          open={modalOpen}
          submitting={submitting}
          onSend={handleSend}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('notifications.deleteTitle')}
        message={t('notifications.deleteMsg', { name: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('notifications.helpTitle')} body={t('notifications.helpBody')} />
    </PageLayout>
  );
}

export default Notifications;
