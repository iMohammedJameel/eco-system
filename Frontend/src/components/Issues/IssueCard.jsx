import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Issues/Issues.module.css';
import {
  TYPE_LABEL_KEYS,
  TYPE_ICONS,
  TYPE_COLORS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  formatDateTime,
} from './issueMeta';

/**
 * IssueCard — كارت بلاغ عطل واحد + أزرار الإجراءات السريعة.
 * مسؤولية العرض فقط — منطق التحديث عند الصفحة.
 *
 * @param {object}   issue        بيانات البلاغ
 * @param {boolean}  canManage    إظهار أزرار الإدارة
 * @param {boolean}  canDelete    إظهار زر الحذف
 * @param {function} onQuickStatus (issue, newStatus) => void
 * @param {function} onEdit       طلب فتح نافذة التفاصيل/التعديل
 * @param {function} onDelete     طلب الحذف
 */
function IssueCard({ issue, canManage, canDelete, onQuickStatus, onEdit, onDelete }) {
  const { t, lang } = useLanguage();
  const color = TYPE_COLORS[issue.type] || '#888';
  const icon = TYPE_ICONS[issue.type] || '•';
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === issue.status) || {};
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === issue.priority) || {};

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.typeIcon} style={{ background: `${color}22`, color }}>
          {icon}
        </span>
        <div className={styles.cardHeadText}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>{t(TYPE_LABEL_KEYS[issue.type] || issue.type || '')}</h3>
            <span className={`${styles.statusChip} ${styles[statusMeta.className] || ''}`}>
              {t(statusMeta.labelKey || issue.status || '')}
            </span>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaItem}>
              📍 {issue.machine?.name || '—'} — {issue.machine?.location || ''}
            </span>
            <span className={styles.metaItem}>
              👤 {issue.user?.username || '—'}
            </span>
            <span className={styles.metaItem}>
              📅 {formatDateTime(issue.createdAt, lang)}
            </span>
          </div>
        </div>
        <span className={`${styles.priorityChip} ${styles[priorityMeta.className] || ''}`}>
          {t(priorityMeta.labelKey || issue.priority || '')}
        </span>
      </div>

      {issue.description && (
        <p className={styles.description}>{issue.description}</p>
      )}

      {issue.adminNotes && (
        <div className={styles.adminNotes}>
          <span className={styles.adminNotesLabel}>{t('issues.adminNotesLabel')}</span>
          <p>{issue.adminNotes}</p>
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.footerInfo}>
          {issue.resolvedBy && (
            <span className={styles.resolvedBy}>
              {t('issues.resolvedBy', {
                user: issue.resolvedBy.username,
                time: formatDateTime(issue.resolvedAt, lang),
              })}
            </span>
          )}
        </div>
        {canManage && (
          <div className={styles.cardActions}>
            {issue.status === 'open' && (
              <button
                className={styles.actionBtn}
                onClick={() => onQuickStatus(issue, 'in_progress')}
              >
                {t('issues.actionStart')}
              </button>
            )}
            {issue.status !== 'resolved' && issue.status !== 'dismissed' && (
              <>
                <button
                  className={styles.resolveBtn}
                  onClick={() => onQuickStatus(issue, 'resolved')}
                >
                  {t('issues.actionResolve')}
                </button>
                <button
                  className={styles.dismissBtn}
                  onClick={() => onQuickStatus(issue, 'dismissed')}
                >
                  {t('issues.actionDismiss')}
                </button>
              </>
            )}
            <button className={styles.editBtn} onClick={() => onEdit(issue)}>
              {t('issues.actionDetails')}
            </button>
            {canDelete && (
              <button className={styles.deleteBtn} onClick={() => onDelete(issue)}>
                {t('common.delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueCard;
