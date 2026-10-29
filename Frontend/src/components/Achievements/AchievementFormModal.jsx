import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
import { METRIC_OPTIONS, ICON_OPTIONS, EMPTY_FORM } from './achievementMeta';
import styles from '../../pages/Achievements/Achievements.module.css';

/** يحوّل إنجاز من شكل الـ API لشكل النموذج */
const toForm = (a) => ({
  name: a.name || '',
  description: a.description || '',
  icon: a.icon || 'sprout',
  metric: a.metric || 'totalDeposits',
  threshold: a.threshold ?? '',
  xpReward: a.xpReward ?? '',
  badgeColor: a.badgeColor || '#0d6c3d',
  isActive: a.isActive ?? true,
});

/** يجهّز payload الإرسال (أرقام + قيم افتراضية) */
function buildPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    icon: form.icon || 'sprout',
    metric: form.metric,
    threshold: Number(form.threshold),
    xpReward: Number(form.xpReward) || 0,
    badgeColor: form.badgeColor || '#0d6c3d',
    isActive: form.isActive,
  };
}

/**
 * AchievementFormModal — نموذج إضافة/تعديل إنجاز داخل Modal.
 * نفس عقد OfferForm: (open, editing, submitting, onSubmit, onClose)
 * ويُستخدم مع key={editing?._id || 'new'} لتهيئة النموذج مع كل هدف.
 */
function AchievementFormModal({ open, editing, submitting, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_FORM));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.threshold === '' || Number(form.threshold) < 0) return;
    await onSubmit(buildPayload(form));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('achievements.editTitle') : t('achievements.addTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label={t('achievements.fName')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder={t('achievements.fNamePh')}
        />
        <Input
          as="textarea"
          label={t('achievements.fDescription')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          placeholder={t('achievements.fDescriptionPh')}
        />
        <div className={styles.row2}>
          {/* اختيار الأيقونة من قائمة lucide صحيحة + معاينة حية —
              كان input حر وبيقبل أي نص/إيموجي فبيبوظ رندر الكارت */}
          <div className={styles.iconField}>
            <Input
              as="select"
              label={t('achievements.fIcon')}
              value={ICON_OPTIONS.some((o) => o.value === form.icon) ? form.icon : 'sprout'}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              options={ICON_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <span
              className={styles.iconPreview}
              style={{ background: `${form.badgeColor}22`, color: form.badgeColor }}
              aria-hidden="true"
            >
              <Icon name={ICON_OPTIONS.some((o) => o.value === form.icon) ? form.icon : 'sprout'} size={22} />
            </span>
          </div>
          <Input
            label={t('achievements.fBadgeColor')}
            type="color"
            value={form.badgeColor}
            onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
          />
        </div>
        <Input
          as="select"
          label={t('achievements.fMetric')}
          value={form.metric}
          onChange={(e) => setForm({ ...form, metric: e.target.value })}
          options={METRIC_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
        />
        <div className={styles.row2}>
          <Input
            label={t('achievements.fThreshold')}
            type="number"
            min="0"
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })}
            required
            placeholder="50"
          />
          <Input
            label={t('achievements.fReward')}
            type="number"
            min="0"
            value={form.xpReward}
            onChange={(e) => setForm({ ...form, xpReward: e.target.value })}
            placeholder="75"
          />
        </div>
        <Input
          as="select"
          label={t('achievements.fStatus')}
          value={form.isActive ? 'true' : 'false'}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          options={[
            { value: 'true', label: t('achievements.enabled') },
            { value: 'false', label: t('achievements.disabled') },
          ]}
        />
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('achievements.saveEdit') : t('achievements.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AchievementFormModal;
