import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * useAsyncData — الهوك المشترك لجلب البيانات في كل صفحات الداشبورد.
 *
 * ليه اتعمل؟ كل صفحة كانت مكررة نفس الـ 20 سطر:
 *   const [data, setData] = useState(...);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *   const load = useCallback(async () => {
 *     setLoading(true); setError(null);
 *     try { setData(await ...) } catch (e) { setError(e.message) }
 *     finally { setLoading(false) }
 *   }, [page, ...]);
 *   useEffect(() => { load(); }, [load]);
 *
 * الفوائد:
 *  1) حذف التكرار من 17 صفحة (≈ 300 سطر).
 *  2) setState يحدث داخل callbacks غير متزامنة فقط — متوافق مع
 *     قاعدة react-hooks/set-state-in-effect (React 19) وبدون cascading renders.
 *  3) حماية من تحديث state بعد unmount (كان بيعمل warning قديم وذاكرة مهدورة).
 *  4) reload() موحّدة بعد أي عملية إضافة/تعديل/حذف.
 *
 * الاستخدام:
 *   const fetchPartners = useCallback(
 *     () => partnersService.getAll({ page, limit: 12, search: debouncedSearch }),
 *     [page, debouncedSearch],
 *   );
 *   const { data, loading, error, reload } = useAsyncData(fetchPartners, {
 *     initialData: { data: [], pagination: { total: 0, page: 1, pages: 1 } },
 *   });
 *
 * @param {() => Promise<any>} fetcher  دالة جلب ملفوفة بـ useCallback —
 *   تغيّر هويتها (بتغيّر deps بتاعتها) يعني إعادة جلب تلقائية.
 * @param {{ initialData?: any }} [options]
 */
export function useAsyncData(fetcher, { initialData = null } = {}) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  // ملاحظة مهمة: مرر دالة جلب مستقرة الهوية (ملفوفة بـ useCallback).
  // تغيّر هويتها (بتغيّر deps بتاعتها) = إعادة جلب تلقائية.
  // كل تحديثات الحالة تحدث داخل callbacks غير متزامنة فقط —
  // متوافق مع قاعدة react-hooks/set-state-in-effect (React 19).
  useEffect(() => {
    let active = true; // يمنع تحديث state بعد unmount أو تغيّر deps

    Promise.resolve()
      .then(() => fetcher())
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || t('common.error'));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => { active = false; };
    // t تُستخدم فقط في رسالة الخطأ الاحتياطية — تبديل اللغة لا يستدعي إعادة الجلب
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, reloadTick]);

  // إعادة الجلب اليدوية (بعد إضافة/تعديل/حذف أو زر "إعادة المحاولة")
  const reload = useCallback(() => {
    setLoading(true);
    setReloadTick((t) => t + 1);
  }, []);

  return { data, loading, error, reload };
}

/**
 * useDebouncedValue — يؤخّر تحديث قيمة البحث حتى يتوقف المستخدم عن الكتابة.
 * بيمنع ضرب الـ API بكل حرف بيكتبه (search من السيرفر).
 *
 * @template T
 * @param {T} value القيمة المتغيرة بسرعة (نص البحث)
 * @param {number} [delay=350] مهلة بالمللي ثانية
 * @returns {T} آخر قيمة بعد استقرار الإدخال
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
