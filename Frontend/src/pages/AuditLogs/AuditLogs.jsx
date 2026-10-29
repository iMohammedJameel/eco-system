import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { auditService } from '../../services/audit';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './AuditLogs.module.css';

const ACTION_ICONS = {
  'auth.login':     { icon: 'user',        labelKey: 'audit.actLogin' },
  'auth.logout':    { icon: 'logout',      labelKey: 'audit.actLogout' },
  'user.create':    { icon: 'users',       labelKey: 'audit.actUserCreate' },
  'user.update':    { icon: 'users',       labelKey: 'audit.actUserUpdate' },
  'user.delete':    { icon: 'delete',      labelKey: 'audit.actUserDelete' },
  'machine.create': { icon: 'building',    labelKey: 'audit.actMachineCreate' },
  'machine.update': { icon: 'building',    labelKey: 'audit.actMachineUpdate' },
  'machine.delete': { icon: 'delete',      labelKey: 'audit.actMachineDelete' },
  'pricing.create': { icon: 'pricing',     labelKey: 'audit.actPricingCreate' },
  'pricing.update': { icon: 'pricing',     labelKey: 'audit.actPricingUpdate' },
  'pricing.delete': { icon: 'delete',      labelKey: 'audit.actPricingDelete' },
  'partner.create': { icon: 'partners',    labelKey: 'audit.actPartnerCreate' },
  'partner.update': { icon: 'partners',    labelKey: 'audit.actPartnerUpdate' },
  'partner.delete': { icon: 'delete',      labelKey: 'audit.actPartnerDelete' },
  'coupon.issue':   { icon: 'ticket',      labelKey: 'audit.actCouponIssue' },
  'coupon.redeem':  { icon: 'ticket',      labelKey: 'audit.actCouponRedeem' },
  'coupon.cancel':  { icon: 'ticket',      labelKey: 'audit.actCouponCancel' },
  'issue.update':   { icon: 'wrench',      labelKey: 'audit.actIssueUpdate' },
  'report.export':  { icon: 'download',    labelKey: 'audit.actReportExport' },
};

/** مفاتيح ترجمة فلاتر النوع (targetType) */
const TARGET_KEYS = {
  auth: 'audit.catAuth',
  user: 'audit.catUser',
  machine: 'audit.catMachine',
  pricing: 'audit.catPricing',
  partner: 'audit.catPartner',
  coupon: 'audit.catCoupon',
  issue: 'audit.catIssue',
  system: 'audit.catSystem',
};

function formatDateTime(iso, lang = 'ar') {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AuditLogs() {
  const { t, lang } = useLanguage();
  const [page, setPage] = useState(1);
  const [targetFilter, setTargetFilter] = useState('');

  const fetchLogs = useCallback(
    () => auditService.getAll({ page, limit: 20, targetType: targetFilter }),
    [page, targetFilter],
  );
  const { data, loading, error, reload } = useAsyncData(fetchLogs, {
    initialData: { data: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } },
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('audit.title')}
        subtitle={t('audit.subtitle')}
      />

      {/* فلاتر النوع */}
      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${targetFilter === '' ? styles.chipActive : ''}`}
          onClick={() => { setTargetFilter(''); setPage(1); }}
        >
          {t('common.all')}
        </button>
        {['auth', 'user', 'machine', 'pricing', 'partner', 'coupon', 'issue', 'system'].map((c) => (
          <button
            key={c}
            className={`${styles.chip} ${targetFilter === c ? styles.chipActive : ''}`}
            onClick={() => { setTargetFilter(c); setPage(1); }}
          >
            {t(TARGET_KEYS[c])}
          </button>
        ))}
      </div>

      {loading && <SkeletonLoading variant="table" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title={t('audit.emptyTitle')}
              message={t('audit.emptyMsg')}
              icon="history"
            />
          ) : (
            <div className={styles.timeline}>
              {data.data.map((log) => {
                const meta = ACTION_ICONS[log.action] || { icon: 'info' };
                return (
                  <div key={log._id} className={styles.item}>
                    <span className={styles.itemIcon}>
                      <Icon name={meta.icon} size={15} />
                    </span>
                    <div className={styles.itemBody}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemAction}>{meta.labelKey ? t(meta.labelKey) : log.action}</span>
                        <span className={styles.itemTarget}>{log.targetLabel}</span>
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.actor}>
                          <Icon name="user" size={11} />
                          {log.actor?.name || '—'}
                          {log.actor?.role === 'superAdmin' && <small> ({t('navbar.roleSuperAdmin')})</small>}
                          {log.actor?.role === 'operationsManager' && <small> ({t('navbar.roleOperations')})</small>}
                        </span>
                        <span className={styles.time}>
                          <Icon name="clock" size={11} />
                          {formatDateTime(log.createdAt, lang)}
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
              page={data.pagination.page}
              pages={data.pagination.pages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}

export default AuditLogs;
