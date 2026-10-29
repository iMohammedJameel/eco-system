import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import UsersStats from '../../components/Users/UsersStats';
import UsersTable from '../../components/Users/UsersTable';
import UserFormModal from '../../components/Users/UserFormModal';
import { usersService } from '../../services/users';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData, useDebouncedValue } from '../../hooks/useAsyncData';
import styles from './Users.module.css';

function Users() {
  const { role } = useAuth();
  const { t, dir } = useLanguage();
  const canCreate = role === 'superAdmin';
  const canEdit = role === 'superAdmin';
  const canDelete = role === 'superAdmin';
  const toast = useToast();

  // ── فلاتر القائمة ──
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  // البحث من السيرفر (مع debounce) — كان client-side على الصفحة المعروضة فقط
  const debouncedSearch = useDebouncedValue(search);

  // ── الجلب عبر الهوك المشترك ──
  const fetchUsers = useCallback(
    () => usersService.getAll({ page, limit: 10, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  );
  const { data, loading, error, reload } = useAsyncData(fetchUsers, {
    initialData: { data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } },
  });

  // ── نموذج الإضافة/التعديل ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await usersService.update(editing._id, payload);
        toast.success(t('users.updated'));
      } else {
        await usersService.create(payload);
        toast.success(t('users.added'));
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('users.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersService.remove(deleteTarget._id);
      toast.success(t('users.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('users.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const users = data.data || [];

  return (
    <PageLayout>
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle', { n: data.pagination?.total ?? 0 })}
        actions={canCreate && <Button onClick={openCreate} icon="add">{t('users.add')}</Button>}
      />

      <UsersStats users={users} />

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder={t('users.searchPh')}
          className={styles.input}
          dir={dir}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {loading ? (
        <SkeletonLoading variant="table" count={6} cols={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title={debouncedSearch ? t('users.emptyMatch') : t('users.emptyTitle')}
          message={debouncedSearch
            ? t('users.emptySearch', { q: debouncedSearch })
            : (canCreate ? t('users.emptyAdd') : t('users.emptyNoData'))}
          onAction={canCreate && !debouncedSearch ? openCreate : undefined}
          actionLabel={t('users.emptyAction')}
        />
      ) : (
        <>
          <UsersTable
            users={users}
            onEdit={canEdit ? openEdit : undefined}
            onDelete={canDelete ? setDeleteTarget : undefined}
          />
          <Pagination
            page={data.pagination?.page || 1}
            pages={data.pagination?.pages || 1}
            total={data.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      {/* يُركّب عند الفتح فقط — يبدأ النموذج نظيفًا مع كل إضافة/تعديل */}
      {modalOpen && (
        <UserFormModal
          open={modalOpen}
          editing={editing}
          submitting={submitting}
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('users.deleteTitle')}
        message={t('users.deleteMsg', { name: deleteTarget?.username ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('users.helpTitle')} body={t('users.helpBody')} />
    </PageLayout>
  );
}

export default Users;
