import { ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import AuthField from '../../components/auth/AuthField';
import AuthButton from '../../components/auth/AuthButton';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ForgotPassword.module.css';

/** الخطوة 2: تعيين كلمة المرور الجديدة بعد نجاح التحقق. */
export default function ResetStep({ logic }) {
  const { newPassword, confirm, errors, loading, setField, submitReset, restart } = logic;
  const { t, dir } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <>
      <h2 className={styles.title}>{t('forgot.resetTitle')}</h2>
      <p className={styles.subtitle}>
        {t('forgot.resetSubtitle')}
      </p>

      <form onSubmit={submitReset} noValidate>
        <AuthField
          id="fp-new"
          label={t('forgot.newPassword')}
          icon={<KeyRound size={18} />}
          error={errors.newPassword}
          first
          inputProps={{
            type: 'password',
            dir: 'ltr',
            autoComplete: 'new-password',
            placeholder: t('register.passwordMin'),
            value: newPassword,
            onChange: (e) => setField('newPassword', e.target.value),
          }}
        />

        <AuthField
          id="fp-confirm"
          label={t('register.confirm')}
          icon={<KeyRound size={18} />}
          error={errors.confirm}
          inputProps={{
            type: 'password',
            dir: 'ltr',
            autoComplete: 'new-password',
            placeholder: t('register.retypePh'),
            value: confirm,
            onChange: (e) => setField('confirm', e.target.value),
          }}
        />

        <AuthButton type="submit" loading={loading}>{t('forgot.changeBtn')}</AuthButton>
      </form>

      <button type="button" className={styles.backLink} onClick={restart}>
        <BackIcon size={15} />
        {t('forgot.backToVerify')}
      </button>
    </>
  );
}
