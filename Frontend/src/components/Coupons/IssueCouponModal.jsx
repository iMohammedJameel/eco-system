import { useState, useCallback } from 'react';
import Modal from '../ui/Modal';
import { useAsyncData, useDebouncedValue } from '../../hooks/useAsyncData';
import { usersService } from '../../services/users';
import { partnersService } from '../../services/partners';
import { useLanguage } from '../../context/LanguageContext';
import styles from '../../pages/Coupons/Coupons.module.css';

const EMPTY_FORM = { userId: '', partnerId: '', offerTitle: '', pointsCost: 40, validityDays: 30 };

/**
 * نموذج إصدار كوبون — مكوّن مستقل يمتلك حالة النموذج وخيارات البحث.
 * onIssue: async (payload) => void — يرفع استثناء عند الفشل فيبقى النموذج مفتوحًا.
 */
export default function IssueCouponModal({ open, submitting, onIssue, onClose }) {
  const { t, dir } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);

  // بحث المستخدمين من السيرفر (بدل تحميل أول 100 بس) + الشركاء عند فتح النموذج
  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebouncedValue(userSearch, 400);

  const fetchUserOptions = useCallback(
    () => (open
      ? usersService.getAll({ limit: 50, search: debouncedUserSearch || undefined })
      : Promise.resolve({ data: [] })),
    [open, debouncedUserSearch],
  );
  const { data: usersRes, loading: usersLoading } = useAsyncData(fetchUserOptions, {
    initialData: { data: [] },
  });
  const users = usersRes?.data || [];

  const fetchPartnerOptions = useCallback(
    () => (open ? partnersService.getAll({ limit: 500 }) : Promise.resolve({ data: [] })),
    [open],
  );
  const { data: partnersRes } = useAsyncData(fetchPartnerOptions, { initialData: { data: [] } });
  const partners = partnersRes?.data || [];

  const selectedPartner = partners.find((p) => p._id === form.partnerId);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.partnerId) return; // required attributes تغطي الحالة دي
    try {
      // offerTitle فاضي → متتبعتش (السيرفر بيرفض النص الفاضي)
      const payload = { ...form, offerTitle: form.offerTitle?.trim() || undefined };
      await onIssue(payload);
      setForm(EMPTY_FORM);
      setUserSearch('');
      onClose();
    } catch {
      /* الصفحة الأم عرضت رسالة الخطأ — النموذج يبقى مفتوحًا للمحاولة مجددًا */
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={t('coupons.issueTitle')}>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          <span>{t('coupons.searchUser')}</span>
          <input
            type="text"
            placeholder={t('coupons.searchUserPh')}
            dir={dir}
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setForm({ ...form, userId: '' }); }}
          />
        </label>
        <label className={styles.field}>
          <span>{usersLoading ? t('coupons.userSearching') : t('coupons.userResults', { n: users.length })}</span>
          <select
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            required
          >
            <option value="">{t('coupons.selectUser')}</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username} ({u.balance?.toFixed?.(0) ?? 0} {t('coupons.egpShort')})
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{t('coupons.partner')}</span>
          <select
            value={form.partnerId}
            onChange={(e) => setForm({ ...form, partnerId: e.target.value, offerTitle: '' })}
            required
          >
            <option value="">{t('coupons.selectPartner')}</option>
            {partners.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{t('coupons.offer')}</span>
          <select
            value={form.offerTitle}
            onChange={(e) => setForm({ ...form, offerTitle: e.target.value })}
          >
            <option value="">{t('coupons.defaultOffer')}</option>
            {(selectedPartner?.discountOffers || []).filter((o) => o.isActive).map((o) => (
              <option key={o._id || o.title} value={o.title}>{o.title}</option>
            ))}
          </select>
        </label>

        <div className={styles.formRow}>
          <label className={styles.field}>
            <span>{t('coupons.pointsCost')}</span>
            <input
              type="number"
              min="1"
              max="100000"
              value={form.pointsCost}
              onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
              required
            />
          </label>
          <label className={styles.field}>
            <span>{t('coupons.validityDays')}</span>
            <input
              type="number"
              min="1"
              max="365"
              value={form.validityDays}
              onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? t('coupons.issuing') : t('coupons.issueBtn')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
