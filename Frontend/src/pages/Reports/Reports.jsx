import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navbar from '../../components/layout/Navbar/Navbar';
import ReportsStats from '../../components/Reports/ReportsStats';
import RevenueChart from '../../components/Reports/RevenueChart';
import RevenueDonut from '../../components/Reports/RevenueDonut';
import MonthlyDetails from '../../components/Reports/MonthlyDetails';
import styles from './Reports.module.css';

function Reports() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.headerRight}>
            <h1 className={styles.pageTitle}>التقارير المالية</h1>
            <p className={styles.pageSubtitle}>نظرة شاملة على الأداء المالي للنظام</p>
          </div>
          <div className={styles.exportBtns}>
            <button className={styles.btnPdf}>↓ تصدير PDF</button>
            <button className={styles.btnExcel}>↓ تصدير Excel</button>
          </div>
        </div>

        <ReportsStats />

        <div className={styles.chartsRow}>
          <RevenueChart />
          <RevenueDonut />
        </div>

        <MonthlyDetails />
      </main>

      <button className={styles.helpBtn}>?</button>
    </div>
  );
}

export default Reports;
