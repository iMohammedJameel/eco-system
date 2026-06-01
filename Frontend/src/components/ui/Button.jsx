import styles from './Button.module.css';

function Button({ children, type = 'button', onClick, fullWidth }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.btn} ${fullWidth ? styles.fullWidth : ''}`}
    >
      {children}
    </button>
  );
}

export default Button;
