import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import HelpButton from '../../components/ui/HelpButton';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, EmptyState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { transactionsService } from '../../services/transactions';
import { useAsyncData, useDebouncedValue } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Transactions.module.css';

const TYPE_KEYS = {
  deposit:    { labelKey: 'transactions.typeDeposit',     className: 'typeDeposit',  icon: 'recycle' },
  withdrawal: { labelKey: 'transactions.typeWithdrawal', className: 'typeWithdraw', icon: 'banknote' },
};

const MATERIAL_KEYS = {
  plastic: 'dashboard.matPlastic',
  glass: 'dashboard.matGlass',
  cardboard: 'dashboard.matCardboard',
  paper: 'dashboard.matPaper',
};

const METHOD_KEYS = {
  bank: 'transactions.methodBank',
  mobile_wallet: 'transactions.methodWallet',
  coupon: 'transactions.methodCoupon',
};

function Transactions() {
  const { t, lang, dir } = useLanguage();

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [search, setSearch] = useState('');
  // البحث من السيرفر (مع debounce) — كان client-side على الصفحة المعروضة فقط
  const debouncedSearch = useDebouncedValue(search);

  const fetchTransactions = useCallback(
    () => transactionsService.getAll({
      page,
      limit: 15,
      type: typeFilter,
      materialType: materialFilter,
      suspicious: suspiciousOnly ? 'true' : '',
      search: debouncedSearch || undefined,
    }),
    [page, typeFilter, materialFilter, suspiciousOnly, debouncedSearch],
  );
  const { data, loading, error, reload } = useAsyncData(fetchTransactions, {
    initialData: { data: [], pagination: { total: 0, page: 1, limit: 15, pages: 1 } },
  });

  const transactions = data.data || [];

  return (
    <PageLayout>
      <PageHeader
        title={t('transactions.title')}
        subtitle={t('transactions.subtitle', { n: data.pagination?.total ?? 0 })}
      />

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={t('transactions.searchPh')}
            className={styles.searchInput}
            dir={dir}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <span className={styles.searchIcon}>
            <Icon name="search" size={16} />
          </span>
        </div>
        <select
          className={styles.select}
          dir={dir}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t('transactions.allTypes')}</option>
          <option value="deposit">{t('transactions.typeDeposit')}</option>
          <option value="withdrawal">{t('transactions.typeWithdrawal')}</option>
        </select>
        <select
          className={styles.select}
          dir={dir}
          value={materialFilter}
          onChange={(e) => { setMaterialFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t('transactions.allMaterials')}</option>
          <option value="plastic">{t('dashboard.matPlastic')}</option>
          <option value="glass">{t('dashboard.matGlass')}</option>
          <option value="cardboard">{t('dashboard.matCardboard')}</option>
          <option value="paper">{t('dashboard.matPaper')}</option>
        </select>
        <button
          type="button"
          className={`${styles.suspiciousToggle} ${suspiciousOnly ? styles.suspiciousActive : ''}`}
          onClick={() => { setSuspiciousOnly((s) => !s); setPage(1); }}
          title={t('transactions.suspiciousHint')}
        >
          <Icon name="shieldAlert" size={15} />
          {t('transactions.suspiciousOnly')}
        </button>
      </div>

      {loading ? (
        <SkeletonLoading variant="table" count={8} cols={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="⇄"
          title={t('transactions.emptyTitle')}
          message={t('transactions.emptyMsg')}
        />
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('transactions.thType')}</th>
                  <th>{t('transactions.thUser')}</th>
                  <th>{t('transactions.thMachine')}</th>
                  <th>{t('transactions.thMaterial')}</th>
                  <th>{t('transactions.thWeight')} ({t('transactions.kg')})</th>
                  <th>{t('transactions.thAmount')} ({t('transactions.egp')})</th>
                  <th>{t('transactions.thMethod')}</th>
                  <th>{t('transactions.thDate')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const tp = TYPE_KEYS[txn.type] || { labelKey: txn.type, className: '', icon: '•' };
                  const userName = typeof txn.user === 'object' ? txn.user?.username : txn.user || '—';
                  const userEmail = typeof txn.user === 'object' ? txn.user?.email : '';
                  const machineName = typeof txn.machine === 'object' ? txn.machine?.name : txn.machine;
                  return (
                    <tr key={txn._id}>
                      <td>
                        <span className={`${styles.typeChip} ${styles[tp.className]}`}>
                          <Icon name={tp.icon} size={13} /> {t(tp.labelKey)}
                        </span>
                        {txn.suspicious && (
                          <span className={styles.suspiciousBadge} title={t('transactions.suspiciousBadgeHint')}>
                            <Icon name="shieldAlert" size={11} /> {t('transactions.suspiciousBadge')}
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
                      <td className={styles.machineCell} title={machineName || undefined}>
                        {machineName || '—'}
                      </td>
                      <td>{txn.materialType ? t(MATERIAL_KEYS[txn.materialType] || txn.materialType) : '—'}</td>
                      <td className={styles.num}>{txn.weightKg ?? '—'}</td>
                      <td className={`${styles.num} ${styles.amount}`}>{(txn.amount ?? 0).toFixed(2)}</td>
                      <td>{txn.withdrawalMethod ? t(METHOD_KEYS[txn.withdrawalMethod] || txn.withdrawalMethod) : '—'}</td>
                      <td className={styles.date}>{formatDateTime(txn.createdAt)}</td>
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

      <HelpButton title={t('transactions.helpTitle')} body={t('transactions.helpBody')} />
    </PageLayout>
  );
}

export default Transactions;
