// src/pages/admin/AdminRequests.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

/* ============== utils ============== */
function cx(...c) {
  return c.filter(Boolean).join(" ");
}

/* ============== UI atoms ============== */
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

function StatusBadge({ status }) {
  if (status === "completed") return <Pill tone="emerald">COMPLETED</Pill>;
  if (status === "cancelled") return <Pill tone="red">CANCELLED</Pill>;
  if (status === "assigned") return <Pill tone="purple">ASSIGNED</Pill>;
  return <Pill tone="amber">{String(status || "PENDING").toUpperCase()}</Pill>;
}

/* ============== PAGE ============== */
export default function AdminRequests() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");

  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "assigned", label: "Assigned" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const serviceOptions = useMemo(
    () => [
      { value: "", label: "All services" },
      { value: "Electrical issue", label: "Electrical issue" },
      { value: "AC Repair", label: "AC Repair" },
      { value: "Plumbing", label: "Plumbing" },
      // add more service types if you use them
    ],
    []
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/requests", {
        params: {
          status,
          service_type: serviceType,
          limit: 100,
          offset: 0,
        },
      });

      const list = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRows(list);
    } catch {
      setError("Failed to load requests");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, serviceType]);

  return (
    <div className="space-y-5">
      {/* header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Admin</p>
          <h1 className="text-sm font-semibold text-slate-100">
            Requests Monitor
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            {serviceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-200"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
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
        <div className="p-6 text-slate-200">Loading requests…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No requests found
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-800">
              <th className="p-4 text-left w-16">ID</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Service</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Provider</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-800 hover:bg-slate-900/40"
              >
                <td className="p-4 text-xs text-slate-500">#{r.id}</td>

                <td className="p-4">
                  <p className="font-semibold text-slate-100">
                    {r.title || "Service request"}
                  </p>
                </td>

                <td className="p-4 text-slate-200">
                  {r.service_type}
                </td>

                <td className="p-4">
                  <StatusBadge status={r.status} />
                </td>

                <td className="p-4 text-slate-200">
                  {r.customer_id ?? "—"}
                </td>

                <td className="p-4 text-slate-200">
                  {r.provider
                    ? `#${r.provider.id} · ${r.provider.name || "Provider"}`
                    : "—"}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => navigate(`/admin/requests/${r.id}`)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 hover:bg-slate-900/60"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
