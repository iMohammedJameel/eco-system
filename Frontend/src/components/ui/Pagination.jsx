import styles from './Pagination.module.css';

export default function Pagination({ page, pages, total, onChange }) {
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

  return (
    <div className={styles.wrap} dir="rtl">
      <button
        className={styles.nav}
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        type="button"
      >
        ›
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
      >
        ‹
      </button>
      {total !== undefined && (
        <span className={styles.total}>إجمالي {total}</span>
      )}
    </div>
  );
}
