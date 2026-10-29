import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import cardTopEn from '../../assets/login/card-top-en.png';
import cardBottomEn from '../../assets/login/card-bottom-en.png';
import emailEnvelope from '../../assets/login/email-envelope.png';
import passLock from '../../assets/login/pass-lock.png';
import styles from './LoginEnglish.module.css';
import { useLanguage } from '../../context/LanguageContext';

/* ══════════════════ MOBILE (EN) — flow layout from the same design assets ══════════════════
   نفس معمارية LoginMobile: كارت انسيابي من نفس قصاصات الديزاين (النسخ النظيفة
   من النصوص العربية) + النصوص الإنجليزية عناصر HTML حقيقية. */
export default function LoginEnglishMobile({ logic }) {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, goForgot, goRegister, from,
  } = logic;
  const { t, toggleLang } = useLanguage();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.mPage} dir="ltr">
      {/* language switcher — back to Arabic */}
      <button type="button" className={styles.mLangBtn} onClick={toggleLang} aria-label={t('auth.changeLang')}>
        {t('auth.langSwitchBack')}
      </button>

      <div className={styles.mCard}>
        {/* card top artwork (logo + wave — Arabic heading/subtitle removed) */}
        <img src={cardTopEn} alt="" className={styles.mCardTop} draggable={false} />

        {/* heading texts as HTML (the Arabic ones were baked in the artwork) */}
        <div className={styles.mHead}>
          <h2 className={styles.mHeading}>{t('auth.welcomeBack')}</h2>
          <p className={styles.mSubtitle}>{t('auth.signInSub')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.mForm}>
          <div className={`${styles.mField} ${errors.email ? styles.mFieldError : ''}`}>
            <img src={emailEnvelope} alt="" className={styles.mIcon} draggable={false} />
            <input
              type="email"
              dir="ltr"
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              aria-label={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <span className={styles.mError}>{errors.email}</span>}

          <div className={`${styles.mField} ${errors.password ? styles.mFieldError : ''}`}>
            <img src={passLock} alt="" className={styles.mIcon} draggable={false} />
            <input
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              placeholder={t('auth.password')}
              autoComplete="current-password"
              aria-label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.mEye}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff size={20} strokeWidth={2.2} /> : <Eye size={20} strokeWidth={2.2} />}
            </button>
          </div>
          {errors.password && <span className={styles.mError}>{errors.password}</span>}

          <div className={styles.mRow}>
            <label htmlFor="en-remember-check-m" className={styles.mRemember}>
              <input
                id="en-remember-check-m"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={styles.hiddenCheck}
              />
              {remember ? (
                <span className={styles.mChecked} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="5" fill="#0d6c3d" />
                    <path d="m7.5 12.5 3 3 6-6.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : (
                <span className={styles.mUnchecked} aria-hidden="true" />
              )}
              <span className={styles.mRememberText}>{t('auth.remember')}</span>
            </label>
            <a href="/forgot-password" onClick={goForgot} className={styles.mForgot}>
              {t('auth.forgot')}
            </a>
          </div>

          <button type="submit" className={styles.mSubmit} disabled={loading}>
            {loading ? (
              <span className={styles.mSpinner} aria-label={t('ui.loading')} />
            ) : (
              <>
                {t('auth.login')}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          {/* or-divider (HTML — the Arabic «أو» artwork was image-only) */}
          <div className={styles.mDivider} aria-hidden="true">
            <span className={styles.mDividerLine} />
            <span className={styles.mDividerText}>{t('auth.or')}</span>
            <span className={styles.mDividerLine} />
          </div>

          <button type="button" className={styles.mGoogle} onClick={googleSoon}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            <span>{t('auth.loginWithGoogle')}</span>
          </button>

          <a href="/register" onClick={goRegister} className={styles.mCreate}>
            {t('auth.createAccount')}
          </a>
        </form>

        {/* card bottom artwork (wave — Arabic footer removed) */}
        <img src={cardBottomEn} alt="" className={styles.mCardBottom} draggable={false} />
      </div>
    </div>
  );
}
