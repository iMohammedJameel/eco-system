import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navbar from '../../components/layout/Navbar/Navbar';
import MachinesStats from '../../components/Machines/MachinesStats';
import MachinesFilters from '../../components/Machines/MachinesFilters';
import MachinesTable from '../../components/Machines/MachinesTable';
import styles from './Machines.module.css';

function Machines() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.headerRight}>
            <h1 className={styles.pageTitle}>إدارة الماكينات</h1>
            <p className={styles.pageSubtitle}>إجمالي 8 ماكينة في النظام</p>
          </div>
          <button className={styles.addBtn}>+ إضافة ماكينة</button>
        </div>

        <MachinesStats />
        <MachinesFilters />
        <MachinesTable />
      </main>

      <button className={styles.helpBtn}>?</button>
    </div>
  );
}

export default Machines;
