import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../../components/ui/Icon';
import styles from './NotFound.module.css';

/**
 * صفحة 404 — أي مسار غير معروف
 * (قبل الإصلاح: كانت ترجّع للداشبورد بصمت — المستخدم مايعرفش إنه كتب رابط غلط)
 */
function NotFound() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={styles.page} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.card}>
        <div className={styles.art} aria-hidden="true">
          <Icon name="recycle" size={56} className={styles.recycleIcon} />
          <span className={styles.fourZeroFour}>404</span>
        </div>
        <h1 className={styles.title}>{t('notfound.title')}</h1>
        <p className={styles.message}>{t('notfound.message')}</p>
        <div className={styles.actions}>
          <Link to="/" className={styles.primaryBtn}>
            <Icon name="home" size={17} />
            <span>{t('notfound.backHome')}</span>
          </Link>
          <Link to="/deposit" className={styles.secondaryBtn}>
            <Icon name="qrCode" size={17} />
            <span>{t('notfound.deposit')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
