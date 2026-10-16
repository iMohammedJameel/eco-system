import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { issuesService } from '../../services/issues';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Issues.module.css';

const TYPE_OPTIONS = [
  { value: 'broken',         label: 'ماكينة معطلة',         icon: '🔧', color: '#b3261e' },
  { value: 'full',           label: 'ماكينة ممتلئة',         icon: '📦', color: '#a06a10' },
  { value: 'jammed',         label: 'ماكينة عالقة',          icon: '⚡', color: '#9c27b0' },
  { value: 'dirty',          label: 'ماكينة متسخة',          icon: '🧹', color: '#0d6c3d' },
  { value: 'rejected_item',  label: 'رفض مادة صالحة',        icon: '✖',  color: '#ff5722' },
  { value: 'other',          label: 'أخرى',                  icon: '•',  color: '#607d8b' },
];

const STATUS_OPTIONS = [
  { value: 'open',        label: 'مفتوح',       className: 'statusOpen',       color: '#b3261e' },
  { value: 'in_progress', label: 'قيد المعالجة', className: 'statusProgress',  color: '#a06a10' },
  { value: 'resolved',    label: 'تم الحل',      className: 'statusResolved',   color: '#0d6c3d' },
  { value: 'dismissed',   label: 'مُستبعد',      className: 'statusDismissed',  color: '#9e9e9e' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'منخفضة', className: 'priorityLow' },
  { value: 'medium', label: 'متوسطة', className: 'priorityMedium' },
  { value: 'high',   label: 'عالية',  className: 'priorityHigh' },
];

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]));
const TYPE_ICONS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.icon]));
const TYPE_COLORS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.color]));
const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Issues() {
  const { role } = useAuth();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', priority: '', adminNotes: '' });
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        issuesService.getStats(),
        issuesService.getAll({
          page,
          limit: 15,
          status: statusFilter,
          type: typeFilter,
          priority: priorityFilter,
        }),
      ]);
      setStats(statsRes.data);
      setData(listRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (issue) => {
    setEditTarget(issue);
    setEditForm({
      status: issue.status,
      priority: issue.priority,
      adminNotes: issue.adminNotes || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await issuesService.update(editTarget._id, {
        status: editForm.status,
        priority: editForm.priority,
        adminNotes: editForm.adminNotes.trim(),
      });
      toast.success('تم تحديث البلاغ');
      setEditTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل التحديث');
    } finally {
      setSubmitting(false);
    }
  };

  const quickStatusUpdate = async (issue, newStatus) => {
    try {
      await issuesService.update(issue._id, { status: newStatus });
      toast.success(`تم تحديث الحالة إلى: ${STATUS_LABELS[newStatus]}`);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل التحديث');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await issuesService.remove(deleteTarget._id);
      toast.success('تم حذف البلاغ');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const statsCards = stats ? [
    { label: 'مفتوح', value: stats.open, color: '#b3261e', bg: '#f9e8e6' },
    { label: 'قيد المعالجة', value: stats.in_progress, color: '#a06a10', bg: '#f4efe2' },
    { label: 'تم الحل', value: stats.resolved, color: '#0d6c3d', bg: '#dcf0dc' },
    { label: 'مُستبعد', value: stats.dismissed, color: '#9e9e9e', bg: '#f0f4f3' },
    { label: 'أولوية عالية مفتوحة', value: stats.high_priority_open, color: '#92231d', bg: '#ffebee' },
  ] : [];

  return (
    <PageLayout>
      <PageHeader
        title="بلاغات أعطال الماكينات"
        subtitle={`إجمالي ${stats?.total ?? 0} بلاغ — ${stats?.open ?? 0} مفتوح، ${stats?.high_priority_open ?? 0} بأولوية عالية`}
      />

      {/* Stats row */}
      {stats && (
        <div className={styles.statsRow}>
          {statsCards.map((s) => (
            <div key={s.label} className={styles.statCard} style={{ background: s.bg }}>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.select}
          dir="rtl"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع الحالات</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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
        <select
          className={styles.select}
          dir="rtl"
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع الأولويات</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoading variant="list" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (data.data || []).length === 0 ? (
        <EmptyState
          icon="🔧"
          title="لا توجد بلاغات"
          message="لا توجد بلاغات مطابقة للفلاتر الحالية"
        />
      ) : (
        <>
          <div className={styles.list}>
            {(data.data || []).map((issue) => {
              const color = TYPE_COLORS[issue.type] || '#888';
              const icon = TYPE_ICONS[issue.type] || '•';
              const statusMeta = STATUS_OPTIONS.find((s) => s.value === issue.status) || {};
              const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === issue.priority) || {};
              return (
                <div key={issue._id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.typeIcon} style={{ background: `${color}22`, color }}>
                      {icon}
                    </span>
                    <div className={styles.cardHeadText}>
                      <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle}>{TYPE_LABELS[issue.type] || issue.type}</h3>
                        <span className={`${styles.statusChip} ${styles[statusMeta.className] || ''}`}>
                          {statusMeta.label || issue.status}
                        </span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          📍 {issue.machine?.name || '—'} — {issue.machine?.location || ''}
                        </span>
                        <span className={styles.metaItem}>
                          👤 {issue.user?.username || '—'}
                        </span>
                        <span className={styles.metaItem}>
                          📅 {formatDateTime(issue.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`${styles.priorityChip} ${styles[priorityMeta.className] || ''}`}>
                      {priorityMeta.label || issue.priority}
                    </span>
                  </div>

                  {issue.description && (
                    <p className={styles.description}>{issue.description}</p>
                  )}

                  {issue.adminNotes && (
                    <div className={styles.adminNotes}>
                      <span className={styles.adminNotesLabel}>ملاحظات الإدارة:</span>
                      <p>{issue.adminNotes}</p>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.footerInfo}>
                      {issue.resolvedBy && (
                        <span className={styles.resolvedBy}>
                          تم الحل بواسطة: {issue.resolvedBy.username} • {formatDateTime(issue.resolvedAt)}
                        </span>
                      )}
                    </div>
                    {canManage && (
                      <div className={styles.cardActions}>
                        {issue.status === 'open' && (
                          <button
                            className={styles.actionBtn}
                            onClick={() => quickStatusUpdate(issue, 'in_progress')}
                          >
                            بدء المعالجة
                          </button>
                        )}
                        {issue.status !== 'resolved' && issue.status !== 'dismissed' && (
                          <>
                            <button
                              className={styles.resolveBtn}
                              onClick={() => quickStatusUpdate(issue, 'resolved')}
                            >
                              ✓ تم الحل
                            </button>
                            <button
                              className={styles.dismissBtn}
                              onClick={() => quickStatusUpdate(issue, 'dismissed')}
                            >
                              استبعاد
                            </button>
                          </>
                        )}
                        <button className={styles.editBtn} onClick={() => openEdit(issue)}>
                          تفاصيل/تعديل
                        </button>
                        {canDelete && (
                          <button className={styles.deleteBtn} onClick={() => setDeleteTarget(issue)}>
                            حذف
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="تعديل البلاغ"
        size="md"
      >
        {editTarget && (
          <>
            <div className={styles.editInfoBox}>
              <div className={styles.editInfoRow}>
                <strong>النوع:</strong> {TYPE_LABELS[editTarget.type] || editTarget.type}
              </div>
              <div className={styles.editInfoRow}>
                <strong>الماكينة:</strong> {editTarget.machine?.name} — {editTarget.machine?.location}
              </div>
              <div className={styles.editInfoRow}>
                <strong>المستخدم:</strong> {editTarget.user?.username} ({editTarget.user?.email})
              </div>
              {editTarget.description && (
                <div className={styles.editInfoRow}>
                  <strong>الوصف:</strong>
                  <p>{editTarget.description}</p>
                </div>
              )}
            </div>
            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.row2}>
                <Input
                  as="select"
                  label="الحالة"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
                <Input
                  as="select"
                  label="الأولوية"
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  options={PRIORITY_OPTIONS}
                />
              </div>
              <Input
                as="textarea"
                label="ملاحظات الإدارة"
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                rows={4}
                placeholder="اكتب ملاحظات حول الإجراء المتخذ..."
              />
              <div className={styles.actions}>
                <Button type="submit" loading={submitting}>حفظ التعديلات</Button>
                <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>إلغاء</Button>
              </div>
            </form>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف البلاغ"
        message="هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء."
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

export default Issues;
