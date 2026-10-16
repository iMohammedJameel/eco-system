import styles from './MachinesTable.module.css';

const STATUS_LABELS = {
  active: { text: 'نشطة', className: 'statusActive', icon: '✔' },
  nearlyFull: { text: 'شبه ممتلئة', className: 'statusWarning', icon: '⚠' },
  offline: { text: 'غير متصلة', className: 'statusOffline', icon: '✖' },
};

const fillColor = (pct) => {
  if (pct == null) return '#bbb';
  if (pct >= 85) return '#b3261e';
  if (pct >= 70) return '#a06a10';
  return '#0d6c3d';
};

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'منذ لحظات';
  if (min < 60) return `منذ ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;
  return `منذ ${Math.floor(hr / 24)} يوم`;
}

function MachinesTable({ machines = [], onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الماكينة</th>
            <th>الموقع</th>
            <th>المحافظة</th>
            <th>الحالة</th>
            <th>امتلاء</th>
            <th>آخر تحديث</th>
            {(onEdit || onDelete) && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {machines.map((m, idx) => {
            const st = STATUS_LABELS[m.status] || STATUS_LABELS.active;
            return (
              <tr key={m._id}>
                <td>{idx + 1}</td>
                <td>
                  <div className={styles.machineName}>
                    <span>⚙</span>
                    {m.name}
                  </div>
                </td>
                <td>
                  <span className={styles.location}>📍 {m.location}</span>
                </td>
                <td>{m.governorate}</td>
                <td>
                  <span className={`${styles.status} ${styles[st.className]}`}>
                    {st.icon} {st.text}
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
                        <button className={styles.editBtn} onClick={() => onEdit(m)}>تعديل</button>
                      )}
                      {onDelete && (
                        <button className={styles.deleteBtn} onClick={() => onDelete(m)}>حذف</button>
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
