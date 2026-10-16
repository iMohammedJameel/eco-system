import styles from './MachinesFilters.module.css';

function MachinesFilters({
  search = '',
  onSearch,
  status = '',
  onStatus,
  governorate = '',
  onGovernorate,
  governorates = [],
}) {
  return (
    <div className={styles.row}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="ابحث عن ماكينة بالاسم أو الموقع..."
          className={styles.input}
          dir="rtl"
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>
      <select
        className={styles.select}
        dir="rtl"
        value={status}
        onChange={(e) => onStatus?.(e.target.value)}
      >
        <option value="">جميع الحالات</option>
        <option value="active">نشطة</option>
        <option value="nearlyFull">شبه ممتلئة</option>
        <option value="offline">غير متصلة</option>
      </select>
      <select
        className={styles.select}
        dir="rtl"
        value={governorate}
        onChange={(e) => onGovernorate?.(e.target.value)}
      >
        <option value="">جميع المحافظات</option>
        {governorates.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  );
}

export default MachinesFilters;
