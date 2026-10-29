import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import styles from './RecyclingChart.module.css';

/* مفاتيح النطاقات محايدة لغويًا — التسميات عبر i18n */
const RANGES = [
  { key: 'day',   labelKey: 'dashboard.rangeDay' },
  { key: 'week',  labelKey: 'dashboard.rangeWeek' },
  { key: 'month', labelKey: 'dashboard.rangeMonth' },
];

/**
 * تنسيق البيانات الحقيقية الثلاثة (يوم/أسبوع/شهر) لصيغة الرسم {x, y}
 * — قبل الإصلاح: نطاقا اليوم والأسبوع كانا يُولَّدان بمعادلات Math.sin
 * مزيفة من إجمالي الشهر؛ الآن كل نطاق من تجميع حقيقي في الـ DB.
 */
function useSeries({ todayHourly, weekDaily, monthly }, range, lang) {
  return useMemo(() => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-GB';

    if (range === 'day') {
      // ساعات العمل 8 صباحًا — 10 مساءً (أوضح للقراءة من 24 نقطة)
      const byHour = new Map((todayHourly || []).map((h) => [h.hour, h]));
      return Array.from({ length: 15 }, (_, i) => {
        const hour = i + 8;
        const h = byHour.get(hour);
        return {
          x: new Date(2024, 0, 1, hour).toLocaleTimeString(locale, { hour: 'numeric' }),
          y: Math.round((h?.totalWeight || 0) * 10) / 10,
        };
      });
    }

    if (range === 'week') {
      return (weekDaily || []).map((d) => ({
        x: new Date(d._id.year, d._id.month - 1, d._id.day)
          .toLocaleDateString(locale, { weekday: 'short' }),
        y: Math.round((d.totalWeight || 0) * 10) / 10,
      }));
    }

    const monthLabels = {
      ar: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }[lang === 'ar' ? 'ar' : 'en'];

    return (monthly || []).map((m) => ({
      x: monthLabels[(m._id.month || 1) - 1] || `${m._id.month}`,
      y: Math.round((m.totalWeight || 0) * 10) / 10,
    }));
  }, [todayHourly, weekDaily, monthly, range, lang]);
}

function ChartTooltip({ active, payload, label, kgLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipLabel}>{label}</span>
      <span className={styles.tooltipValue}>{payload[0].value.toLocaleString('en-US')} {kgLabel}</span>
    </div>
  );
}

function RecyclingChart({ todayHourly = [], weekDaily = [], monthly = [] }) {
  const { t, isRTL, lang } = useLanguage();
  const [active, setActive] = useState('month');
  const displayData = useSeries({ todayHourly, weekDaily, monthly }, active, lang);

  const total = displayData.reduce((s, d) => s + d.y, 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('dashboard.chartTitle')}</h3>
        <div className={styles.filters}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`${styles.filterBtn} ${active === r.key ? styles.activeFilter : ''}`}
              onClick={() => setActive(r.key)}
              type="button"
            >
              {t(r.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* إجمالي الفترة المختارة — من نفس البيانات الحقيقية المعروضة */}
      <p className={styles.rangeTotal}>
        {t('dashboard.rangeTotal', { n: Math.round(total * 10) / 10, kg: t('dashboard.kg') })}
      </p>

      <ResponsiveContainer width="100%" height={250}>
        {/* RTL: الزمن بيتقري من اليمين لليسار (زي الديزاين المعتمد) —
            الأقدم على اليمين، ومحور الأرقام بينقل لليمين والهوامش بتتعكس */}
        <AreaChart
          data={displayData}
          margin={isRTL ? { top: 10, right: -14, left: 8, bottom: 0 } : { top: 10, right: 8, left: -14, bottom: 0 }}
        >
          <defs>
            <linearGradient id="ecAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d6c3d" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0d6c3d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
          <XAxis
            dataKey="x"
            reversed={isRTL}
            tick={{ fontSize: 11, fill: 'var(--c-text-muted)', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            orientation={isRTL ? 'right' : 'left'}
            tick={{ fontSize: 11, fill: 'var(--c-text-muted)', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip kgLabel={t('dashboard.kg')} />} />
          <Area
            type="monotone"
            dataKey="y"
            name={t('dashboard.chartSeries')}
            stroke="#0d6c3d"
            strokeWidth={2.5}
            fill="url(#ecAreaFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#0d6c3d', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RecyclingChart;
