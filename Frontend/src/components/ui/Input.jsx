import styles from './Input.module.css';

function Input({ label, type = 'text', placeholder, value, onChange, icon }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input}
          dir="rtl"
        />
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
    </div>
  );
}

export default Input;
