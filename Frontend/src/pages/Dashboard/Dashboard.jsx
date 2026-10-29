import { useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import { ErrorState, SkeletonLoading } from '../../components/ui/EmptyState';
import HeroBanner from '../../components/Dashboard/HeroBanner';
import StatsCard from '../../components/Dashboard/StatsCard';
import RecyclingChart from '../../components/Dashboard/RecyclingChart';
import MachinesMap from '../../components/Dashboard/MachinesMap';
import TopMachines from '../../components/Dashboard/TopMachines';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import LeaderboardCard from '../../components/Dashboard/LeaderboardCard';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import MotivCard from '../../components/Dashboard/MotivCard';
import { statsService } from '../../services/stats';
import { transactionsService } from '../../services/transactions';
import { machinesService } from '../../services/machines';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { t } = useLanguage();

  const fetchAll = useCallback(
    () => Promise.all([
      statsService.getOverview(),
      statsService.getMonthly(),
      statsService.getTodayHourly(),
      statsService.getWeekDaily(),
      machinesService.getAll({ limit: 100 }),
      transactionsService.getAll({ limit: 8 }),
    ]),
    [],
  );
  const { data: all, loading, error, reload } = useAsyncData(fetchAll, { initialData: [null, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }] });

  const [ov, m, todayH, weekD, mch, tx] = all || [null, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const overview = ov?.data ?? null;
  const monthly = m?.data || [];
  const todayHourly = todayH?.data || [];
  const weekDaily = weekD?.data || [];
  const machines = mch?.data || [];
  const recent = tx?.data || [];

  if (loading) {
    return (
      <PageLayout>
        <SkeletonLoading variant="cards" count={1} />
        <div className={styles.statsRow}>
          <SkeletonLoading variant="stats" count={4} />
        </div>
        <div className={styles.chartsRow}>
          <SkeletonLoading variant="cards" count={1} />
          <SkeletonLoading variant="cards" count={1} />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  const stats = [
    {
      label: t('dashboard.statsUsers'),
      value: (overview?.users?.total ?? 0).toLocaleString('en-US'),
      trend: t('dashboard.statsUsersTrend', { n: overview?.users?.active ?? 0 }),
      trendDir: 'up',
      icon: 'users',
    },
    {
      label: t('dashboard.statsMachines'),
      value: `${overview?.machines?.active ?? 0} / ${overview?.machines?.total ?? 0}`,
      trend: t('dashboard.statsMachinesTrend', { n: overview?.machines?.total ?? 0 }),
      trendDir: 'up',
      icon: 'building',
    },
    {
      label: t('dashboard.statsRevenue'),
      value: `${(overview?.recycling?.totalRevenue ?? 0).toLocaleString('en-US')} ${t('dashboard.egp')}`,
      trend: t('dashboard.thisMonth'),
      trendDir: 'up',
      icon: 'pricing',
    },
    {
      label: t('dashboard.statsWeight'),
      value: `${(overview?.recycling?.totalWeightKg ?? 0).toLocaleString('en-US')} ${t('dashboard.kg')}`,
      trend: t('dashboard.totalRecycling'),
      trendDir: 'up',
      icon: 'recycle',
    },
  ];

  return (
    <PageLayout>
      <div className={styles.grid}>
        {/* ═══ العمود الرئيسي ═══ */}
        <div className={styles.mainCol}>
          <HeroBanner />

          <div className={styles.statsRow}>
            {stats.map((s) => (
              <StatsCard key={s.label} {...s} />
            ))}
          </div>

          <div className={styles.chartsRow}>
            <RecyclingChart todayHourly={todayHourly} weekDaily={weekDaily} monthly={monthly} />
            <MachinesMap machines={machines} />
          </div>

          <div className={styles.bottomRow}>
            <LeaderboardCard />
            <TopMachines machines={machines} />
          </div>
        </div>

        {/* ═══ عمود الودجت (296px) ═══ */}
        <aside className={styles.widgetsCol}>
          <WelcomeCard />
          <MotivCard />
          <RecentActivity activities={recent} />
        </aside>
      </div>
    </PageLayout>
  );
}

export default Dashboard;
