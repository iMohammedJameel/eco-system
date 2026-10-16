import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { auditService } from '../../services/audit';
import styles from './AuditLogs.module.css';

const ACTION_ICONS = {
  'auth.login':     { icon: 'user',        label: 'تسجيل دخول' },
  'auth.logout':    { icon: 'logout',      label: 'تسجيل خروج' },
  'user.create':    { icon: 'users',       label: 'إنشاء مستخدم' },
  'user.update':    { icon: 'users',       label: 'تعديل مستخدم' },
  'user.delete':    { icon: 'delete',      label: 'حذف مستخدم' },
  'machine.create': { icon: 'building',    label: 'إضافة ماكينة' },
  'machine.update': { icon: 'building',    label: 'تعديل ماكينة' },
  'machine.delete': { icon: 'delete',      label: 'حذف ماكينة' },
  'pricing.create': { icon: 'pricing',     label: 'إضافة تسعيرة' },
  'pricing.update': { icon: 'pricing',     label: 'تعديل تسعيرة' },
  'pricing.delete': { icon: 'delete',      label: 'حذف تسعيرة' },
  'partner.create': { icon: 'partners',    label: 'إضافة شريك' },
  'partner.update': { icon: 'partners',    label: 'تعديل شريك' },
  'partner.delete': { icon: 'delete',      label: 'حذف شريك' },
  'coupon.issue':   { icon: 'ticket',      label: 'إصدار كوبون' },
  'coupon.redeem':  { icon: 'ticket',      label: 'استبدال كوبون' },
  'coupon.cancel':  { icon: 'ticket',      label: 'إلغاء كوبون' },
  'issue.update':   { icon: 'wrench',      label: 'تحديث بلاغ' },
  'report.export':  { icon: 'download',    label: 'تصدير تقرير' },
};

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AuditLogs() {
  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [targetFilter, setTargetFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditService.getAll({ page, limit: 20, targetType: targetFilter });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, targetFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <PageLayout>
      <PageHeader
        title="سجل النظام"
        subtitle="سجل تدقيق كامل لكل عمليات الإدارة — ميناء عمل إيه وإمتى"
      />

      {/* فلاتر النوع */}
      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${targetFilter === '' ? styles.chipActive : ''}`}
          onClick={() => { setTargetFilter(''); setPage(1); }}
        >
          الكل
        </button>
        {['auth', 'user', 'machine', 'pricing', 'partner', 'coupon', 'issue', 'system'].map((t) => (
          <button
            key={t}
            className={`${styles.chip} ${targetFilter === t ? styles.chipActive : ''}`}
            onClick={() => { setTargetFilter(t); setPage(1); }}
          >
            {({ auth: 'الدخول', user: 'المستخدمين', machine: 'الماكينات', pricing: 'التسعير', partner: 'الشركاء', coupon: 'الكوبونات', issue: 'البلاغات', system: 'النظام' })[t]}
          </button>
        ))}
      </div>

      {loading && <SkeletonLoading variant="table" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title="السجل فارغ"
              description="ستظهر هنا كل العمليات الإدارية تلقائيًا"
              icon="history"
            />
          ) : (
            <div className={styles.timeline}>
              {data.data.map((log) => {
                const meta = ACTION_ICONS[log.action] || { icon: 'info', label: log.action };
                return (
                  <div key={log._id} className={styles.item}>
                    <span className={styles.itemIcon}>
                      <Icon name={meta.icon} size={15} />
                    </span>
                    <div className={styles.itemBody}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemAction}>{meta.label}</span>
                        <span className={styles.itemTarget}>{log.targetLabel}</span>
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.actor}>
                          <Icon name="user" size={11} />
                          {log.actor?.name || '—'}
                          {log.actor?.role === 'superAdmin' && <small> (مدير عام)</small>}
                          {log.actor?.role === 'operationsManager' && <small> (مشرف عمليات)</small>}
                        </span>
                        <span className={styles.time}>
                          <Icon name="clock" size={11} />
                          {formatDateTime(log.createdAt)}
                        </span>
                        {log.ip && <span className={styles.ip}>IP: {log.ip}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
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
    </PageLayout>
  );
}

export default AuditLogs;
