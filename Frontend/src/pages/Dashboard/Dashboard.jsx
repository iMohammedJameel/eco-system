import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navbar from '../../components/layout/Navbar/Navbar';
import StatsCard from '../../components/Dashboard/StatsCard';
import RecyclingChart from '../../components/Dashboard/RecyclingChart';
import MachinesMap from '../../components/Dashboard/MachinesMap';
import TopMachines from '../../components/Dashboard/TopMachines';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import styles from './Dashboard.module.css';

const stats = [
  { label: 'مستخدمون مسجلون', value: '4,328', badge: '24%', icon: '👥', iconBg: '#e8f5e9' },
  { label: 'ماكينات نشطة', value: '18 / 20', badge: '90%', icon: '⚙', iconBg: '#e8f5e9' },
  { label: 'الإيراد الإجمالي (ج.م)', value: '2,840,000', badge: '8%', icon: '$', iconBg: '#fff8e1' },
  { label: 'إجمالي العناصر المجمّعة', value: '127,450', badge: '12%', icon: '♻', iconBg: '#e8f5e9' },
];

function Dashboard() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>لوحة التحكم</h1>
          <p className={styles.pageSubtitle}>نظرة شاملة على أداء النظام</p>
        </div>

        <div className={styles.statsRow}>
          {stats.map((s) => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>

        <div className={styles.row}>
          <MachinesMap />
          <RecyclingChart />
        </div>

        <div className={styles.bottomRow}>
          <TopMachines />
          <RecentActivity />
        </div>
      </main>

      <button className={styles.helpBtn}>?</button>
    </div>
  );
}

export default Dashboard;
