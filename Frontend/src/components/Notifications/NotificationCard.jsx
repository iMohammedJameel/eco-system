import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Notifications/Notifications.module.css';
import { TYPE_LABEL_KEYS, TYPE_ICONS, TYPE_COLORS } from './notificationMeta';

/** كارت إشعار واحد — عرض فقط، الحذف عبر onDelete */
export default function NotificationCard({ notification: n, canDelete, onDelete }) {
  const { t, lang } = useLanguage();
  const color = TYPE_COLORS[n.type] || '#888';
  const icon = TYPE_ICONS[n.type] || '•';

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.icon} style={{ background: `${color}22`, color }}>{icon}</span>
        <div className={styles.cardHeadText}>
          <h3 className={styles.title}>{n.title}</h3>
          <div className={styles.meta}>
            <span className={styles.typeChip} style={{ background: `${color}22`, color }}>
              {TYPE_LABEL_KEYS[n.type] ? t(TYPE_LABEL_KEYS[n.type]) : n.type}
            </span>
            <span className={styles.recipient}>
              {n.recipient === 'all' ? t('notifications.toAll', { n: n.recipientCount }) : t('notifications.toSpecific')}
            </span>
            <span className={styles.date}>
              {new Date(n.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        {canDelete && (
          <button className={styles.deleteBtn} onClick={() => onDelete(n)}>{t('common.delete')}</button>
        )}
      </div>
      <p className={styles.message}>{n.message}</p>
      {n.sentBy && (
        <p className={styles.sentBy}>
          {t('notifications.sentBy', { name: n.sentBy.username || '—' })}
        </p>
      )}
    </div>
  );
}
