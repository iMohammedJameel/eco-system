import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../../components/ui/Icon';
import styles from './UserLogin.module.css';

/**
 * دخول المواطن — بوابة المواطن (محفظة / سجل / كوبونات)
 * (قبل الإصلاح: المواطن كان يسجّل حسابًا من صفحة الريجستر ثم لا يستطيع الدخول إطلاقًا)
 */
function UserLogin() {
  const { loginUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password, remember);
      const from = location.state?.from?.pathname || '/my-wallet';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t('citizen.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.card}>
        {/* الشعار */}
        <div className={styles.brand}>
          <span className={styles.logo}><Icon name="recycle" size={26} /></span>
          <h1 className={styles.brandTitle}>Eco<span>Cycle</span></h1>
          <p className={styles.brandSub}>{t('citizen.loginSubtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{t('citizen.email')}</span>
            <div className={styles.inputWrap}>
              <Icon name="mail" size={16} className={styles.inputIcon} />
              <input
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('citizen.emailPh')}
                className={styles.input}
                autoComplete="email"
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t('citizen.password')}</span>
            <div className={styles.inputWrap}>
              <Icon name="lock" size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('citizen.passwordPh')}
                className={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                <Icon name={showPass ? 'hide' : 'view'} size={16} />
              </button>
            </div>
          </label>

          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>{t('auth.remember')}</span>
          </label>

          {error && (
            <div className={styles.error} role="alert">
              <Icon name="alertCircle" size={15} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : <Icon name="login" size={17} />}
            <span>{loading ? t('common.loading') : t('citizen.loginBtn')}</span>
          </button>
        </form>

        <div className={styles.links}>
          <p>
            {t('citizen.noAccount')}{' '}
            <Link to="/register" state={{ asCitizen: true }}>{t('citizen.registerLink')}</Link>
          </p>
          <p className={styles.otherPortals}>
            <Link to="/login">{t('citizen.adminLogin')}</Link>
            <span className={styles.dot}>·</span>
            <Link to="/partner-login">{t('citizen.partnerLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
