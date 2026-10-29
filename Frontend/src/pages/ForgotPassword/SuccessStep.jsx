import { Link } from 'react-router-dom';
import AuthSuccess from '../../components/auth/AuthSuccess';
import AuthButton from '../../components/auth/AuthButton';
import { useLanguage } from '../../context/LanguageContext';

/** الخطوة 3: النجاح — إعادة التوجيه لتسجيل الدخول بكلمة المرور الجديدة. */
export default function SuccessStep() {
  const { t } = useLanguage();

  return (
    <AuthSuccess
      title={t('forgot.successTitle')}
      text={t('forgot.successText')}
    >
      <AuthButton as={Link} to="/login">{t('forgot.loginNow')}</AuthButton>
    </AuthSuccess>
  );
}
