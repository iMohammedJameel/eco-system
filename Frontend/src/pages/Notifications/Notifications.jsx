import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { notificationsService } from '../../services/notifications';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Notifications.module.css';

const TYPE_OPTIONS = [
  { value: 'system',        label: 'نظام',          icon: '⚙',  color: '#0d6c3d' },
  { value: 'earnings',      label: 'أرباح',          icon: '$',  color: '#0d6c3d' },
  { value: 'machine_alert', label: 'تنبيه ماكينة',   icon: '⚠',  color: '#a06a10' },
  { value: 'promo',         label: 'عرض ترويجي',     icon: '🎯', color: '#9c27b0' },
  { value: 'issue',         label: 'بلاغ',           icon: '🔧', color: '#b3261e' },
];

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]));
const TYPE_ICONS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.icon]));
const TYPE_COLORS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.color]));

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'system',
  recipient: 'all',
};

function Notifications() {
  const { role } = useAuth();
  const canSend = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsService.getAll({ page, limit: 10, type: typeFilter });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('يرجى ملء العنوان والرسالة');
      return;
    }
    setSubmitting(true);
    try {
      const res = await notificationsService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        recipient: form.recipient,
      });
      const recipientLabel = form.recipient === 'all'
        ? `جميع المستخدمين (${res.data?.recipientCount || 0})`
        : 'مستخدم محدد';
      toast.success(`تم إرسال الإشعار إلى ${recipientLabel}`);
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notificationsService.remove(deleteTarget._id);
      toast.success('تم حذف الإشعار');
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
        title="إدارة الإشعارات"
        subtitle={`إجمالي ${data.pagination?.total ?? 0} إشعار مُرسل`}
        actions={canSend && <Button onClick={openCreate} icon="bellRing">إرسال إشعار</Button>}
      />

      <div className={styles.filterRow}>
        <select
          className={styles.select}
          dir="rtl"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع الأنواع</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoading variant="list" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (data.data || []).length === 0 ? (
        <EmptyState
          icon="🔔"
          title="لا توجد إشعارات"
          message={canSend ? 'ابدأ بإرسال أول إشعار للمستخدمين' : undefined}
          onAction={canSend ? openCreate : undefined}
          actionLabel="+ إرسال إشعار"
        />
      ) : (
        <>
          <div className={styles.list}>
            {(data.data || []).map((n) => {
              const color = TYPE_COLORS[n.type] || '#888';
              const icon = TYPE_ICONS[n.type] || '•';
              return (
                <div key={n._id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.icon} style={{ background: `${color}22`, color }}>{icon}</span>
                    <div className={styles.cardHeadText}>
                      <h3 className={styles.title}>{n.title}</h3>
                      <div className={styles.meta}>
                        <span className={styles.typeChip} style={{ background: `${color}22`, color }}>
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                        <span className={styles.recipient}>
                          {n.recipient === 'all' ? `للجميع (${n.recipientCount})` : 'لمستخدم محدد'}
                        </span>
                        <span className={styles.date}>
                          {new Date(n.createdAt).toLocaleString('ar-EG', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    {canDelete && (
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(n)}>حذف</button>
                    )}
                  </div>
                  <p className={styles.message}>{n.message}</p>
                  {n.sentBy && (
                    <p className={styles.sentBy}>
                      أرسله: {n.sentBy.username || '—'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
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
        title="إرسال إشعار جديد"
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="عنوان الإشعار"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="مثال: عرض خاص لكل المستخدمين!"
            maxLength={120}
          />
          <Input
            as="textarea"
            label="نص الرسالة"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows={4}
            placeholder="اكتب الرسالة هنا..."
            maxLength={1000}
          />
          <div className={styles.row2}>
            <Input
              as="select"
              label="نوع الإشعار"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={TYPE_OPTIONS}
            />
            <Input
              as="select"
              label="المستلم"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              options={[
                { value: 'all', label: 'كل المستخدمين (بث عام)' },
              ]}
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" loading={submitting} icon="bellRing">
              إرسال الإشعار
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
          <p className={styles.hint}>
            💡 سيتم إرسال الإشعار فوراً لجميع المستخدمين النشطين. لا يمكن التراجع عن الإرسال.
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الإشعار"
        message={`هل أنت متأكد من حذف إشعار "${deleteTarget?.title}"؟ لن يتم حذفه من أجهزة المستخدمين، فقط من السجل.`}
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

export default Notifications;
