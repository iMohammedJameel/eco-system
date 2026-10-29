import { Leaf } from 'lucide-react';
import bgFull from '../../assets/login/bg-full.png';
import { useLanguage } from '../../context/LanguageContext';
import styles from './AuthShell.module.css';

/**
 * الهيكل المشترك لصفحات المصادقة (تسجيل / استعادة كلمة المرور):
 * العربية: خلفية التصميم المعتمد + الكارت + شعار EcoCycle.
 * الإنجليزية: خلفية نعناعية نظيفة (نفس الهوية) لأن نصوص التصميم
 * مخبوزة بالعربية داخل صورة الخلفية.
 */
export default function AuthShell({ children }) {
  const { t, dir, lang, toggleLang } = useLanguage();

  return (
    <div className={styles.page} dir={dir}>
      {lang === 'ar' ? (
        <div className={styles.bg} style={{ backgroundImage: `url(${bgFull})` }} aria-hidden="true" />
      ) : (
        <div className={styles.bgEn} aria-hidden="true" />
      )}
      {/* تبديل اللغة */}
      <button type="button" className={styles.langBtn} onClick={toggleLang} aria-label={t('auth.changeLang')}>
        {lang === 'ar' ? t('auth.langSwitchTo') : t('auth.langSwitchBack')}
      </button>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>
            <Leaf size={30} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className={styles.brandName}>
              <span>Eco</span>Cycle
            </h1>
            <p className={styles.brandSub}>{t('auth.brandSub')}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
