import { Navigate, Outlet } from "react-router-dom";

export default function CustomerGuard() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  if (!token || role !== "customer") {
    return <Navigate to="/auth/customer/login" replace />;
  }

  return <Outlet />;
}
