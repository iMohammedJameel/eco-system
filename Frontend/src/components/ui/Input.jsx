import styles from './Input.module.css';

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  error,
  required,
  disabled,
  name,
  id,
  autoComplete,
  dir = 'rtl',
  as = 'input',
  rows = 4,
  options = [],
  ...rest
}) {
  const fieldId = id || name;

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {as === 'textarea' ? (
          <textarea
            id={fieldId}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            dir={dir}
            rows={rows}
            className={styles.textarea}
            {...rest}
          />
        ) : as === 'select' ? (
          <select
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            dir={dir}
            className={styles.select}
            {...rest}
          >
            <option value="">{placeholder || 'اختر...'}</option>
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
        ) : (
          <>
            <input
              id={fieldId}
              type={type}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
              dir={dir}
              className={styles.input}
              {...rest}
            />
            {icon && <span className={styles.icon}>{icon}</span>}
          </>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default Input;
