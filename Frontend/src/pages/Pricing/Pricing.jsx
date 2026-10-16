import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { pricingService } from '../../services/pricing';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Pricing.module.css';

const MATERIAL_OPTIONS = [
  { value: 'plastic',  label: 'بلاستيك',  icon: '♻', color: '#0d6c3d' },
  { value: 'glass',    label: 'زجاج',      icon: '🍾', color: '#0d6c3d' },
  { value: 'cardboard',label: 'كرتون',    icon: '📦', color: '#a06a10' },
  { value: 'paper',    label: 'ورق',       icon: '📄', color: '#9e9e9e' },
];

const MATERIAL_LABELS = Object.fromEntries(MATERIAL_OPTIONS.map((o) => [o.value, o.label]));
const MATERIAL_COLORS = Object.fromEntries(MATERIAL_OPTIONS.map((o) => [o.value, o.color]));

const EMPTY_FORM = {
  materialType: '',
  pricePerKg: '',
  currency: 'EGP',
  isActive: true,
};

function Pricing() {
  const { role } = useAuth();
  const canCreate = role === 'superAdmin';
  const canEdit = role === 'superAdmin';
  const canDelete = role === 'superAdmin';

  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const res = await pricingService.getAll();
      setPricings(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      materialType: p.materialType || '',
      pricePerKg: p.pricePerKg ?? '',
      currency: p.currency || 'EGP',
      isActive: p.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.materialType) {
      toast.error('يرجى اختيار نوع المادة');
      return;
    }
    if (!form.pricePerKg || Number(form.pricePerKg) < 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }
    const payload = {
      pricePerKg: Number(form.pricePerKg),
      currency: form.currency || 'EGP',
      isActive: form.isActive,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await pricingService.update(editing._id, payload);
        toast.success('تم تحديث السعر بنجاح');
      } else {
        await pricingService.create({ ...payload, materialType: form.materialType });
        toast.success('تمت إضافة السعر بنجاح');
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
      await pricingService.remove(deleteTarget._id);
      toast.success('تم حذف السعر');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await pricingService.update(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? 'تم إيقاف السعر' : 'تم تفعيل السعر');
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل التحديث');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="إدارة التسعير"
        subtitle="تحديد أسعار المواد القابلة للتدوير لكل كيلوجرام"
        actions={canCreate && <Button onClick={openCreate} icon="add">إضافة سعر</Button>}
      />

      {loading ? (
        <SkeletonLoading variant="cards" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : pricings.length === 0 ? (
        <EmptyState
          icon="$"
          title="لا توجد أسعار مُعرّفة"
          message={canCreate ? 'ابدأ بتحديد سعر لكل مادة من المواد الأربعة' : undefined}
          onAction={canCreate ? openCreate : undefined}
          actionLabel="+ إضافة سعر"
        />
      ) : (
        <div className={styles.grid}>
          {pricings.map((p) => {
            const meta = MATERIAL_OPTIONS.find((o) => o.value === p.materialType) || { icon: '♻', color: '#888', label: p.materialType };
            return (
              <div key={p._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.materialIcon} style={{ background: `${MATERIAL_COLORS[p.materialType]}22`, color: MATERIAL_COLORS[p.materialType] }}>
                    {meta.icon}
                  </span>
                  <span className={`${styles.statusChip} ${p.isActive ? styles.active : styles.inactive}`}>
                    {p.isActive ? 'مفعّل' : 'متوقف'}
                  </span>
                </div>
                <h3 className={styles.materialName}>{MATERIAL_LABELS[p.materialType] || p.materialType}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{p.pricePerKg}</span>
                  <span className={styles.currency}>{p.currency || 'EGP'} / كجم</span>
                </div>
                <p className={styles.meta}>آخر تحديث: {new Date(p.updatedAt).toLocaleDateString('ar-EG')}</p>
                <div className={styles.cardActions}>
                  {canEdit && (
                    <button className={styles.editBtn} onClick={() => openEdit(p)}>تعديل</button>
                  )}
                  {canEdit && (
                    <button className={styles.toggleBtn} onClick={() => toggleActive(p)}>
                      {p.isActive ? 'إيقاف' : 'تفعيل'}
                    </button>
                  )}
                  {canDelete && (
                    <button className={styles.deleteBtn} onClick={() => setDeleteTarget(p)}>حذف</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل سعر المادة' : 'إضافة سعر مادة جديدة'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {!editing && (
            <Input
              as="select"
              label="نوع المادة"
              value={form.materialType}
              onChange={(e) => setForm({ ...form, materialType: e.target.value })}
              required
              options={MATERIAL_OPTIONS.filter((o) => !pricings.some((p) => p.materialType === o.value))}
            />
          )}
          {editing && (
            <div className={styles.fieldReadonly}>
              <label className={styles.label}>نوع المادة</label>
              <div className={styles.readonlyBox}>{MATERIAL_LABELS[editing.materialType]}</div>
            </div>
          )}
          <Input
            label="السعر لكل كيلوجرام"
            type="number"
            min="0"
            step="0.01"
            value={form.pricePerKg}
            onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
            required
            placeholder="5.00"
          />
          <Input
            label="العملة"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            placeholder="EGP"
          />
          <Input
            as="select"
            label="الحالة"
            value={form.isActive ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'مفعّل' },
              { value: 'false', label: 'متوقف' },
            ]}
          />
          <div className={styles.actions}>
            <Button type="submit" loading={submitting}>
              {editing ? 'حفظ التعديلات' : 'إضافة السعر'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف السعر"
        message={`هل أنت متأكد من حذف سعر "${MATERIAL_LABELS[deleteTarget?.materialType] || deleteTarget?.materialType}"؟ لن يتم احتساب هذه المادة في الإيداعات الجديدة.`}
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

export default Pricing;
