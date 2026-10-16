import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // قيد الأدوار — لو محدد و_role مش ضمنه
  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
