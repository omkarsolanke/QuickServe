import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { jwtDecode } from "jwt-decode";


export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@quickserve.com", password: "admin@123" });
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
      // 🔐 Login
      const res = await api.post("/auth/login", form);
      const token = res.data.access_token;

      // ✅ Decode JWT
      const decoded = jwtDecode(token);

      // 🛑 Block non-admins
      if (decoded.role !== "admin") {
        setError("You are not authorized as admin");
        return;
      }

      // ✅ Store token + role
      localStorage.setItem("access_token", token);
      localStorage.setItem("user_role", decoded.role);

      // ✅ Redirect
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col justify-center">
            <div
              className="cursor-pointer mb-6 hover:opacity-80 transition"
              onClick={() => navigate("/")}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/50 mb-4">
                🔐
              </div>
              <h2 className="text-sm text-slate-400">QuickServe</h2>
            </div>

            <h1 className="text-4xl font-black mb-4">
              Admin
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {" "}Portal
              </span>
            </h1>

            <p className="text-slate-400 mb-8 leading-relaxed">
              Secure access to platform management. Monitor users, verify KYC documents, and manage the entire QuickServe ecosystem.
            </p>

            <p className="text-xs text-slate-600 mt-8">
              Authorized admins only. Unauthorized access is prohibited.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="md:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-8">Admin Sign In</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
