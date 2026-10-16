import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2, Leaf } from 'lucide-react';
import { authService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import bgFull from '../../assets/login/bg-full.png';
import styles from './Register.module.css';

const PHONE_RE = /^01[0-25]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined, confirm: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'الاسم مطلوب';
    else if (form.username.trim().length < 3) e.username = 'الاسم يجب ألا يقل عن 3 حروف';

    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'صيغة البريد الإلكتروني غير صحيحة';

    if (!form.phoneNumber.trim()) e.phoneNumber = 'رقم الهاتف مطلوب';
    else if (!PHONE_RE.test(form.phoneNumber.trim()))
      e.phoneNumber = 'رقم موبايل مصري صحيح: 11 رقمًا يبدأ بـ 010/011/012/015';

    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 6) e.password = 'كلمة المرور يجب ألا تقل عن 6 أحرف';

    if (!form.confirm) e.confirm = 'تأكيد كلمة المرور مطلوب';
    else if (form.confirm !== form.password) e.confirm = 'كلمتا المرور غير متطابقتين';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });
      setDone(true);
      toast.success('تم إنشاء حسابك بنجاح');
    } catch (err) {
      toast.error(err.message || 'فشل إنشاء الحساب — حاول مجددًا');
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => navigate('/login');

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.bg} style={{ backgroundImage: `url(${bgFull})` }} aria-hidden="true" />

      <div className={styles.card}>
        {/* شعار EcoCycle */}
        <div className={styles.brand}>
          <span className={styles.logoMark}>
            <Leaf size={30} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className={styles.brandName}>
              <span>Eco</span>Cycle
            </h1>
            <p className={styles.brandSub}>منصة إعادة التدوير الذكية</p>
          </div>
        </div>

        {done ? (
          /* ═══ نجاح التسجيل ═══ */
          <div className={styles.successBox}>
            <CheckCircle2 className={styles.successIcon} size={72} strokeWidth={1.6} />
            <h2 className={styles.successTitle}>تم إنشاء حسابك بنجاح</h2>
            <p className={styles.successText}>
              رقم هاتفك <strong dir="ltr">{form.phoneNumber}</strong> بقى هويتك في EcoCycle — امسح رمز
              QR من أقرب ماكينة عند الإيداع وادخل نفس الرقم عشان نقاطك وأرصدتك وإنجازاتك تتجمّع
              كلها في حسابك.
            </p>
            <button type="button" className={styles.primaryBtn} onClick={goLogin}>
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          /* ═══ نموذج التسجيل ═══ */
          <>
            <h2 className={styles.title}>إنشاء حساب جديد</h2>
            <p className={styles.subtitle}>انضم لـ EcoCycle وابدأ رحلتك في التدوير الذكي</p>

            <form onSubmit={submit} noValidate>
              <label className={styles.label} htmlFor="reg-username">الاسم الكامل</label>
              <div className={`${styles.field} ${errors.username ? styles.fieldError : ''}`}>
                <User size={18} className={styles.fieldIcon} />
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="name"
                  placeholder="مثال: أحمد محمود"
                  value={form.username}
                  onChange={set('username')}
                />
              </div>
              {errors.username && <span className={styles.error}>{errors.username}</span>}

              <label className={styles.label} htmlFor="reg-email">البريد الإلكتروني</label>
              <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  id="reg-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder="example@domain.com"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
              {errors.email && <span className={styles.error}>{errors.email}</span>}

              <label className={styles.label} htmlFor="reg-phone">رقم الموبايل</label>
              <div className={`${styles.field} ${errors.phoneNumber ? styles.fieldError : ''}`}>
                <Phone size={18} className={styles.fieldIcon} />
                <input
                  id="reg-phone"
                  type="tel"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="01xxxxxxxxx"
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}

              <label className={styles.label} htmlFor="reg-password">كلمة المرور</label>
              <div className={`${styles.field} ${errors.password ? styles.fieldError : ''}`}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="6 أحرف على الأقل"
                  value={form.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}

              <label className={styles.label} htmlFor="reg-confirm">تأكيد كلمة المرور</label>
              <div className={`${styles.field} ${errors.confirm ? styles.fieldError : ''}`}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="أعد كتابة كلمة المرور"
                  value={form.confirm}
                  onChange={set('confirm')}
                />
              </div>
              {errors.confirm && <span className={styles.error}>{errors.confirm}</span>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} aria-label="جارٍ التحميل" /> : 'إنشاء الحساب'}
              </button>
            </form>

            <p className={styles.switchLine}>
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className={styles.switchLink}>
                تسجيل الدخول
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
