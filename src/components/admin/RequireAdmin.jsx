import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthed } from '../../services/adminAuth.js';

// Route guard: renders children only when the admin is logged in, otherwise
// redirects to the admin login (remembering where they were headed).
export default function RequireAdmin({ children }) {
  const location = useLocation();
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
