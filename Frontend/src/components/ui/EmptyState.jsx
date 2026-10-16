import Spinner from './Spinner';
import Skeleton, { SkeletonCard, SkeletonRow } from './Skeleton';
import styles from './EmptyState.module.css';

export function EmptyState({ icon = '📭', title = 'لا توجد بيانات', message, onAction, actionLabel }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {onAction && actionLabel && (
        <button className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = 'حدث خطأ أثناء تحميل البيانات', onRetry }) {
  return (
    <div className={`${styles.wrap} ${styles.error}`}>
      <div className={styles.icon}>⚠</div>
      <h3 className={styles.title}>خطأ</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.action} onClick={onRetry}>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'جارٍ التحميل...' }) {
  return (
    <div className={styles.wrap}>
      <Spinner size="lg" />
      <p className={styles.message}>{label}</p>
    </div>
  );
}

/**
 * SkeletonLoading — shows skeleton placeholders that match the page layout.
 * variant: 'cards' | 'table' | 'list' | 'stats'
 */
export function SkeletonLoading({ variant = 'cards', count = 4, cols = 5 }) {
  if (variant === 'cards') {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className={styles.skeletonTable}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </div>
    );
  }
  if (variant === 'stats') {
    return (
      <div className={styles.skeletonStats}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} hasHeader={false} lines={2} />
        ))}
      </div>
    );
  }
  // list
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rect" height="80px" />
      ))}
    </div>
  );
}
