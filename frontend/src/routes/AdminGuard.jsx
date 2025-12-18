import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminGuard() {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  const isAllowed = !!token && role === "admin";
  if (!isAllowed) {
    // keep redirect back info
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
