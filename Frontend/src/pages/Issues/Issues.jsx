import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import IssuesStats from '../../components/Issues/IssuesStats';
import IssuesFilters from '../../components/Issues/IssuesFilters';
import IssueCard from '../../components/Issues/IssueCard';
import IssueEditModal from '../../components/Issues/IssueEditModal';
import { STATUS_LABEL_KEYS } from '../../components/Issues/issueMeta';
import { issuesService } from '../../services/issues';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './Issues.module.css';

const EMPTY_PAGINATION = { total: 0, page: 1, limit: 15, pages: 1 };

function Issues() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';
  const toast = useToast();

  // ── الفلاتر ──
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // ── الجلب: إحصائيات + قائمة في طلب واحد متوازي ──
  const fetchAll = useCallback(
    () => Promise.all([
      issuesService.getStats(),
      issuesService.getAll({
        page,
        limit: 15,
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
      }),
    ]),
    [page, statusFilter, typeFilter, priorityFilter],
  );
  const { data, loading, error, reload } = useAsyncData(fetchAll, {
    initialData: [null, { data: [], pagination: EMPTY_PAGINATION }],
  });
  const [statsRes, listRes] = data || [null, { data: [], pagination: EMPTY_PAGINATION }];
  const stats = statsRes?.data ?? null;
  const issues = listRes?.data || [];

  // ── التعديل والحذف ──
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await issuesService.update(editTarget._id, payload);
      toast.success(t('issues.updated'));
      setEditTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('issues.updateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const quickStatusUpdate = async (issue, newStatus) => {
    try {
      await issuesService.update(issue._id, { status: newStatus });
      toast.success(t('issues.statusUpdatedTo', { status: t(STATUS_LABEL_KEYS[newStatus] || newStatus) }));
      await reload();
    } catch (err) {
      toast.error(err.message || t('issues.updateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await issuesService.remove(deleteTarget._id);
      toast.success(t('issues.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('issues.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('issues.title')}
        subtitle={t('issues.subtitle', {
          total: stats?.total ?? 0,
          open: stats?.open ?? 0,
          high: stats?.high_priority_open ?? 0,
        })}
      />

      <IssuesStats stats={stats} />

      <IssuesFilters
        status={statusFilter}
        onStatus={(v) => { setStatusFilter(v); setPage(1); }}
        type={typeFilter}
        onType={(v) => { setTypeFilter(v); setPage(1); }}
        priority={priorityFilter}
        onPriority={(v) => { setPriorityFilter(v); setPage(1); }}
      />

      {loading ? (
        <SkeletonLoading variant="list" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : issues.length === 0 ? (
        <EmptyState
          icon="🔧"
          title={t('issues.emptyTitle')}
          message={t('issues.emptyMsg')}
        />
      ) : (
        <>
          <div className={styles.list}>
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                canManage={canManage}
                canDelete={canDelete}
                onQuickStatus={quickStatusUpdate}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <Pagination
            page={listRes?.pagination?.page || 1}
            pages={listRes?.pagination?.pages || 1}
            total={listRes?.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      {/* Edit modal — key بيعيد تهيئة النموذج مع كل بلاغ */}
      {editTarget && (
        <IssueEditModal
          key={editTarget._id}
          issue={editTarget}
          submitting={submitting}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('issues.deleteTitle')}
        message={t('issues.deleteMsg')}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('issues.helpTitle')} body={t('issues.helpBody')} />
    </PageLayout>
  );
}

export default Issues;
