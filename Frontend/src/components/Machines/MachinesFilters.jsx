import { useLanguage } from '../../context/LanguageContext';
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
  const { t, dir } = useLanguage();

  return (
    <div className={styles.row}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder={t('machines.searchPh')}
          className={styles.input}
          dir={dir}
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>
      <select
        className={styles.select}
        dir={dir}
        value={status}
        onChange={(e) => onStatus?.(e.target.value)}
      >
        <option value="">{t('machines.allStatuses')}</option>
        <option value="active">{t('machines.statsActive')}</option>
        <option value="nearlyFull">{t('dashboard.statusNearlyFull')}</option>
        <option value="offline">{t('machines.statsOffline')}</option>
      </select>
      <select
        className={styles.select}
        dir={dir}
        value={governorate}
        onChange={(e) => onGovernorate?.(e.target.value)}
      >
        <option value="">{t('machines.allGovernorates')}</option>
        {governorates.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  );
}

export default MachinesFilters;
