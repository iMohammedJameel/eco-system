import { Icon } from '../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
import { statusOf, formatDate } from './couponMeta';
import styles from '../../pages/Coupons/Coupons.module.css';

/** فئات الشركاء → مفاتيح ترجمة (partners.cat*) */
const CATEGORY_KEYS = {
  supermarket: 'partners.catSupermarket',
  electronics: 'partners.catElectronics',
  pharmacy: 'partners.catPharmacy',
  fashion: 'partners.catFashion',
  food: 'partners.catFood',
  services: 'partners.catServices',
  other: 'partners.catOther',
};

/** جدول الكوبونات — عرض فقط، كل الإجراءات عبر props */
export default function CouponsTable({ coupons, onRedeem, onCancel }) {
  const { t, lang } = useLanguage();

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('coupons.thCode')}</th>
            <th>{t('coupons.thUser')}</th>
            <th>{t('coupons.thPartner')}</th>
            <th>{t('coupons.thOffer')}</th>
            <th>{t('coupons.thPoints')}</th>
            <th>{t('coupons.thStatus')}</th>
            <th>{t('coupons.thExpiry')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => {
            const st = statusOf(c);
            return (
              <tr key={c._id}>
                <td><span className={styles.code} dir="ltr">{c.code}</span></td>
                <td>
                  <div className={styles.cellUser}>
                    <span>{c.user?.username || '—'}</span>
                    <small dir="ltr">{c.user?.phoneNumber || ''}</small>
                  </div>
                </td>
                <td>
                  <div className={styles.cellUser}>
                    <span>{c.partner?.name || '—'}</span>
                    <small>
                      {CATEGORY_KEYS[c.partner?.category] ? t(CATEGORY_KEYS[c.partner.category]) : ''}
                    </small>
                  </div>
                </td>
                <td className={styles.offerCell}>{c.offer?.title || '—'}</td>
                <td className={styles.pointsCell}>{c.pointsCost}</td>
                <td><span className={`${styles.status} ${styles[st.cls]}`}>{t(st.labelKey)}</span></td>
                <td>{formatDate(c.expiresAt, lang)}</td>
                <td>
                  <div className={styles.actions}>
                    {c.status === 'issued' && (
                      <button className={styles.redeemBtn} onClick={() => onRedeem(c.code)} title={t('coupons.redeemTitle')}>
                        <Icon name="check" size={14} /> {t('coupons.redeem')}
                      </button>
                    )}
                    {c.status === 'issued' && (
                      <button className={styles.cancelBtn} onClick={() => onCancel(c)} title={t('coupons.cancelHint')}>
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
