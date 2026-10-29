import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { citizenService } from '../../services/citizen';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './MyProfile.module.css';

/**
 * بروفايلي — المواطن يعدّل اسمه ورقمه ويغيّر كلمة مروره
 * (صفحة جديدة — قبل الإصلاح مفيش أي واجهة للمواطن على بياناته)
 */
function MyProfile() {
  const toast = useToast();
  const { t, lang } = useLanguage();

  // ── بيانات البروفايل ──
  const fetchMe = useCallback(() => citizenService.getMe(), []);
  const { data, loading, error, reload } = useAsyncData(fetchMe, { initialData: { data: null } });
  const me = data?.data;

  // نمط الحالة المشتقة (derived state) — بدون useEffect:
  // قبل أول تعديل من المستخدم، القيم تُشتق من البروفايل مباشرة
  const [draft, setDraft] = useState(null);
  const form = draft ?? { username: me?.username || '', phoneNumber: me?.phoneNumber || '' };
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setDraft({ ...form, [key]: value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await citizenService.updateMe({ username: form.username, phoneNumber: form.phoneNumber });
      toast.success(t('profile.savedToast'));
      setDraft(null); // رجوع للقيم المشتقة من البروفايل المحدّث
      await reload();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  // ── تغيير كلمة المرور ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passMismatch'));
      return;
    }
    setChangingPass(true);
    try {
      await citizenService.changePassword({ currentPassword, newPassword });
      toast.success(t('profile.passChangedToast'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
        <SkeletonLoading variant="cards" count={2} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  const joined = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
        month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <PageLayout>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className={styles.grid}>
        {/* ═══ البيانات الأساسية ═══ */}
        <form className={styles.panel} onSubmit={saveProfile}>
          <div className={styles.panelHead}>
            <span className={styles.panelIcon}><Icon name="user" size={18} /></span>
            <h3>{t('profile.basicInfo')}</h3>
          </div>

          <div className={styles.readonlyRow}>
            <div>
              <span className={styles.roLabel}>{t('citizen.email')}</span>
              <span className={styles.roValue} dir="ltr">{me?.email}</span>
            </div>
            <div>
              <span className={styles.roLabel}>{t('profile.memberSince')}</span>
              <span className={styles.roValue}>{joined}</span>
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>{t('profile.username')}</span>
            <input
              className={styles.input}
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              required
              minLength={2}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t('profile.phone')}</span>
            <input
              className={styles.input}
              dir="ltr"
              value={form.phoneNumber}
              onChange={(e) => setField('phoneNumber', e.target.value)}
              required
              pattern="(\+?2)?01[0-25][0-9]{8}"
              title="01xxxxxxxxx"
            />
            <span className={styles.hint}>{t('profile.phoneHint')}</span>
          </label>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <Icon name="save" size={16} />
            <span>{saving ? t('common.loading') : t('common.save')}</span>
          </button>
        </form>

        {/* ═══ تغيير كلمة المرور ═══ */}
        <form className={styles.panel} onSubmit={changePassword}>
          <div className={styles.panelHead}>
            <span className={styles.panelIcon}><Icon name="key" size={18} /></span>
            <h3>{t('profile.changePassword')}</h3>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>{t('profile.currentPassword')}</span>
            <input
              className={styles.input}
              dir="ltr"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t('profile.newPassword')}</span>
            <input
              className={styles.input}
              dir="ltr"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t('profile.confirmPassword')}</span>
            <input
              className={styles.input}
              dir="ltr"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className={styles.saveBtn} disabled={changingPass}>
            <Icon name="lock" size={16} />
            <span>{changingPass ? t('common.loading') : t('profile.changePassBtn')}</span>
          </button>
        </form>
      </div>
    </PageLayout>
  );
}

export default MyProfile;
