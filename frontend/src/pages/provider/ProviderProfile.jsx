import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
      <button type="button" onClick={onClose} className="text-xs px-2 py-1 rounded-lg border border-current/30 hover:bg-white/5">
        Close
      </button>
    </div>
  );
}

function Card({ title, desc, children, icon }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          {desc ? <p className="text-xs text-slate-500 mt-1">{desc}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs font-semibold text-slate-200">{label}</p>
      {hint ? <p className="text-[11px] text-slate-500 mt-1">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub, disabled = false }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        {sub ? <p className="text-[11px] text-slate-500 mt-1">{sub}</p> : null}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "w-12 h-7 rounded-full border transition relative disabled:opacity-60",
          checked ? "bg-emerald-500/20 border-emerald-500/40" : "bg-slate-800/60 border-slate-700"
        )}
        aria-pressed={checked}
      >
        <span className={cx("absolute top-0.5 w-6 h-6 rounded-full transition", checked ? "left-5 bg-emerald-300" : "left-0.5 bg-slate-300")} />
      </button>
    </div>
  );
}

function KycBadge({ status }) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return <Pill tone="emerald">KYC APPROVED</Pill>;
  if (s === "pending") return <Pill tone="amber">KYC PENDING</Pill>;
  if (s === "rejected") return <Pill tone="red">KYC REJECTED</Pill>;
  return <Pill tone="slate">KYC {String(status || "UNKNOWN").toUpperCase()}</Pill>;
}

