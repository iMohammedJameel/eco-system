import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../ui/Icon';
import styles from '../../pages/Achievements/Achievements.module.css';
import { METRIC_LABEL_KEYS, METRIC_UNIT_KEYS } from './achievementMeta';

/** كارت إنجاز واحد — عرض فقط، الإجراءات عبر props */
export default function AchievementCard({ achievement: a, canManage, canDelete, onEdit, onToggle, onDelete }) {
  const { t } = useLanguage();

  return (
    <div className={styles.card} style={{ borderTopColor: a.badgeColor }}>
      <div className={styles.cardHead}>
        {/* أيقونة lucide حسب اسمها من الداتا — كانت بتترندر كنص خام ("sprout" كتابة) */}
        <div className={styles.badgeIcon} style={{ background: `${a.badgeColor}22`, color: a.badgeColor }}>
          <Icon name={a.icon} size={22} />
        </div>
        <div className={styles.cardHeadText}>
          <h3 className={styles.name}>{a.name}</h3>
          <span className={styles.metric}>{METRIC_LABEL_KEYS[a.metric] ? t(METRIC_LABEL_KEYS[a.metric]) : a.metric}</span>
        </div>
        <span className={`${styles.statusChip} ${a.isActive ? styles.active : styles.inactive}`}>
          {a.isActive ? t('achievements.enabled') : t('achievements.disabled')}
        </span>
      </div>

      {a.description && <p className={styles.description}>{a.description}</p>}

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>{t('achievements.statThreshold')}</span>
          <span className={styles.statValue}>
            {a.threshold} {METRIC_UNIT_KEYS[a.metric] ? t(METRIC_UNIT_KEYS[a.metric]) : ''}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>{t('achievements.statReward')}</span>
          <span className={styles.statValue}>{a.xpReward} {t('dashboard.egp')}</span>
        </div>
      </div>

      {canManage && (
        <div className={styles.cardActions}>
          <button className={styles.editBtn} onClick={() => onEdit(a)}>{t('common.edit')}</button>
          <button className={styles.toggleBtn} onClick={() => onToggle(a)}>
            {a.isActive ? t('achievements.deactivate') : t('achievements.activate')}
          </button>
          {canDelete && (
            <button className={styles.deleteBtn} onClick={() => onDelete(a)}>{t('common.delete')}</button>
          )}
        </div>
      )}
    </div>
  );
}
