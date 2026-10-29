import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import AuthField, { EyeToggle } from '../../components/auth/AuthField';
import AuthButton from '../../components/auth/AuthButton';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Register.module.css';

/** نموذج إنشاء الحساب — 5 حقول مع تحقق فوري وعرض/إخفاء كلمة المرور. */
export default function RegisterForm({ logic }) {
  const { form, errors, showPassword, setShowPassword, loading, set, submit } = logic;
  const { t } = useLanguage();

  return (
    <>
      <h2 className={styles.title}>{t('register.title')}</h2>
      <p className={styles.subtitle}>{t('register.subtitle')}</p>

      <form onSubmit={submit} noValidate>
        <AuthField
          id="reg-username"
          label={t('register.fullName')}
          icon={<User size={18} />}
          error={errors.username}
          first
          inputProps={{
            type: 'text',
            autoComplete: 'name',
            placeholder: t('register.fullNamePh'),
            value: form.username,
            onChange: set('username'),
          }}
        />

        <AuthField
          id="reg-email"
          label={t('common.email')}
          icon={<Mail size={18} />}
          error={errors.email}
          inputProps={{
            type: 'email',
            dir: 'ltr',
            autoComplete: 'email',
            placeholder: t('auth.emailPlaceholder'),
            value: form.email,
            onChange: set('email'),
          }}
        />

        <AuthField
          id="reg-phone"
          label={t('register.phone')}
          icon={<Phone size={18} />}
          error={errors.phoneNumber}
          inputProps={{
            type: 'tel',
            dir: 'ltr',
            inputMode: 'numeric',
            autoComplete: 'tel',
            placeholder: '01xxxxxxxxx',
            value: form.phoneNumber,
            onChange: set('phoneNumber'),
          }}
        />

        <AuthField
          id="reg-password"
          label={t('auth.password')}
          icon={<Lock size={18} />}
          error={errors.password}
          trailing={<EyeToggle visible={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
          inputProps={{
            type: showPassword ? 'text' : 'password',
            dir: 'ltr',
            autoComplete: 'new-password',
            placeholder: t('register.passwordMin'),
            value: form.password,
            onChange: set('password'),
          }}
        />

        <AuthField
          id="reg-confirm"
          label={t('register.confirm')}
          icon={<Lock size={18} />}
          error={errors.confirm}
          inputProps={{
            type: showPassword ? 'text' : 'password',
            dir: 'ltr',
            autoComplete: 'new-password',
            placeholder: t('register.retypePh'),
            value: form.confirm,
            onChange: set('confirm'),
          }}
        />

        <AuthButton type="submit" loading={loading}>{t('register.create')}</AuthButton>
      </form>

      <p className={styles.switchLine}>
        {t('register.haveAccount')}{' '}
        <Link to="/login" className={styles.switchLink}>
          {t('auth.login')}
        </Link>
      </p>
    </>
  );
}
