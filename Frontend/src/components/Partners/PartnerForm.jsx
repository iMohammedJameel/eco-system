import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CATEGORY_OPTIONS } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Partners/Partners.module.css';

/** فئات الشركاء → مفاتيح ترجمة (partners.cat*) */
const CATEGORY_KEYS = {
  supermarket: 'partners.catSupermarket',
  electronics: 'partners.catElectronics',
  pharmacy: 'partners.catPharmacy',
  fashion: 'partners.catFashion',
  food: 'partners.catFood',
  services: 'partners.catServices',
  other: 'partners.catOther',
};

const EMPTY_FORM = {
  name: '',
  category: 'supermarket',
  contactEmail: '',
  contactPhone: '',
  website: '',
  address: '',
  governorate: '',
  isActive: true,
  offers: [],
};

const EMPTY_OFFER = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minSpend: '',
  validUntil: '',
  isActive: true,
};

/** يحوّل offer من شكل الـ API (camelCase + ISO date) لشكل النموذج */
const toFormOffer = (o) => ({
  title: o.title || '',
  description: o.description || '',
  discountType: o.discountType || 'percentage',
  discountValue: o.discountValue ?? '',
  minSpend: o.minSpend ?? '',
  validUntil: o.validUntil ? o.validUntil.substring(0, 10) : '',
  isActive: o.isActive ?? true,
});

/** يجهّز الـ payload النهائي للإرسال (تنظيف + تحويل أنواع) */
function buildPayload(form) {
  return {
    name: form.name.trim(),
    category: form.category,
    contactEmail: form.contactEmail.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    website: form.website.trim() || undefined,
    address: form.address.trim() || undefined,
    governorate: form.governorate.trim() || undefined,
    isActive: form.isActive,
    discountOffers: form.offers
      .filter((o) => o.title.trim() && o.discountValue)
      .map((o) => ({
        title: o.title.trim(),
        description: o.description?.trim() || undefined,
        discountType: o.discountType,
        discountValue: Number(o.discountValue) || 0,
        minSpend: o.minSpend ? Number(o.minSpend) : 0,
        validUntil: o.validUntil ? new Date(o.validUntil).toISOString() : undefined,
        isActive: o.isActive,
      })),
  };
}

/**
 * PartnerForm — نموذج إضافة/تعديل شريك داخل Modal،
 * ويتضمن محرر عروض الخصومات المتداخل (إضافة/حذف/تعديل عرض).
 *
 * @param {boolean}     open        هل الـ Modal مفتوح؟
 * @param {object|null} editing     الشريك قيد التعديل (null = إضافة جديد)
 * @param {boolean}     submitting  حالة الإرسال الجارية
 * @param {function}    onSubmit    (payload) => Promise — يستدعيه عند الحفظ
 * @param {function}    onClose     إغلاق الـ Modal
 */
