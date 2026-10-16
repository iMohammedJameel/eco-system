import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Deposit.module.css';

const MATERIALS = [
  { key: 'plastic',  label: 'بلاستيك', emoji: '🥤' },
  { key: 'glass',    label: 'زجاج',    emoji: '🍶' },
  { key: 'cardboard',label: 'كرتون',   emoji: '📦' },
  { key: 'paper',    label: 'ورق',     emoji: '📄' },
];

const PRICES_FALLBACK = { plastic: 5, glass: 3, cardboard: 4, paper: 2 };

const API = '/api';

function Deposit() {
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
    if (!qrToken) {
      setStage('error');
      setErrorMsg('رابط غير صالح — امسح رمز QR من ماكينة EcoCycle');
      return;
    }
    (async () => {
      try {
        const [s, m] = await Promise.all([
          fetch(`${API}/transactions/qr-info?qrToken=${qrToken}`).then((r) => r.json()),
          fetch(`${API}/transactions/materials`).then((r) => r.json()),
        ]);
        if (s.status !== 'success' || !s.data.valid) {
          setStage('error');
          setErrorMsg(s.data?.used ? 'هذا الرمز مستخدم بالفعل' : 'انتهت صلاحية الرمز — امسح رمزًا جديدًا');
          return;
        }
        setSession(s.data);
        setMaterials(m.data || []);
        setStage('form');
      } catch {
        setStage('error');
        setErrorMsg('تعذر الاتصال بالخادم — تأكد من اتصالك');
      }
    })();
  }, [qrToken]);

  const pricePerKg = (materials.find((m) => m.materialType === material)?.pricePerKg) ?? PRICES_FALLBACK[material];
  const estimated = (weight * pricePerKg).toFixed(2);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/transactions/claim-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          phoneNumber: phone,
          materialType: material,
          weightKg: weight,
          username: username || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        setErrorMsg(json.msg || 'فشل تسجيل الإيداع');
        setStage('error');
        return;
      }
      setResult(json.data);
      setStage('success');
    } catch {
      setErrorMsg('تعذر الاتصال بالخادم');
      setStage('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page} dir="rtl">
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
            <p className={styles.brandSub}>منصة إعادة التدوير الذكية</p>
          </div>
        </div>

        {/* ═══ المراحل ═══ */}
        {stage === 'loading' && (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>جارٍ التحقق من الرمز...</p>
          </div>
        )}

        {stage === 'error' && (
          <div className={styles.center}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>{errorMsg}</p>
            <p className={styles.hint}>لو المشكلة مستمرة، جرب تمسح رمز QR جديد من الماكينة</p>
          </div>
        )}

        {stage === 'form' && (
          <>
            <div className={styles.machineBox}>
              <span className={styles.machineLabel}>ماكينة الإيداع</span>
              <strong className={styles.machineName}>{session?.machine?.name}</strong>
              <span className={styles.machineLoc}>{session?.machine?.location} — {session?.machine?.governorate}</span>
            </div>

            <form onSubmit={submit} className={styles.form}>
              <label className={styles.field}>
                <span>رقم الموبايل</span>
                <input
                  type="tel"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="(\+?2)?01[0-25][0-9]{8}"
                  required
                />
                <small>هنربط الإيداع برصيدك برقم الموبايل — لو أول مرة، هنفتحلك حساب فورًا</small>
              </label>

              <label className={styles.field}>
                <span>اسمك (اختياري — لأول مرة)</span>
                <input
                  type="text"
                  placeholder="مثال: أحمد محمود"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>

              <div className={styles.field}>
                <span>الخامة</span>
                <div className={styles.materialGrid}>
                  {MATERIALS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`${styles.materialCard} ${material === m.key ? styles.materialActive : ''}`}
                      onClick={() => setMaterial(m.key)}
                    >
                      <span className={styles.materialEmoji}>{m.emoji}</span>
                      <span>{m.label}</span>
                      <small>{priceOf(materials, m.key)} ج.م/كجم</small>
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                <span>الوزن التقريبي (كجم)</span>
                <div className={styles.weightRow}>
                  <button type="button" className={styles.weightBtn} onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}>−</button>
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value) || 0.5)}
                  />
                  <button type="button" className={styles.weightBtn} onClick={() => setWeight((w) => Math.min(100, +(w + 0.5).toFixed(1)))}>+</button>
                </div>
              </label>

              <div className={styles.estimate}>
                <span>مكافأتك المتوقعة</span>
                <strong>{estimated} ج.م</strong>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'جارٍ تسجيل الإيداع...' : 'تأكيد الإيداع'}
              </button>
            </form>
          </>
        )}

        {stage === 'success' && result && (
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h2>تم الإيداع بنجاح!</h2>
            <p className={styles.successAmount}>
              كسبت <strong>{result.earned} ج.م</strong> — رصيدك الآن <strong>{result.newBalance} ج.م</strong>
            </p>
            <p className={styles.successUser}>
              {result.user?.createdAccount
                ? `فتحنا لك حساب جديد يا ${result.user?.username} — تكسب مع كل إيداع!`
                : `يا ${result.user?.username}، استمر في التدوير!`}
            </p>

            {(result.unlockedAchievements || []).length > 0 && (
              <div className={styles.achievements}>
                <span className={styles.achTitle}>🏆 إنجازات جديدة:</span>
                {result.unlockedAchievements.map((a) => (
                  <span key={a.id} className={styles.achChip} style={{ borderColor: a.badgeColor }}>
                    {a.name}
                  </span>
                ))}
              </div>
            )}

            {result.suspicious && (
              <p className={styles.suspiciousNote}>
                ملاحظة: الإيداع قيد المراجعة الأمنية وسريعًا هيتفعّل كاملًا
              </p>
            )}

            <div className={styles.machineMini}>
              {result.machine?.name} — {result.machine?.location}
            </div>

            <p className={styles.hint}>قدّم الشاشة دي للموظف لو مطلوب — مع تحيات EcoCycle 🌿</p>
          </div>
        )}
      </div>

      <p className={styles.footer}>EcoCycle — معاً .. لبيئة أفضل</p>
    </div>
  );
}

function priceOf(materials, key) {
  return materials.find((m) => m.materialType === key)?.pricePerKg ?? PRICES_FALLBACK[key];
}

export default Deposit;
