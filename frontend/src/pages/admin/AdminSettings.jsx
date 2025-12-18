import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

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
    <span className={cx("text-[11px] px-2.5 py-1 rounded-full border", tones[tone] || tones.slate)}>
      {children}
    </span>
  );
}

function Section({ icon, title, desc, children }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-200">{label}</p>
          {hint ? <p className="text-[11px] text-slate-500 mt-1">{hint}</p> : null}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, labelLeft, labelRight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-slate-400">
        <span className="text-slate-200 font-semibold">{labelLeft}</span>
        {labelRight ? <span className="text-slate-500"> — {labelRight}</span> : null}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cx(
          "w-12 h-7 rounded-full border transition relative",
          checked
            ? "bg-emerald-500/20 border-emerald-500/40"
            : "bg-slate-800/60 border-slate-700"
        )}
        aria-pressed={checked}
      >
        <span
          className={cx(
            "absolute top-0.5 w-6 h-6 rounded-full transition",
            checked ? "left-5 bg-emerald-300" : "left-0.5 bg-slate-300"
          )}
        />
      </button>
    </div>
  );
}

function Toast({ kind = "success", text, onClose }) {
  if (!text) return null;
  const map = {
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
    error: "bg-red-500/15 border-red-500/30 text-red-200",
    warn: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  };
  return (
    <div className={cx("rounded-2xl border px-4 py-3 text-sm flex items-start justify-between gap-3", map[kind])}>
      <span>{text}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-xs px-2 py-1 rounded-lg border border-current/30 hover:bg-white/5"
      >
        Close
      </button>
    </div>
  );
}

