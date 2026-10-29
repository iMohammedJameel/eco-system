import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import PartnerCard from '../../components/Partners/PartnerCard';
import PartnerForm from '../../components/Partners/PartnerForm';
import { partnersService } from '../../services/partners';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAsyncData, useDebouncedValue } from '../../hooks/useAsyncData';
import { CATEGORY_OPTIONS } from '../../constants/categories';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Partners.module.css';

const EMPTY_PAGINATION = { total: 0, page: 1, limit: 12, pages: 1 };

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

function Partners() {
  const { role } = useAuth();
  const { t, dir } = useLanguage();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';
  const toast = useToast();

  // ── فلاتر القائمة ──
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  // البحث من السيرفر (مع debounce) — كان client-side على الصفحة المعروضة فقط
  const debouncedSearch = useDebouncedValue(search);

  // ── الجلب عبر الهوك المشترك ──
  const fetchPartners = useCallback(
    () => partnersService.getAll({ page, limit: 12, category: categoryFilter, search: debouncedSearch || undefined }),
    [page, categoryFilter, debouncedSearch],
  );
  const { data, loading, error, reload } = useAsyncData(fetchPartners, {
    initialData: { data: [], pagination: EMPTY_PAGINATION },
  });

  // ── إدارة الـ Modal والحذف ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await partnersService.update(editing._id, payload);
        toast.success(t('partners.updated'));
      } else {
        await partnersService.create(payload);
        toast.success(t('partners.added'));
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(err.message || t('partners.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await partnersService.remove(deleteTarget._id);
      toast.success(t('partners.deleted'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message || t('partners.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const partners = data.data || [];

  return (
    <PageLayout>
      <PageHeader
        title={t('partners.title')}
        subtitle={t('partners.subtitle', { n: data.pagination?.total ?? 0 })}
        actions={canManage && <Button onClick={openCreate} icon="add">{t('partners.add')}</Button>}
      />

      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={t('partners.searchPh')}
            className={styles.searchInput}
            dir={dir}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        <select
          className={styles.select}
          dir={dir}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t('partners.allCategories')}</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {CATEGORY_KEYS[c.value] ? t(CATEGORY_KEYS[c.value]) : c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoading variant="cards" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : partners.length === 0 ? (
        <EmptyState
          icon="🤝"
          title={debouncedSearch ? t('partners.emptySearchTitle') : t('partners.emptyTitle')}
          message={debouncedSearch
            ? t('partners.emptySearchMsg', { q: debouncedSearch })
            : (canManage ? t('partners.emptyAdd') : t('partners.emptyMatch'))}
          onAction={canManage && !debouncedSearch ? openCreate : undefined}
          actionLabel={t('partners.emptyAction')}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {partners.map((p) => (
              <PartnerCard
                key={p._id}
                p={p}
                canManage={canManage}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          <Pagination
            page={data.pagination?.page || 1}
            pages={data.pagination?.pages || 1}
            total={data.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      {/* key بيعيد تركيب النموذج مع كل هدف جديد → الحالة تتزفّر صح */}
      <PartnerForm
        key={editing?._id || 'new'}
        open={modalOpen}
        editing={editing}
        submitting={submitting}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('partners.deleteTitle')}
        message={t('partners.deleteMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <HelpButton title={t('partners.helpTitle')} body={t('partners.helpBody')} />
    </PageLayout>
  );
}

export default Partners;
