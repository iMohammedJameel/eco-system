import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

/* ── English variants of the approved-design artwork (Arabic text removed) ── */
import bgFullEn from '../../assets/login/bg-full-en.png';
import langSelectorEn from '../../assets/login/lang-selector-en.png';
import cardBgEn from '../../assets/login/card-bg-en.png';
import emailBoxEn from '../../assets/login/email-box-en.png';
import passBoxEn from '../../assets/login/pass-box-en.png';
import btnBgEn from '../../assets/login/btn-bg-en.png';
import googleBgEn from '../../assets/login/google-bg-en.png';

import styles from './LoginEnglish.module.css';
import { boxStyle, vh } from './designCoords';
import { useLanguage } from '../../context/LanguageContext';

/* ══════════════════ DESKTOP (EN) — same pixel-perfect design as Arabic ══════════════════
   نفس معمارية LoginDesktop بالظبط: خلفية التصميم المعتمد + كارت + حقول وأزرار
   قصاصات من نفس الديزاين، والعناصر التفاعلية طبقات شفافة على نفس الإحداثيات.
   الفرق الوحيد: الصور نسخ -en نظيفة (النصوص العربية المخبوزة اتشالت)
   والنصوص الإنجليزية بتتعرض كطبقات HTML على نفس مواضع نظيراتها العربية. */
/* ═══ أيقونات حادة فوق الرسم المخبوز ═══
   القصاصات الصورية فيها أيقونات مخبوزة منخفضة الدقة (قفل/مغلف/عين)
   بتتضبّب لما الشاشة أكبر من التصميم (1536×1024).
   الحل: رقعة بلون خلفية الحقل #fbf8f3 تغطي المخبوز + أيقونة lucide SVG
   حادة على أي مقاس. الإحداثيات مقاسة بالبكسل من القصاصة الأصلية. */
function FieldIcon({ Icon, box, size, color, testId }) {
  const [x0, y0, x1, y1] = box;
  return (
    <span className={styles.fieldIconPatch} style={boxStyle(box)} aria-hidden="true" data-testid={testId}>
      <Icon size={size} strokeWidth={2} color={color} />
    </span>
  );
}

