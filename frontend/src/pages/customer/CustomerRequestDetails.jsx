// src/pages/customer/CustomerRequestDetails.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function CustomerRequestDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initial = location.state?.request || null;

  const [req, setReq] = useState(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState("");
  const [addressFromGeo, setAddressFromGeo] = useState("");

  const loadRequest = async () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "customer") {
      navigate("/auth/customer/login");
      return;
    }

    setError("");
    try {
      const res = await api.get("/requests/my", { params: { limit: 20 } });
      const list = res.data || [];
      const found = list.find((r) => r.id === Number(id));
      if (!found) {
        setError("Request not found");
        setReq(null);
      } else {
        setReq(found);
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await api.post(`/requests/${id}/cancel`);
      await loadRequest();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to cancel request");
    }
  };

  // Use browser geolocation and backend reverse geocode (/location/reverse)
  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setAddressFromGeo("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await api.get("/location/reverse", {
            params: { lat, lng },
          });
          // Backend should return { address: "<formatted human address>" }
          setAddressFromGeo(res.data.address);
        } catch (e) {
          setAddressFromGeo(`Lat ${lat}, Lng ${lng}`);
        }
      },
      (err) => {
        setAddressFromGeo(`Location error: ${err.message}`);
      }
    );
  };

  useEffect(() => {
    loadRequest();
    const timer = setInterval(loadRequest, 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const goBack = () => {
    if (location.state?.from) navigate(location.state.from);
    else navigate("/customer/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020518] text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-[3px] border-slate-600/70 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs sm:text-sm text-slate-400">Loading request…</p>
        </div>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="min-h-screen bg-[#020518] text-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="rounded-2xl bg-red-500/10 border border-red-500/40 px-4 py-3 text-sm text-red-100 max-w-sm text-center">
          {error || "Request not found"}
        </div>
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-100 hover:border-cyan-400/70 hover:text-cyan-50 transition"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const isPending = req.status === "pending";

  const statusColor =
    req.status === "cancelled"
      ? "bg-red-500/10 text-red-200 border-red-500/40"
      : req.status === "completed"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/40"
      : "bg-cyan-500/10 text-cyan-200 border-cyan-500/40";

  return (
    <div className="min-h-screen bg-[#020518] text-slate-50 flex items-center justify-center px-3 sm:px-6 py-6">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-40 w-72 h-72 rounded-full bg-cyan-500/18 blur-3xl opacity-80" />
        <div className="absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-indigo-500/18 blur-[90px] opacity-90" />
      </div>

      <div className="relative z-10 w-full max-w-3xl rounded-[28px] bg-slate-950/85 border border-slate-800/80 shadow-[0_24px_80px_rgba(0,0,0,0.85)] px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* top bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 hover:text-cyan-200 transition"
          >
            <span className="text-sm">←</span>
            <span>Back to dashboard</span>
          </button>

          {isPending && (
            <button
              onClick={cancelRequest}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-[11px] sm:text-xs font-semibold text-slate-950 px-3 sm:px-4 py-1.5 shadow-[0_10px_32px_rgba(248,113,113,0.55)]"
            >
              Cancel request
            </button>
          )}
        </div>

        {/* header + status pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Request details
            </h1>
            <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
              Track the status and details of this service request.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-[10px] sm:text-[11px]">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 capitalize ${statusColor}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {req.status}
            </span>
            <span className="text-slate-500">
              Request ID: <span className="text-slate-300">#{req.id}</span>
            </span>
          </div>
        </div>

        {/* main request card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 sm:px-5 sm:py-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-50">
                {req.title || "Service request"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {req.service_type || "General service"}
              </p>
            </div>

            {req.budget != null && (
              <div className="text-right text-[11px]">
                <p className="text-slate-500">Budget</p>
                <p className="text-emerald-300 font-semibold">₹{req.budget}</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 border border-slate-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Live updates
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">
              You will be notified when a provider is assigned or the status
              changes.
            </span>
          </div>
        </div>

        {/* address */}
        {req.address && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 sm:px-5 sm:py-5 text-xs sm:text-[13px] space-y-1.5">
            <p className="font-semibold text-slate-100">Service address</p>
            <p className="text-slate-400 whitespace-pre-line">{req.address}</p>
          </div>
        )}

        {/* optional: “Use my current location” helper display */}
        {addressFromGeo && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3 text-[11px] sm:text-[12px] space-y-1">
            <p className="font-semibold text-slate-100">
              Your current location (detected)
            </p>
            <p className="text-slate-400 whitespace-pre-line">
              {addressFromGeo}
            </p>
          </div>
        )}

        {/* description */}
        {req.description && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 sm:px-5 sm:py-5 text-xs sm:text-[13px] space-y-1.5">
            <p className="font-semibold text-slate-100">Description</p>
            <p className="text-slate-400 whitespace-pre-line">
              {req.description}
            </p>
          </div>
        )}

        {/* example button to trigger geolocation (optional) */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={useMyLocation}
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:border-cyan-400/70 hover:text-cyan-50 transition"
          >
            Use my current location
          </button>
        </div>
      </div>
    </div>
  );
}
