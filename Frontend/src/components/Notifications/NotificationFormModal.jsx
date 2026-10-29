import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { TYPE_OPTIONS, EMPTY_FORM } from './notificationMeta';
import styles from '../../pages/Notifications/Notifications.module.css';

/**
 * NotificationFormModal — نموذج إرسال إشعار (بث عام) داخل Modal.
 * onSend: async (payload) => { recipientCount } — يستخدم للرسالة التوضيحية.
 */
function NotificationFormModal({ open, submitting, onSend, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    await onSend({
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      recipient: form.recipient,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('notifications.sendTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label={t('notifications.fTitle')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder={t('notifications.fTitlePh')}
          maxLength={120}
        />
        <Input
          as="textarea"
          label={t('notifications.fMessage')}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={4}
          placeholder={t('notifications.fMessagePh')}
          maxLength={1000}
        />
        <div className={styles.row2}>
          <Input
            as="select"
            label={t('notifications.fType')}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          />
          <Input
            as="select"
            label={t('notifications.fRecipient')}
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            options={[
              { value: 'all', label: t('notifications.recipientAll') },
            ]}
          />
        </div>
        <div className={styles.actions}>
          <Button type="submit" loading={submitting} icon="bellRing">
            {t('notifications.sendConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
        <p className={styles.hint}>
          {t('notifications.hint')}
        </p>
      </form>
    </Modal>
  );
}

export default NotificationFormModal;
