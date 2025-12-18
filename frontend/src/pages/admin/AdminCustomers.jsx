import { useEffect, useState } from "react";
import api from "../../api/client";

/* ---------------- utils ---------------- */
function cx(...c) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- UI atoms ---------------- */
function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/70 border-slate-700 text-slate-200",
    purple: "bg-purple-500/15 border-purple-500/30 text-purple-100",
    pink: "bg-pink-500/15 border-pink-500/30 text-pink-100",
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

/* ---------------- Modal ---------------- */
function ConfirmModal({
  open,
  title,
  desc,
  confirmText,
  onClose,
  onConfirm,
  danger,
  busy,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={busy ? undefined : onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs"
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

/* ================= PAGE ================= */
export default function AdminCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ---------- load customers ---------- */
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/customers", {
        params: { search, limit: 50, offset: 0 },
      });

      // ✅ CRITICAL FIX
      const list = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRows(list);
    } catch (e) {
      setError("Failed to load customers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------- delete ---------- */
  const hardDelete = async (id) => {
    setBusyId(id);
    await api.delete(`/admin/customers/${id}`);
    setRows((r) => r.filter((x) => x.id !== id));
    setBusyId(null);
    setDeleteTarget(null);
  };

  /* ================= render ================= */
  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-slate-200">Loading customers…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No customers found
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="text-xs text-slate-400">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">User ID</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={`customer-${r.id}`}   // ✅ STABLE KEY
                className="border-b border-slate-800"
              >
                <td className="p-3">
                  <p className="font-semibold text-slate-100">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                </td>
                <td className="p-3">
                  <Pill>#{r.id}</Pill>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="px-3 py-2 rounded-xl border border-red-500/40 text-red-200 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete customer?"
        desc={deleteTarget?.name}
        confirmText="Delete"
        danger
        busy={busyId === deleteTarget?.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => hardDelete(deleteTarget.id)}
      />
    </div>
  );
}
