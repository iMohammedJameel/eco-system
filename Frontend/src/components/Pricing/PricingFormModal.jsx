import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { MATERIAL_OPTIONS, MATERIAL_LABEL_KEYS, EMPTY_FORM } from './pricingMeta';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Pricing/Pricing.module.css';

/** يحوّل سعر من شكل الـ API لشكل النموذج */
const toForm = (p) => ({
  materialType: p.materialType || '',
  pricePerKg: p.pricePerKg ?? '',
  currency: p.currency || 'EGP',
  isActive: p.isActive ?? true,
});

/**
 * PricingFormModal — نموذج إضافة/تعديل سعر مادة داخل Modal.
 * نوع المادة يُختار فقط عند الإنشاء (المواد المسعّرة مستثناة) وثابت عند التعديل.
 */
function PricingFormModal({ open, editing, existingMaterials = [], submitting, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_FORM));

  const availableOptions = MATERIAL_OPTIONS.filter(
    (o) => editing || !existingMaterials.some((m) => m === o.value),
  ).map((o) => ({ value: o.value, label: t(o.labelKey) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.materialType || form.pricePerKg === '' || Number(form.pricePerKg) < 0) return;
    const payload = {
      pricePerKg: Number(form.pricePerKg),
      currency: form.currency || 'EGP',
      isActive: form.isActive,
    };
    if (!editing) payload.materialType = form.materialType;
    await onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('pricing.editTitle') : t('pricing.addTitle')}
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {editing ? (
          <div className={styles.fieldReadonly}>
            <label className={styles.label}>{t('pricing.fMaterial')}</label>
            <div className={styles.readonlyBox}>
              {MATERIAL_LABEL_KEYS[editing.materialType]
                ? t(MATERIAL_LABEL_KEYS[editing.materialType])
                : editing.materialType}
            </div>
          </div>
        ) : (
          <Input
            as="select"
            label={t('pricing.fMaterial')}
            value={form.materialType}
            onChange={(e) => setForm({ ...form, materialType: e.target.value })}
            required
            options={availableOptions}
          />
        )}
        <Input
          label={t('pricing.fPricePerKg')}
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerKg}
          onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
          required
          placeholder="5.00"
        />
        <Input
          label={t('pricing.fCurrency')}
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          placeholder="EGP"
          dir="ltr"
        />
        <Input
          as="select"
          label={t('pricing.fStatus')}
          value={form.isActive ? 'true' : 'false'}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          options={[
            { value: 'true', label: t('pricing.statusActive') },
            { value: 'false', label: t('pricing.statusInactive') },
          ]}
        />
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('pricing.saveEdit') : t('pricing.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default PricingFormModal;
