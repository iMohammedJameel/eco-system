import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from './Icon';
import styles from './HelpButton.module.css';

/**
 * HelpButton — زر المساعدة العائم (بديل أزرار «?» الميتة).
 * - يفتح popover بمحتوى مساعدة حقيقي (title + body من i18n)
 * - يقفل بـ Escape أو الضغط خارج الـ popover
 * - مثبّت أسفل-يمين فيزيائيًا في اللغتين — بعيد عن السايدبار المثبّت شمال
 *   (الأزرار القديمة كانت أسفل-شمال z-50 فكانت بتتغطى بالسايدبار z-100 على الديسكتوب)
 * - الـ popover نفسه بيرث اتجاه الصفحة (RTL عربي / LTR إنجليزي)
 */
export default function HelpButton({ title, body }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!title && !body) return null;

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.btn} ${open ? styles.btnActive : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={title || t('common.help')}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={title || undefined}
      >
        <Icon name="help" size={19} />
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label={title}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={14} />
          </button>
          {title && <h4 className={styles.popoverTitle}>{title}</h4>}
          {body && <p className={styles.popoverBody}>{body}</p>}
        </div>
      )}
    </div>
  );
}