function NavItem({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition",
          isActive
            ? "bg-purple-500/15 border-purple-500/30 text-purple-100"
            : "border-slate-800 text-slate-300 hover:border-purple-500/30 hover:text-slate-100 hover:bg-slate-900/40"
        )
      }
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export default function ProviderProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ kind: "success", text: "" });
  const [error, setError] = useState("");

  const [edit, setEdit] = useState(false);

  const [me, setMe] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    service_type: "",
    base_price: 0,
    experience_years: 0,
    city: "",
    address_line: "",
  });

  const [availability, setAvailability] = useState({
    is_online: false,
    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    start_time: "09:00",
    end_time: "20:00",
  });

  const initials = useMemo(() => {
    const n = form.full_name || me?.user?.full_name || "Provider";
    return n
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");
  }, [form.full_name, me]);

  const serviceOptions = useMemo(
    () => ["AC Repair", "Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Appliance repair"],
    []
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/provider/me");
      setMe(res.data);

      const user = res.data?.user || {};
      const provider = res.data?.provider || {};

      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: provider.bio || "",
        service_type: provider.service_type || "",
        base_price: provider.base_price ?? 0,
        experience_years: provider.experience_years ?? 0,
        city: provider.city || "",
        address_line: provider.address_line || "",
      });

      setAvailability({
        is_online: !!provider.is_online,
        working_days: provider.working_days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        start_time: provider.start_time || "09:00",
        end_time: provider.end_time || "20:00",
      });
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load provider profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setToast({ kind: "success", text: "" });
    setError("");

    if (!form.full_name.trim()) {
      setToast({ kind: "error", text: "Full name is required." });
      setSaving(false);
      return;
    }
    if (!form.service_type.trim()) {
      setToast({ kind: "error", text: "Service type is required." });
      setSaving(false);
      return;
    }
    if (Number(form.base_price) < 0) {
      setToast({ kind: "error", text: "Base price must be 0 or more." });
      setSaving(false);
      return;
    }

    try {
      await api.put("/provider/me", {
        user: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
        },
        provider: {
          bio: form.bio.trim(),
          service_type: form.service_type,
          base_price: Number(form.base_price),
          experience_years: Number(form.experience_years),
          city: form.city.trim(),
          address_line: form.address_line.trim(),
        },
      });

      // Optional endpoint; ignore if not implemented
      await api.put("/provider/me/availability", availability).catch(() => {});
      setToast({ kind: "success", text: "Profile updated successfully." });
      setEdit(false);
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e.response?.data?.detail || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setAvailability((a) => {
      const has = a.working_days.includes(day);
      return {
        ...a,
        working_days: has ? a.working_days.filter((d) => d !== day) : [...a.working_days, day],
      };
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/auth/provider/login");
  };

  const setOnline = async (nextOnline) => {
    // Optimistic UI
    setAvailability((a) => ({ ...a, is_online: nextOnline }));
    try {
      await api.put("/provider/me/availability", { ...availability, is_online: nextOnline });
      setToast({ kind: "success", text: nextOnline ? "You are Online now." : "You are Offline now." });
    } catch (e) {
      // rollback if backend not implemented
      setAvailability((a) => ({ ...a, is_online: !nextOnline }));
      setToast({ kind: "warn", text: e.response?.data?.detail || "Online toggle endpoint not available yet." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/16 blur-3xl rounded-full opacity-45" />
        <div className="absolute bottom-24 right-20 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full opacity-40" />
      </div>

      {/* NAVBAR */}
      <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-slate-950 font-black">
              QS
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-black leading-4">QuickServe</p>
              <p className="text-[11px] text-slate-500">Provider Panel</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-2">
            <NavItem to="/provider/dashboard" label="Home" icon="🏠" end />
            <NavItem to="/provider/dashboard" label="Dashboard" icon="📊" />
            <NavItem to="/provider/profile" label="Profile" icon="👤" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnline(!availability.is_online)}
              className={cx(
                "px-3 py-2 rounded-xl border text-xs font-semibold transition",
                availability.is_online
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20"
                  : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-900/70"
              )}
              title="Toggle online/offline"
            >
              {availability.is_online ? "🟢 Online" : "⚪ Offline"}
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 text-slate-950 text-xs font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* PAGE */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-5">
        <Toast kind={toast.kind} text={toast.text} onClose={() => setToast({ kind: "success", text: "" })} />

        {error && (
          <div className="rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Profile header */}
        <div className="rounded-3xl bg-slate-950/60 border border-slate-800 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-slate-900/0 to-cyan-500/10" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-purple-500/25">
                  {initials || "P"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Provider profile</p>
                  <p className="text-xl md:text-2xl font-black text-slate-100 truncate">
                    {form.full_name || "Provider"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill tone="purple">{form.service_type || "Service not set"}</Pill>
                    <Pill tone="slate">Base ₹{Number(form.base_price || 0)}</Pill>
                    <KycBadge status={me?.provider?.kyc_status} />
                    {availability.is_online ? <Pill tone="emerald">ONLINE</Pill> : <Pill tone="slate">OFFLINE</Pill>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {!edit ? (
                  <button
                    type="button"
                    onClick={() => setEdit(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950 text-xs font-semibold shadow-lg shadow-purple-500/20"
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEdit(false);
                        load();
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800/60 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={saveProfile}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 text-xs font-semibold shadow-lg disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            <Card icon="🪪" title="Profile details" desc="Keep your information accurate for better trust and matching.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name">
                  {edit ? (
                    <input
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {form.full_name || "—"}
                    </div>
                  )}
                </Field>

                <Field label="Email" hint="Email is usually read-only.">
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-400">
                    {form.email || "—"}
                  </div>
                </Field>

                <Field label="Phone">
                  {edit ? (
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                      placeholder="+91..."
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {form.phone || "—"}
                    </div>
                  )}
                </Field>

                <Field label="Experience (years)">
                  {edit ? (
                    <input
                      type="number"
                      min={0}
                      value={form.experience_years}
                      onChange={(e) => setForm((f) => ({ ...f, experience_years: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {Number(form.experience_years || 0)}
                    </div>
                  )}
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Bio" hint="Short intro shown to customers.">
                  {edit ? (
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100 resize-none"
                      placeholder="Example: 6+ years experience..."
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100 whitespace-pre-wrap">
                      {form.bio || "—"}
                    </div>
                  )}
                </Field>
              </div>
            </Card>

            <Card icon="🧰" title="Service & pricing" desc="These settings affect how customers discover and book you.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Service type">
                  {edit ? (
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                    >
                      <option value="" className="bg-slate-950">Select service</option>
                      {serviceOptions.map((s) => (
                        <option key={s} value={s} className="bg-slate-950">{s}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {form.service_type || "—"}
                    </div>
                  )}
                </Field>

                <Field label="Base price (₹)" hint="Starting price shown to customers.">
                  {edit ? (
                    <input
                      type="number"
                      min={0}
                      value={form.base_price}
                      onChange={(e) => setForm((f) => ({ ...f, base_price: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      ₹{Number(form.base_price || 0)}
                    </div>
                  )}
                </Field>
              </div>
            </Card>

            <Card icon="📌" title="Location" desc="Used to match you with nearby customer requests.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="City">
                  {edit ? (
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                      placeholder="Hyderabad"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {form.city || "—"}
                    </div>
                  )}
                </Field>

                <Field label="Address line" hint="Not shown publicly (optional).">
                  {edit ? (
                    <input
                      value={form.address_line}
                      onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm text-slate-100"
                      placeholder="Area / Street"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100">
                      {form.address_line || "—"}
                    </div>
                  )}
                </Field>
              </div>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <Card icon="🟢" title="Availability" desc="Control whether customers can match with you right now.">
              <div className="space-y-3">
                <Toggle
                  checked={availability.is_online}
                  onChange={setOnline}
                  label={availability.is_online ? "You are Online" : "You are Offline"}
                  sub="Online providers can receive requests."
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start time">
                    <input
                      type="time"
                      value={availability.start_time}
                      disabled={!edit}
                      onChange={(e) => setAvailability((a) => ({ ...a, start_time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100 disabled:opacity-60"
                    />
                  </Field>
                  <Field label="End time">
                    <input
                      type="time"
                      value={availability.end_time}
                      disabled={!edit}
                      onChange={(e) => setAvailability((a) => ({ ...a, end_time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-100 disabled:opacity-60"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs font-semibold text-slate-200">Working days</p>
                  <p className="text-[11px] text-slate-500 mt-1">Select days you typically work.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                      const active = availability.working_days.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={!edit}
                          onClick={() => toggleDay(d)}
                          className={cx(
                            "px-3 py-1.5 rounded-full text-xs border transition disabled:opacity-60",
                            active
                              ? "bg-purple-500/15 border-purple-500/30 text-purple-100"
                              : "border-slate-800 text-slate-300 hover:border-purple-500/30"
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!edit ? (
                  <p className="text-[11px] text-slate-600">Switch to Edit mode to change working hours/days.</p>
                ) : null}
              </div>
            </Card>

            <Card icon="🧾" title="KYC & documents" desc="Upload documents to get verified and receive more requests.">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => navigate("/provider/kyc")}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-200 text-xs font-semibold hover:bg-slate-900/70 transition"
                >
                  Manage KYC documents
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/provider/kyc-pending")}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-200 text-xs font-semibold hover:bg-slate-900/70 transition"
                >
                  View KYC status
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
