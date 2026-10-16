import { useAuth } from '../../context/AuthContext';
import heroArt from '../../assets/hero-city.jpg';
import styles from './HeroBanner.module.css';

function HeroBanner() {
  const { profile } = useAuth();
  const name = profile?.username || profile?.name || 'أهلاً بك';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء النور' : 'مساء الخير';

  return (
    <section className={styles.hero} aria-label="ترحيب">
      <img src={heroArt} alt="" className={styles.art} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h2 className={styles.greeting}>
          {greeting} <span className={styles.name}>{name}</span> 👋
        </h2>
        <p className={styles.tagline}>نفعّل EcoCycle لإدارة النفايات — معنا.. مع مستقبل أفضل لاستدامتنا</p>
      </div>
    </section>
  );
}

export default HeroBanner;
