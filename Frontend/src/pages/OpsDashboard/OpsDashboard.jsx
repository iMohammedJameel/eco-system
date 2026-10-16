import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { SkeletonLoading, ErrorState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { statsService } from '../../services/stats';
import { issuesService } from '../../services/issues';
import { machinesService } from '../../services/machines';
import { partnersService } from '../../services/partners';
import { transactionsService } from '../../services/transactions';
import styles from './OpsDashboard.module.css';

const ISSUE_TYPE_LABELS = {
  broken: 'معطلة', full: 'ممتلئة', jammed: 'عالقة', dirty: 'تحتاج تنظيف',
  rejected_item: 'رفضت خامات', fraud: 'نشاط مشبوه', other: 'أخرى',
};

const PRIORITY_LABELS = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };

function formatHours(h) {
  if (h == null) return 'غير متوقع';
  if (h < 24) return `خلال ${h} ساعة`;
  const d = Math.round(h / 24);
  return `خلال ${d} يوم`;
}

function formatRelative(iso) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `منذ ${min} د`;
  return `منذ ${Math.floor(min / 60)} س`;
}

function OpsDashboard() {
  const [stats, setStats] = useState(null);
  const [issueStats, setIssueStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [partners, setPartners] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, issues, mch, ptn, openIssues, fc, sus] = await Promise.all([
        statsService.getOverview(),
        issuesService.getStats(),
        machinesService.getAll({ limit: 100 }),
        partnersService.getAll({ limit: 100 }),
        issuesService.getAll({ status: 'open', limit: 5 }),
        statsService.getMachineForecasts().catch(() => ({ data: [] })),
        transactionsService.getAll({ suspicious: 'true', limit: 5 }).catch(() => ({ data: [] })),
      ]);
      setStats(overview.data || null);
      setIssueStats(issues.data || null);
      setMachines((mch.data || []).filter(m => m.status !== 'offline'));
      setPartners(ptn.data || []);
      setRecentIssues(openIssues.data || []);
      setForecasts(fc.data || []);
      setSuspicious(sus.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="لوحة العمليات" subtitle="مراقبة العمليات اليومية" />
        <SkeletonLoading variant="stats" count={4} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="لوحة العمليات" subtitle="مراقبة العمليات اليومية" />
        <ErrorState message={error} onRetry={load} />
      </PageLayout>
    );
  }

  const fullMachines = machines.filter(m => m.status === 'nearlyFull');
  const activePartners = partners.filter(p => p.isActive);
  const urgentForecasts = forecasts.filter(f => f.hoursToFull != null).slice(0, 5);

  return (
    <PageLayout>
      <PageHeader title="لوحة العمليات" subtitle="المهام ومؤشرات الأداء ومراقبة الأعطال — مع تحليل تنبؤي" />

      {/* ═══ KPI ═══ */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'var(--c-primary-bg)', color: 'var(--c-primary)' }}>
            <Icon name="users" size={22} />
          </div>
          <div>
            <p className={styles.kpiValue}>{stats?.users?.active ?? 0}</p>
            <p className={styles.kpiLabel}>مستخدم نشط</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning)' }}>
            <Icon name="gauge" size={22} />
          </div>
          <div>
            <p className={styles.kpiValue}>{fullMachines.length}</p>
            <p className={styles.kpiLabel}>ماكينة شبه ممتلئة</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}>
            <Icon name="issues" size={22} />
          </div>
          <div>
            <p className={styles.kpiValue}>{issueStats?.open ?? 0}</p>
            <p className={styles.kpiLabel}>بلاغ مفتوح</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'var(--c-primary-bg)', color: 'var(--c-primary-dark)' }}>
            <Icon name="partners" size={22} />
          </div>
          <div>
            <p className={styles.kpiValue}>{activePartners.length}</p>
            <p className={styles.kpiLabel}>شريك نشط</p>
          </div>
        </div>
      </div>

      {/* ═══ صفان: ماكينات + بلاغات ═══ */}
      <div className={styles.twoCol}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>ماكينات تحتاج تفريغ</h3>
            <span className={styles.countBadge}>{fullMachines.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {fullMachines.length === 0 ? (
              <p className={styles.emptyText}>كل الماكينات تعمل بكفاءة طبيعية.</p>
            ) : (
              fullMachines.map(m => (
                <div key={m._id} className={styles.listItem}>
                  <div className={styles.listItemIcon} style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning)' }}>
                    <Icon name="building" size={17} />
                  </div>
                  <div className={styles.listItemText}>
                    <p className={styles.listItemTitle}>{m.name}</p>
                    <p className={styles.listItemSub}>{m.location} — امتلاء {Math.round(m.fillPercentage)}%</p>
                  </div>
                  <div className={styles.fillBar}>
                    <div className={styles.fillBarInner} style={{ width: `${m.fillPercentage}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>أحدث البلاغات المفتوحة</h3>
            <span className={styles.countBadge} style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}>{issueStats?.open ?? 0}</span>
          </div>
          <div className={styles.sectionBody}>
            {recentIssues.length === 0 ? (
              <p className={styles.emptyText}>لا توجد بلاغات مفتوحة — كل حاجة تمام!</p>
            ) : (
              recentIssues.map(issue => (
                <div key={issue._id} className={styles.listItem}>
                  <div className={styles.listItemIcon} style={{
                    background: issue.priority === 'high' ? 'var(--c-danger-bg)' : issue.priority === 'medium' ? 'var(--c-warning-bg)' : 'var(--c-primary-bg)',
                    color: issue.priority === 'high' ? 'var(--c-danger)' : issue.priority === 'medium' ? 'var(--c-warning)' : 'var(--c-primary)',
                  }}>
                    <Icon name={issue.type === 'fraud' ? 'shieldAlert' : 'wrench'} size={17} />
                  </div>
                  <div className={styles.listItemText}>
                    <p className={styles.listItemTitle}>{ISSUE_TYPE_LABELS[issue.type] || issue.type}</p>
                    <p className={styles.listItemSub}>
                      {issue.machine?.name || 'ماكينة غير معروفة'} — أولوية {PRIORITY_LABELS[issue.priority] || issue.priority}
                      {issue.createdAt && ` · ${formatRelative(issue.createdAt)}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ جديد: تنبؤ الامتلاء (تحليل تنبئي) + معاملات مشبوهة (كشف الاحتيال) ═══ */}
      <div className={styles.twoCol}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Icon name="zap" size={15} /> تنبؤ الامتلاء — إجراء استباقي
            </h3>
            <span className={styles.countBadge} style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning)' }}>
              {forecasts.filter(f => f.urgent).length} عاجل
            </span>
          </div>
          <div className={styles.sectionBody}>
            {urgentForecasts.length === 0 ? (
              <p className={styles.emptyText}>لا توجد تنبؤات قريبة — معدلات الامتلاء منخفضة.</p>
            ) : (
              urgentForecasts.map(f => (
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
                      {f.location} — متوسط {f.avgKgPerDay} كجم/يوم
                    </p>
                  </div>
                  <span className={`${styles.forecastChip} ${f.urgent ? styles.forecastUrgent : ''}`}>
                    {formatHours(f.hoursToFull)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Icon name="shieldAlert" size={15} /> كشف الاحتيال — معاملات مشتبهة
            </h3>
            <span className={styles.countBadge} style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}>
              {suspicious.length}
            </span>
          </div>
          <div className={styles.sectionBody}>
            {suspicious.length === 0 ? (
              <p className={styles.emptyText}>لا توجد معاملات مشتبهة — النظام آمن.</p>
            ) : (
              suspicious.map(t => (
                <div key={t._id} className={styles.listItem}>
                  <div className={styles.listItemIcon} style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger)' }}>
                    <Icon name="shieldAlert" size={17} />
                  </div>
                  <div className={styles.listItemText}>
                    <p className={styles.listItemTitle}>{t.user?.username || 'مستخدم'}</p>
                    <p className={styles.listItemSub}>
                      {t.machine?.name || '—'} · {t.amount} ج.م · {formatRelative(t.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ ملخص البلاغات ═══ */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statValue} style={{ color: 'var(--c-danger)' }}>{issueStats?.open ?? 0}</span>
          <span className={styles.statLabel}>مفتوح</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue} style={{ color: 'var(--c-warning)' }}>{issueStats?.in_progress ?? 0}</span>
          <span className={styles.statLabel}>قيد المعالجة</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue} style={{ color: 'var(--c-primary)' }}>{issueStats?.resolved ?? 0}</span>
          <span className={styles.statLabel}>تم حله</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue} style={{ color: 'var(--c-text-muted)' }}>{issueStats?.dismissed ?? 0}</span>
          <span className={styles.statLabel}>مرفوض</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue} style={{ color: 'var(--c-danger-hover)' }}>{issueStats?.high_priority_open ?? 0}</span>
          <span className={styles.statLabel}>عالية الأولوية</span>
        </div>
      </div>
    </PageLayout>
  );
}

export default OpsDashboard;
