import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import MachinesStats from '../../components/Machines/MachinesStats';
import MachinesFilters from '../../components/Machines/MachinesFilters';
import MachinesTable from '../../components/Machines/MachinesTable';
import { machinesService } from '../../services/machines';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Machines.module.css';

const EMPTY_FORM = {
  name: '',
  location: '',
  governorate: '',
  lat: '',
  lng: '',
  status: 'active',
  fillPercentage: 0,
};

function Machines() {
  const { role } = useAuth();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await machinesService.getAll({ page, limit: 10 });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Client-side filtering on top of paginated response — simple and adequate for an admin tool
  const filtered = (data.data || []).filter((m) => {
    if (search && !(`${m.name} ${m.location} ${m.governorate}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    if (governorateFilter && m.governorate !== governorateFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (machine) => {
    setEditing(machine);
    setForm({
      name: machine.name || '',
      location: machine.location || '',
      governorate: machine.governorate || '',
      lat: machine.coordinates?.lat ?? '',
      lng: machine.coordinates?.lng ?? '',
      status: machine.status || 'active',
      fillPercentage: machine.fillPercentage ?? 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.governorate.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      governorate: form.governorate.trim(),
      coordinates: form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : undefined,
    };
    if (editing) {
      payload.status = form.status;
      payload.fillPercentage = Number(form.fillPercentage) || 0;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await machinesService.update(editing._id, payload);
        toast.success('تم تحديث الماكينة بنجاح');
      } else {
        await machinesService.create(payload);
        toast.success('تمت إضافة الماكينة بنجاح');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await machinesService.remove(deleteTarget._id);
      toast.success('تم حذف الماكينة');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="إدارة الماكينات"
        subtitle={`إجمالي ${data.pagination?.total ?? 0} ماكينة في النظام`}
        actions={canManage && <Button onClick={openCreate} icon="add">إضافة ماكينة</Button>}
      />

      <MachinesStats machines={data.data || []} />

      <MachinesFilters
        search={search}
        onSearch={setSearch}
        status={statusFilter}
        onStatus={setStatusFilter}
        governorate={governorateFilter}
        onGovernorate={setGovernorateFilter}
        governorates={Array.from(new Set((data.data || []).map((m) => m.governorate).filter(Boolean)))}
      />

      {loading ? (
        <SkeletonLoading variant="table" count={6} cols={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⚙"
          title="لا توجد ماكينات"
          message={canManage ? 'ابدأ بإضافة أول ماكينة' : 'لا توجد بيانات مطابقة'}
          onAction={canManage ? openCreate : undefined}
          actionLabel="+ إضافة ماكينة"
        />
      ) : (
        <>
          <MachinesTable
            machines={filtered}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل ماكينة' : 'إضافة ماكينة جديدة'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="اسم الماكينة"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="مثال: EcoCycle — مايدي ميترو"
          />
          <Input
            label="الموقع"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            placeholder="العنوان بالتفصيل"
          />
          <Input
            label="المحافظة"
            value={form.governorate}
            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
            required
            placeholder="القاهرة، الإسكندرية..."
          />
          <div className={styles.row2}>
            <Input
              label="خط العرض (lat)"
              type="number"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              placeholder="29.96"
              step="any"
            />
            <Input
              label="خط الطول (lng)"
              type="number"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              placeholder="31.26"
              step="any"
            />
          </div>
          {editing && (
            <div className={styles.row2}>
              <Input
                as="select"
                label="الحالة"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'active', label: 'نشطة' },
                  { value: 'nearlyFull', label: 'شبه ممتلئة' },
                  { value: 'offline', label: 'غير متصلة' },
                ]}
              />
              <Input
                label="نسبة الامتلاء"
                type="number"
                min="0"
                max="100"
                value={form.fillPercentage}
                onChange={(e) => setForm({ ...form, fillPercentage: e.target.value })}
              />
            </div>
          )}
          <div className={styles.actions}>
            <Button type="submit" loading={submitting}>
              {editing ? 'حفظ التعديلات' : 'إضافة الماكينة'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الماكينة"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel="حذف"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <button className={styles.helpBtn} title="مساعدة">?</button>
    </PageLayout>
  );
}

export default Machines;
