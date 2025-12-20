// src/pages/customer/CustomerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border bg-slate-800/70 border-slate-700 text-slate-200">
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  if (s === "completed") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-300">
        COMPLETED
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-red-500/50 bg-red-500/15 text-red-300">
        CANCELLED
      </span>
    );
  }

  if (s === "assigned") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-sky-500/50 bg-sky-500/15 text-sky-300">
        ASSIGNED
      </span>
    );
  }

  if (s === "en_route") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-indigo-500/50 bg-indigo-500/15 text-indigo-300">
        TO LOCATION
      </span>
    );
  }

  if (s === "arrived") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-amber-400/60 bg-amber-400/15 text-amber-200">
        ARRIVED
      </span>
    );
  }

  if (s === "payment") {
    return (
      <span className="text-[11px] px-3 py-1 rounded-full border border-emerald-400/60 bg-emerald-400/15 text-emerald-200">
        PAYMENT
      </span>
    );
  }

  // default = pending
  return (
    <span className="text-[11px] px-3 py-1 rounded-full border border-amber-500/50 bg-amber-500/15 text-amber-200">
      PENDING
    </span>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Customer");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "customer") {
      navigate("/auth/customer/login");
      return;
    }

    try {
      try {
        const me = await api.get("/customer/me");
        const user = me.data?.user || {};
        setUserName(user.full_name || user.name || "Customer");
      } catch {
        setUserName("Customer");
      }

      const res = await api.get("/requests/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    loadData();
    // background polling every 10 seconds
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when coming back from a request page that may have changed status,
  // allow that page to trigger a one-time refresh via router state
  useEffect(() => {
    if (location.state && location.state.refreshRequests) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  const handleOpenRequest = (req) => {
    navigate(`/customer/requests/${req.id}`, {
      state: { request: req, fromDashboard: true },
    });
  };

  const initials = useMemo(() => {
    const n = userName || "C";
    return n
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");
  }, [userName]);

  // treat anything that is not completed/cancelled as active (pending, assigned, en_route, arrived, payment)
  const activeCount = requests.filter((r) => {
    const s = String(r.status || "").toLowerCase();
    return s !== "completed" && s !== "cancelled";
  }).length;

  const completedCount = requests.filter(
    (r) => String(r.status).toLowerCase() === "completed"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040717] text-slate-50">
      {/* background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-cyan-500/18 blur-3xl opacity-60" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-emerald-500/16 blur-3xl opacity-60" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_0_0,white_0,transparent_55%),radial-gradient(circle_at_100%_0,white_0,transparent_55%)]" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand pill */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-2 sm:px-3 py-1.5 rounded-2xl bg-[#05091F] border border-cyan-500/30 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-emerald-300 flex items-center justify-center text-[13px] sm:text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/40">
              QS
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-slate-100">
                QuickServe
              </span>
              <span className="text-[11px] text-slate-500">
                Customer Panel
              </span>
            </div>
          </button>

          {/* desktop nav pills */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <NavLink
              to="/customer/dashboard"
              end
              className={({ isActive }) =>
                cx(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs transition",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-emerald-400/10 border-cyan-400/60 text-cyan-100"
                    : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-100 hover:bg-slate-900/60"
                )
              }
            >
              <span>🏠</span>
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/customer/profile"
              className={({ isActive }) =>
                cx(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs transition",
                  isActive
                    ? "bg-gradient-to-r from-sky-500/20 to-cyan-400/10 border-sky-400/60 text-sky-100"
                    : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-sky-400/50 hover:text-sky-100 hover:bg-slate-900/60"
                )
              }
            >
              <span>👤</span>
              <span>Profile</span>
            </NavLink>

            <button
              type="button"
              onClick={() => navigate("/customer/request/smart")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:-translate-y-0.5 transition"
            >
              <span>✨</span>
              <span>Create Request</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-slate-950 text-xs font-semibold shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60 hover:-translate-y-0.5 transition"
            >
              Logout
            </button>
          </nav>

          {/* mobile compact nav */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/customer/profile")}
              className="px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-[11px] text-slate-100 flex items-center gap-1"
            >
              <span>👤</span>
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/customer/request/smart")}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-[11px] font-semibold shadow-md"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-slate-950 text-[11px] font-semibold shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-7">
        {/* Greeting */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-3xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-lg font-bold text-cyan-300">
              {initials || "C"}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Welcome back, {userName}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Your home services control center
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate("/customer/request/smart")}
            className="group relative inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-sm font-semibold shadow-lg shadow-cyan-500/40 hover:shadow-2xl hover:-translate-y-0.5 transition"
          >
            <span className="relative z-10">Create New Request</span>
            <span className="relative z-10 w-7 h-7 rounded-full bg-slate-950/10 flex items-center justify-center">
              ➕
            </span>
            <span className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition rounded-2xl mix-blend-overlay" />
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/40 p-4 overflow-hidden">
            <div className="absolute -top-6 -right-8 w-24 h-24 rounded-full bg-cyan-500/15 blur-xl" />
            <p className="text-xs text-slate-400 mb-1 relative">Active requests</p>
            <p className="text-3xl font-bold text-cyan-300 relative">
              {activeCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 relative">
              Pending or in progress with your provider.
            </p>
          </div>
          <div className="relative rounded-2xl bg-slate-950/80 border border-emerald-500/40 p-4 overflow-hidden">
            <div className="absolute -top-6 -right-8 w-24 h-24 rounded-full bg-emerald-500/15 blur-xl" />
            <p className="text-xs text-slate-400 mb-1 relative">Completed</p>
            <p className="text-3xl font-bold text-emerald-300 relative">
              {completedCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 relative">
              Jobs successfully finished.
            </p>
          </div>
          <div className="relative rounded-2xl bg-slate-950/80 border border-slate-700 p-4 overflow-hidden">
            <div className="absolute -top-6 -right-10 w-24 h-24 rounded-full bg-slate-500/15 blur-xl" />
            <p className="text-xs text-slate-400 mb-1 relative">Total requests</p>
            <p className="text-3xl font-bold text-slate-100 relative">
              {requests.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 relative">
              All time requests from your account.
            </p>
          </div>
        </section>

        {/* Recent requests */}
        <section className="mt-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
              Your recent requests
              <Pill>Last 10</Pill>
            </h2>
            <button
              onClick={() => navigate("/customer/request/smart")}
              className="text-[11px] sm:text-xs text-cyan-300 hover:text-cyan-200"
            >
              + New request
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/80 p-7 sm:p-8 text-center text-slate-500 text-sm">
              You have no requests yet. Use the{" "}
              <span className="text-cyan-300 font-semibold">
                Create New Request
              </span>{" "}
              button to book your first service.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 10).map((r) => {
                const status = String(r.status || "").toLowerCase();
                const isCancelled = status === "cancelled";
                const isCancelledByProvider =
                  isCancelled && r.cancel_reason === "provider_rejected";

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (isCancelledByProvider) {
                        navigate("/customer/providers", { state: { request: r } });
                      } else {
                        handleOpenRequest(r);
                      }
                    }}
                    className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 px-3 sm:px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:border-cyan-500/40 hover:bg-slate-900/80 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 truncate">
                        {r.title || r.service_type || "Service request"}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate">
                        {r.service_type || "Service"} • Final price: ₹
                        {r.budget ?? "—"}
                      </p>
                      {isCancelledByProvider && (
                        <p className="mt-1 text-[11px] text-red-300">
                          Provider rejected this request. Tap to select another
                          provider.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <StatusBadge status={r.status} />
                      <span className="hidden sm:inline text-[11px] text-slate-500">
                        #{r.id}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
