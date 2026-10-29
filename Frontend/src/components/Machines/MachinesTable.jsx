import { useLanguage } from '../../context/LanguageContext';
import styles from './MachinesTable.module.css';

const STATUS_KEYS = {
  active:     { labelKey: 'machines.statsActive',   className: 'statusActive',  icon: '✔' },
  nearlyFull: { labelKey: 'dashboard.statusNearlyFull', className: 'statusWarning', icon: '⚠' },
  offline:    { labelKey: 'machines.statsOffline',  className: 'statusOffline', icon: '✖' },
};

const fillColor = (pct) => {
  if (pct == null) return '#bbb';
  if (pct >= 85) return '#b3261e';
  if (pct >= 70) return '#a06a10';
  return '#0d6c3d';
};

/* مصنع دالة "منذ X" — خارج المكوّن حتى لا تُعدّ استدعاء غير نقي أثناء الرسم */
function makeTimeAgo(t) {
  return (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t('dashboard.justNow');
    if (min < 60) return t('dashboard.minutesAgo', { n: min });
    const hr = Math.floor(min / 60);
    if (hr < 24) return t('dashboard.hoursAgo', { n: hr });
    return t('dashboard.daysAgo', { n: Math.floor(hr / 24) });
  };
}

function MachinesTable({ machines = [], onEdit, onDelete }) {
  const { t } = useLanguage();
  const timeAgo = makeTimeAgo(t);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>{t('machines.thName')}</th>
            <th>{t('machines.thLocation')}</th>
            <th>{t('machines.thGovernorate')}</th>
            <th>{t('machines.thStatus')}</th>
            <th>{t('machines.thFill')}</th>
            <th>{t('machines.thLastUpdate')}</th>
            {(onEdit || onDelete) && <th>{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {machines.map((m, idx) => {
            const st = STATUS_KEYS[m.status] || STATUS_KEYS.active;
            return (
              <tr key={m._id}>
                <td>{idx + 1}</td>
                <td title={m.name}>
                  <div className={styles.machineName}>
                    <span>⚙</span>
                    {m.name}
                  </div>
                </td>
                <td title={m.location}>
                  <span className={styles.location}>📍 {m.location}</span>
                </td>
                <td>{m.governorate}</td>
                <td>
                  <span className={`${styles.status} ${styles[st.className]}`}>
                    {st.icon} {t(st.labelKey)}
                  </span>
                </td>
                <td>
                  {m.status !== 'offline' ? (
                    <div className={styles.fillCell}>
                      <div className={styles.barBg}>
                        <div className={styles.bar} style={{ width: `${m.fillPercentage ?? 0}%`, background: fillColor(m.fillPercentage) }} />
                      </div>
                      <span className={styles.fillPct}>{m.fillPercentage ?? 0}%</span>
                    </div>
                  ) : <span className={styles.dash}>—</span>}
                </td>
                <td className={styles.lastSend}>{timeAgo(m.lastPingAt || m.updatedAt)}</td>
                {(onEdit || onDelete) && (
                  <td>
                    <div className={styles.actionsCell}>
                      {onEdit && (
                        <button className={styles.editBtn} onClick={() => onEdit(m)}>{t('common.edit')}</button>
                      )}
                      {onDelete && (
                        <button className={styles.deleteBtn} onClick={() => onDelete(m)}>{t('common.delete')}</button>
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

export default MachinesTable;
