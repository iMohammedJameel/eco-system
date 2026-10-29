import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './AuthField.module.css';

/**
 * زر إظهار/إخفاء كلمة المرور — يُمرَّر كعنصر `trailing` لحقل كلمة المرور.
 * التصميم نفسه من صفحة التسجيل المعتمدة.
 */
export function EyeToggle({ visible, onToggle }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      className={styles.eyeBtn}
      onClick={onToggle}
      aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

/**
 * حقل إدخال موحّد: تسمية + أيقونة + مدخل + رسالة خطأ.
 * @param {string}   id          — معرّف الحقل (للـ label و aria)
 * @param {string}   label       — نص التسمية
 * @param {node}     icon        — أيقونة lucide (مثل <Mail size={18} />)
 * @param {string}   error       — رسالة الخطأ إن وُجدت
 * @param {boolean}  first       — أول حقل بالنموذج (بلا هامش علوي)
 * @param {node}     trailing    — عنصر في نهاية الحقل (زر إظهار كلمة المرور)
 * @param {object}   inputProps  — باقي خصائص الـ input (type/value/onChange…)
 */
export default function AuthField({ id, label, icon, error, first = false, trailing = null, inputProps = {} }) {
  return (
    <>
      <label className={`${styles.label} ${first ? styles.first : ''}`} htmlFor={id}>{label}</label>
      <div className={`${styles.field} ${error ? styles.fieldError : ''}`}>
        {icon && <span className={styles.fieldIcon}>{icon}</span>}
        <input id={id} {...inputProps} />
        {trailing}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </>
  );
}
