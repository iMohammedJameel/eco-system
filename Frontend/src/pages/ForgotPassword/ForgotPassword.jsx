import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldQuestion, KeyRound, CheckCircle2, Leaf, ArrowRight } from 'lucide-react';
import { authService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import bgFull from '../../assets/login/bg-full.png';
import styles from './ForgotPassword.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const toast = useToast();

  const [step, setStep] = useState(1); // 1 = التحقق، 2 = كلمة مرور جديدة، 3 = نجاح
  const [email, setEmail] = useState('');
  const [verify, setVerify] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const setField = (key, value) => {
    if (key === 'email') setEmail(value);
    if (key === 'verify') setVerify(value);
    if (key === 'newPassword') setNewPassword(value);
    if (key === 'confirm') setConfirm(value);
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  /* ── الخطوة 1: التحقق من الهوية ── */
  const submitVerify = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'صيغة البريد الإلكتروني غير صحيحة';
    if (!verify.trim()) e.verify = 'بيانات التحقق مطلوبة';
    else if (verify.trim().length < 2) e.verify = 'بيانات التحقق قصيرة جدًا';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase(), verify.trim());
      setResetToken(res.resetToken);
      setStep(2);
      toast.success(res.msg || 'تم التحقق من هويتك');
    } catch (err) {
      toast.error(err.message || 'بيانات التحقق غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  /* ── الخطوة 2: كلمة المرور الجديدة ── */
  const submitReset = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!newPassword) e.newPassword = 'كلمة المرور الجديدة مطلوبة';
    else if (newPassword.length < 6) e.newPassword = 'كلمة المرور يجب ألا تقل عن 6 أحرف';
    if (!confirm) e.confirm = 'التأكيد مطلوب';
    else if (confirm !== newPassword) e.confirm = 'كلمتا المرور غير متطابقتين';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      setStep(3);
      toast.success(res.msg || 'تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      toast.error(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(1);
    setEmail('');
    setVerify('');
    setNewPassword('');
    setConfirm('');
    setResetToken('');
    setErrors({});
  };

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

        {step === 1 && (
          <>
            <h2 className={styles.title}>استعادة كلمة المرور</h2>
            <p className={styles.subtitle}>
              أدخل بريدك المسجّل مع بيانات التحقق، وهنوجّهك لتعيين كلمة مرور جديدة.
            </p>

            <form onSubmit={submitVerify} noValidate>
              <label className={styles.label} htmlFor="fp-email">البريد الإلكتروني</label>
              <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  id="fp-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              {errors.email && <span className={styles.error}>{errors.email}</span>}

              <label className={styles.label} htmlFor="fp-verify">بيانات التحقق</label>
              <div className={`${styles.field} ${errors.verify ? styles.fieldError : ''}`}>
                <ShieldQuestion size={18} className={styles.fieldIcon} />
                <input
                  id="fp-verify"
                  type="text"
                  placeholder="اسم المستخدم أو رقم الهاتف"
                  value={verify}
                  onChange={(e) => setField('verify', e.target.value)}
                />
              </div>
              {errors.verify && <span className={styles.error}>{errors.verify}</span>}

              <div className={styles.hintBox}>
                <strong>إزاي تعرف بيانات التحقق المناسبة؟</strong>
                <span>
                  حسابات الإدارة (لوحة التحكم): اكتب <em>اسم المستخدم</em> المسجّل.
                  <br />
                  حسابات المستخدمين: اكتب <em>رقم الموبايل</em> المسجّل في حسابك.
                </span>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} aria-label="جارٍ التحميل" /> : 'تحقّق من هويتي'}
              </button>
            </form>

            <p className={styles.switchLine}>
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className={styles.switchLink}>
                العودة لتسجيل الدخول
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.title}>كلمة مرور جديدة</h2>
            <p className={styles.subtitle}>
              تم التحقق من هويتك — اكتب كلمة المرور الجديدة لحسابك.
            </p>

            <form onSubmit={submitReset} noValidate>
              <label className={styles.label} htmlFor="fp-new">كلمة المرور الجديدة</label>
              <div className={`${styles.field} ${errors.newPassword ? styles.fieldError : ''}`}>
                <KeyRound size={18} className={styles.fieldIcon} />
                <input
                  id="fp-new"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="6 أحرف على الأقل"
                  value={newPassword}
                  onChange={(e) => setField('newPassword', e.target.value)}
                />
              </div>
              {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}

              <label className={styles.label} htmlFor="fp-confirm">تأكيد كلمة المرور</label>
              <div className={`${styles.field} ${errors.confirm ? styles.fieldError : ''}`}>
                <KeyRound size={18} className={styles.fieldIcon} />
                <input
                  id="fp-confirm"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="أعد كتابة كلمة المرور"
                  value={confirm}
                  onChange={(e) => setField('confirm', e.target.value)}
                />
              </div>
              {errors.confirm && <span className={styles.error}>{errors.confirm}</span>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} aria-label="جارٍ التحميل" /> : 'تغيير كلمة المرور'}
              </button>
            </form>

            <button type="button" className={styles.backLink} onClick={restart}>
              <ArrowRight size={15} />
              رجوع لتعديل بيانات التحقق
            </button>
          </>
        )}

        {step === 3 && (
          <div className={styles.successBox}>
            <CheckCircle2 className={styles.successIcon} size={72} strokeWidth={1.6} />
            <h2 className={styles.successTitle}>تم تغيير كلمة المرور بنجاح</h2>
            <p className={styles.successText}>
              كلمة مرورك اتحدّثت وتم فتح قفل الحساب لو كان مقفول.
              تقدر دلوقتي تسجّل الدخول بكلمة المرور الجديدة.
            </p>
            <Link to="/login" className={styles.primaryBtn}>
              تسجيل الدخول الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
