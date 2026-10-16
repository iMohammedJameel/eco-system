import { useEffect, useState } from 'react';
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
import styles from './Reports.module.css';

function Reports() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, m, mat] = await Promise.all([
        statsService.getOverview(),
        statsService.getMonthly(),
        statsService.getMaterials(),
      ]);
      setOverview(ov.data || null);
      setMonthly(m.data || []);
      setMaterials(mat.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [exporting, setExporting] = useState('');

  const handleExport = async (type) => {
    setExporting(type);
    try {
      await api.download('/dashboard/reports/export', { type });
      toast.success(`تم تنزيل تقرير ${type === 'monthly' ? 'الإيرادات الشهرية' : type === 'materials' ? 'الخامات' : 'المعاملات'} — Excel`);
    } catch {
      toast.error('فشل تصدير التقرير');
    } finally {
      setExporting('');
    }
  };

  /** PDF عبر طباعة المتصفح — يدعم العربي بجودة كاملة */
  const handlePrint = () => {
    const monthLabels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const rows = (monthly || []).map((m) => `
      <tr>
        <td>${monthLabels[(m._id.month || 1) - 1]} ${m._id.year}</td>
        <td>${m.count}</td>
        <td>${(m.totalWeight || 0).toFixed(1)}</td>
        <td>${(m.totalAmount || 0).toFixed(2)}</td>
      </tr>`).join('');

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>EcoCycle — التقرير المالي</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1b2a22; }
          h1 { color: #0d6c3d; font-size: 22px; }
          .sub { color: #5b6b62; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #0d6c3d; color: #fff; padding: 10px; text-align: right; }
          td { padding: 9px 10px; border-bottom: 1px solid #e3ece5; text-align: right; }
          tr:nth-child(even) td { background: #f4f9f5; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand span { font-weight: 800; font-size: 24px; color: #0d6c3d; }
          .brand span i { color: #79c032; font-style: normal; }
          @media print { .noprint { display: none; } }
        </style>
      </head>
      <body>
        <div class="brand"><span>Eco<i>Cycle</i></span> — التقرير المالي</div>
        <h1>الإيرادات الشهرية — آخر 12 شهرًا</h1>
        <p class="sub">تم الإنشاء ${new Date().toLocaleString('ar-EG')} · إجمالي الإيرادات ${(overview?.recycling?.totalRevenue ?? 0).toFixed(2)} ج.م · إجمالي الوزن ${(overview?.recycling?.totalWeightKg ?? 0).toFixed(1)} كجم</p>
        <table>
          <thead><tr><th>الشهر</th><th>عدد المعاملات</th><th>الوزن (كجم)</th><th>الإيرادات (ج.م)</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">لا توجد بيانات</td></tr>'}</tbody>
        </table>
        <p class="noprint" style="margin-top:30px;color:#8a9990;font-size:12px">استخدم Ctrl+P ثم «حفظ كـ PDF» لحفظ التقرير</p>
        <script>window.onload = () => setTimeout(() => window.print(), 600)<\/script>
      </body>
      </html>
    `);
    w.document.close();
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="التقارير المالية" subtitle="نظرة شاملة على الأداء المالي للنظام" />
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
        <PageHeader title="التقارير المالية" subtitle="نظرة شاملة على الأداء المالي للنظام" />
        <ErrorState message={error} onRetry={load} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="التقارير المالية"
        subtitle="نظرة شاملة على الأداء المالي للنظام"
        actions={
          <div className={styles.exportBtns}>
            <Button variant="secondary" size="sm" onClick={handlePrint} icon="printer">تصدير PDF</Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('transactions')}
              icon="download"
              disabled={exporting === 'transactions'}
            >
              {exporting === 'transactions' ? 'جارٍ التصدير...' : 'تصدير المعاملات Excel'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('monthly')}
              icon="download"
              disabled={exporting === 'monthly'}
            >
              {exporting === 'monthly' ? 'جارٍ التصدير...' : 'تصدير الشهور Excel'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('materials')}
              icon="download"
              disabled={exporting === 'materials'}
            >
              {exporting === 'materials' ? 'جارٍ التصدير...' : 'تصدير الخامات Excel'}
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
