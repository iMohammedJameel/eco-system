import { useLanguage } from '../../context/LanguageContext';
import styles from './UsersTable.module.css';

const LEVEL_KEYS = {
  beginner:  { labelKey: 'users.lvlBeginner',  className: 'levelGray' },
  active:    { labelKey: 'users.lvlActive',    className: 'levelActive' },
  good:      { labelKey: 'users.lvlGood',      className: 'levelGray' },
  excellent: { labelKey: 'users.lvlExcellent', className: 'levelGold' },
};

function getInitials(name = '', fallback = '?') {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0])
    : name.slice(0, 2);
}

function UsersTable({ users = [], onEdit, onDelete }) {
  const { t, lang } = useLanguage();

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('users.thUser')}</th>
            <th>{t('users.thEmail')}</th>
            <th>{t('users.thPhone')}</th>
            <th>{t('users.thWeight')} ({t('users.kg')})</th>
            <th>{t('users.thBalance')} ({t('users.egp')})</th>
            <th>{t('users.thJoined')}</th>
            <th>{t('users.thLevel')}</th>
            <th>{t('users.thStatus')}</th>
            {(onEdit || onDelete) && <th>{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const lvl = LEVEL_KEYS[u.level] || LEVEL_KEYS.beginner;
            return (
              <tr key={u._id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{getInitials(u.username, t('users.anon'))}</div>
                    <span>{u.username}</span>
                  </div>
                </td>
                <td className={styles.email} dir="ltr">{u.email}</td>
                <td className={styles.phone} dir="ltr">{u.phoneNumber}</td>
                <td>{Math.round(u.totalDeposits || 0).toLocaleString('en-US')}</td>
                <td className={styles.balance}>{(u.balance || 0).toFixed(2)}</td>
                <td className={styles.date}>{formatDate(u.createdAt)}</td>
                <td>
                  <span className={`${styles.level} ${styles[lvl.className]}`}>{t(lvl.labelKey)}</span>
                </td>
                <td>
                  <span className={u.isActive ? styles.statusActive : styles.statusSuspended}>
                    {u.isActive ? t('users.stActive') : t('users.stSuspended')}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td>
                    <div className={styles.actionsCell}>
                      {onEdit && (
                        <button className={styles.editBtn} onClick={() => onEdit(u)}>{t('common.edit')}</button>
                      )}
                      {onDelete && (
                        <button className={styles.deleteBtn} onClick={() => onDelete(u)}>{t('common.delete')}</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
