//ProviderGuard.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProviderGuard() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  if (!token || role !== "provider") {
    return <Navigate to="/auth/provider/login" replace />;
  }

  return <Outlet />;
}
