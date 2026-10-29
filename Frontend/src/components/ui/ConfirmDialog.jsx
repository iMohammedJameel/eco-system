import Modal from './Modal';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { t } = useLanguage();

  return (
    <Modal open={open} title={title || t('common.confirm')} onClose={onClose} size="sm">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel || t('common.cancel')}
        </button>
        <button
          type="button"
          className={`${styles.confirm} ${danger ? styles.danger : ''}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? t('common.loading') : (confirmLabel || t('common.confirm'))}
        </button>
      </div>
    </Modal>
  );
}
