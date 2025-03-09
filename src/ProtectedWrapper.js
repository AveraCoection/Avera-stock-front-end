import AuthContext from "./AuthContext";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedWrapper(props) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const publicRoutes = ["/login", "/forget-password", "/reset-password"];

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (publicRoutes.includes(location.pathname)) {
    return props.children;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
}


export default ProtectedWrapper;
