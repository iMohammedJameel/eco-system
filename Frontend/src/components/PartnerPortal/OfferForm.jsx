import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/PartnerPortal/PartnerPortal.module.css';

const EMPTY_OFFER = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minSpend: '',
  validUntil: '',
  isActive: true,
};

/** يحوّل عرض من شكل الـ API لشكل النموذج (تاريخ yyyy-mm-dd) */
const toForm = (offer) => ({
  title: offer.title || '',
  description: offer.description || '',
  discountType: offer.discountType || 'percentage',
  discountValue: offer.discountValue ?? '',
  minSpend: offer.minSpend ?? '',
  validUntil: offer.validUntil ? offer.validUntil.substring(0, 10) : '',
  isActive: offer.isActive ?? true,
});

/** يجهّز payload الإرسال (أرقام + ISO date) */
function buildPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minSpend: form.minSpend ? Number(form.minSpend) : 0,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
    isActive: form.isActive,
  };
}

/**
 * OfferForm — نموذج إضافة/تعديل عرض خصم واحد داخل Modal.
 *
 * @param {boolean}        open       هل الـ Modal مفتوح؟
 * @param {object|null}    editing    العرض قيد التعديل (null = إنشاء جديد)
 * @param {boolean}        submitting حالة الإرسال
 * @param {(payload) => Promise} onSubmit يستدعى عند الحفظ
 * @param {function}       onClose    إغلاق
 */
function OfferForm({ open, editing, submitting, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_OFFER));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.discountValue === '') return;
    await onSubmit(buildPayload(form));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('portal.editTitle') : t('portal.addTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.offerForm}>
        <Input
          label={t('portal.fTitle')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder={t('portal.fTitlePh')}
        />
        <Input
          as="textarea"
          label={t('portal.fDesc')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
        <div className={styles.formRow2}>
          <Input
            as="select"
            label={t('portal.fDiscountType')}
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            options={[
              { value: 'percentage', label: t('portal.typePercentage') },
              { value: 'fixed', label: t('portal.typeFixed', { unit: t('dashboard.egp') }) },
            ]}
          />
          <Input
            label={t('portal.fDiscountValue')}
            type="number"
            min="0"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            required
          />
        </div>
        <div className={styles.formRow2}>
          <Input
            label={t('portal.fMinSpend', { unit: t('dashboard.egp') })}
            type="number"
            min="0"
            value={form.minSpend}
            onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
          />
          <Input
            label={t('portal.fValidUntil')}
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          />
        </div>
        <Input
          as="select"
          label={t('portal.fStatus')}
          value={form.isActive ? 'true' : 'false'}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          options={[
            { value: 'true', label: t('common.enabled') },
            { value: 'false', label: t('portal.stopped') },
          ]}
        />
        <div className={styles.formActions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('portal.saveEdit') : t('portal.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default OfferForm;
