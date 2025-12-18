import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";


export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: "customer",
      });
      navigate("/auth/customer/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4 py-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col justify-center">
            <div
              className="cursor-pointer mb-6 hover:opacity-80 transition"
              onClick={() => navigate("/")}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-cyan-500/50 mb-4">
                ⚡
              </div>
              <h2 className="text-sm text-slate-400">QuickServe</h2>
            </div>

            <h1 className="text-4xl font-black mb-4">
              Join thousands of
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                {" "}happy customers
              </span>
            </h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Create an account in less than 2 minutes and start booking verified professionals today.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  ✓
                </div>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  ✓
                </div>
                <span className="text-sm">Instant verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  ✓
                </div>
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-8">
              Already have an account?{" "}
              <a
                href="/auth/customer/login"
                className="text-cyan-300 font-semibold hover:underline"
              >
                Sign in here
              </a>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="md:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Create Account</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                name="full_name"
                placeholder="John Doe"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition placeholder-slate-600"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/30 hover:shadow-2xl transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our Terms of Service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
