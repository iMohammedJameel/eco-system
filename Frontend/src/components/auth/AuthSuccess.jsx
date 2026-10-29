import { CheckCircle2 } from 'lucide-react';
import styles from './AuthSuccess.module.css';

/**
 * لوحة النجاح الختامية لصفحات المصادقة — أيقونة + عنوان + نص + زر/رابط.
 * @param {node} children — زر الإجراء (يُمرَّر من الصفحة ليتحكّم في التنقل)
 */
export default function AuthSuccess({ title, text, children }) {
  return (
    <div className={styles.successBox}>
      <CheckCircle2 className={styles.successIcon} size={72} strokeWidth={1.6} />
      <h2 className={styles.successTitle}>{title}</h2>
      <p className={styles.successText}>{text}</p>
      {children}
    </div>
  );
}
