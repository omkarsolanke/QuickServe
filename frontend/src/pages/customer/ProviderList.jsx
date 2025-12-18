// src/pages/customer/ProviderList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function kmLabel(km) {
  if (km == null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function ProviderList() {
  const navigate = useNavigate();
  const location = useLocation();
  const request = location.state?.request || null;

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const inFlightRef = useRef(false);

  const loadProviders = async ({ silent = false } = {}) => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "customer") {
      navigate("/auth/customer/login");
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const serviceType =
        request?.service_type || localStorage.getItem("last_service_type") || "";

      const res = await api.get("/customer/nearby-providers", {
        params: { service_type: serviceType },
      });

      const items = (res.data.items || []).map((p) => ({
        id: p.provider_id,
        name: p.name,
        location: p.area,
        distance_km: p.distance_km,
        rating: p.rating ?? 0,
        jobs_done: p.jobs ?? 0,
        base_price: p.base_price ?? p.est_min ?? null,
        currency: p.currency ?? "₹",
        service_type: serviceType || "Any service",
      }));

      setProviders(items);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load nearby providers");
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadProviders({ silent: false });
    const id = setInterval(() => loadProviders({ silent: true }), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtitle = useMemo(() => {
    if (!request?.service_type) {
      return "Matching trusted professionals around your location.";
    }
    return `Showing providers for “${request.service_type}”.`;
  }, [request?.service_type]);

  const handleSelect = (p) => {
    navigate("/customer/confirm", { state: { provider: p, request } });
  };

  const serviceLabel = request?.service_type || "All services";

  const handleBack = () => {
    if (location.state?.from) navigate(location.state.from);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#020518] text-slate-50">
      {/* background orbs for depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-32 w-64 h-64 rounded-full bg-cyan-500/18 blur-3xl opacity-80" />
        <div className="absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-indigo-500/16 blur-[90px] opacity-90" />
      </div>

      <main className="relative z-10 mx-auto max-w-xl md:max-w-5xl px-4 pt-4 pb-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Sticky mobile header with back + refresh + summary */}
        <header className="sticky top-0 z-20 -mx-4 mb-2 border-b border-slate-800/70 bg-[#020518]/95 backdrop-blur-md px-4 pt-2 pb-3 sm:static sm:border-none sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 hover:border-cyan-400/70 hover:text-cyan-50 hover:bg-slate-900 transition"
            >
              <span className="text-sm">←</span>
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => loadProviders({ silent: false })}
              className={cx(
                "relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium border",
                "border-slate-700/80 bg-slate-900/80 text-slate-100",
                "hover:border-cyan-400/70 hover:text-cyan-50 hover:bg-slate-900 transition"
              )}
            >
              {refreshing && (
                <span className="h-3.5 w-3.5 border-[2px] border-cyan-300/70 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-[10px] text-slate-500 hidden sm:block">
              Home / CustomerDashboard /{" "}
              <span className="text-cyan-300">Nearby providers</span>
            </p>

            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                  Providers near you
                </h1>
                <p className="mt-1 text-[11px] sm:text-sm text-slate-400">
                  {subtitle}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live updates
              </span>
            </div>

            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-900/70 border border-slate-700/80 px-2.5 py-1 text-[10px] text-slate-300">
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-cyan-200 font-medium truncate">
                {serviceLabel}
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="truncate text-slate-400">
                Choose a provider to see full details and confirm your booking.
              </span>
            </div>
          </div>
        </header>

        {/* States */}
        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-slate-400">
            <div className="h-9 w-9 border-[3px] border-slate-600/70 border-t-cyan-400 rounded-full animate-spin" />
            <p>Finding the best matches around you…</p>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/40 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : providers.length === 0 ? (
          <div className="mt-4 rounded-3xl bg-slate-900/70 border border-slate-700/80 p-6 text-sm text-slate-300 text-center space-y-2">
            <p className="font-medium">No providers available yet.</p>
            <p className="text-xs text-slate-500">
              Try again in a moment or adjust your service type and location.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>
                Showing{" "}
                <span className="text-slate-200">{providers.length}</span>{" "}
                {providers.length === 1 ? "provider" : "providers"}
              </span>
            </div>

            {/* Mobile‑first list; becomes grid on larger screens */}
            <section
              aria-label="Nearby providers"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
            >
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="group relative flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.55)] hover:border-cyan-400/60 hover:bg-slate-900 transition-transform duration-150 active:scale-[0.99]"
                >
                  {/* glow on hover (desktop) */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/15 via-transparent to-indigo-500/10 blur-[2px] transition-opacity" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/40 to-sky-500/20 text-[13px] font-semibold text-cyan-50 ring-1 ring-cyan-400/40">
                        {initials(p.name || "Provider")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-50 truncate">
                          {p.name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                          <span className="truncate max-w-[9rem]">
                            {p.location || "—"}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>{kmLabel(p.distance_km)} away</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 text-amber-200 px-2 py-0.5 font-semibold">
                        ★ {Number(p.rating || 0).toFixed(1)}
                      </span>
                      <span className="mt-1 text-[10px]">
                        {p.jobs_done || 0} jobs
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-3 flex items-end justify-between gap-3">
                    <div className="text-[11px]">
                      <div className="text-slate-500 mb-0.5">Base price</div>
                      <div className="text-emerald-200 font-semibold text-[13px]">
                        {p.base_price != null
                          ? `${p.currency}${p.base_price}`
                          : "Contact for quote"}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Final quote may vary after inspection.
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200 border border-cyan-400/40">
                        {p.service_type || "Service provider"}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-full bg-cyan-500 text-[11px] font-medium text-slate-950 px-4 py-1.5 shadow-[0_10px_30px_rgba(8,145,178,0.55)] w-full sm:w-auto">
                        View details
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
