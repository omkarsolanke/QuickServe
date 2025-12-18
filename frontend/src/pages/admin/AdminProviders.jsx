import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

/* ================= utils ================= */
function cx(...c) {
  return c.filter(Boolean).join(" ");
}

/* ================= UI atoms ================= */
function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/70 border-slate-700 text-slate-200",
    purple: "bg-purple-500/15 border-purple-500/30 text-purple-100",
    amber: "bg-amber-500/15 border-amber-500/40 text-amber-200",
    emerald: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
    red: "bg-red-500/15 border-red-500/40 text-red-200",
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

function KycBadge({ status }) {
  if (status === "approved") return <Pill tone="emerald">APPROVED</Pill>;
  if (status === "pending") return <Pill tone="amber">PENDING</Pill>;
  if (status === "rejected") return <Pill tone="red">REJECTED</Pill>;
  if (status === "not_submitted") return <Pill>NOT SUBMITTED</Pill>;
  return <Pill>{String(status || "UNKNOWN").toUpperCase()}</Pill>;
}

function OnlineBadge({ isOnline }) {
  return isOnline ? <Pill tone="emerald">ONLINE</Pill> : <Pill>OFFLINE</Pill>;
}

/* ================= Modal ================= */
function ConfirmModal({
  open,
  title,
  desc,
  confirmText,
  danger,
  busy,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={busy ? undefined : onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-200"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={onConfirm}
            className={cx(
              "px-4 py-2 rounded-xl text-xs font-semibold",
              danger
                ? "bg-gradient-to-r from-red-400 to-pink-500 text-slate-950"
                : "bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950"
            )}
          >
            {busy ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Dropdown ================= */
function RowMenu({ children }) {
  return (
    <details className="relative">
      <summary className="list-none cursor-pointer px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200">
        Actions ▾
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 z-10">
        {children}
      </div>
    </details>
  );
}

function MenuItem({ label, hint, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full text-left px-4 py-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-900/60",
        danger ? "text-red-200" : "text-slate-200"
      )}
    >
      <p className="text-xs font-semibold">{label}</p>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </button>
  );
}

/* ================= PAGE ================= */
export default function AdminProviders() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ---------- filters ---------- */
  const [search, setSearch] = useState("");          // text search
  const [category, setCategory] = useState("name");  // which field to search
  const [serviceType, setServiceType] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [onlineFilter, setOnlineFilter] = useState("");

  const serviceOptions = useMemo(
    () => [
      { value: "", label: "All services" },
      { value: "Plumber", label: "Plumber" },
      { value: "Electrician", label: "Electrician" },
      { value: "Cleaner", label: "Cleaner" },
      { value: "Carpenter", label: "Carpenter" },
      { value: "Painter", label: "Painter" },
    ],
    []
  );

  const kycOptions = [
    { value: "", label: "All KYC" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "not_submitted", label: "Not submitted" },
  ];

  const onlineOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Online only" },
    { value: "false", label: "Offline only" },
  ];

  /* ---------- load ---------- */
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/providers", {
        params: {
          search,
          search_field: category,       // backend: use to filter by name/email/phone
          service_type: serviceType,
          kyc_status: kycStatus,
          is_online: onlineFilter || undefined,
        },
      });

      const list = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRows(list);
    } catch {
      setError("Failed to load providers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // reload when any filter changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, serviceType, kycStatus, onlineFilter]);

  /* ---------- delete ---------- */
  const hardDelete = async (providerId) => {
    setBusyId(providerId);
    try {
      await api.delete(`/admin/providers/${providerId}`);
      setRows((r) => r.filter((x) => x.provider_id !== providerId));
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  /* ================= render ================= */
  return (
    <div className="space-y-5">
      {/* filters bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="city">City</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers…"
            className="h-9 w-52 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200 placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={kycStatus}
            onChange={(e) => setKycStatus(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            {kycOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={onlineFilter}
            onChange={(e) => setOnlineFilter(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            {onlineOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-slate-200">Loading providers…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No providers found
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-800">
              <th className="p-4 text-left">Provider</th>
              <th className="p-4 text-left">Service</th>
              <th className="p-4 text-left">KYC</th>
              <th className="p-4 text-left">Online</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={
                  r.provider_id
                    ? `provider-${r.provider_id}`
                    : r.user_id
                    ? `user-${r.user_id}`
                    : `row-${r.email}`
                }
                className="border-b border-slate-800"
              >
                <td className="p-4">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                  {r.phone && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {r.phone}
                    </p>
                  )}
                </td>

                <td className="p-4">{r.service_type}</td>

                <td className="p-4">
                  <KycBadge status={r.kyc_status} />
                </td>

                <td className="p-4">
                  <OnlineBadge isOnline={r.is_online} />
                </td>


                <td className="p-4 text-right">
                  <RowMenu>
                    <MenuItem
                      label="Review KYC"
                      onClick={() =>
                        navigate(`/admin/kyc/${r.provider_id}`)
                      }
                    />
                    <MenuItem
                      label="Hard delete"
                      danger
                      onClick={() => setDeleteTarget(r)}
                    />
                  </RowMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete provider?"
        desc={`This will permanently delete ${deleteTarget?.name}`}
        confirmText="Delete"
        danger
        busy={busyId === deleteTarget?.provider_id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => hardDelete(deleteTarget.provider_id)}
      />
    </div>
  );
}
