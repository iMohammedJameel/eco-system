import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove],
  );

  // ثابت بالهوية (useMemo) — بدونه كل render جديد كان بيعمل object جديد
  // وبيعيد رسم كل المستهلكين للتوست (نفس المشكلة الشهيرة في value={{...}})
  const toast = useMemo(
    () => ({
      success: (msg, d) => push(msg, 'success', d),
      error: (msg, d) => push(msg, 'error', d),
      info: (msg, d) => push(msg, 'info', d),
      warning: (msg, d) => push(msg, 'warning', d),
      remove,
    }),
    [push, remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <span className={styles.icon}>
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '⚠'}
              {t.type === 'info' && 'ℹ'}
            </span>
            <span className={styles.message}>{t.message}</span>
            <button className={styles.close} onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
