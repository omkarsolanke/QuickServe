import { useNavigate } from "react-router-dom";

export default function ProviderLoading() {
  const navigate = useNavigate();

  const chips = [
    { label: "AC Repair", icon: "❄️" },
    { label: "Electrical", icon: "⚡" },
    { label: "Plumbing", icon: "🚰" },
    { label: "Cleaning", icon: "🧽" },
    { label: "Carpentry", icon: "🪚" },
    { label: "Painting", icon: "🎨" },
    { label: "Appliances", icon: "🔧" },
    { label: "Pest Control", icon: "🪳" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-50 bg-slate-950">
      {/* Animated aurora background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_10%_10%,rgba(16,185,129,0.25),transparent_60%),radial-gradient(900px_500px_at_90%_90%,rgba(132,204,22,0.18),transparent_60%),radial-gradient(700px_400px_at_90%_15%,rgba(45,212,191,0.12),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-[length:200%_200%] animate-[gradient-shift_16s_ease_infinite]" />

      {/* Navbar */}
      <header className="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-lg font-black text-slate-900 shadow-md shadow-emerald-500/40 group-hover:scale-105 transition">
              🛠️
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-slate-200 font-semibold">
                QuickServe
              </span>
              <span className="text-xs text-slate-500">
                Home / Provider Loading
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-emerald-200/90 px-3 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
              I’m a Provider
            </span>
            <button
              onClick={() => navigate("/auth/provider/login")}
              className="px-4 py-1.5 rounded-xl border border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth/provider/signin")}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-pulse" />
              Booting your provider console…
            </p>

            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#fff,rgba(167,243,208,0.95),rgba(190,242,100,0.95))] bg-[length:200%_100%] animate-[gradient-shift_12s_ease_infinite]">
                More jobs. Faster payouts.
              </span>
            </h1>

            <p className="text-slate-300/90 mb-6">
              QuickServe is preparing everything you need to start accepting
              requests confidently—availability, pricing, ratings, and alerts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs text-slate-400">Live alerts</p>
                <p className="text-sm text-slate-200 mt-1">
                  Instant job notifications based on your services & radius.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs text-slate-400">Earnings</p>
                <p className="text-sm text-slate-200 mt-1">
                  Track payouts, tips, and weekly performance in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs text-slate-400">Trust & safety</p>
                <p className="text-sm text-slate-200 mt-1">
                  KYC badges and verified profiles to win customer trust.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs text-slate-400">Smart matching</p>
                <p className="text-sm text-slate-200 mt-1">
                  Get leads that fit your skills, schedule, and location.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/auth/provider/login")}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 text-slate-950 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-lime-500/25 hover:-translate-y-0.5 transition"
              >
                Sign In to accept jobs
              </button>
              <button
                onClick={() => navigate("/auth/provider/signin")}
                className="px-5 py-2.5 rounded-2xl border border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
              >
                Create provider account
              </button>
            </div>
          </div>

          {/* Right: Dashboard preview card */}
          <div className="relative">
            {/* floating “service images” */}
            <div className="absolute -top-6 left-4 w-16 h-16 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-center text-2xl animate-[float_4.6s_ease-in-out_infinite]">
              🧰
            </div>
            <div className="absolute -top-4 right-10 w-14 h-14 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-center text-2xl animate-[float_5.2s_ease-in-out_infinite] [animation-delay:400ms]">
              📍
            </div>
            <div className="absolute -bottom-6 left-8 w-14 h-14 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-center text-2xl animate-[float_4.8s_ease-in-out_infinite] [animation-delay:800ms]">
              💰
            </div>

            <div className="rounded-3xl bg-slate-950/70 border border-slate-800/70 p-6 shadow-2xl overflow-hidden">
              <div className="absolute -top-24 -right-16 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-lime-400/16 blur-3xl rounded-full" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Provider console preview</p>
                    <h3 className="text-lg font-semibold">Getting ready…</h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl border border-emerald-400/35 bg-slate-900/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent border-r-transparent rounded-full animate-spin" />
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-lime-400 animate-[loadingBar_1.4s_ease-in-out_infinite]" />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-300 mb-5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <p className="text-slate-400">Step 1</p>
                    <p className="mt-1">Sync services</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <p className="text-slate-400">Step 2</p>
                    <p className="mt-1">Enable alerts</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <p className="text-slate-400">Step 3</p>
                    <p className="mt-1">Go online</p>
                  </div>
                </div>

                {/* “Live jobs” skeleton */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Incoming jobs</p>
                    <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 animate-pulse"
                      >
                        <div className="h-3 w-2/3 bg-slate-700/60 rounded mb-2" />
                        <div className="h-2 w-1/2 bg-slate-800 rounded" />
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Tip: Keep notifications ON to accept jobs faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service marquee */}
        <section className="mt-12">
          <div className="overflow-hidden relative py-3 border-y border-slate-800/60">
            <div className="flex gap-4 whitespace-nowrap animate-[marquee_22s_linear_infinite] will-change-transform">
              {chips.map((c, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full text-xs border border-slate-700 bg-slate-900/60 shadow-sm"
                >
                  <span className="mr-2">{c.icon}</span>
                  {c.label}
                </span>
              ))}
              {chips.map((c, idx) => (
                <span
                  key={`dup-${idx}`}
                  className="px-4 py-2 rounded-full text-xs border border-slate-700 bg-slate-900/60 shadow-sm"
                >
                  <span className="mr-2">{c.icon}</span>
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
