import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import cardTop from '../../assets/login/card-top.png';
import cardBottom from '../../assets/login/card-bottom.png';
import dividerImg from '../../assets/login/divider.png';
import emailEnvelope from '../../assets/login/email-envelope.png';
import passLock from '../../assets/login/pass-lock.png';
import remCheckbox from '../../assets/login/rem-checkbox.png';
import remText from '../../assets/login/rem-text.png';
import remForgot from '../../assets/login/rem-forgot.png';
import btnContent from '../../assets/login/btn-content.png';
import googleContent from '../../assets/login/google-content.png';
import styles from './Login.module.css';
import { useLanguage } from '../../context/LanguageContext';

/* ══════════════════ MOBILE — flow layout from the same design assets ══════════════════ */
export default function LoginMobile({ logic }) {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, goForgot, goRegister, from,
  } = logic;
  const { t, toggleLang } = useLanguage();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.mPage} dir="rtl">
      {/* زر تبديل اللغة — نسخة الموبايل */}
      <button type="button" className={styles.mLangBtn} onClick={toggleLang} aria-label={t('auth.changeLang')}>
        {t('auth.langSwitchTo')}
      </button>
      <div className={styles.mCard}>
        <img src={cardTop} alt="" className={styles.mCardTop} draggable={false} />

        <form onSubmit={handleSubmit} noValidate className={styles.mForm}>
          <div className={`${styles.mField} ${errors.email ? styles.fieldError : ''}`}>
            <img src={emailEnvelope} alt="" className={styles.mIcon} draggable={false} />
            <input
              type="email"
              dir="ltr"
              placeholder="example@domain.com"
              autoComplete="email"
              aria-label="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <span className={styles.mError}>{errors.email}</span>}

          <div className={`${styles.mField} ${errors.password ? styles.fieldError : ''}`}>
            <img src={passLock} alt="" className={styles.mIcon} draggable={false} />
            <input
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              placeholder="كلمة المرور"
              autoComplete="current-password"
              aria-label="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.mEye}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff size={20} strokeWidth={2.2} /> : <Eye size={20} strokeWidth={2.2} />}
            </button>
          </div>
          {errors.password && <span className={styles.mError}>{errors.password}</span>}

          <div className={styles.mRow}>
            <label htmlFor="remember-check-m" className={styles.mRemember}>
              <input
                id="remember-check-m"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={styles.hiddenCheck}
              />
              {remember ? (
                <img src={remCheckbox} alt="" className={styles.mCheckImg} draggable={false} />
              ) : (
                <span className={styles.mUnchecked} />
              )}
              <img src={remText} alt="تذكرني" draggable={false} />
            </label>
            <a href="/forgot-password" onClick={goForgot} className={styles.mForgot}>
              <img src={remForgot} alt="نسيت كلمة المرور؟" draggable={false} />
            </a>
          </div>

          <button type="submit" className={styles.mSubmit} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} aria-label="جارٍ التحميل" />
            ) : (
              <img src={btnContent} alt="تسجيل الدخول" draggable={false} />
            )}
          </button>

          <img src={dividerImg} alt="" className={styles.mDivider} draggable={false} />

          <button type="button" className={styles.mGoogle} onClick={googleSoon}>
            <img src={googleContent} alt="تسجيل الدخول باستخدام Google" draggable={false} />
          </button>
          <a href="/register" onClick={goRegister} className={styles.mCreate}>
            {t('auth.createAccount')}
          </a>
        </form>

        <img src={cardBottom} alt="" className={styles.mCardBottom} draggable={false} />
      </div>
    </div>
  );
}
