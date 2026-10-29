import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Machines/Machines.module.css';

const EMPTY_FORM = {
  name: '',
  location: '',
  governorate: '',
  lat: '',
  lng: '',
  status: 'active',
  fillPercentage: 0,
};

/** يحوّل ماكينة من شكل الـ API لشكل النموذج (إحداثيات مسطّحة) */
const toForm = (m) => ({
  name: m.name || '',
  location: m.location || '',
  governorate: m.governorate || '',
  lat: m.coordinates?.lat ?? '',
  lng: m.coordinates?.lng ?? '',
  status: m.status || 'active',
  fillPercentage: m.fillPercentage ?? 0,
});

/** يجهّز payload الإرسال (إحداثيات رقمية + الحالة فقط عند التعديل) */
function buildPayload(form, editing) {
  const payload = {
    name: form.name.trim(),
    location: form.location.trim(),
    governorate: form.governorate.trim(),
    coordinates: form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : undefined,
  };
  if (editing) {
    payload.status = form.status;
    payload.fillPercentage = Number(form.fillPercentage) || 0;
  }
  return payload;
}

/**
 * MachineFormModal — نموذج إضافة/تعديل ماكينة داخل Modal.
 * نفس عقد OfferForm: (open, editing, submitting, onSubmit, onClose)
 */
function MachineFormModal({ open, editing, submitting, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_FORM));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.governorate.trim()) return;
    await onSubmit(buildPayload(form, editing));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('machines.editTitle') : t('machines.addTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label={t('machines.fName')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder={t('machines.fNamePh')}
        />
        <Input
          label={t('machines.fLocation')}
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
          placeholder={t('machines.fLocationPh')}
        />
        <Input
          label={t('machines.fGovernorate')}
          value={form.governorate}
          onChange={(e) => setForm({ ...form, governorate: e.target.value })}
          required
          placeholder={t('machines.fGovernoratePh')}
        />
        <div className={styles.row2}>
          <Input
            label={t('machines.fLat')}
            type="number"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            placeholder="29.96"
            step="any"
          />
          <Input
            label={t('machines.fLng')}
            type="number"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            placeholder="31.26"
            step="any"
          />
        </div>
        {editing && (
          <div className={styles.row2}>
            <Input
              as="select"
              label={t('machines.fStatus')}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'active', label: t('machines.statsActive') },
                { value: 'nearlyFull', label: t('dashboard.statusNearlyFull') },
                { value: 'offline', label: t('machines.statsOffline') },
              ]}
            />
            <Input
              label={t('machines.fFill')}
              type="number"
              min="0"
              max="100"
              value={form.fillPercentage}
              onChange={(e) => setForm({ ...form, fillPercentage: e.target.value })}
            />
          </div>
        )}
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('machines.saveEdit') : t('machines.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MachineFormModal;
