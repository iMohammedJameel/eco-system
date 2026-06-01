import styles from './UsersTable.module.css';

const users = [
  { initials: 'أم', name: 'أحمد محمد',    phone: '01XXXXXXX1', deposits: 156, balance: '39.00', date: 'يناير ٢٠٢٦',   level: 'نشط',  levelColor: 'levelActive',  status: 'نشط' },
  { initials: 'فع', name: 'فاطمة علي',    phone: '01XXXXXXX2', deposits: 203, balance: '51.50', date: 'فبراير ٢٠٢٦',  level: 'متميز',levelColor: 'levelGold',   status: 'نشط' },
  { initials: 'مح', name: 'محمد حسن',     phone: '01XXXXXXX3', deposits: 89,  balance: '22.25', date: 'مارس ٢٠٢٦',    level: 'نشط',  levelColor: 'levelActive',  status: 'نشط' },
  { initials: 'سم', name: 'سارة محمود',   phone: '01XXXXXXX4', deposits: 312, balance: '78.00', date: 'يناير ٢٠٢٦',   level: 'خير',  levelColor: 'levelGray',   status: 'نشط' },
  { initials: 'عج', name: 'عمر خالد',     phone: '01XXXXXXX5', deposits: 45,  balance: '11.25', date: 'أبريل ٢٠٢٦',   level: 'مبتدئ',levelColor: 'levelGray',   status: 'نشط' },
  { initials: 'نأ', name: 'نور أحمد',     phone: '01XXXXXXX6', deposits: 178, balance: '44.50', date: 'فبراير ٢٠٢٦',  level: 'متميز',levelColor: 'levelGold',   status: 'نشط' },
  { initials: 'يع', name: 'ياسمين عبدالله',phone: '01XXXXXXX7', deposits: 421, balance: '105.25',date: 'ديسمبر ٢٠٢٥', level: 'خير',  levelColor: 'levelGray',   status: 'نشط' },
];

function UsersTable() {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>رقم الهاتف</th>
            <th>إجمالي الإيداعات</th>
            <th>الرصيد</th>
            <th>تاريخ التسجيل</th>
            <th>المستوى</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.phone}>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatar}>{u.initials}</div>
                  <span>{u.name}</span>
                </div>
              </td>
              <td className={styles.phone}>{u.phone}</td>
              <td>{u.deposits} زجاجة</td>
              <td className={styles.balance}>ج.م {u.balance}</td>
              <td className={styles.date}>{u.date}</td>
              <td>
                <span className={`${styles.level} ${styles[u.levelColor]}`}>{u.level}</span>
              </td>
              <td>
                <span className={styles.statusActive}>نشط</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
