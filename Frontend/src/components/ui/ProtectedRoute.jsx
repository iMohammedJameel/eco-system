import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * توجيه آمن حسب الدور — بدل الرجوع الدائم للـ dashboard
 * (الرجوع للداشبورد لدور غير أدمن كان بيعمل إعادة توجيه متكررة لصفحة فاضية)
 */
function homeForRole(role) {
  if (role === 'user') return '/my-wallet';
  if (role === 'partner') return '/partner-portal';
  return '/dashboard';
}

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // قيد الأدوار — لو محدد والدور مش ضمنه: رجّعه لبوابة دوره الصحيحة
  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return children;
}
