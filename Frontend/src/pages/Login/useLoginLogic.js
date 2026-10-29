import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * منطق تسجيل الدخول المشترك بين كل نسخ العرض (ديسكتوب/موبايل/إنجليزي) —
 * الحالة تعيش هنا (في المكوّن الأب Login) وليس داخل كل نسخة،
 * حتى لا تُفقد بيانات المستخدم عند تغيّر مقاس الشاشة أو اللغة أثناء الكتابة.
 */
export function useLoginLogic() {
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
  const { t } = useLanguage();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('auth.emailInvalid');
    if (!password) e.password = t('auth.passwordRequired');
    else if (password.length < 6) e.password = t('auth.passwordShort');
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
      toast.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  // عناصر النسخة التجريبية — رسائل صريحة وصادقة بدل "غير متاحة" العامة
  const googleSoon = (e) => {
    e.preventDefault();
    toast.info(t('auth.googleSoon'));
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
    handleSubmit, googleSoon, goForgot, goRegister, from,
  };
}
