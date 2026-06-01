import styles from './Navbar.module.css';

function Navbar() {
  return (
    <header className={styles.navbar} dir="rtl">
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>♻</div>
        <span className={styles.userName}>نقاء</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.roleBtn}>مشرف عمليات</button>
        <span className={styles.lang}>EN ⇄</span>
        <button className={styles.iconBtn}>
          🔔
          <span className={styles.badge} />
        </button>
        <button className={styles.iconBtn}>⚙</button>
        <div className={styles.avatar}>أ</div>
      </div>
    </header>
  );
}

export default Navbar;
