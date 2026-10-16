import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/* ── Assets: every visual is an exact crop from the approved design ── */
import bgFull from '../../assets/login/bg-full.png';
import cardBg from '../../assets/login/card-bg.png';
import cardTop from '../../assets/login/card-top.png';
import cardBottom from '../../assets/login/card-bottom.png';
import dividerImg from '../../assets/login/divider.png';
import langSelector from '../../assets/login/lang-selector.png';
import emailBox from '../../assets/login/email-box.png';
import passBox from '../../assets/login/pass-box.png';
import btnBg from '../../assets/login/btn-bg.png';
import googleBg from '../../assets/login/google-bg.png';
import emailEnvelope from '../../assets/login/email-envelope.png';
import passLock from '../../assets/login/pass-lock.png';
import passEye from '../../assets/login/pass-eye.png';
import remCheckbox from '../../assets/login/rem-checkbox.png';
import remText from '../../assets/login/rem-text.png';
import remForgot from '../../assets/login/rem-forgot.png';
import btnContent from '../../assets/login/btn-content.png';
import googleContent from '../../assets/login/google-content.png';
import styles from './Login.module.css';

/* ════════════════════════════════════════════════════════════════
   Pixel-perfect strategy: the page background, the form card, the
   input fields and the buttons are EXACT crops of the approved
   design (1536 × 1024). Interactive elements are transparent
   overlays locked to the same design coordinates, so what the user
   sees is literally the design artwork itself.
   box = [x0, y0, x1, y1] in design pixels.
   ════════════════════════════════════════════════════════════════ */
const DW = 1536;
const DH = 1024;
const px = (v) => `${(v / DW) * 100}%`;
const py = (v) => `${(v / DH) * 100}%`;
const vw = (v) => `${(v / DW) * 100}vw`;
/* حجم خط مرتبط بالارتفاع — يمنع تضخم النص عند نسب عرض مختلفة عن 3:2 */
const vh = (v) => `${(v / DH) * 100}vh`;

const boxStyle = (b) => ({
  left: px(b[0]),
  top: py(b[1]),
  width: `${((b[2] - b[0]) / DW) * 100}%`,
  height: `${((b[3] - b[1]) / DH) * 100}%`,
});

/* ── shared auth logic ── */
function useLoginLogic() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'صيغة البريد غير صحيحة';
    if (!password) e.password = 'كلمة المرور مطلوبة';
    else if (password.length < 6) e.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // "تذكرني" = جلسة 30 يومًا، بدونها = جلسة متصفح قصيرة
      await login(email.trim(), password, remember);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // عناصر النسخة التجريبية — رسائل صريحة وصادقة بدل "غير متاحة" العامة
  const googleSoon = (e) => {
    e.preventDefault();
    toast.info('الدخول عبر Google يتطلب إعداد Google OAuth — غير مفعّل في النسخة التجريبية');
  };
  const langSoon = (e) => {
    e.preventDefault();
    toast.info('الواجهة متاحة بالعربية فقط في هذه النسخة');
  };

  // روابط حقيقية تعمل فعليًا
  const goForgot = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };
  const goRegister = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, langSoon, goForgot, goRegister, from,
  };
}

/* ══════════════════ DESKTOP — pixel-perfect overlay ══════════════════ */
function LoginDesktop() {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, langSoon, goForgot, goRegister, from,
  } = useLoginLogic();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.page} dir="rtl">
      {/* page background = the approved design itself */}
      <div className={styles.bg} style={{ backgroundImage: `url(${bgFull})` }} aria-hidden="true" />

      {/* language selector (exact crop, clickable) */}
      <button
        type="button"
        className={styles.langBtn}
        onClick={langSoon}
        style={boxStyle([1237, 47, 1445, 105])}
        aria-label="تغيير اللغة"
      >
        <img src={langSelector} alt="العربية" draggable={false} />
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
          {showPassword ? (
            <>
              <span className={styles.eyePatch} />
              <Eye className={styles.eyeIcon} strokeWidth={2.4} />
            </>
          ) : null /* the baked eye artwork shows through */}
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
          <span className={styles.btnLabel}>تسجيل الدخول</span>
        </button>

        {/* ── google button (design crop with baked icon + label) ── */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={googleSoon}
          style={boxStyle([894, 751, 1347, 810])}
        >
          <img src={googleBg} alt="" className={styles.btnArt} draggable={false} aria-hidden="true" />
          <span className={styles.btnLabel}>تسجيل الدخول باستخدام Google</span>
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

/* ══════════════════ MOBILE — flow layout from the same design assets ══════════════════ */
function LoginMobile() {
  const {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, setShowPassword, loading, errors, isAuthenticated,
    handleSubmit, googleSoon, langSoon, goForgot, goRegister, from,
  } = useLoginLogic();

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className={styles.mPage} dir="rtl">
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
              {showPassword ? <Eye size={20} strokeWidth={2.4} /> : <img src={passEye} alt="" draggable={false} />}
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
            أنشئ حساب جديد
          </a>
        </form>

        <img src={cardBottom} alt="" className={styles.mCardBottom} draggable={false} />
      </div>
    </div>
  );
}

/* ══════════════════ responsive switcher ══════════════════ */
function Login() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile ? <LoginMobile /> : <LoginDesktop />;
}

export default Login;
