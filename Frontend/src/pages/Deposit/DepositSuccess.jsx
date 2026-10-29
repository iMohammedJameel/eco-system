import { useLanguage } from '../../context/LanguageContext';
import styles from './Deposit.module.css';

/** مرحلة نجاح الإيداع — ملخص المكافأة والإنجازات والملاحظات الأمنية */
export default function DepositSuccess({ result }) {
  const { t } = useLanguage();
  const egp = t('dashboard.egp');
  // تقريب لخانتين — حماية من أخطاء دقة الفاصلة العائمة في العرض (133.54000000000002 → 133.54)
  const cleanBalance = Number(result.newBalance || 0).toFixed(2);

  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>🎉</div>
      <h2>{t('deposit.successTitle')}</h2>
      <p className={styles.successAmount}>
        {t('deposit.earnedMsg', { earned: result.earned, balance: cleanBalance, egp })}
      </p>
      <p className={styles.successUser}>
        {result.user?.createdAccount
          ? t('deposit.newUserMsg', { name: result.user?.username })
          : t('deposit.welcomeBackMsg', { name: result.user?.username })}
      </p>

      {(result.unlockedAchievements || []).length > 0 && (
        <div className={styles.achievements}>
          <span className={styles.achTitle}>{t('deposit.newAchievements')}</span>
          {result.unlockedAchievements.map((a) => (
            <span key={a.id} className={styles.achChip} style={{ borderColor: a.badgeColor }}>
              {a.name}
            </span>
          ))}
        </div>
      )}

      {result.suspicious && (
        <p className={styles.suspiciousNote}>
          {t('deposit.suspiciousNote')}
        </p>
      )}

      <div className={styles.machineMini}>
        {result.machine?.name} — {result.machine?.location}
      </div>

      <p className={styles.hint}>{t('deposit.showScreenHint')}</p>
    </div>
  );
}
