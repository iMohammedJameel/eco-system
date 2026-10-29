import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsService } from '../../services/transactions';
import { useLanguage } from '../../context/LanguageContext';
import DepositForm from './DepositForm';
import DepositSuccess from './DepositSuccess';
import styles from './Deposit.module.css';

function Deposit() {
  const { t, dir, lang, toggleLang } = useLanguage();
  const [params] = useSearchParams();
  const qrToken = params.get('t') || params.get('qrToken') || '';

  const [stage, setStage] = useState('loading'); // loading | form | success | error
  const [session, setSession] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [material, setMaterial] = useState('plastic');
  const [weight, setWeight] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      // الفحص والتحديث كله جوا المسار غير المتزامن — بدون setState متزامن في جسم الـ effect
      if (!qrToken) {
        setErrorMsg(t('deposit.invalidLink'));
        setStage('error');
        return;
      }
      try {
        const [s, m] = await Promise.all([
          transactionsService.getQRInfo(qrToken),
          transactionsService.getMaterials(),
        ]);
        if (!active) return;
        if (s.status !== 'success' || !s.data.valid) {
          setErrorMsg(s.data?.used ? t('deposit.usedCode') : t('deposit.expiredCode'));
          setStage('error');
          return;
        }
        setSession(s.data);
        setMaterials(m.data || []);
        setStage('form');
      } catch (err) {
        if (!active) return;
        setErrorMsg(err?.message || t('deposit.connectionErr'));
        setStage('error');
      }
    })();
    return () => { active = false; };
    // الترجمة لا تؤثر على صلاحية الرمز — ولا نريد إعادة الفحص عند تبديل اللغة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const json = await transactionsService.claimPublic({
        qrToken,
        phoneNumber: phone,
        materialType: material,
        weightKg: weight,
        username: username || undefined,
      });
      setResult(json.data);
      setStage('success');
    } catch (err) {
      setErrorMsg(err?.message || t('deposit.submitFailed'));
      setStage('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page} dir={dir}>
      {/* تبديل اللغة */}
      <button type="button" className={styles.langBtn} onClick={toggleLang} aria-label={t('auth.changeLang')}>
        {lang === 'ar' ? t('auth.langSwitchTo') : t('auth.langSwitchBack')}
      </button>

      {/* خلفية زخرفية */}
      <svg className={styles.bgLeaf} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 21c3 0 7-1.5 9-5.5C17.5 11 17 6.5 14.5 4c.5 4-1 7-3.5 8.5C8.5 14 6.5 16 6 19z" fill="rgba(255,255,255,0.08)" />
        <path d="M4 21c1.5-4 4-7 8-9-2 4-4.5 7-8 9z" fill="rgba(255,255,255,0.06)" />
      </svg>

      <div className={styles.card}>
        <div className={styles.brand}>
          <svg viewBox="0 0 60 60" className={styles.logoMark} fill="none" aria-hidden="true">
            <path d="M30 8a22 22 0 0 1 19.05 11.02l-4.3 2.48A17 17 0 0 0 30 13" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M50.2 20.4l1.3 6.9-6.6-2.5 5.3-4.4z" fill="#79c032" />
            <path d="M51.5 30a21.5 21.5 0 0 1-10.6 18.6l-2.4-4.4A17 17 0 0 0 46.6 30" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M40.6 50.1l-6.4 2.9.9-7 5.5 4.1z" fill="#79c032" />
            <path d="M30 51.5a21.6 21.6 0 0 1-17.6-9.1l4.1-2.9A17 17 0 0 0 30 46.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M11.6 43.4l-1.9-6.8 6.7 2.1-4.8 4.7z" fill="#79c032" />
            <path d="M30 25.5c5.5-4.2 11.5-3.6 14.5-3.1.6 3.3.3 9.6-5 13.7-4.2 3.2-8.3 2.3-10.5 1.5-1.9-3-2.3-8.7 1-12.1z" fill="#79c032" />
          </svg>
          <div>
            <h1 className={styles.brandName}><span>Eco</span>Cycle</h1>
            <p className={styles.brandSub}>{t('auth.brandSub')}</p>
          </div>
        </div>

        {/* ═══ المراحل ═══ */}
        {stage === 'loading' && (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>{t('deposit.verifying')}</p>
          </div>
        )}

        {stage === 'error' && (
          <div className={styles.center}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>{errorMsg}</p>
            <p className={styles.hint}>{t('deposit.errorHint')}</p>
          </div>
        )}

        {stage === 'form' && (
          <DepositForm
            session={session}
            materials={materials}
            phone={phone} onPhone={setPhone}
            username={username} onUsername={setUsername}
            material={material} onMaterial={setMaterial}
            weight={weight} onWeight={setWeight}
            submitting={submitting}
            onSubmit={submit}
          />
        )}

        {stage === 'success' && result && <DepositSuccess result={result} />}
      </div>

      <p className={styles.footer}>EcoCycle — {t('deposit.footerSlogan')}</p>
    </div>
  );
}

export default Deposit;
