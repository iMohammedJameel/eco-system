import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../../components/ui/Icon';
import styles from '../UserLogin/UserLogin.module.css';

/**
 * دخول الشريك — بوابة الشركاء الحقيقية
 * (قبل الإصلاح: البوابة كانت وضع عرض للأدمن فقط — الشريك الحقيقي ماكانش يدخل بنفسه)
 */
function PartnerLogin() {
  const { loginPartner } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

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
      await loginPartner(email, password, remember);
      navigate('/partner-portal', { replace: true });
    } catch (err) {
      setError(err.message || t('portal.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}><Icon name="store" size={26} /></span>
          <h1 className={styles.brandTitle}>{t('portal.loginBrandTitle')}</h1>
          <p className={styles.brandSub}>{t('portal.loginBrandSub')}</p>
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
                placeholder="support@kazyon.com"
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
                placeholder="••••••••"
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
            <span>{loading ? t('common.loading') : t('portal.loginBtn')}</span>
          </button>
        </form>

        <div className={styles.links}>
          <p className={styles.otherPortals}>
            <Link to="/login">{t('citizen.adminLogin')}</Link>
            <span className={styles.dot}>·</span>
            <Link to="/user-login">{t('portal.userLoginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PartnerLogin;
