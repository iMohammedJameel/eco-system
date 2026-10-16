import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  title = 'تأكيد',
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`${styles.confirm} ${danger ? styles.danger : ''}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'جارٍ...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
