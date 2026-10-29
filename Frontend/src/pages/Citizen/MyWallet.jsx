import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, SkeletonLoading } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { citizenService } from '../../services/citizen';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MyWallet.module.css';

/* مفاتيح المواد — نفس مصدر صفحة المعاملات */
const MATERIAL_KEYS = {
  plastic: 'dashboard.matPlastic',
  glass: 'dashboard.matGlass',
  cardboard: 'dashboard.matCardboard',
  paper: 'dashboard.matPaper',
};

/**
 * محفظة المواطن — الرصيد والمستوى والإحصائيات وآخر الحركات
 * (صفحة جديدة — قبل الإصلاح المواطن ماكانش عنده أي واجهة يشوف فيها رصيده)
 */
const MATERIAL_META = {
  plastic: { icon: 'package', color: 'plastic' },
  glass: { icon: 'gem', color: 'glass' },
  cardboard: { icon: 'package', color: 'cardboard' },
  paper: { icon: 'fileText', color: 'paper' },
};

function MyWallet() {
  const { t } = useLanguage();

  const fetchWallet = useCallback(() => citizenService.getWallet(), []);
  const { data, loading, error, reload } = useAsyncData(fetchWallet, { initialData: { data: null } });
  const wallet = data?.data;

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')} />
        <SkeletonLoading variant="stats" count={4} />
        <div style={{ height: 16 }} />
        <SkeletonLoading variant="list" count={4} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')} />
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  const levelKey = `wallet.level_${wallet?.level || 'beginner'}`;
  const levelPct = {
    beginner: 15, active: 40, good: 70, excellent: 100,
  }[wallet?.level || 'beginner'];

  const stats = [
    { icon: 'recycle', label: t('wallet.totalWeight'), value: `${(wallet?.deposits?.weightKg || 0).toFixed(1)} ${t('common.kg')}`, },
    { icon: 'package', label: t('wallet.depositsCount'), value: wallet?.deposits?.count || 0, },
    { icon: 'coins', label: t('wallet.totalEarned'), value: `${(wallet?.deposits?.earned || 0).toFixed(2)} ${t('common.egp')}`, },
    { icon: 'ticket', label: t('wallet.activeCoupons'), value: wallet?.activeCoupons || 0, },
  ];

  return (
    <PageLayout>
      <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')} />

      {/* ═══ كارت الرصيد ═══ */}
      <div className={styles.balanceHero}>
        <div className={styles.balanceMain}>
          <span className={styles.balanceLabel}>{t('wallet.currentBalance')}</span>
          <span className={styles.balanceValue}>
            {(wallet?.balance || 0).toFixed(2)}
            <small> {t('common.egp')}</small>
          </span>
          <Link to="/my-coupons" className={styles.redeemLink}>
            <Icon name="ticket" size={15} />
            <span>{t('wallet.redeemCTA')}</span>
          </Link>
        </div>

        <div className={styles.levelCard}>
          <div className={styles.levelHead}>
            <Icon name="sprout" size={18} />
            <span>{t('wallet.yourLevel')}</span>
          </div>
          <strong className={styles.levelName}>{t(levelKey)}</strong>
          <div className={styles.levelBar}>
            <span style={{ width: `${levelPct}%` }} />
          </div>
          <p className={styles.levelHint}>{t('wallet.levelHint', { kg: wallet?.totalDepositsKg?.toFixed?.(1) || 0 })}</p>
        </div>
      </div>

      {/* ═══ الإحصائيات ═══ */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statIcon}><Icon name={s.icon} size={20} /></span>
            <div>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.twoCols}>
        {/* ═══ آخر الحركات ═══ */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>{t('wallet.recentActivity')}</h3>
            <Link to="/my-history">{t('wallet.viewAll')}</Link>
          </div>
          {(wallet?.recentTransactions || []).length === 0 ? (
            <p className={styles.emptyMsg}>{t('wallet.noTransactions')}</p>
          ) : (
            <ul className={styles.txList}>
              {wallet.recentTransactions.map((tx) => (
                <li key={tx._id} className={styles.txItem}>
                  <span className={`${styles.txIcon} ${tx.type === 'deposit' ? styles.txIn : styles.txOut}`}>
                    <Icon name={tx.type === 'deposit' ? 'trendingUp' : 'trendingDown'} size={15} />
                  </span>
                  <div className={styles.txInfo}>
                    <span className={styles.txTitle}>
                      {tx.type === 'deposit'
                        ? `${t('wallet.deposit')} · ${tx.materialType ? t(MATERIAL_KEYS[tx.materialType] || tx.materialType) : '—'}`
                        : t('wallet.withdrawal')}
                    </span>
                    <span className={styles.txSub}>{tx.machine?.name || '—'}</span>
                  </div>
                  <span className={`${styles.txAmount} ${tx.type === 'deposit' ? styles.txIn : styles.txOut}`}>
                    {tx.type === 'deposit' ? '+' : '−'}{Number(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ═══ التوزيع حسب المادة ═══ */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>{t('wallet.byMaterial')}</h3>
          </div>
          {(wallet?.byMaterial || []).length === 0 ? (
            <p className={styles.emptyMsg}>{t('wallet.noTransactions')}</p>
          ) : (
            <ul className={styles.matList}>
              {wallet.byMaterial.map((m) => {
                const meta = MATERIAL_META[m._id] || { icon: 'package', color: 'plastic' };
                const max = Math.max(...wallet.byMaterial.map((x) => x.weight), 1);
                return (
                  <li key={m._id} className={styles.matItem}>
                    <span className={`${styles.matIcon} ${styles[meta.color]}`}>
                      <Icon name={meta.icon} size={15} />
                    </span>
                    <div className={styles.matInfo}>
                      <div className={styles.matRow}>
                        <span>{t(MATERIAL_KEYS[m._id] || m._id)}</span>
                        <span className={styles.matWeight}>{m.weight.toFixed(1)} {t('common.kg')}</span>
                      </div>
                      <div className={styles.matBar}>
                        <span style={{ width: `${(m.weight / max) * 100}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default MyWallet;
