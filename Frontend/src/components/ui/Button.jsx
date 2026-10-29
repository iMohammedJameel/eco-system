import { Icon } from './Icon';
import styles from './Button.module.css';

function Button({
  children,
  type = 'button',
  onClick,
  fullWidth,
  variant = 'primary',
  size = 'md',
  disabled,
  loading = false,
  icon,        // string icon name (lucide) OR ReactNode (legacy emoji)
  iconRight = false,
  className = '',
  ...rest
}) {
  const isIconName = typeof icon === 'string';
  const iconNode = isIconName ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : icon;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant] || '',
        styles[size] || '',
        fullWidth ? styles.fullWidth : '',
        iconRight ? styles.iconRight : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      {iconNode && !loading && (
        <span className={styles.icon}>{iconNode}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
