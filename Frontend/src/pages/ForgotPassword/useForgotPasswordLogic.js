import { useState } from 'react';
import { authService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * منطق استعادة كلمة المرور — 3 خطوات:
 * 1) التحقق من الهوية (البريد + اسم المستخدم/رقم الهاتف)
 * 2) تعيين كلمة المرور الجديدة برمز resetToken المؤقت
 * 3) شاشة النجاح
 * الحالة هنا وليست داخل الخطوات حتى لا تُفقد بيانات
 * المستخدم عند إعادة رسم مكوّنات الخطوة.
 */
export function useForgotPasswordLogic() {
  const toast = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
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
    if (!email.trim()) e.email = t('auth.emailRequired');
    else if (!EMAIL_RE.test(email.trim())) e.email = t('auth.emailInvalid');
    if (!verify.trim()) e.verify = t('forgot.verifyRequired');
    else if (verify.trim().length < 2) e.verify = t('forgot.verifyShort');
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase(), verify.trim());
      setResetToken(res.resetToken);
      setStep(2);
      toast.success(res.msg || t('forgot.identityOk'));
    } catch (err) {
      toast.error(err.message || t('forgot.identityFailed'));
    } finally {
      setLoading(false);
    }
  };

  /* ── الخطوة 2: كلمة المرور الجديدة ── */
  const submitReset = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!newPassword) e.newPassword = t('forgot.newPasswordRequired');
    else if (newPassword.length < 6) e.newPassword = t('auth.passwordShort');
    if (!confirm) e.confirm = t('forgot.confirmRequired');
    else if (confirm !== newPassword) e.confirm = t('register.mismatch');
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      setStep(3);
      toast.success(res.msg || t('forgot.changed'));
    } catch (err) {
      toast.error(err.message || t('forgot.changeFailed'));
    } finally {
      setLoading(false);
    }
  };

  /* ── رجوع لتعديل بيانات التحقق ── */
  const restart = () => {
    setStep(1);
    setEmail('');
    setVerify('');
    setNewPassword('');
    setConfirm('');
    setResetToken('');
    setErrors({});
  };

  return {
    step, email, verify, newPassword, confirm,
    errors, loading,
    setField, submitVerify, submitReset, restart,
  };
}
