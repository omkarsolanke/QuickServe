// src/pages/admin/AdminDashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function StatCard({ title, value, icon, hint, accent }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 border border-slate-800/90 p-5 backdrop-blur-2xl shadow-[0_18px_55px_rgba(0,0,0,0.75)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{title}</p>
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${accent}`}
        >
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      <p className="mt-3 text-3xl font-black text-slate-100">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

function QuickAction({ title, desc, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-3xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition backdrop-blur-2xl p-5 shadow-[0_16px_45px_rgba(0,0,0,0.75)] group"
    >
      <div className="w-11 h-11 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-center group-hover:border-purple-400/50">
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-[12px] text-slate-500">{desc}</p>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const wsRef = useRef(null);
  const retryTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const loadingRef = useRef(false);

  const loadStats = async (silent = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!silent) setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load stats");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // keep latest loadStats reference for WS callbacks
  const loadStatsRef = useRef(loadStats);
  useEffect(() => {
    loadStatsRef.current = loadStats;
  }, [stats]);

  // initial load
  useEffect(() => {
    loadStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WebSocket (reconnect-safe, disabled on HTTPS/Cloudflare)
  useEffect(() => {
    const isSecure = window.location.protocol === "https:";
    if (isSecure) {
      console.log("Admin WebSocket disabled on HTTPS (Cloudflare mode)");
      return;
    }

    shouldReconnectRef.current = true;

    const wsBase = API_BASE.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws/admin`;

    const clearRetry = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const connect = () => {
      clearRetry();

      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // noop
        }
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg?.type === "refresh") {
            loadStatsRef.current?.(true);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!shouldReconnectRef.current) return;
        retryTimerRef.current = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearRetry();
      try {
        wsRef.current?.close();
      } catch {
        // noop
      }
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Pending KYC",
        value: stats?.pending_kyc ?? 0,
        icon: "🧾",
        hint: "Providers waiting for verification.",
        accent: "bg-amber-500/10 border-amber-500/20 text-amber-200",
      },
      {
        title: "Total Providers",
        value: stats?.total_providers ?? 0,
        icon: "🛠️",
        hint: "All registered providers.",
        accent: "bg-purple-500/10 border-purple-500/20 text-purple-200",
      },
      {
        title: "Online Providers",
        value: stats?.online_providers ?? 0,
        icon: "🟢",
        hint: "Currently available for requests.",
        accent: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
      },
      {
        title: "Total Customers",
        value: stats?.total_customers ?? 0,
        icon: "👥",
        hint: "All customer accounts.",
        accent: "bg-cyan-500/10 border-cyan-500/20 text-cyan-200",
      },
      {
        title: "Total Requests",
        value: stats?.total_requests ?? 0,
        icon: "📦",
        hint: "All requests in the system.",
        accent: "bg-pink-500/10 border-pink-500/20 text-pink-200",
      },
      {
        title: "Open Reports",
        value: stats?.open_reports ?? 0,
        icon: "🚩",
        hint: "Customer complaints / fraud flags.",
        accent: "bg-red-500/10 border-red-500/20 text-red-200",
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-slate-950/60 border border-slate-800/80 p-5 backdrop-blur-2xl shadow-[0_18px_55px_rgba(0,0,0,0.75)] animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-3 w-20 bg-slate-700/60 rounded" />
                <div className="w-11 h-11 rounded-2xl border border-slate-800 bg-slate-900/60" />
              </div>
              <div className="mt-4 h-8 w-24 bg-slate-700/80 rounded" />
              <div className="mt-2 h-3 w-32 bg-slate-800/70 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-950/95 via-slate-950/85 to-slate-900/80 border border-slate-800 p-6 backdrop-blur-2xl shadow-[0_22px_70px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">Quick actions</p>
            <p className="text-xs text-slate-500 mt-1">
              Jump to the most used admin tasks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/kyc")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950 text-xs font-semibold shadow-lg shadow-purple-500/30"
          >
            Review KYC
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="KYC Queue"
            desc="Approve or reject provider documents."
            icon="🧾"
            onClick={() => navigate("/admin/kyc")}
          />
          <QuickAction
            title="Manage Providers"
            desc="Search, delete, or suspend providers."
            icon="🛠️"
            onClick={() => navigate("/admin/providers")}
          />
          <QuickAction
            title="Requests Monitor"
            desc="View all requests and assignments."
            icon="📦"
            onClick={() => navigate("/admin/requests")}
          />
        </div>
      </div>
    </div>
  );
}
