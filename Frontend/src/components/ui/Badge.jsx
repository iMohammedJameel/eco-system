import styles from './Badge.module.css';

const VARIANT_CLASS = {
  primary:   styles.primary,
  success:   styles.success,
  warning:   styles.warning,
  danger:    styles.danger,
  info:      styles.info,
  neutral:   styles.neutral,
};

const SIZE_CLASS = {
  sm: styles.sm,
  md: styles.md,
};

/**
 * Badge — small pill-shaped status indicator.
 * Props: variant (primary|success|warning|danger|info|neutral), size (sm|md), dot (bool), icon
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
}) {
  const cls = [
    styles.badge,
    VARIANT_CLASS[variant] || VARIANT_CLASS.neutral,
    SIZE_CLASS[size] || SIZE_CLASS.md,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls}>
      {(dot || icon) && (
        <span className={styles.indicator}>
          {icon || <span className={styles.dot} />}
        </span>
      )}
      {children}
    </span>
  );
}