export default function LoginEnglish({ logic }) {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, goForgot, goRegister, from,
  } = logic;
  const { t, toggleLang } = useLanguage();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.page} dir="ltr">
      {/* page background = the approved design (Arabic hero texts removed) */}
      <div className={styles.bg} style={{ backgroundImage: `url(${bgFullEn})` }} aria-hidden="true" />

      {/* ── hero texts (HTML layer on the cleaned photo side) ── */}
      <div className={styles.heroLayer}>
        <h1 className={styles.heroHeading} style={boxStyle([372, 214, 700, 340])}>
          Join us in sensing<br />
          the impact of sustainability
        </h1>
        <p className={styles.heroParagraph} style={boxStyle([372, 346, 700, 414])}>
          Let's lift our community to the peak of effectiveness,<br />
          and make it one of the best.
        </p>
        {/* مراكز الأيقونات المقاسة: 404 / 491 / 569 / 656 — والتسميات الإنجليزية
            أطول من العربية فبتتقسم سطرين عشان متتزاحمش (المسافة بين الأيقونات 78-87px) */}
        <ul className={styles.heroFeatures} aria-hidden="false">
          <li style={boxStyle([361, 476, 448, 518])}>Rewards &amp;<br />Points</li>
          <li style={boxStyle([448, 476, 535, 518])}>Clean<br />Environment</li>
          <li style={boxStyle([526, 476, 613, 518])}>Recycling</li>
          <li style={boxStyle([613, 476, 700, 518])}>Nearest<br />Machine</li>
        </ul>
        <p className={styles.heroFooter} style={boxStyle([102, 922, 380, 976])}>
          Made with passion
        </p>
      </div>

      {/* language selector (cleaned crop — «English» label as HTML) */}
      <button
        type="button"
        className={styles.langBtn}
        onClick={toggleLang}
        style={boxStyle([1237, 47, 1445, 105])}
        aria-label={t('auth.changeLang')}
      >
        <img src={langSelectorEn} alt="" draggable={false} />
        <span className={styles.langText}>English</span>
      </button>

      {/* form card artwork (gradient, logo, headings area cleaned) */}
      <div className={styles.card} style={boxStyle([850, 114, 1386, 948])} aria-hidden="true">
        <img src={cardBgEn} alt="" draggable={false} />
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.layer}>
        {/* ── card heading texts (HTML on cleaned art) ── */}
        <p className={styles.tagline} style={boxStyle([1090, 212, 1320, 242])}>
          {t('auth.systemTitle')}
        </p>
        <h2 className={styles.heading} style={boxStyle([900, 268, 1336, 312])}>
          {t('auth.welcomeBack')}
        </h2>
        <p className={styles.subtitle} style={boxStyle([880, 326, 1330, 356])}>
          {t('auth.signInSub')}
        </p>

        {/* ── email field (cleaned crop + crisp envelope icon over baked art) ── */}
        <div
          id="emailField"
          className={`${styles.fieldBox} ${errors.email ? styles.fieldError : ''}`}
          style={boxStyle([894, 386, 1347, 451])}
          aria-hidden="true"
        >
          <img src={emailBoxEn} alt="" draggable={false} />
        </div>
        {/* مغلف حاد فوق الموضع المخبوز — crop x[18,37] y[25,40] + هامش */}
        <FieldIcon Icon={Mail} box={[908, 407, 936, 430]} size={17} color="#1d3a37" testId="en-mail-icon" />
        <span className={styles.floatLabel} style={boxStyle([952, 391, 1170, 413])}>
          {t('auth.email')}
        </span>
        <input
          id="en-login-email"
          type="email"
          dir="ltr"
          autoComplete="email"
          aria-label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          className={styles.input}
          style={{ ...boxStyle([946, 417, 1335, 445]), fontSize: vh(15) }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <span className={styles.errorMsg} style={boxStyle([896, 452, 1345, 473])}>
            {errors.email}
          </span>
        )}

        {/* ── password field (cleaned crop + crisp lock icon over baked art) ── */}
        <div
          id="passField"
          className={`${styles.fieldBox} ${errors.password ? styles.fieldError : ''}`}
          style={boxStyle([894, 474, 1347, 537])}
          aria-hidden="true"
        >
          <img src={passBoxEn} alt="" draggable={false} />
        </div>
        {/* قفل حاد فوق الموضع المخبوز — crop x[19,35] y[22,42] + هامش */}
        <FieldIcon Icon={Lock} box={[909, 492, 933, 520]} size={18} color="#1d3a37" testId="en-lock-icon" />
        <span className={styles.floatLabel} style={boxStyle([952, 479, 1170, 500])}>
          {t('auth.password')}
        </span>
        <input
          id="en-login-password"
          type={showPassword ? 'text' : 'password'}
          dir="ltr"
          autoComplete="current-password"
          aria-label={t('auth.password')}
          placeholder={t('auth.password')}
          className={styles.input}
          style={{ ...boxStyle([946, 500, 1297, 532]), fontSize: vh(15) }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          style={boxStyle([1301, 492, 1337, 523])}
        >
          {/* عين حادة دائمًا — العين المخبوزة في القصاصة منخفضة الدقة */}
          <span className={styles.eyePatch} />
          {showPassword ? (
            <EyeOff className={styles.eyeIcon} strokeWidth={2.2} />
          ) : (
            <Eye className={styles.eyeIcon} strokeWidth={2.2} />
          )}
        </button>
        {errors.password && (
          <span className={styles.errorMsg} style={boxStyle([896, 540, 1345, 564])}>
            {errors.password}
          </span>
        )}

        {/* ── remember me (left — checkbox artwork kept under the cover logic) ── */}
        <input
          id="en-remember-check"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className={styles.hiddenCheck}
        />
        <label
          htmlFor="en-remember-check"
          className={styles.rememberZone}
          style={boxStyle([894, 560, 1080, 602])}
        >
          <span className={styles.rememberText}>{t('auth.remember')}</span>
        </label>
        {!remember && (
          /* cover the baked (checked) checkbox with the unchecked state */
          <span className={styles.checkboxCover} style={boxStyle([894, 562, 928, 600])}>
            <span className={styles.unchecked} />
          </span>
        )}

        {/* ── forgot password (right — HTML link on cleaned art) ── */}
        <a
          href="/forgot-password"
          onClick={goForgot}
          className={styles.forgotLink}
          style={boxStyle([1090, 560, 1354, 602])}
        >
          {t('auth.forgot')}
        </a>

        {/* ── submit button (cleaned green pill + HTML label) ── */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          style={boxStyle([894, 622, 1347, 681])}
        >
          <img src={btnBgEn} alt="" className={styles.btnArt} draggable={false} aria-hidden="true" />
          {loading ? (
            <span className={styles.loadingPatch}>
              <span className={styles.spinner} style={{ width: vh(22), height: vh(22) }} aria-label={t('ui.loading')} />
            </span>
          ) : (
            <span className={styles.btnText}>
              {t('auth.login')}
              <svg width={vh(17)} height={vh(17)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </button>

        {/* ── «or» divider (baked lines kept; word as HTML) ── */}
        <span className={styles.orText} style={boxStyle([1096, 698, 1160, 734])}>
          {t('auth.or')}
        </span>

        {/* ── google button (fully cleaned crop — G logo + label as centered HTML group) ── */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={googleSoon}
          style={boxStyle([894, 751, 1347, 810])}
        >
          <img src={googleBgEn} alt="" className={styles.btnArt} draggable={false} aria-hidden="true" />
          <span className={styles.googleText}>
            <svg width={vh(21)} height={vh(21)} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            <span>{t('auth.loginWithGoogle')}</span>
          </span>
        </button>

        {/* ── footer (HTML on cleaned art) ── */}
        <p className={styles.cardFooter} style={boxStyle([920, 840, 1316, 886])}>
          {t('auth.noAccount')}{' '}
          <a href="/register" onClick={goRegister} className={styles.footerLink}>
            {t('auth.createAccount')}
          </a>
        </p>
      </form>
    </div>
  );
}
