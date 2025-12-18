// src/pages/provider/ProviderDashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/70 border-slate-700 text-slate-200",
    purple: "bg-purple-500/15 border-purple-500/30 text-purple-100",
    pink: "bg-pink-500/15 border-pink-500/30 text-pink-100",
    amber: "bg-amber-500/15 border-amber-500/40 text-amber-200",
    emerald: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
    red: "bg-red-500/15 border-red-500/40 text-red-200",
    cyan: "bg-cyan-500/15 border-cyan-500/40 text-cyan-200",
  };
  return (
    <span
      className={cx(
        "text-[11px] px-2.5 py-1 rounded-full border",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
}

function Toast({ kind = "success", text, onClose }) {
  if (!text) return null;
  const map = {
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
    error: "bg-red-500/15 border-red-500/30 text-red-200",
    warn: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  };
  return (
    <div
      className={cx(
        "rounded-2xl border px-4 py-3 text-sm flex items-start justify-between gap-3",
        map[kind]
      )}
    >
      <span>{text}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-xs px-2 py-1 rounded-lg border border-current/30 hover:bg-white/5"
      >
        Close
      </button>
    </div>
  );
}

function Card({ title, desc, icon, children }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          {desc ? <p className="text-xs text-slate-500 mt-1">{desc}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function NavItem({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition",
          isActive
            ? "bg-purple-500/15 border-purple-500/30 text-purple-100"
            : "border-slate-800 text-slate-300 hover:border-purple-500/30 hover:text-slate-100 hover:bg-slate-900/40"
        )
      }
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

function KycBadge({ status }) {
  const s = String(status || "not_submitted").toLowerCase();
  if (s === "approved") return <Pill tone="emerald">KYC APPROVED</Pill>;
  if (s === "pending") return <Pill tone="amber">KYC PENDING</Pill>;
  if (s === "rejected") return <Pill tone="red">KYC REJECTED</Pill>;
  return <Pill tone="slate">KYC NOT SUBMITTED</Pill>;
}

function StatusDot({ online }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition",
        online
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
          : "bg-slate-900/40 border-slate-800 text-slate-200"
      )}
      title="Online status"
    >
      <span
        className={cx(
          "w-2 h-2 rounded-full",
          online ? "bg-emerald-400" : "bg-slate-400"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

/**
 * When online:
 * - if NO incoming requests -> show searching animation.
 * - if HAS incoming requests -> show only the incoming list, no animation.
 */
function SearchingOverlay({ incoming, onAccept, onReject }) {
  const hasRequests = Array.isArray(incoming) && incoming.length > 0;

  if (hasRequests) {
    // Only incoming list
    return (
      <div className="rounded-3xl bg-slate-950/70 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-slate-100 mb-1">
            New requests found nearby
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Review and act on incoming jobs in real time.
          </p>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
            <p className="text-xs text-slate-400 mb-2">
              Incoming requests (live)
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {incoming.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs"
                >
                  <p className="font-semibold text-slate-100 truncate">
                    {r.title || r.service_type}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {r.service_type} • Final price: ₹{r.budget ?? "—"}
                  </p>
                  <p className="text-[11px] text-cyan-300 mt-0.5 capitalize">
                    {r.status}
                  </p>

                  {String(r.status || "").toLowerCase() === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => onAccept(r)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-500/80 text-slate-950 text-[11px] font-semibold hover:bg-emerald-400"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onReject(r)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-red-500/80 text-slate-950 text-[11px] font-semibold hover:bg-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only searching animation
  return (
    <div className="relative rounded-3xl bg-slate-950/70 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-10 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      <div className="relative px-6 py-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border border-emerald-400/40 flex items-center justify-center bg-slate-900/70">
            <div className="w-20 h-20 rounded-full border border-emerald-400/60 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-emerald-400/90 shadow-lg shadow-emerald-500/40 animate-ping" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-spin" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-100">
            Searching for nearby new requests…
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            You are online and visible to customers. New jobs around you will
            pop up here as soon as they arrive.
          </p>
        </div>

        <div className="w-full max-w-xl grid grid-cols-3 gap-3 text-[11px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Live GPS sharing enabled</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="text-slate-300">Matching you with best jobs</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-slate-300">Accept in one tap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const watchIdRef = useRef(null);

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ kind: "success", text: "" });

  const [providerName, setProviderName] = useState("Provider");
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const [online, setOnline] = useState(false);

  const [incoming, setIncoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // AUTH + ME
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");

    if (!token || role !== "provider") {
      navigate("/auth/provider/login");
      return;
    }

    (async () => {
      try {
        const me = await api.get("/provider/me");
        setProviderName(me.data?.user?.full_name || "Provider");
        setOnline(!!me.data?.provider?.is_online);
        setKycStatus(me.data?.provider?.kyc_status || "not_submitted");
      } catch {
        setError("Could not load provider status.");
        setKycStatus("not_submitted");
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);

  // LOAD INCOMING + HISTORY + CURRENT JOB
  const loadData = async () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "provider") {
      navigate("/auth/provider/login");
      return;
    }

    try {
      setHistoryLoading(true);
      const [incRes, histRes, currentRes] = await Promise.all([
        api.get("/provider/incoming"),
        api.get("/provider/history", { params: { limit: 10 } }),
        api.get("/provider/current-job"),
      ]);

      setIncoming(Array.isArray(incRes.data) ? incRes.data : []);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
      setCurrentJob(currentRes.data || null);
    } catch {
      setIncoming([]);
      setHistory([]);
      setCurrentJob(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    loadData();
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
  }, [checking]);

  // ACCEPT / REJECT
  const handleAccept = async (r) => {
    try {
      await api.post(`/provider/requests/${r.id}/accept`);
      navigate(`/provider/jobs/${r.id}`, { state: { request: r } });
    } catch (e) {
      setToast({
        kind: "error",
        text: e.response?.data?.detail || "Failed to accept request.",
      });
    }
  };

  const handleReject = async (r) => {
    try {
      await api.post(`/provider/requests/${r.id}/reject`);
      setToast({
        kind: "warn",
        text: "Request rejected. Customer will re-select provider.",
      });
      setIncoming((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      setToast({
        kind: "error",
        text: e.response?.data?.detail || "Failed to reject request.",
      });
    }
  };

  const kyc = useMemo(() => {
    const map = {
      not_submitted: {
        tone: "slate",
        icon: "🧾",
        title: "Complete KYC to unlock Online mode",
        desc: "Upload your documents once. After approval you can receive nearby customer requests.",
        cta: "Upload KYC",
        action: () => navigate("/provider/kyc"),
      },
      pending: {
        tone: "amber",
        icon: "⏳",
        title: "KYC under review",
        desc: "A quick verification check is in progress.",
        cta: "View status",
        action: () => navigate("/provider/kyc-pending"),
      },
      approved: {
        tone: "emerald",
        icon: "✅",
        title: "You are verified",
        desc: "Go online to receive customer requests and start earning.",
        cta: "Manage profile",
        action: () => navigate("/provider/profile"),
      },
      rejected: {
        tone: "red",
        icon: "⚠️",
        title: "KYC needs correction",
        desc: "Re-upload correct documents and resubmit for approval.",
        cta: "Re-upload KYC",
        action: () => navigate("/provider/kyc"),
      },
    };
    return map[String(kycStatus || "not_submitted")] || map.not_submitted;
  }, [kycStatus, navigate]);

  const canGoOnline = kycStatus === "approved";

  const setOnlineServer = async (nextOnline) => {
    setOnline(nextOnline);
    try {
      await api.put("/provider/me/availability", {
        is_online: nextOnline,
        working_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        start_time: "09:00",
        end_time: "20:00",
      });
      setToast({
        kind: "success",
        text: nextOnline ? "You are Online now." : "You are Offline now.",
      });
    } catch (e) {
      setOnline(!nextOnline);
      setToast({
        kind: "warn",
        text: e.response?.data?.detail || "Online toggle failed.",
      });
    }
  };

  const handleGoOnline = () => {
    if (!canGoOnline) {
      navigate("/provider/kyc");
      return;
    }
    setOnlineServer(!online);
  };

  // live location
  useEffect(() => {
    if (kycStatus !== "approved" || !online) return;
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        api
          .post("/provider/providers/location", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            is_online: true,
          })
          .catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        api
          .post("/provider/providers/location", {
            latitude: 0,
            longitude: 0,
            is_online: false,
          })
          .catch(() => {});
      }
    };
  }, [online, kycStatus]);

  const handleLogout = () => {
    setOnline(false);
    localStorage.clear();
    navigate("/auth/provider/login");
  };

  const initials = useMemo(() => {
    const n = providerName || "Provider";
    return n
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");
  }, [providerName]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/16 blur-3xl rounded-full opacity-45" />
        <div className="absolute bottom-24 right-20 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full opacity-40" />
      </div>

      {/* NAVBAR */}
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-slate-950 font-black">
              QS
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-black leading-4">QuickServe</p>
              <p className="text-[11px] text-slate-500">Provider Panel</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-2">
            <NavItem to="/provider/dashboard" label="Home" icon="🏠" end />
            <NavItem to="/provider/dashboard" label="Dashboard" icon="📊" />
            <NavItem to="/provider/profile" label="Profile" icon="👤" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoOnline}
              className={cx(
                "px-3 py-2 rounded-xl border text-xs font-semibold transition",
                online
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20"
                  : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-900/70"
              )}
            >
              {online ? "🟢 Online" : "⚪ Offline"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 text-slate-950 text-xs font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* PAGE */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-5">
        <Toast
          kind={toast.kind}
          text={toast.text}
          onClose={() => setToast({ kind: "success", text: "" })}
        />

        {error && (
          <div className="rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Header strip */}
        <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-slate-900/0 to-cyan-500/10" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-purple-500/25">
                  {initials || "P"}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Welcome back</p>
                  <p className="text-xl md:text-2xl font-black text-slate-100 truncate">
                    {providerName}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <KycBadge status={kycStatus} />
                    <StatusDot online={online} />
                    <Pill tone="slate">
                      Live location: {online ? "On" : "Off"}
                    </Pill>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={kyc.action}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 text-xs font-semibold hover:bg-slate-900/70 transition"
                >
                  {kyc.cta}
                </button>

                <button
                  type="button"
                  onClick={handleGoOnline}
                  className={cx(
                    "px-5 py-2.5 rounded-xl text-xs font-semibold transition",
                    canGoOnline
                      ? online
                        ? "border border-slate-700 text-slate-200 hover:bg-slate-800/60"
                        : "bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 shadow-lg"
                      : "bg-slate-800/60 text-slate-300 cursor-not-allowed"
                  )}
                  disabled={!canGoOnline}
                >
                  {canGoOnline ? (online ? "Go Offline" : "Go Online") : "KYC Required"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* CENTER: online overlay or offline cards */}
          <div className="lg:col-span-2 space-y-5">
            {online ? (
              <SearchingOverlay
                incoming={incoming}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ) : (
              <>
                <Card icon={kyc.icon} title={kyc.title} desc={kyc.desc}>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="purple">Faster matching</Pill>
                    <Pill tone="cyan">Better visibility</Pill>
                    <Pill tone="slate">Profile completeness matters</Pill>
                  </div>
                </Card>

                <Card
                  icon="⚡"
                  title="Quick actions"
                  desc="Shortcuts to manage your work faster."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => navigate("/provider/kyc")}
                      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left hover:bg-slate-900/70 transition"
                    >
                      <p className="text-xs text-slate-500">Verification</p>
                      <p className="mt-1 font-semibold">KYC</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Upload / update documents
                      </p>
                    </button>

                    <button
                      onClick={() => navigate("/provider/profile")}
                      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left hover:bg-slate-900/70 transition"
                    >
                      <p className="text-xs text-slate-500">Account</p>
                      <p className="mt-1 font-semibold">Profile</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Edit pricing, bio, location
                      </p>
                    </button>
                  </div>

                  {/* Incoming list in offline layout (optional) */}
                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 mt-2">
                    <p className="text-xs text-slate-400 mb-2">
                      Incoming requests
                    </p>

                    {incoming.length === 0 ? (
                      <p className="text-[11px] text-slate-500">
                        No incoming requests yet. Stay online to receive jobs.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {incoming.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs"
                          >
                            <p className="font-semibold text-slate-100 truncate">
                              {r.title || r.service_type}
                            </p>
                            <p className="text-slate-500 mt-0.5">
                              {r.service_type} • Final price: ₹
                              {r.budget ?? "—"}
                            </p>
                            <p className="text-[11px] text-cyan-300 mt-0.5 capitalize">
                              {r.status}
                            </p>

                            {String(r.status || "").toLowerCase() ===
                              "pending" && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => handleAccept(r)}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-500/80 text-slate-950 text-[11px] font-semibold hover:bg-emerald-400"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(r)}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-red-500/80 text-slate-950 text-[11px] font-semibold hover:bg-red-400"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            <Card
              icon="🟢"
              title="Availability"
              desc="Customers can match only when you are online."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">
                    {online ? "You are Online" : "You are Offline"}
                  </p>
                  <StatusDot online={online} />
                </div>

                <button
                  onClick={handleGoOnline}
                  className={cx(
                    "mt-1 w-full px-4 py-3 rounded-2xl text-xs font-semibold transition",
                    canGoOnline
                      ? online
                        ? "border border-slate-700 text-slate-200 hover:bg-slate-800/60"
                        : "bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 shadow-lg"
                      : "bg-slate-800/60 text-slate-300"
                  )}
                  disabled={!canGoOnline}
                >
                  {canGoOnline ? (online ? "Go Offline" : "Go Online") : "KYC Required"}
                </button>
              </div>
            </Card>

            <Card
              icon="📌"
              title="Smart tips"
              desc="Small changes that improve bookings."
            >
              <div className="space-y-2 text-xs text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="font-semibold text-slate-100">
                    Keep base price realistic
                  </p>
                  <p className="mt-1 text-slate-500">
                    Clear pricing increases conversion.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="font-semibold text-slate-100">
                    Write a short bio
                  </p>
                  <p className="mt-1 text-slate-500">
                    1–2 lines about experience builds trust instantly.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CURRENT JOB CARD */}
        {currentJob && (
          <div className="rounded-3xl bg-slate-950/60 border border-emerald-500/40 backdrop-blur-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Current job
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You are working on this request right now.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(`/provider/jobs/${currentJob.id}`, {
                    state: { request: currentJob },
                  })
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-emerald-500/80 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Open job
              </button>
            </div>
            <div className="p-5 text-xs">
              <p className="font-semibold text-slate-100 truncate">
                {currentJob.title ||
                  currentJob.service_type ||
                  "Service request"}
              </p>
              <p className="text-slate-500 mt-1">
                {currentJob.service_type} • Final price: ₹
                {currentJob.budget ?? "—"}
              </p>
              <p className="mt-1 text-[11px] text-emerald-300 capitalize">
                Status: {currentJob.status}
              </p>
            </div>
          </div>
        )}

        {/* HISTORY */}
        <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-100">History</p>
            <p className="text-xs text-slate-500 mt-1">
              Recent requests and jobs (latest first).
            </p>
          </div>

          <div className="p-5">
            {historyLoading ? (
              <div className="text-sm text-slate-300">Loading history…</div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center">
                <p className="text-sm font-semibold text-slate-100">
                  No activity yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Go online to start receiving requests.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-xs flex justify-between"
                  >
                    <span className="truncate">
                      {r.title || r.service_type}
                    </span>
                    <span className="capitalize text-slate-400">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
