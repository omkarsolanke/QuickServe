import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

/* ---------------- UI helpers ---------------- */
function Badge({ status }) {
  const map = {
    pending: "bg-amber-500/15 border-amber-500/40 text-amber-200",
    approved: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
    rejected: "bg-red-500/15 border-red-500/40 text-red-200",
  };
  return (
    <span
      className={`text-[11px] px-2.5 py-1 rounded-full border ${
        map[status] || "border-slate-700 text-slate-300"
      }`}
    >
      {String(status || "unknown").toUpperCase()}
    </span>
  );
}
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
function ConfirmModal({
  open,
  title,
  desc,
  confirmText,
  onClose,
  onConfirm,
  danger,
  disabled,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 mt-2">{desc}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs hover:bg-slate-800/60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-60 ${
              danger
                ? "bg-gradient-to-r from-red-400 to-pink-500 text-slate-950"
                : "bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */
export default function AdminKycReview() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const kycStatus = data?.provider?.kyc_status;

  const docTips = useMemo(
    () => [
      "Check name/email matches signup data.",
      "Ensure ID number is readable and valid.",
      "Verify documents are not blurred or cropped.",
    ],
    []
  );

  /* ---------- load ---------- */
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/admin/kyc/${providerId}`);
      setData(res.data || null);
      setReason(res.data?.kyc?.rejection_reason || "");
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load KYC details");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  /* ---------- actions ---------- */
  const approve = async () => {
    if (kycStatus === "approved") return;

    setBusy(true);
    try {
      await api.post(`/admin/kyc/${providerId}/approve`);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Approve failed");
    } finally {
      setBusy(false);
      setApproveOpen(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setBusy(true);
    try {
      await api.post(`/admin/kyc/${providerId}/reject`, {
        reason: reason.trim(),
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Reject failed");
    } finally {
      setBusy(false);
      setRejectOpen(false);
    }
  };

  /* ---------- docs ---------- */
  const DocCard = ({ title, path }) => (
    <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5 shadow-xl">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-[11px] text-slate-500 mt-1 break-all">
        {path || "Not uploaded"}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          disabled={!path}
          onClick={() => window.open(`${API_BASE}/${path}`, "_blank")}
          className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 disabled:opacity-50"
        >
          Open
        </button>
        <button
          disabled={!path}
          onClick={() => path && navigator.clipboard.writeText(`${API_BASE}/${path}`)}
          className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200 disabled:opacity-50"
        >
          Copy path
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-slate-200">
        Loading KYC record…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
        KYC record not found.
      </div>
    );
  }

  /* ================= render ================= */
  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/admin/kyc")}
          className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-200"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          <Badge status={kycStatus} />
          <button
            disabled={busy || kycStatus === "approved"}
            onClick={() => setApproveOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-xs font-semibold disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => setRejectOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 text-xs font-semibold disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Provider */}
        <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-6 shadow-xl">
          <p className="text-sm font-semibold text-slate-100">
            {data.user.full_name}
          </p>
          <p className="text-xs text-slate-500">{data.user.email}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-slate-800">
              {data.provider.service_type}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-slate-800">
              ₹{data.provider.base_price}
            </span>
          </div>

          <ul className="mt-4 text-xs text-slate-400 space-y-1">
            {docTips.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>

        {/* Docs */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocCard title="ID Proof" path={data.kyc.id_proof_path} />
          <DocCard title="Address Proof" path={data.kyc.address_proof_path} />
          <DocCard title="Profile Photo" path={data.kyc.profile_photo_path} />

          <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5 shadow-xl">
            <p className="text-sm font-semibold text-slate-100">
              Rejection reason
            </p>
            <textarea
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-3 w-full px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-sm text-slate-100 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={approveOpen}
        title="Approve provider KYC?"
        desc="This will allow the provider to go online."
        confirmText={busy ? "Approving…" : "Approve"}
        onClose={() => setApproveOpen(false)}
        onConfirm={approve}
        disabled={busy}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject provider KYC?"
        desc="A clear rejection reason is required."
        confirmText={busy ? "Rejecting…" : "Reject"}
        onClose={() => setRejectOpen(false)}
        onConfirm={reject}
        danger
        disabled={busy}
      />
    </div>
  );
}
