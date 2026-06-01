import styles from './MachinesTable.module.css';

const machines = [
  { id: 1, name: 'ماكينة المترو - مصر الجديدة', location: 'محطة هليوبوليس', status: 'نشطة', fill: 67, lastSend: 'منذ 5 د', action: 'تفاصيل' },
  { id: 2, name: 'ماكينة سوق العتبة', location: 'القاهرة الكبرى', status: 'شبه ممتلئة', fill: 89, lastSend: 'منذ 12 د', action: 'إشعار' },
  { id: 3, name: 'ماكينة محطة رمسيس', location: 'القاهرة', status: 'غير متصلة', fill: null, lastSend: 'منذ 3 س', action: 'إصلاح' },
  { id: 4, name: 'ماكينة مدينة نصر', location: 'سيتي ستارز', status: 'نشطة', fill: 45, lastSend: 'منذ 2 د', action: 'تفاصيل' },
  { id: 5, name: 'ماكينة التحرير', location: 'ميدان التحرير', status: 'نشطة', fill: 52, lastSend: 'منذ 8 د', action: 'تفاصيل' },
  { id: 6, name: 'ماكينة المعادي', location: 'محطة المعادي', status: 'شبه ممتلئة', fill: 91, lastSend: 'منذ 15 د', action: 'إشعار' },
  { id: 7, name: 'ماكينة الإسكندرية', location: 'محطة الرمل', status: 'نشطة', fill: 38, lastSend: 'منذ 4 د', action: 'تفاصيل' },
  { id: 8, name: 'ماكينة المنصورة', location: 'جامعة المنصورة', status: 'نشطة', fill: 62, lastSend: 'منذ 10 د', action: 'تفاصيل' },
];

const statusConfig = {
  'نشطة':        { className: 'statusActive',    icon: '✔' },
  'شبه ممتلئة': { className: 'statusWarning',   icon: '⚠' },
  'غير متصلة':  { className: 'statusOffline',   icon: '✖' },
};

const fillColor = (pct) => {
  if (pct >= 85) return '#e53935';
  if (pct >= 70) return '#f59e0b';
  return '#1a5c3a';
};

function MachinesTable() {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الماكينة</th>
            <th>الموقع</th>
            <th>الحالة</th>
            <th>امتلاء</th>
            <th>آخر إرسال</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>
                <div className={styles.machineName}>
                  <span>⚙</span>
                  {m.name}
                </div>
              </td>
              <td>
                <span className={styles.location}>📍 {m.location}</span>
              </td>
              <td>
                <span className={`${styles.status} ${styles[statusConfig[m.status].className]}`}>
                  {statusConfig[m.status].icon} {m.status}
                </span>
              </td>
              <td>
                {m.fill !== null ? (
                  <div className={styles.fillCell}>
                    <div className={styles.barBg}>
                      <div className={styles.bar} style={{ width: `${m.fill}%`, background: fillColor(m.fill) }} />
                    </div>
                    <span className={styles.fillPct}>{m.fill}%</span>
                  </div>
                ) : <span className={styles.dash}>—</span>}
              </td>
              <td className={styles.lastSend}>{m.lastSend}</td>
              <td>
                <button className={styles.actionBtn}>{m.action}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MachinesTable;
