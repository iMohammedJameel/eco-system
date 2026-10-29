import { useLanguage } from '../../context/LanguageContext';
import styles from './AuthButton.module.css';

/**
 * زر الإرسال الأساسي لصفحات المصادقة — يعرض سبينر أثناء التحميل.
 * يدعم أيضًا روابط react-router عبر as={Link} (خاصية disabled
 * تُطبَّق على الأزرار فقط لأنها ليست attribute صالحًا للروابط).
 */
export default function AuthButton({ children, loading = false, as = 'button', ...rest }) {
  const { t } = useLanguage();
  const Tag = as;
  const isButton = as === 'button';
  return (
    <Tag
      className={styles.primaryBtn}
      {...(isButton ? { disabled: loading } : {})}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-label={t('ui.loading')} /> : children}
    </Tag>
  );
}
