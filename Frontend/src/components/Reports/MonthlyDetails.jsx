import styles from './MonthlyDetails.module.css';

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];

const rows = [
  { label: 'إيرادات الإعلانات', values: [99000, 105750, 111600, 115200, 121500], type: 'income' },
  { label: 'شراكات الشركات',    values: [77000,  82250,  86800,  89600,  94500],  type: 'income' },
  { label: 'رصيد كربوني',       values: [44000,  47000,  49600,  51200,  54000],  type: 'income' },
  { label: 'مكافآت مدفوعة',     values: [-60500, -63900, -67900, -66500, -71250], type: 'expense' },
  { label: 'صيانة وتشغيل',      values: [-15400, -16150, -17200, -16750, -17900], type: 'expense' },
  { label: 'صافي الفائض',       values: [144100, 154950, 162900, 172750, 180850], type: 'total' },
];

function MonthlyDetails() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.sub}>آخر 5 أشهر (بالجنيه المصري)</p>
        <h3 className={styles.title}>التفاصيل الشهرية</h3>
      </div>
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
                <td key={i} className={
                  row.type === 'total' ? styles.totalVal :
                  row.type === 'expense' ? styles.expenseVal : styles.incomeVal
                }>
                  {v < 0 ? `-${Math.abs(v).toLocaleString()}` : v.toLocaleString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyDetails;
