import { useEffect, useState } from 'react';
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
import styles from './Dashboard.module.css';

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [machines, setMachines] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, m, mch, tx] = await Promise.all([
        statsService.getOverview(),
        statsService.getMonthly(),
        machinesService.getAll({ limit: 100 }),
        transactionsService.getAll({ limit: 8 }),
      ]);
      setOverview(ov.data || null);
      setMonthly(m.data || []);
      setMachines(mch.data || []);
      setRecent(tx.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

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
        <ErrorState message={error} onRetry={loadAll} />
      </PageLayout>
    );
  }

  const stats = [
    {
      label: 'المستخدمين',
      value: (overview?.users?.total ?? 0).toLocaleString('en-US'),
      trend: `${overview?.users?.active ?? 0} نشط`,
      trendDir: 'up',
      icon: 'users',
    },
    {
      label: 'الماكينات',
      value: `${overview?.machines?.active ?? 0} / ${overview?.machines?.total ?? 0}`,
      trend: `${overview?.machines?.total ?? 0} مركز`,
      trendDir: 'up',
      icon: 'building',
    },
    {
      label: 'الإيراد الإجمالي',
      value: `${(overview?.recycling?.totalRevenue ?? 0).toLocaleString('en-US')} ج.م`,
      trend: 'هذا الشهر',
      trendDir: 'up',
      icon: 'pricing',
    },
    {
      label: 'الوزن المجمّع',
      value: `${(overview?.recycling?.totalWeightKg ?? 0).toLocaleString('en-US')} كجم`,
      trend: 'إجمالي التدوير',
      trendDir: 'up',
      icon: 'recycle',
    },
  ];

  const monthLabels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const chartData = (monthly || []).map((m) => ({
    x: monthLabels[(m._id.month || 1) - 1] || `${m._id.month}`,
    y: Math.round(m.totalWeight || 0),
  }));

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
            <RecyclingChart data={chartData} />
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
