import { useLanguage } from '../../context/LanguageContext';
import styles from './MotivCard.module.css';

/** انسجم مع فكرتك الأخضر — ورقان غنية زي الديزاين */
function MotivCard() {
  const { t } = useLanguage();

  return (
    <div className={styles.card}>
      <div className={styles.leaves} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={styles.leaf1} fill="none">
          <path d="M6 21c3 0 7-1.5 9-5.5C17.5 11 17 6.5 14.5 4c.5 4-1 7-3.5 8.5C8.5 14 6.5 16 6 19z" fill="#dcf0dc" />
          <path d="M4 21c1.5-4 4-7 8-9-2 4-4.5 7-8 9z" fill="#a9c7b6" />
        </svg>
        <svg viewBox="0 0 24 24" className={styles.leaf2} fill="none">
          <path d="M6 21c3 0 7-1.5 9-5.5C17.5 11 17 6.5 14.5 4c.5 4-1 7-3.5 8.5C8.5 14 6.5 16 6 19z" fill="#c9e5cd" />
        </svg>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{t('dashboard.motivTitle')}</h3>
        <p className={styles.desc}>{t('dashboard.motivDesc')}</p>
      </div>
    </div>
  );
}

export default MotivCard;
