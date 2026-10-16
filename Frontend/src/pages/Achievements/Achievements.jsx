import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { achievementsService } from '../../services/achievements';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Achievements.module.css';

const METRIC_OPTIONS = [
  { value: 'totalDeposits',  label: 'إجمالي الوزن المُعاد (كجم)' },
  { value: 'depositsCount',  label: 'عدد عمليات الإيداع' },
  { value: 'balance',        label: 'الرصيد (ج.م)' },
  { value: 'co2Saved',       label: 'ثاني أكسيد الكربون الموفّر (كجم)' },
];

const METRIC_LABELS = Object.fromEntries(METRIC_OPTIONS.map((o) => [o.value, o.label]));
const METRIC_UNITS = {
  totalDeposits: 'كجم',
  depositsCount: 'عملية',
  balance: 'ج.م',
  co2Saved: 'كجم',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  icon: '🏅',
  metric: 'totalDeposits',
  threshold: '',
  xpReward: '',
  badgeColor: '#0d6c3d',
  isActive: true,
};

function Achievements() {
  const { role } = useAuth();
  const canManage = role === 'superAdmin';
  const canDelete = role === 'superAdmin';

  const [achievements, setAchievements] = useState([]);
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
      const res = await achievementsService.getAll();
      setAchievements(res.data || []);
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

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name || '',
      description: a.description || '',
      icon: a.icon || '🏅',
      metric: a.metric || 'totalDeposits',
      threshold: a.threshold ?? '',
      xpReward: a.xpReward ?? '',
      badgeColor: a.badgeColor || '#0d6c3d',
      isActive: a.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('يرجى إدخال اسم الإنجاز');
      return;
    }
    if (!form.threshold || Number(form.threshold) < 0) {
      toast.error('يرجى إدخال قيمة حد صحيحة');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon || '🏅',
      metric: form.metric,
      threshold: Number(form.threshold),
      xpReward: Number(form.xpReward) || 0,
      badgeColor: form.badgeColor || '#0d6c3d',
      isActive: form.isActive,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await achievementsService.update(editing._id, payload);
        toast.success('تم تحديث الإنجاز');
      } else {
        await achievementsService.create(payload);
        toast.success('تمت إضافة الإنجاز');
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
      await achievementsService.remove(deleteTarget._id);
      toast.success('تم حذف الإنجاز');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (a) => {
    try {
      await achievementsService.update(a._id, { isActive: !a.isActive });
      toast.success(a.isActive ? 'تم إيقاف الإنجاز' : 'تم تفعيل الإنجاز');
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل التحديث');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="إدارة الإنجازات (Gamification)"
        subtitle={`${achievements.length} إنجاز مُعرّف — شارات يحصل عليها المستخدمون عند تحقيق أهداف التدوير`}
        actions={canManage && <Button onClick={openCreate} icon="add">إضافة إنجاز</Button>}
      />

      {loading ? (
        <SkeletonLoading variant="cards" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="لا توجد إنجازات"
          message={canManage ? 'ابدأ بإنشاء شارات تحفيزية للمستخدمين' : undefined}
          onAction={canManage ? openCreate : undefined}
          actionLabel="+ إضافة إنجاز"
        />
      ) : (
        <div className={styles.grid}>
          {achievements.map((a) => (
            <div key={a._id} className={styles.card} style={{ borderTopColor: a.badgeColor }}>
              <div className={styles.cardHead}>
                <div className={styles.badgeIcon} style={{ background: `${a.badgeColor}22`, color: a.badgeColor }}>
                  {a.icon}
                </div>
                <div className={styles.cardHeadText}>
                  <h3 className={styles.name}>{a.name}</h3>
                  <span className={styles.metric}>{METRIC_LABELS[a.metric] || a.metric}</span>
                </div>
                <span className={`${styles.statusChip} ${a.isActive ? styles.active : styles.inactive}`}>
                  {a.isActive ? 'مفعّل' : 'متوقف'}
                </span>
              </div>

              {a.description && <p className={styles.description}>{a.description}</p>}

              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>الحد المطلوب</span>
                  <span className={styles.statValue}>
                    {a.threshold} {METRIC_UNITS[a.metric] || ''}
                  </span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>المكافأة</span>
                  <span className={styles.statValue}>{a.xpReward} ج.م</span>
                </div>
              </div>

              {canManage && (
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(a)}>تعديل</button>
                  <button className={styles.toggleBtn} onClick={() => toggleActive(a)}>
                    {a.isActive ? 'إيقاف' : 'تفعيل'}
                  </button>
                  {canDelete && (
                    <button className={styles.deleteBtn} onClick={() => setDeleteTarget(a)}>حذف</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل الإنجاز' : 'إضافة إنجاز جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="اسم الإنجاز"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="مثال: بطل التدوير"
          />
          <Input
            as="textarea"
            label="الوصف"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="ما الذي يحققه المستخدم للحصول على هذا الإنجاز؟"
          />
          <div className={styles.row2}>
            <Input
              label="الأيقونة (إيموجي)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🏅"
            />
            <Input
              label="لون الشارة"
              type="color"
              value={form.badgeColor}
              onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
            />
          </div>
          <Input
            as="select"
            label="المقياس (المعيار)"
            value={form.metric}
            onChange={(e) => setForm({ ...form, metric: e.target.value })}
            options={METRIC_OPTIONS}
          />
          <div className={styles.row2}>
            <Input
              label="الحد المطلوب"
              type="number"
              min="0"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              required
              placeholder="50"
            />
            <Input
              label="المكافأة (ج.م)"
              type="number"
              min="0"
              value={form.xpReward}
              onChange={(e) => setForm({ ...form, xpReward: e.target.value })}
              placeholder="75"
            />
          </div>
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
              {editing ? 'حفظ التعديلات' : 'إضافة الإنجاز'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الإنجاز"
        message={`هل أنت متأكد من حذف إنجاز "${deleteTarget?.name}"؟`}
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

export default Achievements;
