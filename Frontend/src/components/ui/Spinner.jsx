import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', label, fullPage = false }) {
  const node = (
    <span className={styles.wrap}>
      <span className={`${styles.spinner} ${styles[size] || ''}`} />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );

  if (fullPage) {
    return <div className={styles.fullPage}>{node}</div>;
  }
  return node;
}
