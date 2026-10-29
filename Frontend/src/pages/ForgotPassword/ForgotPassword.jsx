import AuthShell from '../../components/auth/AuthShell';
import VerifyStep from './VerifyStep';
import ResetStep from './ResetStep';
import SuccessStep from './SuccessStep';
import { useForgotPasswordLogic } from './useForgotPasswordLogic';

/**
 * استعادة كلمة المرور — منسّق رقيق:
 * المنطق كله في useForgotPasswordLogic والعرض في مكوّنات الخطوات.
 */
function ForgotPassword() {
  const logic = useForgotPasswordLogic();

  return (
    <AuthShell>
      {logic.step === 1 && <VerifyStep logic={logic} />}
      {logic.step === 2 && <ResetStep logic={logic} />}
      {logic.step === 3 && <SuccessStep />}
    </AuthShell>
  );
}

export default ForgotPassword;
