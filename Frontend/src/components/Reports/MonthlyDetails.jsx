import styles from './MonthlyDetails.module.css';

const monthLabels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function MonthlyDetails({ monthly = [] }) {
  // Show last 6 months (most recent first when API returns oldest-first)
  const recent = [...monthly].slice(-6).reverse();
  const months = recent.map((m) => monthLabels[(m._id?.month || 1) - 1] || `${m._id?.month}`);

  const rows = [
    {
      label: 'الإيرادات (ج.م)',
      values: recent.map((m) => Math.round(m.totalAmount || 0)),
      type: 'income',
    },
    {
      label: 'الوزن المعاد (كجم)',
      values: recent.map((m) => Math.round(m.totalWeight || 0)),
      type: 'income',
    },
    {
      label: 'عدد العمليات',
      values: recent.map((m) => m.count || 0),
      type: 'total',
    },
  ];

  if (recent.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.sub}>لا توجد بيانات شهرية</p>
          <h3 className={styles.title}>التفاصيل الشهرية</h3>
        </div>
        <p className={styles.empty}>لا توجد بيانات كافية</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>آخر {recent.length} أشهر</p>
        <h3 className={styles.title}>التفاصيل الشهرية</h3>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الفئة</th>
              {months.map((m) => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.type === 'total' ? styles.totalRow : ''}>
                <td className={styles.rowLabel}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className={row.type === 'total' ? styles.totalVal : styles.incomeVal}>
                    {v.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyDetails;
