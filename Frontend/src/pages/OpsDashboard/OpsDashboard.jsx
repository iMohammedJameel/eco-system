import { useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonLoading, ErrorState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import OpsKpiRow from '../../components/OpsDashboard/OpsKpiRow';
import OpsListPanel from '../../components/OpsDashboard/OpsListPanel';
import { ISSUE_TYPE_LABEL_KEYS, PRIORITY_LABEL_KEYS, formatHours, formatRelative } from '../../components/OpsDashboard/opsMeta';
import { statsService } from '../../services/stats';
import { issuesService } from '../../services/issues';
import { machinesService } from '../../services/machines';
import { partnersService } from '../../services/partners';
import { transactionsService } from '../../services/transactions';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './OpsDashboard.module.css';

function OpsDashboard() {
  const { t } = useLanguage();
  const fetchAll = useCallback(
    () => Promise.all([
      statsService.getOverview(),
      issuesService.getStats(),
      machinesService.getAll({ limit: 100 }),
      partnersService.getAll({ limit: 100 }),
      issuesService.getAll({ status: 'open', limit: 5 }),
      statsService.getMachineForecasts().catch(() => ({ data: [] })),
      transactionsService.getAll({ suspicious: 'true', limit: 5 }).catch(() => ({ data: [] })),
    ]),
    [],
  );
  const { data: all, loading, error, reload } = useAsyncData(fetchAll, {
    initialData: [null, null, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }],
  });
  const [overview, issues, mch, ptn, openIssues, fc, sus] = all;

  const stats = overview?.data ?? null;
  const issueStats = issues?.data ?? null;
  const machines = (mch?.data || []).filter((m) => m.status !== 'offline');
  const partners = ptn?.data || [];
  const recentIssues = openIssues?.data || [];
  const forecasts = fc?.data || [];
  const suspicious = sus?.data || [];

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title={t('ops.title')} subtitle={t('ops.subtitle')} />
        <SkeletonLoading variant="stats" count={4} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title={t('ops.title')} subtitle={t('ops.subtitle')} />
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  const fullMachines = machines.filter((m) => m.status === 'nearlyFull');
  const activePartners = partners.filter((p) => p.isActive);
  const urgentForecasts = forecasts.filter((f) => f.hoursToFull != null).slice(0, 5);

  const kpis = [
    { icon: 'users', value: stats?.users?.active ?? 0, labelKey: 'ops.kpiActiveUsers', bg: 'var(--c-primary-bg)', color: 'var(--c-primary)' },
    { icon: 'gauge', value: fullMachines.length, labelKey: 'ops.kpiNearlyFull', bg: 'var(--c-warning-bg)', color: 'var(--c-warning)' },
    { icon: 'issues', value: issueStats?.open ?? 0, labelKey: 'ops.kpiOpenIssues', bg: 'var(--c-danger-bg)', color: 'var(--c-danger)' },
    { icon: 'partners', value: activePartners.length, labelKey: 'ops.kpiActivePartners', bg: 'var(--c-primary-bg)', color: 'var(--c-primary-dark)' },
  ];

  const issueStatsSummary = [
    { label: t('ops.stOpen'), value: issueStats?.open ?? 0, color: 'var(--c-danger)' },
    { label: t('ops.stInProgress'), value: issueStats?.in_progress ?? 0, color: 'var(--c-warning)' },
    { label: t('ops.stResolved'), value: issueStats?.resolved ?? 0, color: 'var(--c-primary)' },
    { label: t('ops.stDismissed'), value: issueStats?.dismissed ?? 0, color: 'var(--c-text-muted)' },
    { label: t('ops.stHighPriority'), value: issueStats?.high_priority_open ?? 0, color: 'var(--c-danger-hover)' },
  ];

  return (
    <PageLayout>
      <PageHeader title={t('ops.title')} subtitle={t('ops.subtitleFull')} />

      {/* ═══ KPI ═══ */}
      <OpsKpiRow kpis={kpis} />

      {/* ═══ صفان: ماكينات + بلاغات ═══ */}
      <div className={styles.twoCol}>
        <OpsListPanel
          title={t('ops.machinesTitle')}
          badge={fullMachines.length}
          emptyKey="ops.machinesEmpty"
          items={fullMachines}
          renderItem={(m) => (
            <div key={m._id} className={styles.listItem}>
              <div className={styles.listItemIcon} style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning)' }}>
                <Icon name="building" size={17} />
              </div>
              <div className={styles.listItemText}>
                <p className={styles.listItemTitle}>{m.name}</p>
                <p className={styles.listItemSub}>{m.location} — {t('dashboard.mapFill', { n: Math.round(m.fillPercentage) })}</p>
              </div>
              <div className={styles.fillBar}>
                <div className={styles.fillBarInner} style={{ width: `${m.fillPercentage}%` }} />
              </div>
            </div>
          )}
        />

        <OpsListPanel
          title={t('ops.issuesTitle')}
          badge={{ text: issueStats?.open ?? 0, bg: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}
          emptyKey="ops.issuesEmpty"
          items={recentIssues}
          renderItem={(issue) => (
            <div key={issue._id} className={styles.listItem}>
              <div className={styles.listItemIcon} style={{
                background: issue.priority === 'high' ? 'var(--c-danger-bg)' : issue.priority === 'medium' ? 'var(--c-warning-bg)' : 'var(--c-primary-bg)',
                color: issue.priority === 'high' ? 'var(--c-danger)' : issue.priority === 'medium' ? 'var(--c-warning)' : 'var(--c-primary)',
              }}>
                <Icon name={issue.type === 'fraud' ? 'shieldAlert' : 'wrench'} size={17} />
              </div>
              <div className={styles.listItemText}>
                <p className={styles.listItemTitle}>{t(ISSUE_TYPE_LABEL_KEYS[issue.type] || issue.type)}</p>
                <p className={styles.listItemSub}>
                  {issue.machine?.name || t('ops.unknownMachine')} — {t('ops.priorityWith', { p: t(PRIORITY_LABEL_KEYS[issue.priority] || issue.priority) })}
                  {issue.createdAt && ` · ${formatRelative(issue.createdAt, t)}`}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* ═══ تنبؤ الامتلاء (تحليل تنبئي) + معاملات مشبوهة (كشف الاحتيال) ═══ */}
      <div className={styles.twoCol}>
        <OpsListPanel
          title={<><Icon name="zap" size={15} /> {t('ops.forecastTitle')}</>}
          badge={{ text: t('ops.urgentBadge', { n: forecasts.filter((f) => f.urgent).length }), bg: 'var(--c-warning-bg)', color: 'var(--c-warning)' }}
          emptyKey="ops.forecastEmpty"
          items={urgentForecasts}
          renderItem={(f) => (
            <div key={f.machineId} className={styles.listItem}>
              <div className={styles.listItemIcon} style={{
                background: f.urgent ? 'var(--c-danger-bg)' : 'var(--c-primary-bg)',
                color: f.urgent ? 'var(--c-danger)' : 'var(--c-primary)',
              }}>
                <Icon name="gauge" size={17} />
              </div>
              <div className={styles.listItemText}>
                <p className={styles.listItemTitle}>{f.name}</p>
                <p className={styles.listItemSub}>
                  {f.location} — {t('ops.avgPerDay', { n: f.avgKgPerDay, kg: t('dashboard.kg') })}
                </p>
              </div>
              <span className={`${styles.forecastChip} ${f.urgent ? styles.forecastUrgent : ''}`}>
                {formatHours(f.hoursToFull, t)}
              </span>
            </div>
          )}
        />

        <OpsListPanel
          title={<><Icon name="shieldAlert" size={15} /> {t('ops.fraudTitle')}</>}
          badge={{ text: suspicious.length, bg: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}
          emptyKey="ops.fraudEmpty"
          items={suspicious}
          renderItem={(tx) => (
            <div key={tx._id} className={styles.listItem}>
              <div className={styles.listItemIcon} style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}>
                <Icon name="shieldAlert" size={17} />
              </div>
              <div className={styles.listItemText}>
                <p className={styles.listItemTitle}>{tx.user?.username || t('ops.userFallback')}</p>
                <p className={styles.listItemSub}>
                  {tx.machine?.name || '—'} · {t('ops.egpAmount', { n: tx.amount, unit: t('dashboard.egp') })} · {formatRelative(tx.createdAt, t)}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* ═══ ملخص البلاغات ═══ */}
      <div className={styles.statsRow}>
        {issueStatsSummary.map((s) => (
          <div key={s.label} className={styles.statBox}>
            <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export default OpsDashboard;
