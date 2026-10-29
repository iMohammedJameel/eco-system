import { useLanguage } from '../../context/LanguageContext';
import styles from './WelcomeCard.module.css';

/** كارت الترحيب — ماكينة خضراء صلبة زي الديزاين */
function WelcomeCard() {
  const { t } = useLanguage();

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{t('dashboard.welcomeTitle')}</h3>
        <p className={styles.desc}>{t('dashboard.welcomeDesc')}</p>
      </div>
      <svg className={styles.bin} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="14" y="18" width="36" height="38" rx="5" fill="#0d6c3d" />
        <rect x="10" y="12" width="44" height="7" rx="3.5" fill="#074e29" />
        <rect x="26" y="7" width="12" height="5" rx="2.5" fill="#074e29" />
        <path d="M24 26v20M32 26v20M40 26v20" stroke="#dcf0dc" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
        <path d="M50 44l9-9v18z" fill="#79c032" />
      </svg>
    </div>
  );
}

export default WelcomeCard;
