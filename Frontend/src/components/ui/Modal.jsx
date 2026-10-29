import { useEffect, useId, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Modal.module.css';

export default function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  const { dir } = useLanguage();
  const modalRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };

    // a11y: نحفظ مكان الفوكس قبل الفتح ونعيده للإغلاق، وننقل الفوكس للمودال عند الفتح
    const previouslyFocused = document.activeElement;
    modalRef.current?.focus();

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} dir={dir}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`${styles.modal} ${styles[size] || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title} id={titleId}>{title}</h3>
          <button className={styles.close} onClick={onClose} type="button" aria-label="×">×</button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
