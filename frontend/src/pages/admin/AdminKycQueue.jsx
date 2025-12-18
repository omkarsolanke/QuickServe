import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";

/* ---------------- utils ---------------- */
function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Badge({ status }) {
  const map = {
    pending: "bg-amber-500/15 border-amber-500/40 text-amber-200",
    approved: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
    rejected: "bg-red-500/15 border-red-500/40 text-red-200",
  };
  return (
    <span
      className={cx(
        "text-[11px] px-2.5 py-1 rounded-full border",
        map[status] || "border-slate-700 text-slate-300"
      )}
    >
      {String(status || "").toUpperCase()}
    </span>
  );
}

/* ================= PAGE ================= */
export default function AdminKycQueue() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const status = sp.get("status") || "pending";

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = useMemo(
    () => [
      { key: "pending", label: "Pending" },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
    ],
    []
  );

  /* ---------- load queue ---------- */
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/kyc", {
        params: {
          status,
          search: search.trim(),
          limit: 50,
          offset: 0,
        },
      });

      // ✅ CRITICAL FIX
      const list = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRows(list);
    } catch (e) {
      setError("Failed to load KYC queue");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /* ================= render ================= */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">KYC Queue</p>
            <p className="text-xs text-slate-500 mt-1">
              Review provider documents and approve or reject.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-200"
            />
            <button
              onClick={load}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950 text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSp({ status: f.key })}
              className={cx(
                "px-3 py-1.5 rounded-full text-xs border",
                status === f.key
                  ? "bg-purple-500/15 border-purple-500/30 text-purple-100"
                  : "border-slate-800 text-slate-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl bg-slate-950/60 border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between">
          <p className="text-sm font-semibold text-slate-100">
            Providers ({rows.length})
          </p>
          <p className="text-xs text-slate-600">Click Review to open details</p>
        </div>

        {loading ? (
          <div className="p-6 text-slate-200">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-slate-400">No records found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-xs text-slate-400 bg-slate-900/40">
              <tr>
                <th className="text-left px-5 py-3">Provider</th>
                <th className="text-left px-5 py-3">Service</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Online</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((r) => (
                <tr
                  key={`kyc-${r.provider_id}`}   // ✅ stable key
                  className="hover:bg-slate-900/30"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-100">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.email}</p>
                  </td>
                  <td className="px-5 py-4">{r.service_type}</td>
                  <td className="px-5 py-4">
                    <Badge status={r.kyc_status} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cx(
                        "text-xs",
                        r.is_online ? "text-emerald-300" : "text-slate-500"
                      )}
                    >
                      {r.is_online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        navigate(`/admin/kyc/${r.provider_id}`)
                      }
                      className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200"
                    >
                      Review →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
