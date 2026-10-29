import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, SkeletonLoading, EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { citizenService } from '../../services/citizen';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MyHistory.module.css';

/**
 * سجل معاملاتي — المواطن يشوف إيداعاته وسحوباته بترقيم وفلتر
 * (صفحة جديدة — قبل الإصلاح مفيش أي واجهة للمواطن على سجل معاملاته)
 */
const TYPE_FILTERS = [
  { key: '', labelKey: 'common.all' },
  { key: 'deposit', labelKey: 'wallet.deposit' },
  { key: 'withdrawal', labelKey: 'wallet.withdrawal' },
];

/* مفاتيح المواد وطرق السحب — نفس مصدر صفحة المعاملات */
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

function MyHistory() {
  const { t, lang } = useLanguage();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');

  const fetchHistory = useCallback(
    () => citizenService.getMyTransactions({ page, limit: 10, type: type || undefined }),
    [page, type],
  );
  const { data, loading, error, reload } = useAsyncData(fetchHistory, {
    initialData: { data: [], pagination: { total: 0, page: 1, pages: 1 } },
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1 };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <PageLayout>
      <PageHeader title={t('history.title')} subtitle={t('history.subtitle')} />

      {/* فلتر النوع */}
      <div className={styles.filters}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterBtn} ${type === f.key ? styles.activeFilter : ''}`}
            onClick={() => { setType(f.key); setPage(1); }}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoading variant="list" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="recycle"
          title={t('history.emptyTitle')}
          message={t('history.emptyMsg')}
        />
      ) : (
        <>
          <div className={styles.list}>
            {transactions.map((tx) => (
              <div key={tx._id} className={styles.row}>
                <span className={`${styles.typeBadge} ${tx.type === 'deposit' ? styles.badgeIn : styles.badgeOut}`}>
                  <Icon name={tx.type === 'deposit' ? 'trendingUp' : 'trendingDown'} size={16} />
                  {tx.type === 'deposit' ? t('wallet.deposit') : t('wallet.withdrawal')}
                </span>

                <div className={styles.info}>
                  <span className={styles.primary}>
                    {tx.type === 'deposit'
                      ? `${tx.weightKg} ${t('common.kg')} · ${tx.materialType ? t(MATERIAL_KEYS[tx.materialType] || tx.materialType) : '—'}`
                      : `${t(METHOD_KEYS[tx.withdrawalMethod] || tx.withdrawalMethod || '') || '—'}`}
                  </span>
                  <span className={styles.secondary}>
                    {tx.machine?.name ? `${tx.machine.name} — ` : ''}{fmtDate(tx.createdAt)}
                  </span>
                </div>

                <span className={`${styles.amount} ${tx.type === 'deposit' ? styles.amtIn : styles.amtOut}`}>
                  {tx.type === 'deposit' ? '+' : '−'}{Number(tx.amount).toFixed(2)} {t('common.egp')}
                </span>
              </div>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onChange={setPage}
          />
        </>
      )}
    </PageLayout>
  );
}

export default MyHistory;
