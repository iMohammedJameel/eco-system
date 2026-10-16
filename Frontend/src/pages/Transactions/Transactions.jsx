import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { transactionsService } from '../../services/transactions';
import styles from './Transactions.module.css';

const TYPE_LABELS = {
  deposit:    { text: 'إيداع',  className: 'typeDeposit', icon: 'recycle' },
  withdrawal: { text: 'سحب',    className: 'typeWithdraw', icon: 'banknote' },
};

const MATERIAL_LABELS = {
  plastic: 'بلاستيك',
  glass: 'زجاج',
  cardboard: 'كرتون',
  paper: 'ورق',
};

const METHOD_LABELS = {
  bank: 'حساب بنكي',
  mobile_wallet: 'محفظة موبايل',
  coupon: 'كوبون شريك',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Transactions() {
  const [data, setData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionsService.getAll({
        page,
        limit: 15,
        type: typeFilter,
        materialType: materialFilter,
        suspicious: suspiciousOnly ? 'true' : '',
      });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, materialFilter, suspiciousOnly]);

  useEffect(() => { load(); }, [load]);

  const filtered = (data.data || []).filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const userName = typeof t.user === 'object' ? t.user?.username : t.user;
      const machineName = typeof t.machine === 'object' ? t.machine?.name : t.machine;
      if (!(`${userName} ${machineName} ${t.accountNumber || ''}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <PageLayout>
      <PageHeader
        title="سجل المعاملات"
        subtitle={`إجمالي ${data.pagination?.total ?? 0} معاملة`}
      />

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="ابحث باسم المستخدم أو الماكينة..."
            className={styles.searchInput}
            dir="rtl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <Icon name="search" size={16} />
          </span>
        </div>
        <select
          className={styles.select}
          dir="rtl"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع الأنواع</option>
          <option value="deposit">إيداع</option>
          <option value="withdrawal">سحب</option>
        </select>
        <select
          className={styles.select}
          dir="rtl"
          value={materialFilter}
          onChange={(e) => { setMaterialFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع المواد</option>
          <option value="plastic">بلاستيك</option>
          <option value="glass">زجاج</option>
          <option value="cardboard">كرتون</option>
          <option value="paper">ورق</option>
        </select>
        <button
          type="button"
          className={`${styles.suspiciousToggle} ${suspiciousOnly ? styles.suspiciousActive : ''}`}
          onClick={() => { setSuspiciousOnly((s) => !s); setPage(1); }}
          title="معاملات مُعلّمة تلقائيًا بواسطة كشف الاحتيال"
        >
          <Icon name="shieldAlert" size={15} />
          مشتبهة فقط
        </button>
      </div>

      {loading ? (
        <SkeletonLoading variant="table" count={8} cols={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⇄"
          title="لا توجد معاملات"
          message="لا توجد معاملات مطابقة للفلاتر الحالية"
        />
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>النوع</th>
                  <th>المستخدم</th>
                  <th>الماكينة</th>
                  <th>المادة</th>
                  <th>الوزن (كجم)</th>
                  <th>المبلغ (ج.م)</th>
                  <th>طريقة السحب</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const tp = TYPE_LABELS[t.type] || { text: t.type, className: '', icon: '•' };
                  const userName = typeof t.user === 'object' ? t.user?.username : t.user || '—';
                  const userEmail = typeof t.user === 'object' ? t.user?.email : '';
                  const machineName = typeof t.machine === 'object' ? t.machine?.name : t.machine;
                  return (
                    <tr key={t._id}>
                      <td>
                        <span className={`${styles.typeChip} ${styles[tp.className]}`}>
                          <Icon name={tp.icon} size={13} /> {tp.text}
                        </span>
                        {t.suspicious && (
                          <span className={styles.suspiciousBadge} title="مُعلّمة بواسطة كشف الاحتيال">
                            <Icon name="shieldAlert" size={11} /> مشبوهة
                          </span>
                        )}
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{(userName || '?').slice(0, 2).toUpperCase()}</div>
                          <div>
                            <div className={styles.userName}>{userName}</div>
                            {userEmail && <div className={styles.userEmail} dir="ltr">{userEmail}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{machineName || '—'}</td>
                      <td>{t.materialType ? MATERIAL_LABELS[t.materialType] || t.materialType : '—'}</td>
                      <td className={styles.num}>{t.weightKg ?? '—'}</td>
                      <td className={`${styles.num} ${styles.amount}`}>{(t.amount ?? 0).toFixed(2)}</td>
                      <td>{t.withdrawalMethod ? METHOD_LABELS[t.withdrawalMethod] || t.withdrawalMethod : '—'}</td>
                      <td className={styles.date}>{formatDateTime(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.pagination?.page || 1}
            pages={data.pagination?.pages || 1}
            total={data.pagination?.total}
            onChange={setPage}
          />
        </>
      )}

      <button className={styles.helpBtn} title="مساعدة">?</button>
    </PageLayout>
  );
}

export default Transactions;
