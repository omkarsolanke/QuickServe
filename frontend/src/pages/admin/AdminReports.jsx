import { useEffect, useMemo, useState } from "react";
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

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  if (["open", "new"].includes(s)) return <Pill tone="red">OPEN</Pill>;
  if (["in_review", "review"].includes(s)) return <Pill tone="amber">IN REVIEW</Pill>;
  if (["resolved", "closed", "done"].includes(s)) return <Pill tone="emerald">RESOLVED</Pill>;
  return <Pill tone="slate">{String(status || "—").toUpperCase()}</Pill>;
}

function severityTone(sev) {
  const s = String(sev || "").toLowerCase();
  if (["high", "critical"].includes(s)) return "red";
  if (["medium"].includes(s)) return "amber";
  return "slate";
}

/* ---------------- Detail modal ---------------- */
function DetailModal({ open, onClose, report, onResolve, busy }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between">
          <p className="text-sm font-semibold text-slate-100">
            Report #{report?.id}
          </p>
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report?.status} />
            <Pill tone={severityTone(report?.severity)}>
              {(report?.severity || "LOW").toUpperCase()}
            </Pill>
            <Pill tone="purple">{report?.type || "COMPLAINT"}</Pill>
          </div>

          <p className="text-sm text-slate-100 whitespace-pre-wrap">
            {report?.description || "No description provided."}
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onResolve}
              disabled={busy || report?.status === "resolved"}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 text-xs font-semibold disabled:opacity-60"
            >
              {busy ? "Resolving..." : "Mark resolved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */
export default function AdminReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [selected, setSelected] = useState(null);

  const statusOptions = useMemo(
    () => [
      { value: "open", label: "Open" },
      { value: "in_review", label: "In review" },
      { value: "resolved", label: "Resolved" },
      { value: "", label: "All" },
    ],
    []
  );

  /* ---------- load ---------- */
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/reports", {
        params: {
          status: status || "",
          search: search.trim(),
          limit: 100,
          offset: 0,
        },
      });

      // ✅ SAFE NORMALIZATION (CRITICAL FIX)
      const items = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRows(items);
    } catch (e) {
      setRows([]);
      setError(
        e.response?.data?.detail ||
          "Reports endpoint not available yet."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const resolve = async (id) => {
    setBusyId(id);
    setError("");

    try {
      await api.post(`/admin/reports/${id}/resolve`);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
      );
      setSelected((p) => (p?.id === id ? { ...p, status: "resolved" } : p));
    } catch (e) {
      setError(e.response?.data?.detail || "Resolve failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-slate-200">Loading reports…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No reports found
        </div>
      ) : (
        <div className="divide-y divide-slate-800 rounded-3xl border border-slate-800">
          {rows.map((r) => (
            <button
              key={`report-${r.id}`}
              onClick={() => setSelected(r)}
              className="w-full text-left p-5 hover:bg-slate-900/30 transition"
            >
              <div className="flex flex-wrap gap-2 mb-2">
                <Pill>#{r.id}</Pill>
                <StatusBadge status={r.status} />
                <Pill tone={severityTone(r.severity)}>
                  {(r.severity || "LOW").toUpperCase()}
                </Pill>
              </div>
              <p className="text-sm text-slate-100 line-clamp-2">
                {r.description || "No description"}
              </p>
            </button>
          ))}
        </div>
      )}

      <DetailModal
        open={!!selected}
        report={selected}
        busy={busyId === selected?.id}
        onResolve={() => resolve(selected.id)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
