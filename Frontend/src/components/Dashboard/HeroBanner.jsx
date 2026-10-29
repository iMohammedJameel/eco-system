import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { localizeName } from '../../utils/localizeName';
import heroArt from '../../assets/hero-city.jpg';
import styles from './HeroBanner.module.css';

function HeroBanner() {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();
  // اسم متناسق مع لغة الواجهة — لو اسم الأدمن عربي والواجهة إنجليزية
  // نعرض لقب الدور المترجم (Super Admin) بدل الاسم الخام (المدير العام)
  const name = localizeName(profile?.username || profile?.name, profile?.role, lang, t)
    || t('dashboard.heroWelcome');

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.heroMorning')
    : hour < 17 ? t('dashboard.heroNoon') : t('dashboard.heroEvening');

  return (
    <section className={styles.hero} aria-label={t('dashboard.heroAria')}>
      <img src={heroArt} alt="" className={styles.art} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h2 className={styles.greeting}>
          {greeting} <span className={styles.name}>{name}</span> 👋
        </h2>
        <p className={styles.tagline}>{t('dashboard.heroTagline')}</p>
      </div>
    </section>
  );
}

export default HeroBanner;
