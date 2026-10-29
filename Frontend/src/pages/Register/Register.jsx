import AuthShell from '../../components/auth/AuthShell';
import AuthSuccess from '../../components/auth/AuthSuccess';
import AuthButton from '../../components/auth/AuthButton';
import RegisterForm from './RegisterForm';
import { useRegisterLogic } from './useRegisterLogic';
import { useLanguage } from '../../context/LanguageContext';

/**
 * إنشاء حساب جديد — منسّق رقيق:
 * المنطق في useRegisterLogic والعرض في RegisterForm/AuthSuccess.
 */
function Register() {
  const logic = useRegisterLogic();
  const { t } = useLanguage();

  return (
    <AuthShell>
      {logic.done ? (
        <AuthSuccess
          title={t('register.successTitle')}
          text={t('register.successText', { phone: logic.form.phoneNumber })}
        >
          <AuthButton as="button" type="button" onClick={logic.goLogin}>
            {t('register.backToLogin')}
          </AuthButton>
        </AuthSuccess>
      ) : (
        <RegisterForm logic={logic} />
      )}
    </AuthShell>
  );
}

export default Register;