function PartnerForm({ open, editing, submitting, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name || '',
          category: editing.category || 'supermarket',
          contactEmail: editing.contactEmail || '',
          contactPhone: editing.contactPhone || '',
          website: editing.website || '',
          address: editing.address || '',
          governorate: editing.governorate || '',
          isActive: editing.isActive ?? true,
          offers: (editing.discountOffers || []).map(toFormOffer),
        }
      : EMPTY_FORM,
  );

  // ── إدارة العروض المتداخلة ──
  const addOffer = () =>
    setForm((f) => ({ ...f, offers: [...f.offers, { ...EMPTY_OFFER }] }));

  const removeOffer = (i) =>
    setForm((f) => ({ ...f, offers: f.offers.filter((_, idx) => idx !== i) }));

  const updateOffer = (i, field, value) =>
    setForm((f) => {
      const offers = [...f.offers];
      offers[i] = { ...offers[i], [field]: value };
      return { ...f, offers };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSubmit(buildPayload(form));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('partners.editTitle') : t('partners.addTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row2}>
          <Input
            label={t('partners.fName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Kazyon Markets"
          />
          <Input
            as="select"
            label={t('partners.fCategory')}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={CATEGORY_OPTIONS.map((c) => ({
              value: c.value,
              label: CATEGORY_KEYS[c.value] ? t(CATEGORY_KEYS[c.value]) : c.label,
            }))}
          />
        </div>
        <div className={styles.row2}>
          <Input
            label={t('partners.fEmail')}
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            placeholder="support@partner.com"
            dir="ltr"
          />
          <Input
            label={t('partners.fPhone')}
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            placeholder="19009"
            dir="ltr"
          />
        </div>
        <Input
          label={t('partners.fWebsite')}
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://..."
          dir="ltr"
        />
        <div className={styles.row2}>
          <Input
            label={t('partners.fAddress')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            label={t('partners.fGovernorate')}
            value={form.governorate}
            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
          />
        </div>
        <Input
          as="select"
          label={t('partners.fStatus')}
          value={form.isActive ? 'true' : 'false'}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          options={[
            { value: 'true', label: t('partners.statusActive') },
            { value: 'false', label: t('partners.statusInactive') },
          ]}
        />

        <div className={styles.offersSection}>
          <div className={styles.offersHeader}>
            <h4 className={styles.sectionTitle}>{t('partners.offersSection')}</h4>
            <Button type="button" variant="secondary" size="sm" onClick={addOffer} icon="add">
              {t('partners.addOffer')}
            </Button>
          </div>

          {form.offers.length === 0 && (
            <p className={styles.offersEmpty}>{t('partners.offersEmpty')}</p>
          )}

          {form.offers.map((o, i) => (
            <div key={i} className={styles.offerForm}>
              <div className={styles.offerFormHead}>
                <span className={styles.offerFormTitle}>{t('partners.offerNum', { n: i + 1 })}</span>
                <button type="button" className={styles.removeOffer} onClick={() => removeOffer(i)}>
                  {t('partners.removeOffer')}
                </button>
              </div>
              <Input
                label={t('partners.fOfferTitle')}
                value={o.title}
                onChange={(e) => updateOffer(i, 'title', e.target.value)}
                placeholder="10% off groceries"
              />
              <Input
                as="textarea"
                label={t('partners.fOfferDesc')}
                value={o.description}
                onChange={(e) => updateOffer(i, 'description', e.target.value)}
                rows={2}
              />
              <div className={styles.row3}>
                <Input
                  as="select"
                  label={t('partners.fDiscountType')}
                  value={o.discountType}
                  onChange={(e) => updateOffer(i, 'discountType', e.target.value)}
                  options={[
                    { value: 'percentage', label: t('partners.dtPercentage') },
                    { value: 'fixed', label: t('partners.dtFixed') },
                  ]}
                />
                <Input
                  label={t('partners.fDiscountValue')}
                  type="number"
                  min="0"
                  value={o.discountValue}
                  onChange={(e) => updateOffer(i, 'discountValue', e.target.value)}
                />
                <Input
                  label={t('partners.fMinSpend')}
                  type="number"
                  min="0"
                  value={o.minSpend}
                  onChange={(e) => updateOffer(i, 'minSpend', e.target.value)}
                />
              </div>
              <div className={styles.row2}>
                <Input
                  label={t('partners.fValidUntil')}
                  type="date"
                  value={o.validUntil}
                  onChange={(e) => updateOffer(i, 'validUntil', e.target.value)}
                />
                <Input
                  as="select"
                  label={t('partners.fOfferStatus')}
                  value={o.isActive ? 'true' : 'false'}
                  onChange={(e) => updateOffer(i, 'isActive', e.target.value === 'true')}
                  options={[
                    { value: 'true', label: t('partners.offerActive') },
                    { value: 'false', label: t('partners.offerInactive') },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('partners.saveEdit') : t('partners.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default PartnerForm;
