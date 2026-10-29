import { useState, useRef, useId, useEffect } from 'react';
import styles from './Tooltip.module.css';

/**
 * Tooltip — accessible hover/focus tooltip.
 * Props: content (string), position (top|bottom|left|right), children
 */
export default function Tooltip({
  content,
  position = 'top',
  children,
  delay = 300,
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const id = useId();

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  // تنظيف المؤقت المعلق عند الفك — يمنع setOpen بعد unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!content) return children;

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        aria-describedby={open ? id : undefined}
        className={styles.trigger}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={`${styles.tooltip} ${styles[position] || styles.top}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
