import styles from './Card.module.css';

/**
 * Card — surface container with optional header/footer and padding.
 * Props: title, subtitle, actions (header right), padding (sm|md|lg|none), hoverable (bool)
 */
export default function Card({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  hoverable = false,
  className = '',
  ...rest
}) {
  const padCls = styles[`pad-${padding}`] || styles['pad-md'];
  const cls = [
    styles.card,
    padCls,
    hoverable ? styles.hoverable : '',
    className,
  ].filter(Boolean).join(' ');

  const hasHeader = title || subtitle || actions;

  return (
    <div className={cls} {...rest}>
      {hasHeader && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
