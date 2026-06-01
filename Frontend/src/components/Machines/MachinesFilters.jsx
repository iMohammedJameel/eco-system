import styles from './MachinesFilters.module.css';

function MachinesFilters() {
  return (
    <div className={styles.row}>
      <div className={styles.searchBox}>
        <input type="text" placeholder="ابحث عن ماكينة..." className={styles.input} dir="rtl" />
        <span className={styles.searchIcon}>🔍</span>
      </div>
      <select className={styles.select} dir="rtl">
        <option>جميع الحالات</option>
        <option>نشطة</option>
        <option>شبه ممتلئة</option>
        <option>غير متصلة</option>
      </select>
      <select className={styles.select} dir="rtl">
        <option>جميع المحافظات</option>
        <option>القاهرة</option>
        <option>الإسكندرية</option>
        <option>المنصورة</option>
      </select>
    </div>
  );
}

export default MachinesFilters;
