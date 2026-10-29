import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Users/Users.module.css';

const EMPTY_FORM = {
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  isActive: true,
};

/** يحوّل مستخدم من شكل الـ API لشكل النموذج (كلمة المرور فارغة دائمًا عند التعديل) */
const toForm = (u) => ({
  username: u.username || '',
  email: u.email || '',
  phoneNumber: u.phoneNumber || '',
  password: '',
  isActive: u.isActive ?? true,
});

/** يجهّز payload الإرسال — كلمة المرور تُرسل فقط لو اتملت */
function buildPayload(form, editing) {
  if (editing) {
    return {
      username: form.username.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      isActive: form.isActive,
      ...(form.password ? { password: form.password } : {}),
    };
  }
  return {
    username: form.username.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    password: form.password,
  };
}

/**
 * UserFormModal — نموذج إضافة/تعديل مستخدم داخل Modal.
 * نفس عقد OfferForm: (open, editing, submitting, onSubmit, onClose)
 */
function UserFormModal({ open, editing, submitting, onSubmit, onClose }) {
  const { t, dir } = useLanguage();
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_FORM));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.phoneNumber.trim()) return;
    if (!editing && !form.password) return;
    await onSubmit(buildPayload(form, editing));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('users.editTitle') : t('users.addTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label={t('users.fUsername')}
          dir={dir}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          label={t('users.fEmail')}
          type="email"
          dir="ltr"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label={t('users.fPhone')}
          dir="ltr"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          required
          placeholder="01012345678"
        />
        <Input
          label={editing ? t('users.fPasswordKeep') : t('users.fPassword')}
          type="password"
          dir={dir}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editing}
        />
        {editing && (
          <Input
            as="select"
            label={t('users.fStatus')}
            dir={dir}
            value={form.isActive ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: t('users.stActive') },
              { value: 'false', label: t('users.stSuspended') },
            ]}
          />
        )}
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>
            {editing ? t('users.saveEdit') : t('users.addConfirm')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