// Default settings (client-side fallback)
const DEFAULTS = {
  platform_name: "QuickServe",
  maintenance_mode: false,
  default_search_radius_km: 5,
  max_search_radius_km: 25,
  provider_auto_online_after_kyc: true,
  min_base_price: 99,
  platform_fee_percent: 0,
  service_types: ["AC Repair", "Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Appliance repair"],
  request_statuses: ["pending", "assigned", "in_progress", "completed", "cancelled"],
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ kind: "success", text: "" });

  const [settings, setSettings] = useState(DEFAULTS);
  const [newService, setNewService] = useState("");

  const serviceTypesSorted = useMemo(() => {
    const s = settings?.service_types || [];
    // copy+sort (don't mutate state arrays) [web:432]
    return [...s].sort((a, b) => String(a).localeCompare(String(b)));
  }, [settings]);

  const load = async () => {
    setLoading(true);
    setToast({ kind: "success", text: "" });

    try {
      const res = await api.get("/admin/settings");
      setSettings({ ...DEFAULTS, ...(res.data || {}) });
    } catch (e) {
      setSettings(DEFAULTS);
      setToast({
        kind: "warn",
        text: e.response?.data?.detail || "Settings endpoint not available yet. Using local defaults.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setToast({ kind: "success", text: "" });

    if (!settings.platform_name?.trim()) {
      setToast({ kind: "error", text: "Platform name is required." });
      setSaving(false);
      return;
    }
    if (Number(settings.default_search_radius_km) <= 0) {
      setToast({ kind: "error", text: "Default radius must be greater than 0." });
      setSaving(false);
      return;
    }
    if (Number(settings.max_search_radius_km) < Number(settings.default_search_radius_km)) {
      setToast({ kind: "error", text: "Max radius must be >= default radius." });
      setSaving(false);
      return;
    }

    try {
      await api.put("/admin/settings", settings);
      setToast({ kind: "success", text: "Settings saved successfully." });
    } catch (e) {
      setToast({ kind: "error", text: e.response?.data?.detail || "Save failed (endpoint missing?)" });
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    const v = newService.trim();
    if (!v) return;

    const current = settings.service_types || [];
    const exists = current.some((x) => String(x).toLowerCase() === v.toLowerCase());
    if (exists) {
      setToast({ kind: "warn", text: "Service type already exists." });
      return;
    }

    setSettings((s) => ({ ...s, service_types: [...(s.service_types || []), v] })); // immutable update [web:432]
    setNewService("");
  };

  const removeService = (name) => {
    setSettings((s) => ({
      ...s,
      service_types: (s.service_types || []).filter((x) => x !== name), // immutable update [web:432]
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULTS);
    setToast({ kind: "warn", text: "Reset to defaults (local). Click Save to persist." });
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-slate-200">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toast
        kind={toast.kind}
        text={toast.text}
        onClose={() => setToast({ kind: "success", text: "" })}
      />

      {/* Page header */}
      <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5 md:p-6 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <span className="text-lg">⚙️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Admin Settings</p>
                <p className="text-xs text-slate-500">
                  Control platform behavior, matching defaults, and service catalog.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="purple">Configurable</Pill>
              <Pill tone="slate">Services: {(settings.service_types || []).length}</Pill>
              {settings.maintenance_mode ? <Pill tone="red">MAINTENANCE ON</Pill> : <Pill tone="emerald">LIVE</Pill>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 text-xs font-semibold hover:bg-slate-900/70 transition disabled:opacity-60"
            >
              Reload
            </button>

            <button
              type="button"
              onClick={resetToDefaults}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-amber-200 text-xs font-semibold hover:bg-slate-900/70 transition disabled:opacity-60"
            >
              Reset to defaults
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950 text-xs font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section
          icon="🏷️"
          title="Platform identity"
          desc="Control branding and global flags that affect all users."
        >
          <div className="space-y-4">
            <Field label="Platform name" hint="Shown on admin and can be used on user-facing screens if you want.">
              <input
                value={settings.platform_name || ""}
                onChange={(e) => setSettings((s) => ({ ...s, platform_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100 placeholder:text-slate-600"
                placeholder="QuickServe"
              />
            </Field>

            <Field
              label="Maintenance mode"
              hint="When enabled, you can block new requests and show a maintenance banner in the app."
            >
              <Toggle
                checked={!!settings.maintenance_mode}
                onChange={(v) => setSettings((s) => ({ ...s, maintenance_mode: v }))}
                labelLeft={settings.maintenance_mode ? "Enabled" : "Disabled"}
                labelRight="Use with caution"
              />
            </Field>

            <Field
              label="Auto-online after KYC"
              hint="If enabled, a provider can go online automatically after approval (optional behavior)."
            >
              <Toggle
                checked={!!settings.provider_auto_online_after_kyc}
                onChange={(v) => setSettings((s) => ({ ...s, provider_auto_online_after_kyc: v }))}
                labelLeft={settings.provider_auto_online_after_kyc ? "Enabled" : "Disabled"}
                labelRight="Providers still can be forced offline"
              />
            </Field>
          </div>
        </Section>

        <Section
          icon="📍"
          title="Matching defaults"
          desc="Tune radius and pricing constraints used by your matching logic."
        >
          <div className="space-y-4">
            <Field label="Default search radius (km)" hint="Initial radius used when finding nearby providers.">
              <input
                type="number"
                min={1}
                value={settings.default_search_radius_km}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, default_search_radius_km: Number(e.target.value) }))
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
              />
            </Field>

            <Field label="Max search radius (km)" hint="Upper bound for expanding search when no providers found.">
              <input
                type="number"
                min={1}
                value={settings.max_search_radius_km}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, max_search_radius_km: Number(e.target.value) }))
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
              />
            </Field>

            <Field label="Minimum base price (₹)" hint="Block providers with base price below this value (optional).">
              <input
                type="number"
                min={0}
                value={settings.min_base_price}
                onChange={(e) => setSettings((s) => ({ ...s, min_base_price: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
              />
            </Field>

            <Field label="Platform fee (%)" hint="If you charge a fee per transaction, configure it here.">
              <input
                type="number"
                min={0}
                max={100}
                value={settings.platform_fee_percent}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, platform_fee_percent: Number(e.target.value) }))
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
              />
            </Field>
          </div>
        </Section>

        <div className="lg:col-span-2">
          <Section
            icon="🧩"
            title="Service catalog"
            desc="Manage the list of service types available for providers and customer requests."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <Field label="Add service type" hint="Example: Washing Machine Repair">
                  <div className="flex gap-2">
                    <input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addService();
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100 placeholder:text-slate-600"
                      placeholder="Enter new service"
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-950 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">Press Enter to add quickly.</p>
                </Field>

                <Field
                  label="Request statuses (display only)"
                  hint="This list helps your team standardize names; update backend enums separately."
                >
                  <div className="flex flex-wrap gap-2">
                    {(settings.request_statuses || []).map((s) => (
                      <Pill key={s} tone="slate">{String(s).toUpperCase()}</Pill>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Service types</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Removing a service type may affect existing providers/requests; use carefully.
                    </p>
                  </div>
                  <Pill tone="slate">{(settings.service_types || []).length} items</Pill>
                </div>

                {(settings.service_types || []).length === 0 ? (
                  <div className="mt-4 p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
                      <span className="text-xl">🗂️</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-100">No service types</p>
                    <p className="mt-1 text-xs text-slate-500">Add one on the left.</p>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceTypesSorted.map((name) => (
                      <div
                        key={name}
                        className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 flex items-start justify-between gap-3 hover:border-purple-500/30 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-100 truncate">{name}</p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Used for provider category and customer request.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(name)}
                          className="px-3 py-2 rounded-xl border border-red-500/30 text-red-200 text-xs hover:bg-red-500/10"
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Quick add presets</p>
                    <p className="text-[11px] text-slate-600 mt-1">Add common services with one click.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {["Washing Machine Repair", "Refrigerator Repair", "RO Service"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setNewService(p);
                          setTimeout(addService, 0);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs hover:bg-slate-800/60"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
