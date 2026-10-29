import { useLanguage } from '../../context/LanguageContext';
import styles from './Pagination.module.css';

export default function Pagination({ page, pages, total, onChange }) {
  const { t, dir } = useLanguage();
  if (!pages || pages <= 1) return null;

  const goTo = (p) => {
    if (p < 1 || p > pages || p === page) return;
    onChange(p);
  };

  // Build a compact list of page numbers with ellipsis
  const nums = [];
  const push = (n) => { if (!nums.includes(n)) nums.push(n); };

  push(1);
  if (page - 1 > 1) push(page - 1);
  if (page > 1 && page < pages) push(page);
  if (page + 1 < pages) push(page + 1);
  push(pages);

  const withEllipsis = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) withEllipsis.push('…');
    withEllipsis.push(nums[i]);
  }

  const isRTL = dir === 'rtl';

  return (
    <div className={styles.wrap} dir={dir}>
      <button
        className={styles.nav}
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        type="button"
        aria-label={t('ui.prevPage')}
      >
        {isRTL ? '›' : '‹'}
      </button>
      {withEllipsis.map((n, i) =>
        n === '…' ? (
          <span key={`e${i}`} className={styles.ellipsis}>…</span>
        ) : (
          <button
            key={n}
            className={`${styles.page} ${n === page ? styles.active : ''}`}
            onClick={() => goTo(n)}
            type="button"
          >
            {n}
          </button>
        ),
      )}
      <button
        className={styles.nav}
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        type="button"
        aria-label={t('ui.nextPage')}
      >
        {isRTL ? '‹' : '›'}
      </button>
      {total !== undefined && (
        <span className={styles.total}>{t('common.total')} {total}</span>
      )}
    </div>
  );
}
