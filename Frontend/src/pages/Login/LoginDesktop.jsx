import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

/* ── Assets: every visual is an exact crop from the approved design ── */
import bgFull from '../../assets/login/bg-full.png';
import langSelector from '../../assets/login/lang-selector.png';
import cardBg from '../../assets/login/card-bg.png';
import emailBox from '../../assets/login/email-box.png';
import passBox from '../../assets/login/pass-box.png';
import btnBg from '../../assets/login/btn-bg.png';
import googleBg from '../../assets/login/google-bg.png';
import styles from './Login.module.css';
import { boxStyle, vh } from './designCoords';
import { useLanguage } from '../../context/LanguageContext';

/* ══════════════════ DESKTOP — pixel-perfect overlay ══════════════════
   خلفية الصفحة والكارت وحقول الإدخال والأزرار هي قصاصات طبق الأصل
   من التصميم المعتمد (1536×1024)، والعناصر التفاعلية طبقات شفافة
   مثبّتة على نفس إحداثيات التصميم — فما يراه المستخدم هو التصميم نفسه. */
/* ═══ أيقونات حادة فوق الرسم المخبوز ═══
   نفس فكرة النسخة الإنجليزية: رقعة بلون خلفية الحقل تُخفي الأيقونة
   المخبوزة الضبابية + أيقونة lucide SVG حادة على أي مقاس شاشة.
   الإحداثيات مقاسة بالبكسل من القصاصات العربية الأصلية. */
function FieldIcon({ Icon, box, size, color, bg, testId }) {
  return (
    <span
      className={styles.fieldIconPatch}
      style={{ ...boxStyle(box), background: bg }}
      aria-hidden="true"
      data-testid={testId}
    >
      <Icon size={size} strokeWidth={2} color={color} />
    </span>
  );
}

export default function LoginDesktop({ logic }) {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, goForgot, goRegister, from,
  } = logic;
  const { t, toggleLang } = useLanguage();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.page} dir="rtl">
      {/* page background = the approved design itself */}
      <div className={styles.bg} style={{ backgroundImage: `url(${bgFull})` }} aria-hidden="true" />

      {/* language selector (exact crop, clickable — يبدّل للإنجليزية فعليًا) */}
      <button
        type="button"
        className={styles.langBtn}
        onClick={toggleLang}
        style={boxStyle([1237, 47, 1445, 105])}
        aria-label={t('auth.changeLang')}
      >
        <img src={langSelector} alt="العربية | English" draggable={false} />
      </button>

      {/* form card artwork (gradient, corners, logo, headings, wave, footer baked) */}
      <div className={styles.card} style={boxStyle([850, 114, 1386, 948])} aria-hidden="true">
        <img src={cardBg} alt="" draggable={false} />
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.layer}>
        {/* ── email field (design crop = exact field with baked label,
             placeholder and envelope icon) ── */}
        <div
          id="emailField"
          className={`${styles.fieldBox} ${errors.email ? styles.fieldError : ''}`}
          style={boxStyle([894, 386, 1347, 451])}
          aria-hidden="true"
        >
          <img src={emailBox} alt="" draggable={false} />
        </div>
        {/* مغلف حاد فوق الموضع المخبوز — crop x[18,37] y[25,40] + هامش */}
        <FieldIcon Icon={Mail} box={[908, 407, 936, 430]} size={17} color="#1d3a37" bg="#fbf9f5" testId="ar-mail-icon" />
        {/* hide the baked placeholder once the user typed something */}
        {email && (
          <div className={styles.phPatch} style={{ ...boxStyle([948, 418, 1120, 442]), background: '#fbf9f5' }} />
        )}
        <input
          id="login-email"
          type="email"
          dir="ltr"
          autoComplete="email"
          aria-label="البريد الإلكتروني"
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

        {/* ── password field (design crop with baked lock, placeholder and eye) ── */}
        <div
          id="passField"
          className={`${styles.fieldBox} ${errors.password ? styles.fieldError : ''}`}
          style={boxStyle([894, 474, 1347, 537])}
          aria-hidden="true"
        >
          <img src={passBox} alt="" draggable={false} />
        </div>
        {/* قفل حاد فوق الموضع المخبوز — crop x[19,35] y[22,42] + هامش */}
        <FieldIcon Icon={Lock} box={[909, 492, 933, 520]} size={18} color="#1d3a37" bg="#faf8f4" testId="ar-lock-icon" />
        {password && (
          <div className={styles.phPatch} style={{ ...boxStyle([946, 487, 1036, 521]), background: '#faf8f4' }} />
        )}
        <input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          dir="ltr"
          autoComplete="current-password"
          aria-label="كلمة المرور"
          className={styles.input}
          style={{ ...boxStyle([946, 485, 1297, 526]), fontSize: vh(15) }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
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

        {/* ── remember me (physical left — artwork baked into the card) ── */}
        <input
          id="remember-check"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className={styles.hiddenCheck}
        />
        {/* clickable zone sits under the (pointer-transparent) visuals */}
        <label
          htmlFor="remember-check"
          className={styles.rememberZone}
          style={boxStyle([894, 560, 992, 602])}
          aria-label="تذكرني"
        />
        {!remember && (
          /* cover the baked (checked) checkbox with the unchecked state */
          <span className={styles.checkboxCover} style={boxStyle([894, 562, 928, 600])}>
            <span className={styles.unchecked} />
          </span>
        )}

        {/* ── forgot password (physical right — baked artwork, clickable) ── */}
        <a
          href="/forgot-password"
          onClick={goForgot}
          className={styles.linkBtn}
          aria-label="نسيت كلمة المرور؟"
          style={boxStyle([1213, 558, 1354, 602])}
        />

        {/* ── submit button (design crop with baked label) ── */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          style={boxStyle([894, 622, 1347, 681])}
        >
          <img src={btnBg} alt="" className={styles.btnArt} draggable={false} aria-hidden="true" />
          {loading && (
            <span className={styles.loadingPatch}>
              <span className={styles.spinner} style={{ width: vh(22), height: vh(22) }} aria-label="جارٍ التحميل" />
            </span>
          )}
          <span className={styles.btnLabel}>{t('auth.login')}</span>
        </button>

        {/* ── google button (design crop with baked icon + label) ── */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={googleSoon}
          style={boxStyle([894, 751, 1347, 810])}
        >
          <img src={googleBg} alt="" className={styles.btnArt} draggable={false} aria-hidden="true" />
          <span className={styles.btnLabel}>{t('auth.loginWithGoogle')}</span>
        </button>

        {/* ── create-account hotspot (green link baked in card artwork) ── */}
        <a
          href="/register"
          onClick={goRegister}
          className={styles.hotspot}
          aria-label="أنشئ حساب جديد"
          style={boxStyle([1002, 841, 1115, 877])}
        />
      </form>
    </div>
  );
}
