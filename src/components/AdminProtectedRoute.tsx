import { Navigate, useLocation } from 'react-router-dom';
import { AuthUtils } from '../utils/auth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;