import { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className={styles.page}>
      <div className={styles.langToggle}>
        <span>EN</span>
        <span className={styles.langIcon}>⇄</span>
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span>♻</span>
        </div>

        <h1 className={styles.title}>نقاء - لوحة التحكم الإدارية</h1>
        <p className={styles.subtitle}>سجل دخولك للوصول إلى لوحة التحكم</p>

        <form onSubmit={handleSubmit} className={styles.form} dir="rtl">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="admin@recycling.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="✉"
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="🔒"
          />

          <Button type="submit" fullWidth>
            تسجيل الدخول
          </Button>
        </form>

        <div className={styles.demo} dir="rtl">
          <p className={styles.demoTitle}>بيانات تجريبية:</p>
          <p>البريد: admin@recycling.com</p>
          <p>كلمة المرور: admin123</p>
        </div>

        <div className={styles.divider} />

        <a href="/" className={styles.backLink}>← العودة للصفحة الرئيسية</a>
      </div>

      <div className={styles.helpBtn}>?</div>
    </div>
  );
}

export default Login;
