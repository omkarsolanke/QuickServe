import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function ProviderKycPending() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "provider") {
      navigate("/auth/provider/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/provider/kyc/status");
        const s = res.data?.status || "pending";
        setStatus(s);

        if (s === "approved") navigate("/provider/dashboard");
        if (s === "not_submitted" || s === "rejected") navigate("/provider/kyc");
      } catch (e) {
        setError("Could not check status. Please try again.");
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4 py-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-24 w-96 h-96 bg-amber-500/15 blur-3xl rounded-full opacity-40" />
        <div className="absolute bottom-16 right-20 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl shadow-amber-900/25 backdrop-blur-2xl p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <span className="text-xl">⏳</span>
          </div>

          <div className="flex-1">
            <p className="text-xs text-slate-500">KYC status</p>
            <h1 className="text-2xl font-black text-slate-100 mt-1">
              Under review
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Your documents were submitted successfully. You’ll be able to go online after approval.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-full text-xs border bg-amber-500/15 border-amber-500/40 text-amber-200">
            {checking ? "Checking..." : status.toUpperCase()}
          </div>
        </div>

        {error && (
          <div className="mt-5 text-sm px-4 py-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800/60"
          >
            Back to dashboard
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-emerald-300 text-slate-950 text-xs font-semibold shadow-lg disabled:opacity-60"
          >
            Refresh status
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-200">While you wait</p>
          <ul className="mt-2 text-[12px] text-slate-400 space-y-1">
            <li>Keep notifications enabled for approval updates.</li>
            <li>Make sure documents are clear and not cropped.</li>
            <li>If rejected, you can re-upload from the KYC page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
