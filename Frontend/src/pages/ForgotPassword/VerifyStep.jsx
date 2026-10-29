import { Link } from 'react-router-dom';
import { Mail, ShieldQuestion } from 'lucide-react';
import AuthField from '../../components/auth/AuthField';
import AuthButton from '../../components/auth/AuthButton';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ForgotPassword.module.css';

/** الخطوة 1: التحقق من الهوية — البريد المسجّل + بيانات التحقق. */
export default function VerifyStep({ logic }) {
  const { email, verify, errors, loading, setField, submitVerify } = logic;
  const { t } = useLanguage();

  return (
    <>
      <h2 className={styles.title}>{t('forgot.title')}</h2>
      <p className={styles.subtitle}>
        {t('forgot.subtitle')}
      </p>

      <form onSubmit={submitVerify} noValidate>
        <AuthField
          id="fp-email"
          label={t('common.email')}
          icon={<Mail size={18} />}
          error={errors.email}
          first
          inputProps={{
            type: 'email',
            dir: 'ltr',
            autoComplete: 'email',
            placeholder: t('auth.emailPlaceholder'),
            value: email,
            onChange: (e) => setField('email', e.target.value),
          }}
        />

        <AuthField
          id="fp-verify"
          label={t('forgot.verifyData')}
          icon={<ShieldQuestion size={18} />}
          error={errors.verify}
          inputProps={{
            type: 'text',
            placeholder: t('forgot.verifyPh'),
            value: verify,
            onChange: (e) => setField('verify', e.target.value),
          }}
        />

        <div className={styles.hintBox}>
          <strong>{t('forgot.hintTitle')}</strong>
          <span>
            {t('forgot.hintAdmin')}
            <br />
            {t('forgot.hintUser')}
          </span>
        </div>

        <AuthButton type="submit" loading={loading}>{t('forgot.verifyBtn')}</AuthButton>
      </form>

      <p className={styles.switchLine}>
        {t('forgot.remembered')}{' '}
        <Link to="/login" className={styles.switchLink}>
          {t('forgot.backToLogin')}
        </Link>
      </p>
    </>
  );
}
