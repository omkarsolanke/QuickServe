// src/pages/customer/CustomerConfirm.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 backdrop-blur-xl px-4 py-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate">{value}</div>
    </div>
  );
}

export default function CustomerConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialProvider = location.state?.provider || null;
  const initialRequest = location.state?.request || null;

  const [provider, setProvider] = useState(initialProvider);
  const [request, setRequest] = useState(initialRequest);

  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const inFlightRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "customer") navigate("/auth/customer/login");
  }, [navigate]);

  useEffect(() => {
    if (!initialProvider || !initialRequest) navigate("/customer/providers");
  }, [initialProvider, initialRequest, navigate]);

  const refreshAll = async ({ silent = false } = {}) => {
    if (!provider?.id || !request?.id) return;

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (silent) setRefreshing(true);
    setError("");

    try {
      // Adjust these endpoints to match your backend
      const [provRes, reqRes] = await Promise.all([
        api.get(`/providers/${provider.id}`),
        api.get(`/requests/${request.id}`),
      ]);

      // map provider
      const p = provRes.data || {};
      setProvider((prev) => ({
        ...prev,
        name: p.name ?? prev.name,
        location: p.area ?? p.location ?? prev.location,
        rating: p.rating ?? prev.rating ?? 0,
        jobs_done: p.jobs ?? p.jobs_done ?? prev.jobs_done ?? 0,
        base_price: p.base_price ?? p.est_min ?? prev.base_price ?? prev.est_budget ?? null,
        currency: p.currency ?? prev.currency ?? "₹",
      }));

      // map request
      const r = reqRes.data || {};
      setRequest((prev) => ({
        ...prev,
        title: r.title ?? prev.title,
        service_type: r.service_type ?? prev.service_type,
        address: r.address ?? prev.address,
        description: r.description ?? prev.description,
      }));
    } catch (e) {
      // keep old data, just show small warning
      setError(e.response?.data?.detail || "Could not refresh live details");
    } finally {
      setRefreshing(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!provider?.id || !request?.id) return;

    refreshAll({ silent: false });

    const id = setInterval(() => refreshAll({ silent: true }), 5000);
    return () => clearInterval(id); // cleanup [web:291]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.id, request?.id]);

  const ratingText = useMemo(() => {
    const r = Number.isFinite(provider?.rating) ? provider.rating : 0;
    return r.toFixed(1);
  }, [provider?.rating]);

  const basePriceText = useMemo(() => {
    const price = provider?.base_price ?? provider?.est_budget ?? null;
    const cur = provider?.currency ?? "₹";
    return price != null ? `${cur}${price}` : "—";
  }, [provider?.base_price, provider?.est_budget, provider?.currency]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/requests/${request.id}/assign-provider`, {
        provider_id: provider.id,
      });
      navigate("/customer/dashboard", { state: { justBooked: true } });
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to confirm booking");
      setSubmitting(false);
    }
  };

  if (!provider || !request) return null;

  return (
    <div className="min-h-screen bg-[#040717] text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-28 w-96 h-96 rounded-full bg-cyan-500/16 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 right-0 w-96 h-96 rounded-full bg-emerald-500/14 blur-3xl opacity-70" />
      </div>

      <header className="relative z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("/customer/providers")}
            className="px-3 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-200 hover:border-cyan-400/45 hover:text-cyan-100 hover:bg-slate-900/60 transition"
          >
            ← Back
          </button>

          <div className="text-[11px] text-slate-500">
            {refreshing ? "Updating live…" : "Live updates on"}
          </div>

          <button
            type="button"
            onClick={() => refreshAll({ silent: false })}
            className="px-3 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-200 hover:border-cyan-400/45 hover:text-cyan-100 hover:bg-slate-900/60 transition"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1">
              Home / CustomerDashboard / <span className="text-cyan-300">Confirm</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-black">Confirm your booking</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Details refresh automatically every few seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-[520px]">
            <Stat label="Provider" value={provider.name || "—"} />
            <Stat label="Rating" value={`★ ${ratingText}`} />
            <Stat label="Base price" value={basePriceText} />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/35 px-4 py-3 text-[12px] text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-8 space-y-5">
            <div className="rounded-3xl bg-slate-900/55 border border-slate-700/70 backdrop-blur-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100">{provider.name}</div>
                  <div className="text-[12px] text-slate-500 truncate">{provider.location || "—"}</div>
                  <div className="text-[12px] text-emerald-200 mt-2 font-semibold">
                    Base price: {basePriceText}
                  </div>
                </div>
                <div className="text-right text-[12px] text-slate-400">
                  <div className="text-amber-200 font-semibold">★ {ratingText}</div>
                  <div>{provider.jobs_done ?? 0} jobs completed</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/55 border border-slate-700/70 backdrop-blur-2xl p-5 sm:p-6">
              <div className="text-sm font-bold text-slate-100">Request</div>
              <div className="mt-3 space-y-3 text-xs">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 px-4 py-3">
                  <div className="text-[11px] text-slate-500">Title</div>
                  <div className="text-sm font-semibold text-slate-100 mt-0.5">
                    {request.title || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 px-4 py-3">
                  <div className="text-[11px] text-slate-500">Service</div>
                  <div className="text-xs text-cyan-200 mt-0.5">{request.service_type || "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 px-4 py-3">
                  <div className="text-[11px] text-slate-500">Address</div>
                  <div className="text-xs text-slate-200 mt-0.5">{request.address || "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/35 px-4 py-3">
                  <div className="text-[11px] text-slate-500">Description</div>
                  <div className="text-xs text-slate-200 mt-0.5 whitespace-pre-wrap">
                    {request.description || "—"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl bg-slate-900/55 border border-slate-700/70 backdrop-blur-2xl p-5 sm:p-6">
              <div className="text-sm font-bold text-slate-100">Confirm</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Assigns this provider to your request.
              </p>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className={cx(
                  "w-full mt-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition",
                  "bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 shadow-cyan-500/30 hover:shadow-cyan-500/55 hover:-translate-y-0.5",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {submitting ? "Confirming…" : "Confirm & book"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/customer/providers")}
                disabled={submitting}
                className="w-full mt-2 py-2.5 rounded-2xl border border-slate-700 text-slate-200 text-xs hover:bg-slate-800/60 transition disabled:opacity-60"
              >
                Change provider
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
