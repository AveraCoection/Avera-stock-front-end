import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; 
  }
  return <Outlet />;
};

export default RoleProtectedRoute;
