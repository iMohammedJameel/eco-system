import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: '⊞', label: 'لوحة التحكم',    path: '/dashboard' },
  { icon: '⚙', label: 'الماكينات',       path: '/machines' },
  { icon: '👥', label: 'المستخدمين',     path: '/users' },
  { icon: '$',  label: 'التقارير المالية', path: '/reports' },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>♻</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>نقاء</span>
          <span className={styles.logoSub}>لوحة التحكم</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
