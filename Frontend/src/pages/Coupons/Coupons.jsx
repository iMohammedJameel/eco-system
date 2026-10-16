import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { useToast } from '../../context/ToastContext';
import { couponsService } from '../../services/coupons';
import { usersService } from '../../services/users';
import { partnersService } from '../../services/partners';
import styles from './Coupons.module.css';

const STATUS_META = {
  issued:   { label: 'مُصدر',     cls: 'issued' },
  redeemed: { label: 'مُستبدل',   cls: 'redeemed' },
  cancelled:{ label: 'ملغي',      cls: 'cancelled' },
  expired:  { label: 'منتهي',     cls: 'expired' },
};

const CATEGORY_LABELS = {
  supermarket: 'سوبرماركت', electronics: 'إلكترونيات', pharmacy: 'صيدلية',
  fashion: 'أزياء', food: 'مطاعم', services: 'خدمات', other: 'أخرى',
};

function statusOf(c) {
  if (c.status === 'issued' && c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return STATUS_META.expired;
  }
  return STATUS_META[c.status] || STATUS_META.issued;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Coupons() {
  const toast = useToast();

  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 12, pages: 1 }, stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // نموذج الإصدار
  const [issueOpen, setIssueOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ userId: '', partnerId: '', offerTitle: '', pointsCost: 40, validityDays: 30 });
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await couponsService.getAll({ page, limit: 12, status: statusFilter });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openIssue = async () => {
    setIssueOpen(true);
    if (users.length === 0 || partners.length === 0) {
      try {
        const [u, p] = await Promise.all([
          usersService.getAll({ limit: 100 }),
          partnersService.getAll({ limit: 100 }),
        ]);
        setUsers(u.data || []);
        setPartners(p.data || []);
      } catch {
        toast.error('تعذر تحميل المستخدمين والشركاء');
      }
    }
  };

  const selectedPartner = partners.find((p) => p._id === form.partnerId);

  const submitIssue = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.partnerId) {
      toast.error('اختر المستخدم والشريك أولًا');
      return;
    }
    setIssuing(true);
    try {
      // offerTitle فاضي → متتبعتش (السيرفر بيرفض النص الفاضي)
      const payload = { ...form, offerTitle: form.offerTitle?.trim() || undefined };
      const res = await couponsService.issue(payload);
      toast.success(`تم إصدار الكوبون ${res.data.coupon.code} — رصيد المستخدم: ${res.data.newBalance} ج.م`);
      setIssueOpen(false);
      setForm({ userId: '', partnerId: '', offerTitle: '', pointsCost: 40, validityDays: 30 });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIssuing(false);
    }
  };

  const handleRedeem = async (code) => {
    try {
      await couponsService.redeem(code);
      toast.success('تم تأكيد استبدال الكوبون');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('إلغاء الكوبون وإرجاع النقاط للمستخدم؟')) return;
    try {
      await couponsService.cancel(id);
      toast.success('تم إلغاء الكوبون وإرجاع النقاط');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="الكوبونات"
        subtitle="استبدال نقاط المستخدمين بكوبونات خصم عند الشركاء"
        actions={
          <button className={styles.issueBtn} onClick={openIssue}>
            <Icon name="add" size={16} />
            إصدار كوبون
          </button>
        }
      />

      {/* إحصائيات سريعة */}
      <div className={styles.quickStats}>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{data.stats?.issued ?? 0}</span>
          <span className={styles.qsLabel}>قابلة للاستبدال</span>
        </div>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{data.stats?.redeemed ?? 0}</span>
          <span className={styles.qsLabel}>تم استبدالها</span>
        </div>
        <div className={styles.qs}>
          <span className={styles.qsValue}>{(data.stats?.totalPoints ?? 0).toLocaleString('en-US')}</span>
          <span className={styles.qsLabel}>إجمالي النقاط المستبدلة</span>
        </div>
      </div>

      {/* فلاتر */}
      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${statusFilter === '' ? styles.chipActive : ''}`}
          onClick={() => { setStatusFilter(''); setPage(1); }}
        >
          الكل
        </button>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            className={`${styles.chip} ${statusFilter === key ? styles.chipActive : ''}`}
            onClick={() => { setStatusFilter(key === 'expired' ? 'issued' : key); setPage(1); }}
          >
            {meta.label}
          </button>
        ))}
      </div>

      {loading && <SkeletonLoading variant="table" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title="لا توجد كوبونات"
              description="ابدأ بإصدار كوبون لمستخدم من زر «إصدار كوبون»"
              icon="ticket"
            />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>المستخدم</th>
                    <th>الشريك</th>
                    <th>العرض</th>
                    <th>النقاط</th>
                    <th>الحالة</th>
                    <th>الانتهاء</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((c) => {
                    const st = statusOf(c);
                    return (
                      <tr key={c._id}>
                        <td><span className={styles.code}>{c.code}</span></td>
                        <td>
                          <div className={styles.cellUser}>
                            <span>{c.user?.username || '—'}</span>
                            <small>{c.user?.phoneNumber || ''}</small>
                          </div>
                        </td>
                        <td>
                          <div className={styles.cellUser}>
                            <span>{c.partner?.name || '—'}</span>
                            <small>{CATEGORY_LABELS[c.partner?.category] || ''}</small>
                          </div>
                        </td>
                        <td className={styles.offerCell}>{c.offer?.title || '—'}</td>
                        <td className={styles.pointsCell}>{c.pointsCost}</td>
                        <td><span className={`${styles.status} ${styles[st.cls]}`}>{st.label}</span></td>
                        <td>{formatDate(c.expiresAt)}</td>
                        <td>
                          <div className={styles.actions}>
                            {c.status === 'issued' && (
                              <button className={styles.redeemBtn} onClick={() => handleRedeem(c.code)} title="تأكيد الاستبدال">
                                <Icon name="check" size={14} /> استبدال
                              </button>
                            )}
                            {c.status === 'issued' && (
                              <button className={styles.cancelBtn} onClick={() => handleCancel(c._id)} title="إلغاء وإرجاع النقاط">
                                <Icon name="close" size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data.pagination.pages > 1 && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* ═══ نموذج الإصدار ═══ */}
      {issueOpen && (
        <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="إصدار كوبون جديد">
          <form className={styles.form} onSubmit={submitIssue}>
            <label className={styles.field}>
              <span>المستخدم</span>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
              >
                <option value="">— اختر المستخدم —</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username} ({u.balance?.toFixed?.(0) ?? 0} ج.م)
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>الشريك</span>
              <select
                value={form.partnerId}
                onChange={(e) => setForm({ ...form, partnerId: e.target.value, offerTitle: '' })}
                required
              >
                <option value="">— اختر الشريك —</option>
                {partners.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>العرض</span>
              <select
                value={form.offerTitle}
                onChange={(e) => setForm({ ...form, offerTitle: e.target.value })}
              >
                <option value="">— العرض الافتراضي —</option>
                {(selectedPartner?.discountOffers || []).filter((o) => o.isActive).map((o) => (
                  <option key={o._id} value={o.title}>{o.title}</option>
                ))}
              </select>
            </label>

            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>التكلفة (نقاط)</span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={form.pointsCost}
                  onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>الصلاحية (يوم)</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.validityDays}
                  onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setIssueOpen(false)}>
                إلغاء
              </button>
              <button type="submit" className={styles.submitBtn} disabled={issuing}>
                {issuing ? 'جارٍ الإصدار...' : 'إصدار الكوبون'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

export default Coupons;
