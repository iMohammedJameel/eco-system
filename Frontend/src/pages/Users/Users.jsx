import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import UsersStats from '../../components/Users/UsersStats';
import UsersTable from '../../components/Users/UsersTable';
import { usersService } from '../../services/users';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Users.module.css';

const EMPTY_FORM = {
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  isActive: true,
};

function Users() {
  const { role } = useAuth();
  const canCreate = role === 'superAdmin';
  const canEdit = role === 'superAdmin';
  const canDelete = role === 'superAdmin';

  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

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
      const res = await usersService.getAll({ page, limit: 10 });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = (data.data || []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
      isActive: user.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!editing && !form.password) {
      toast.error('كلمة المرور مطلوبة عند الإنشاء');
      return;
    }

    const payload = editing
      ? {
          username: form.username.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        }
      : {
          username: form.username.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
        };

    setSubmitting(true);
    try {
      if (editing) {
        await usersService.update(editing._id, payload);
        toast.success('تم تحديث المستخدم');
      } else {
        await usersService.create(payload);
        toast.success('تمت إضافة المستخدم');
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
      await usersService.remove(deleteTarget._id);
      toast.success('تم حذف المستخدم');
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
        title="إدارة المستخدمين"
        subtitle={`إجمالي ${data.pagination?.total ?? 0} مستخدم مسجل`}
        actions={canCreate && <Button onClick={openCreate} icon="add">إضافة مستخدم</Button>}
      />

      <UsersStats users={data.data || []} />

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="ابحث عن مستخدم بالاسم أو رقم الهاتف أو البريد..."
          className={styles.input}
          dir="rtl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {loading ? (
        <SkeletonLoading variant="table" count={6} cols={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="لا يوجد مستخدمون"
          message={canCreate ? 'ابدأ بإضافة أول مستخدم' : 'لا توجد بيانات مطابقة'}
          onAction={canCreate ? openCreate : undefined}
          actionLabel="+ إضافة مستخدم"
        />
      ) : (
        <>
          <UsersTable
            users={filtered}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="اسم المستخدم"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="رقم الهاتف"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
            placeholder="01012345678"
          />
          <Input
            label={editing ? 'كلمة المرور (اتركها فارغة للإبقاء عليها)' : 'كلمة المرور'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />
          {editing && (
            <Input
              as="select"
              label="الحالة"
              value={form.isActive ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
              options={[
                { value: 'true', label: 'نشط' },
                { value: 'false', label: 'موقوف' },
              ]}
            />
          )}
          <div className={styles.actions}>
            <Button type="submit" loading={submitting}>
              {editing ? 'حفظ التعديلات' : 'إضافة المستخدم'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف "${deleteTarget?.username}"؟ سيتم حذف حسابه وكل بياناته نهائياً.`}
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

export default Users;
