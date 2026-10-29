import { useLanguage } from '../../context/LanguageContext';
import { MATERIALS, priceOf } from './depositMeta';
import styles from './Deposit.module.css';

/**
 * مرحلة نموذج الإيداع — عرض فقط؛ القيمة والمعالجات تصل عبر props
 * حتى تبقى حالة المستخدم محفوظة لو رجع من مرحلة لأخرى.
 */
export default function DepositForm({
  session, materials, phone, onPhone, username, onUsername,
  material, onMaterial, weight, onWeight, submitting, onSubmit,
}) {
  const { t } = useLanguage();
  const egp = t('dashboard.egp');
  const kg = t('dashboard.kg');
  const estimated = (weight * priceOf(materials, material)).toFixed(2);

  return (
    <>
      <div className={styles.machineBox}>
        <span className={styles.machineLabel}>{t('deposit.machineLabel')}</span>
        <strong className={styles.machineName}>{session?.machine?.name}</strong>
        <span className={styles.machineLoc}>{session?.machine?.location} — {session?.machine?.governorate}</span>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>{t('register.phone')}</span>
          <input
            type="tel"
            dir="ltr"
            inputMode="numeric"
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            pattern="(\+?2)?01[0-25][0-9]{8}"
            required
          />
          <small>{t('deposit.phoneHint')}</small>
        </label>

        <label className={styles.field}>
          <span>{t('deposit.nameOptional')}</span>
          <input
            type="text"
            placeholder={t('register.fullNamePh')}
            value={username}
            onChange={(e) => onUsername(e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span>{t('deposit.material')}</span>
          <div className={styles.materialGrid}>
            {MATERIALS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`${styles.materialCard} ${material === m.key ? styles.materialActive : ''}`}
                onClick={() => onMaterial(m.key)}
              >
                <span className={styles.materialEmoji}>{m.emoji}</span>
                <span>{t(m.labelKey)}</span>
                <small>{t('deposit.perKg', { price: priceOf(materials, m.key), egp, kg })}</small>
              </button>
            ))}
          </div>
        </div>

        <label className={styles.field}>
          <span>{t('deposit.weightLabel', { kg })}</span>
          <div className={styles.weightRow}>
            <button type="button" className={styles.weightBtn} onClick={() => onWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}>−</button>
            <input
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={weight}
              onChange={(e) => onWeight(Number(e.target.value) || 0.5)}
            />
            <button type="button" className={styles.weightBtn} onClick={() => onWeight((w) => Math.min(100, +(w + 0.5).toFixed(1)))}>+</button>
          </div>
        </label>

        <div className={styles.estimate}>
          <span>{t('deposit.estimate')}</span>
          <strong>{t('deposit.estimateValue', { amount: estimated, egp })}</strong>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? t('deposit.submitting') : t('deposit.confirm')}
        </button>
      </form>
    </>
  );
}
