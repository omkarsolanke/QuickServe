import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function ProviderLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "provider1@quickserve.com", password: "provider@123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user_role", "provider");
      navigate("/provider/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-400/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col justify-center">
            <div
              className="cursor-pointer mb-6 hover:opacity-80 transition"
              onClick={() => navigate("/")}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/50 mb-4">
                🛠️
              </div>
              <h2 className="text-sm text-slate-400">QuickServe</h2>
            </div>

            <h1 className="text-4xl font-black mb-4">
              Welcome back,
              <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                {" "}Pro!
              </span>
            </h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Sign in to your provider account, accept jobs, and grow your business with QuickServe.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  ✓
                </div>
                <span className="text-sm">Instant job notifications</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lime-400/20 flex items-center justify-center text-lime-300">
                  ✓
                </div>
                <span className="text-sm">Secure earnings tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  ✓
                </div>
                <span className="text-sm">Build your ratings</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-8">
              New provider?{" "}
              <a
                href="/auth/provider/signin"
                className="text-emerald-300 font-semibold hover:underline"
              >
                Join now
              </a>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="md:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-8">Sign In</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Email</label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition placeholder-slate-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-emerald-400 to-lime-400 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-xs text-slate-500 text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
