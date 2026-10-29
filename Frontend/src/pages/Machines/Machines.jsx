import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import MachinesStats from '../../components/Machines/MachinesStats';
import MachinesFilters from '../../components/Machines/MachinesFilters';
import MachinesTable from '../../components/Machines/MachinesTable';
import MachineFormModal from '../../components/Machines/MachineFormModal';
import { machinesService } from '../../services/machines';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData, useDebouncedValue } from '../../hooks/useAsyncData';

function Machines() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('');
  // البحث والفلاتر من السيرفر — كانوا client-side على الصفحة المعروضة فقط
  const debouncedSearch = useDebouncedValue(search);

  const fetchMachines = useCallback(
    () => machinesService.getAll({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      governorate: governorateFilter || undefined,
    }),
    [page, debouncedSearch, statusFilter, governorateFilter],
  );
  const { data, loading, error, reload } = useAsyncData(fetchMachines, {
    initialData: { data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } },
  });

  const machines = data.data || [];

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

  const openEdit = (machine) => {
    setEditing(machine);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await machinesService.update(editing._id, payload);
        toast.success(t('machines.updated'));
      } else {
        await machinesService.create(payload);
        toast.success(t('machines.added'));
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('machines.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await machinesService.remove(deleteTarget._id);
      toast.success(t('machines.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('machines.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('machines.title')}
        subtitle={t('machines.subtitle', { n: data.pagination?.total ?? 0 })}
        actions={canManage && <Button onClick={openCreate} icon="add">{t('machines.add')}</Button>}
      />

      <MachinesStats machines={machines} />

      <MachinesFilters
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        status={statusFilter}
        onStatus={(v) => { setStatusFilter(v); setPage(1); }}
        governorate={governorateFilter}
        onGovernorate={(v) => { setGovernorateFilter(v); setPage(1); }}
        governorates={Array.from(new Set(machines.map((m) => m.governorate).filter(Boolean)))}
      />

      {loading ? (
        <SkeletonLoading variant="table" count={6} cols={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : machines.length === 0 ? (
        <EmptyState
          icon="⚙"
          title={t('machines.emptyTitle')}
          message={canManage ? t('machines.emptyAdd') : t('machines.emptyMatch')}
          onAction={canManage ? openCreate : undefined}
          actionLabel={t('machines.emptyAction')}
        />
      ) : (
        <>
          <MachinesTable
            machines={machines}
            onEdit={canManage ? openEdit : undefined}
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
        <MachineFormModal
          open={modalOpen}
          editing={editing}
          submitting={submitting}
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('machines.deleteTitle')}
        message={t('machines.deleteMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('machines.helpTitle')} body={t('machines.helpBody')} />
    </PageLayout>
  );
}

export default Machines;
