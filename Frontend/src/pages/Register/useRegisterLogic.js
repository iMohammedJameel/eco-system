import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

const PHONE_RE = /^01[0-25]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirm: '',
};

/**
 * منطق إنشاء الحساب — الحالة والتحقق والإرسال في مكان واحد،
 * والعرض في RegisterForm حتى يظل النموذج سهل الصيانة.
 */
export function useRegisterLogic() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState(INITIAL_FORM);
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
    if (!form.username.trim()) e.username = t('register.nameRequired');
    else if (form.username.trim().length < 3) e.username = t('register.nameShort');

    if (!form.email.trim()) e.email = t('auth.emailRequired');
    else if (!EMAIL_RE.test(form.email.trim())) e.email = t('auth.emailInvalid');

    if (!form.phoneNumber.trim()) e.phoneNumber = t('register.phoneRequired');
    else if (!PHONE_RE.test(form.phoneNumber.trim()))
      e.phoneNumber = t('register.phoneInvalid');

    if (!form.password) e.password = t('auth.passwordRequired');
    else if (form.password.length < 6) e.password = t('auth.passwordShort');

    if (!form.confirm) e.confirm = t('register.confirmRequired');
    else if (form.confirm !== form.password) e.confirm = t('register.mismatch');

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
      toast.success(t('register.created'));
    } catch (err) {
      toast.error(err.message || t('register.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => navigate('/login');

  return {
    form, errors, showPassword, setShowPassword, loading, done,
    set, submit, goLogin,
  };
}
