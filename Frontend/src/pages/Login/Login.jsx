import { useState, useEffect } from 'react';
import LoginDesktop from './LoginDesktop';
import LoginMobile from './LoginMobile';
import LoginEnglish from './LoginEnglish';
import LoginEnglishMobile from './LoginEnglishMobile';
import { useLoginLogic } from './useLoginLogic';
import { useLanguage } from '../../context/LanguageContext';

/* ══════════════════ responsive + language switcher ══════════════════
   منطق الحالة يعيش هنا مرة واحدة ويُمرَّر للنسخة المعروضة،
   حتى لا تضيع بيانات المستخدم عند تغيّر مقاس الشاشة أو اللغة.
   - العربية: النسخة المعتمدة pixel-perfect (ديسكتوب/موبايل)
   - الإنجليزية: نفس الديزاين بالظبط (قصاصات نظيفة من النصوص العربية
     + نصوص إنجليزية HTML على نفس الإحداثيات) — ديسكتوب/موبايل */
function Login() {
  const logic = useLoginLogic();
  const { lang } = useLanguage();

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (lang === 'en') {
    return isMobile ? <LoginEnglishMobile logic={logic} /> : <LoginEnglish logic={logic} />;
  }
  return isMobile ? <LoginMobile logic={logic} /> : <LoginDesktop logic={logic} />;
}

export default Login;
