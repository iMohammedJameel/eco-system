import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { TYPE_LABEL_KEYS, STATUS_OPTIONS, PRIORITY_OPTIONS, formatDateTime } from './issueMeta';
import styles from '../../pages/Issues/Issues.module.css';

/**
 * IssueEditModal — نافذة تفاصيل/تعديل البلاغ (حالة + أولوية + ملاحظات إدارة).
 *
 * @param {object|null} issue      البلاغ (null = مغلق)
 * @param {boolean}     submitting حالة الحفظ
 * @param {(payload) => Promise} onSubmit
 * @param {function}    onClose
 */
function IssueEditModal({ issue, submitting, onSubmit, onClose }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(() => ({
    status: issue?.status || 'open',
    priority: issue?.priority || 'medium',
    adminNotes: issue?.adminNotes || '',
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      status: form.status,
      priority: form.priority,
      adminNotes: form.adminNotes.trim(),
    });
  };

  return (
    <Modal
      open={!!issue}
      onClose={onClose}
      title={t('issues.editTitle')}
      size="md"
    >
      {issue && (
        <>
          <div className={styles.editInfoBox}>
            <div className={styles.editInfoRow}>
              <strong>{t('issues.infoType')}</strong> {t(TYPE_LABEL_KEYS[issue.type] || issue.type || '')}
            </div>
            <div className={styles.editInfoRow}>
              <strong>{t('issues.infoMachine')}</strong> {issue.machine?.name} — {issue.machine?.location}
            </div>
            <div className={styles.editInfoRow}>
              <strong>{t('issues.infoUser')}</strong> {issue.user?.username} ({issue.user?.email})
            </div>
            <div className={styles.editInfoRow}>
              <strong>{t('issues.infoDate')}</strong> {formatDateTime(issue.createdAt, lang)}
            </div>
            {issue.description && (
              <div className={styles.editInfoRow}>
                <strong>{t('issues.infoDescription')}</strong>
                <p>{issue.description}</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row2}>
              <Input
                as="select"
                label={t('issues.fStatus')}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              />
              <Input
                as="select"
                label={t('issues.fPriority')}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              />
            </div>
            <Input
              as="textarea"
              label={t('issues.fAdminNotes')}
              value={form.adminNotes}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
              rows={4}
              placeholder={t('issues.fAdminNotesPh')}
            />
            <div className={styles.actions}>
              <Button type="submit" loading={submitting}>{t('issues.saveEdit')}</Button>
              <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}

export default IssueEditModal;
