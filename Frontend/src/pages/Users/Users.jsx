import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navbar from '../../components/layout/Navbar/Navbar';
import UsersStats from '../../components/Users/UsersStats';
import UsersTable from '../../components/Users/UsersTable';
import styles from './Users.module.css';

function Users() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>إدارة المستخدمين</h1>
          <p className={styles.pageSubtitle}>إجمالي 8 مستخدم مسجل</p>
        </div>

        <UsersStats />

        <div className={styles.searchBox}>
          <input type="text" placeholder="ابحث عن مستخدم بالاسم أو رقم الهاتف..." className={styles.input} dir="rtl" />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <UsersTable />
      </main>

      <button className={styles.helpBtn}>?</button>
    </div>
  );
}

export default Users;
