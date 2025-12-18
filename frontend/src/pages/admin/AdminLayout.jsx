import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function SidebarLink({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "group flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition",
          isActive
            ? "bg-purple-500/15 border-purple-500/30 text-purple-100"
            : "border-slate-800 text-slate-300 hover:border-purple-500/30 hover:text-purple-100 hover:bg-slate-900/40"
        )
      }
    >
      <span className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
        <span className="text-base">{icon}</span>
      </span>
      <span className="font-semibold">{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [me, setMe] = useState({ email: "admin", role: "admin" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "admin") {
      navigate("/auth/admin/login");
      return;
    }
    setMe({ email: "admin@quickserve.com", role: "admin" });
  }, [navigate]);

  const title = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/admin/kyc")) return "KYC Verification";
    if (p.includes("/admin/providers")) return "Providers";
    if (p.includes("/admin/customers")) return "Customers";
    if (p.includes("/admin/requests")) return "Requests Monitor";
    if (p.includes("/admin/reports")) return "Disputes & Reports";
    if (p.includes("/admin/settings")) return "Admin Settings";
    return "Admin Dashboard";
  }, [location.pathname]);

  const logout = async () => {
    // optional: call backend logout if you implement it
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      navigate("/auth/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/18 blur-3xl rounded-full opacity-40" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/12 blur-3xl rounded-full opacity-40" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside
          className={cx(
            "sticky top-0 h-screen border-r border-slate-800 bg-slate-950/60 backdrop-blur-2xl p-4 hidden md:flex flex-col gap-4",
            collapsed ? "w-24" : "w-72"
          )}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-3 hover:opacity-90 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-lg">🛡️</span>
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-black leading-4">QuickServe</p>
                  <p className="text-[11px] text-slate-500">Admin Console</p>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition text-slate-300"
              title="Collapse"
            >
              {collapsed ? "»" : "«"}
            </button>
          </div>

          <div className="space-y-2">
            <SidebarLink to="/admin/dashboard" icon="📊" label={collapsed ? "" : "Dashboard"} end />
            <SidebarLink to="/admin/kyc" icon="🧾" label={collapsed ? "" : "KYC Queue"} />
            <SidebarLink to="/admin/providers" icon="🛠️" label={collapsed ? "" : "Providers"} />
            <SidebarLink to="/admin/customers" icon="👥" label={collapsed ? "" : "Customers"} />
            <SidebarLink to="/admin/requests" icon="📦" label={collapsed ? "" : "Requests"} />
            <SidebarLink to="/admin/reports" icon="🚩" label={collapsed ? "" : "Reports"} />
            <SidebarLink to="/admin/settings" icon="⚙️" label={collapsed ? "" : "Settings"} />
          </div>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-[11px] text-slate-500">Signed in</p>
            <p className="text-sm font-semibold text-slate-100 truncate">{me.email}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={logout}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-200 hover:bg-slate-800/60"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950"
              >
                Home
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Admin</p>
                <h1 className="text-lg md:text-xl font-black text-slate-100">{title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/40">
                  <span className="text-xs text-slate-400">Role</span>
                  <span className="text-xs font-semibold text-purple-200">ADMIN</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="md:hidden px-3 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
