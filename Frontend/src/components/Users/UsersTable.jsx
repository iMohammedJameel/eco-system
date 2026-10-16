import styles from './UsersTable.module.css';

const LEVEL_LABELS = {
  beginner:  { text: 'مبتدئ',  className: 'levelGray' },
  active:    { text: 'نشط',    className: 'levelActive' },
  good:      { text: 'خيّر',   className: 'levelGray' },
  excellent: { text: 'متميز',  className: 'levelGold' },
};

function getInitials(name = '') {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0])
    : name.slice(0, 2);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function UsersTable({ users = [], onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>البريد الإلكتروني</th>
            <th>رقم الهاتف</th>
            <th>إجمالي الوزن (كجم)</th>
            <th>الرصيد (ج.م)</th>
            <th>تاريخ التسجيل</th>
            <th>المستوى</th>
            <th>الحالة</th>
            {(onEdit || onDelete) && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const lvl = LEVEL_LABELS[u.level] || LEVEL_LABELS.beginner;
            return (
              <tr key={u._id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{getInitials(u.username)}</div>
                    <span>{u.username}</span>
                  </div>
                </td>
                <td className={styles.email}>{u.email}</td>
                <td className={styles.phone} dir="ltr">{u.phoneNumber}</td>
                <td>{Math.round(u.totalDeposits || 0).toLocaleString('en-US')}</td>
                <td className={styles.balance}>{(u.balance || 0).toFixed(2)}</td>
                <td className={styles.date}>{formatDate(u.createdAt)}</td>
                <td>
                  <span className={`${styles.level} ${styles[lvl.className]}`}>{lvl.text}</span>
                </td>
                <td>
                  <span className={u.isActive ? styles.statusActive : styles.statusSuspended}>
                    {u.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td>
                    <div className={styles.actionsCell}>
                      {onEdit && (
                        <button className={styles.editBtn} onClick={() => onEdit(u)}>تعديل</button>
                      )}
                      {onDelete && (
                        <button className={styles.deleteBtn} onClick={() => onDelete(u)}>حذف</button>
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
