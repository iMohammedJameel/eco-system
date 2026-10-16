import styles from './Avatar.module.css';

const SIZE_CLASS = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

const VARIANT_CLASS = {
  primary:   styles.primary,
  success:   styles.success,
  warning:   styles.warning,
  danger:    styles.danger,
  info:      styles.info,
  neutral:   styles.neutral,
};

function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Avatar — circular user/admin avatar with initials or image.
 * Props: name, src (image URL), size (xs|sm|md|lg|xl), variant (color theme)
 */
export default function Avatar({
  name = '',
  src,
  size = 'md',
  variant = 'primary',
  className = '',
}) {
  const cls = [
    styles.avatar,
    SIZE_CLASS[size] || SIZE_CLASS.md,
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    className,
  ].filter(Boolean).join(' ');

  if (src) {
    return <img src={src} alt={name} className={cls} />;
  }

  return <span className={cls} aria-label={name}>{getInitials(name)}</span>;
}
