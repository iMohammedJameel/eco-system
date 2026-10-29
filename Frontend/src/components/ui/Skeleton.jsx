import styles from './Skeleton.module.css';

/**
 * Skeleton — shimmer placeholder for loading states.
 * Props: variant (text|rect|circle), width, height, lines (for text), className
 */
export default function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  className = '',
  style = {},
}) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.textBlock} style={style}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.text}`}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              height: height || '0.9rem',
            }}
          />
        ))}
      </div>
    );
  }

  const variantCls = styles[variant] || styles.rect;
  const finalStyle = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '0.9rem' : variant === 'circle' ? '40px' : '20px'),
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${variantCls} ${className}`}
      style={finalStyle}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText — paragraph-shaped skeleton.
 */
export function SkeletonText({ lines = 3, className = '', ...rest }) {
  return <Skeleton variant="text" lines={lines} className={className} {...rest} />;
}

/**
 * SkeletonCard — full card-shaped skeleton for dashboard/stats.
 */
export function SkeletonCard({ hasHeader = true, lines = 3, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {hasHeader && (
        <div className={styles.cardHeader}>
          <Skeleton variant="rect" width="40%" height="1.2rem" />
          <Skeleton variant="circle" width="36px" height="36px" />
        </div>
      )}
      <Skeleton variant="text" lines={lines} />
    </div>
  );
}

/**
 * SkeletonRow — table-row-shaped skeleton.
 */
export function SkeletonRow({ cols = 5, className = '' }) {
  return (
    <div className={`${styles.row} ${className}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" width="80%" />
      ))}
    </div>
  );
}
