import { useState, useCallback } from 'react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { ErrorState, SkeletonLoading } from '../../components/ui/EmptyState';
import ReportsStats from '../../components/Reports/ReportsStats';
import RevenueChart from '../../components/Reports/RevenueChart';
import RevenueDonut from '../../components/Reports/RevenueDonut';
import MonthlyDetails from '../../components/Reports/MonthlyDetails';
import { statsService } from '../../services/stats';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import styles from './Reports.module.css';

function Reports() {
  const toast = useToast();
  const { t, lang, dir } = useLanguage();

  const fetchAll = useCallback(
    () => Promise.all([
      statsService.getOverview(),
      statsService.getMonthly(),
      statsService.getMaterials(),
    ]),
    [],
  );
  const { data: all, loading, error, reload } = useAsyncData(fetchAll, {
    initialData: [null, { data: [] }, { data: [] }],
  });
  const [ov, m, mat] = all;
  const overview = ov?.data ?? null;
  const monthly = m?.data || [];
  const materials = mat?.data || [];

  const [exporting, setExporting] = useState('');

  /* رسالة نجاح التصدير حسب نوع التقرير */
  const EXPORTED_KEYS = {
    monthly: 'reports.exportedMonthly',
    materials: 'reports.exportedMaterials',
    transactions: 'reports.exportedTransactions',
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      await api.download('/dashboard/reports/export', { type });
      toast.success(t(EXPORTED_KEYS[type] || EXPORTED_KEYS.transactions));
    } catch {
      toast.error(t('reports.exportFailed'));
    } finally {
      setExporting('');
    }
  };

  /** PDF عبر طباعة المتصفح — يدعم العربي بجودة كاملة (lang/dir حسب اللغة الحالية) */
  const handlePrint = () => {
    const monthLabels = t('dashboard.months');
    const rows = (monthly || []).map((m) => `
      <tr>
        <td>${monthLabels[(m._id.month || 1) - 1]} ${m._id.year}</td>
        <td>${m.count}</td>
        <td>${(m.totalWeight || 0).toFixed(1)}</td>
        <td>${(m.totalAmount || 0).toFixed(2)}</td>
      </tr>`).join('');

    const htmlLang = lang === 'ar' ? 'ar' : 'en';
    const htmlDir = dir;
    const cellAlign = dir === 'rtl' ? 'right' : 'left';
    const generatedAt = new Date().toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US');
    const totalRevenue = `${(overview?.recycling?.totalRevenue ?? 0).toFixed(2)} ${t('dashboard.egp')}`;
    const totalWeight = `${(overview?.recycling?.totalWeightKg ?? 0).toFixed(1)} ${t('dashboard.kg')}`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(`
      <!DOCTYPE html>
      <html lang="${htmlLang}" dir="${htmlDir}">
      <head>
        <meta charset="UTF-8">
        <title>EcoCycle — ${t('reports.printDocTitle')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1b2a22; }
          h1 { color: #0d6c3d; font-size: 22px; }
          .sub { color: #5b6b62; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #0d6c3d; color: #fff; padding: 10px; text-align: ${cellAlign}; }
          td { padding: 9px 10px; border-bottom: 1px solid #e3ece5; text-align: ${cellAlign}; }
          tr:nth-child(even) td { background: #f4f9f5; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand span { font-weight: 800; font-size: 24px; color: #0d6c3d; }
          .brand span i { color: #79c032; font-style: normal; }
          @media print { .noprint { display: none; } }
        </style>
      </head>
      <body>
        <div class="brand"><span>Eco<i>Cycle</i></span> — ${t('reports.printDocTitle')}</div>
        <h1>${t('reports.printH1')}</h1>
        <p class="sub">${t('reports.printMeta', { date: generatedAt, revenue: totalRevenue, weight: totalWeight })}</p>
        <table>
          <thead><tr><th>${t('reports.thMonth')}</th><th>${t('reports.thTxCount')}</th><th>${t('reports.thWeight', { unit: t('dashboard.kg') })}</th><th>${t('reports.thRevenue', { unit: t('dashboard.egp') })}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="4">${t('reports.printNoData')}</td></tr>`}</tbody>
        </table>
        <p class="noprint" style="margin-top:30px;color:#8a9990;font-size:12px">${t('reports.printHint')}</p>
        <script>window.onload = () => setTimeout(() => window.print(), 600)</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />
        <SkeletonLoading variant="stats" count={4} />
        <div className={styles.chartsRow}>
          <SkeletonLoading variant="cards" count={1} />
          <SkeletonLoading variant="cards" count={1} />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />
        <ErrorState message={error} onRetry={reload} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <div className={styles.exportBtns}>
            <Button variant="secondary" size="sm" onClick={handlePrint} icon="printer">{t('reports.exportPdf')}</Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('transactions')}
              icon="download"
              disabled={exporting === 'transactions'}
            >
              {exporting === 'transactions' ? t('reports.exporting') : t('reports.exportTransactions')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('monthly')}
              icon="download"
              disabled={exporting === 'monthly'}
            >
              {exporting === 'monthly' ? t('reports.exporting') : t('reports.exportMonthly')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('materials')}
              icon="download"
              disabled={exporting === 'materials'}
            >
              {exporting === 'materials' ? t('reports.exporting') : t('reports.exportMaterials')}
            </Button>
          </div>
        }
      />

      <ReportsStats overview={overview} />

      <div className={styles.chartsRow}>
        <RevenueChart monthly={monthly} />
        <RevenueDonut materials={materials} />
      </div>

      <MonthlyDetails monthly={monthly} />
    </PageLayout>
  );
}

export default Reports;
