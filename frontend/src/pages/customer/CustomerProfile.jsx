// src/pages/customer/CustomerProfile.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function CustomerProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
    member_since: "",
  });

  const kickToLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/auth/customer/login", { replace: true });
  };

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");

    if (!token || role !== "customer") {
      navigate("/auth/customer/login", { replace: true });
      return;
    }

    async function fetchProfile() {
      try {
        const res = await api.get("/customer/me");

        const user = res.data?.user || {};
        const customer = res.data?.customer || {};

        setForm((f) => ({
          ...f,
          full_name: user.full_name || "",
          email: user.email || "",
          member_since: customer.member_since || "",
        }));
      } catch (err) {
        if (err.response?.status === 401) {
          kickToLogin();
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await api.patch("/customer/me", {
        full_name: form.full_name || undefined,
        email: form.email || undefined,
        current_password: form.current_password || undefined,
        new_password: form.new_password || undefined,
      });

      setSuccess("Profile updated successfully");
      setForm((f) => ({
        ...f,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      if (err.response?.status === 401) {
        kickToLogin();
      } else {
        setError(
          err.response?.data?.detail || "Failed to update profile. Try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/", { replace: true });
  };

  const initials = useMemo(
    () => (form.full_name?.trim()?.[0] || "C").toUpperCase(),
    [form.full_name]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040717] text-slate-50">
      {/* soft background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-cyan-500/18 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-emerald-500/16 blur-3xl opacity-70" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_0_0,white_0,transparent_55%),radial-gradient(circle_at_100%_0,white_0,transparent_55%)]" />
      </div>

      {/* navbar aligned with customer dashboard style */}
      <header className="relative z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/customer/dashboard")}
            className="flex items-center gap-3 px-2 sm:px-3 py-1.5 rounded-2xl bg-[#05091F] border border-cyan-500/30 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-emerald-300 flex items-center justify-center text-[13px] sm:text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/40">
              QS
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-slate-100">
                QuickServe
              </span>
              <span className="text-[11px] text-slate-500">
                Customer / Profile
              </span>
            </div>
          </button>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => navigate("/customer/dashboard")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-100 hover:bg-slate-900/60 transition"
            >
              🏠 <span>Dashboard</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-sky-400/60 bg-gradient-to-r from-sky-500/20 to-cyan-400/10 text-sky-100">
              👤 <span>Profile</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-slate-950 text-xs font-semibold shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60 hover:-translate-y-0.5 transition"
            >
              Logout
            </button>
          </nav>

          {/* mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/customer/dashboard")}
              className="px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-[11px] text-slate-100"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-slate-950 text-[11px] font-semibold shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-1">Account settings</p>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
            Manage your profile
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* left glass profile card */}
          <section className="md:col-span-1">
            <div className="relative rounded-3xl bg-slate-900/60 border border-slate-700/80 backdrop-blur-2xl p-6 shadow-xl shadow-cyan-900/20 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl opacity-70" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl opacity-60" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-emerald-300 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-cyan-500/40">
                  {initials}
                </div>
                <h2 className="text-xl font-semibold">
                  {form.full_name || "Customer"}
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  {form.email || "—"}
                </p>

                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <p>
                    <span className="text-slate-500">Role:</span> Customer
                  </p>
                  <p>
                    <span className="text-slate-500">Member since:</span>{" "}
                    {form.member_since
                      ? new Date(form.member_since).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-cyan-500/40 text-cyan-200">
                    Email verified
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-emerald-500/40 text-emerald-200">
                    Secure account
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* right glass form card */}
          <section className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-slate-900/60 border border-slate-700/80 backdrop-blur-2xl p-6 sm:p-7 space-y-5 shadow-xl shadow-slate-900/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-100">
                  Edit profile
                </h3>
                {saving && (
                  <span className="text-[11px] text-slate-400">
                    Saving changes…
                  </span>
                )}
              </div>

              {error && (
                <div className="text-[11px] px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-[11px] px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    Full name
                  </label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <h4 className="text-sm font-semibold mb-2 text-slate-200">
                  Change password
                  <span className="ml-1 text-[11px] text-slate-500">
                    (optional)
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    name="current_password"
                    type="password"
                    value={form.current_password}
                    onChange={handleChange}
                    placeholder="Current"
                    className="px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                  />
                  <input
                    name="new_password"
                    type="password"
                    value={form.new_password}
                    onChange={handleChange}
                    placeholder="New"
                    className="px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                  />
                  <input
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm"
                    className="px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Use a strong password with at least 8 characters, including
                  letters and numbers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/customer/dashboard")}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800/80 transition"
                  disabled={saving}
                >
                  Back to dashboard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="relative inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/40 disabled:opacity-60 overflow-hidden"
                >
                  <span className="relative z-10">
                    {saving ? "Saving..." : "Save changes"}
                  </span>
                  <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_0,rgba(255,255,255,0.45),transparent_55%)]" />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
