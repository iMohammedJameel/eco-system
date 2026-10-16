import styles from './Switch.module.css';

/**
 * Switch — accessible toggle.
 * Props: checked, onChange, label, size (sm|md), disabled, color
 */
export default function Switch({
  checked = false,
  onChange,
  label,
  size = 'md',
  disabled = false,
  name,
}) {
  const handleToggle = () => {
    if (disabled || !onChange) return;
    onChange(!checked);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const cls = [
    styles.switch,
    styles[size] || styles.md,
    checked ? styles.checked : '',
    disabled ? styles.disabled : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        name={name}
        className={cls}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
