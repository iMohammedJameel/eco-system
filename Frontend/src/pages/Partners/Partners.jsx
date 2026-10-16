import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { partnersService } from '../../services/partners';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Partners.module.css';

const CATEGORY_OPTIONS = [
  { value: 'supermarket',  label: 'سوبر ماركت' },
  { value: 'electronics',  label: 'إلكترونيات' },
  { value: 'pharmacy',     label: 'صيدلية' },
  { value: 'fashion',      label: 'أزياء' },
  { value: 'food',         label: 'طعام ومشروبات' },
  { value: 'services',     label: 'خدمات' },
  { value: 'other',        label: 'أخرى' },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]));
const CATEGORY_ICONS = {
  supermarket: '🛒',
  electronics: '📱',
  pharmacy: '💊',
  fashion: '👕',
  food: '🍔',
  services: '🤝',
  other: '🏪',
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

function Partners() {
  const { role } = useAuth();
  const canManage = role === 'superAdmin' || role === 'operationsManager';
  const canDelete = role === 'superAdmin';

  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersService.getAll({ page, limit: 12, category: categoryFilter });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = (data.data || []).filter((p) => {
    if (search && !(`${p.name} ${p.contactEmail} ${p.governorate}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      category: p.category || 'supermarket',
      contactEmail: p.contactEmail || '',
      contactPhone: p.contactPhone || '',
      website: p.website || '',
      address: p.address || '',
      governorate: p.governorate || '',
      isActive: p.isActive ?? true,
      offers: (p.discountOffers || []).map((o) => ({
        title: o.title || '',
        description: o.description || '',
        discountType: o.discountType || 'percentage',
        discountValue: o.discountValue ?? '',
        minSpend: o.minSpend ?? '',
        validUntil: o.validUntil ? o.validUntil.substring(0, 10) : '',
        isActive: o.isActive ?? true,
      })),
    });
    setModalOpen(true);
  };

  const addOffer = () => setForm({ ...form, offers: [...form.offers, { ...EMPTY_OFFER }] });
  const removeOffer = (i) => setForm({ ...form, offers: form.offers.filter((_, idx) => idx !== i) });
  const updateOffer = (i, field, value) => {
    const offers = [...form.offers];
    offers[i] = { ...offers[i], [field]: value };
    setForm({ ...form, offers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('يرجى إدخال اسم الشريك');
      return;
    }
    const payload = {
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

    setSubmitting(true);
    try {
      if (editing) {
        await partnersService.update(editing._id, payload);
        toast.success('تم تحديث الشريك بنجاح');
      } else {
        await partnersService.create(payload);
        toast.success('تمت إضافة الشريك بنجاح');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await partnersService.remove(deleteTarget._id);
      toast.success('تم حذف الشريك');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="إدارة الشركاء"
        subtitle={`إجمالي ${data.pagination?.total ?? 0} شريك`}
        actions={canManage && <Button onClick={openCreate} icon="add">إضافة شريك</Button>}
      />

      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="ابحث عن شريك بالاسم أو البريد..."
            className={styles.searchInput}
            dir="rtl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        <select
          className={styles.select}
          dir="rtl"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع الفئات</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonLoading variant="cards" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="لا يوجد شركاء"
          message={canManage ? 'ابدأ بإضافة أول شريك' : 'لا توجد بيانات مطابقة'}
          onAction={canManage ? openCreate : undefined}
          actionLabel="+ إضافة شريك"
        />
      ) : (
        <>
          <div className={styles.grid}>
            {filtered.map((p) => (
              <div key={p._id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.logoBox}>
                    {CATEGORY_ICONS[p.category] || '🏪'}
                  </div>
                  <div className={styles.cardHeadText}>
                    <h3 className={styles.name}>{p.name}</h3>
                    <span className={styles.category}>{CATEGORY_LABELS[p.category] || p.category}</span>
                  </div>
                  <span className={`${styles.statusChip} ${p.isActive ? styles.active : styles.inactive}`}>
                    {p.isActive ? 'نشط' : 'متوقف'}
                  </span>
                </div>

                <div className={styles.metaList}>
                  {p.contactEmail && <div className={styles.metaRow}><span>✉</span><span dir="ltr">{p.contactEmail}</span></div>}
                  {p.contactPhone && <div className={styles.metaRow}><span>📞</span><span dir="ltr">{p.contactPhone}</span></div>}
                  {p.address && <div className={styles.metaRow}><span>📍</span><span>{p.address}{p.governorate ? `، ${p.governorate}` : ''}</span></div>}
                </div>

                {p.discountOffers && p.discountOffers.length > 0 && (
                  <div className={styles.offersBox}>
                    <p className={styles.offersTitle}>عروض الخصومات ({p.discountOffers.length})</p>
                    {p.discountOffers.slice(0, 2).map((o, i) => (
                      <div key={i} className={styles.offer}>
                        <span className={styles.offerBadge}>
                          {o.discountType === 'percentage' ? `${o.discountValue}%` : `${o.discountValue} ج.م`}
                        </span>
                        <span className={styles.offerTitle}>{o.title}</span>
                      </div>
                    ))}
                    {p.discountOffers.length > 2 && (
                      <p className={styles.moreOffers}>+ {p.discountOffers.length - 2} عرض آخر</p>
                    )}
                  </div>
                )}

                {canManage && (
                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={() => openEdit(p)}>تعديل</button>
                    {canDelete && (
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(p)}>حذف</button>
                    )}
                  </div>
                )}
              </div>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل شريك' : 'إضافة شريك جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <Input
              label="اسم الشريك"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Kazyon Markets"
            />
            <Input
              as="select"
              label="الفئة"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div className={styles.row2}>
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="support@partner.com"
            />
            <Input
              label="رقم الهاتف"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="19009"
              dir="ltr"
            />
          </div>
          <Input
            label="الموقع الإلكتروني"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://..."
            dir="ltr"
          />
          <div className={styles.row2}>
            <Input
              label="العنوان"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="المحافظة"
              value={form.governorate}
              onChange={(e) => setForm({ ...form, governorate: e.target.value })}
            />
          </div>
          <Input
            as="select"
            label="الحالة"
            value={form.isActive ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'نشط' },
              { value: 'false', label: 'متوقف' },
            ]}
          />

          <div className={styles.offersSection}>
            <div className={styles.offersHeader}>
              <h4 className={styles.sectionTitle}>عروض الخصومات</h4>
              <Button type="button" variant="secondary" size="sm" onClick={addOffer} icon="add">
                إضافة عرض
              </Button>
            </div>

            {form.offers.length === 0 && (
              <p className={styles.offersEmpty}>لا توجد عروض. اضغط "إضافة عرض" لإضافة عرض جديد.</p>
            )}

            {form.offers.map((o, i) => (
              <div key={i} className={styles.offerForm}>
                <div className={styles.offerFormHead}>
                  <span className={styles.offerFormTitle}>عرض #{i + 1}</span>
                  <button type="button" className={styles.removeOffer} onClick={() => removeOffer(i)}>حذف العرض</button>
                </div>
                <Input
                  label="عنوان العرض"
                  value={o.title}
                  onChange={(e) => updateOffer(i, 'title', e.target.value)}
                  placeholder="10% off groceries"
                />
                <Input
                  as="textarea"
                  label="الوصف"
                  value={o.description}
                  onChange={(e) => updateOffer(i, 'description', e.target.value)}
                  rows={2}
                />
                <div className={styles.row3}>
                  <Input
                    as="select"
                    label="نوع الخصم"
                    value={o.discountType}
                    onChange={(e) => updateOffer(i, 'discountType', e.target.value)}
                    options={[
                      { value: 'percentage', label: 'نسبة مئوية %' },
                      { value: 'fixed', label: 'مبلغ ثابت' },
                    ]}
                  />
                  <Input
                    label="قيمة الخصم"
                    type="number"
                    min="0"
                    value={o.discountValue}
                    onChange={(e) => updateOffer(i, 'discountValue', e.target.value)}
                  />
                  <Input
                    label="الحد الأدنى للصرف"
                    type="number"
                    min="0"
                    value={o.minSpend}
                    onChange={(e) => updateOffer(i, 'minSpend', e.target.value)}
                  />
                </div>
                <div className={styles.row2}>
                  <Input
                    label="صالح حتى"
                    type="date"
                    value={o.validUntil}
                    onChange={(e) => updateOffer(i, 'validUntil', e.target.value)}
                  />
                  <Input
                    as="select"
                    label="حالة العرض"
                    value={o.isActive ? 'true' : 'false'}
                    onChange={(e) => updateOffer(i, 'isActive', e.target.value === 'true')}
                    options={[
                      { value: 'true', label: 'مفعّل' },
                      { value: 'false', label: 'متوقف' },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Button type="submit" loading={submitting}>
              {editing ? 'حفظ التعديلات' : 'إضافة الشريك'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الشريك"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ سيتم حذف جميع عروضه أيضاً.`}
        confirmLabel="حذف"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <button className={styles.helpBtn} title="مساعدة">?</button>
    </PageLayout>
  );
}

export default Partners;
