import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Icon({ type, className = "w-6 h-6 md:w-7 md:h-7" }) {
  switch (type) {
    case "electrical":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M13 2L4 14h7l-1 8 10-14h-7l0-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "plumbing":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M7 3v5a5 5 0 0 0 5 5h1v2a4 4 0 0 0 4 4h2v-4h-2v-2a5 5 0 0 0-5-5h-1V3H7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ac":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M5 7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M7 10h10M8 18c1.5-1.5 2.5-1.5 4 0m0 0c1.5-1.5 2.5-1.5 4 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cleaning":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M7 21h10M9 21V7h6v14M10 7l2-4 2 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 12c1.2.6 2 .6 3 0m8 0c1.2.6 2 .6 3 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "appliance":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M6 4h12v16H6V4Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 7h8M9 11h6M9 15h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M12 2v20M2 12h20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function CustomerLoading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.max(1, Math.round((92 - p) * 0.08));
        return next >= 92 ? 92 : next;
      });
    }, 550);
    return () => clearInterval(t);
  }, []);

  const services = useMemo(
    () => [
      {
        title: "Electrical",
        subtitle: "Switches, sockets, short circuits",
        icon: "electrical",
        accent: "from-fuchsia-400/90 via-cyan-300/80 to-emerald-300/80",
      },
      {
        title: "Plumbing",
        subtitle: "Leaks, taps, clogged drains",
        icon: "plumbing",
        accent: "from-cyan-300/90 via-sky-300/80 to-blue-300/80",
      },
      {
        title: "AC Repair",
        subtitle: "Cooling issues, service, gas refill",
        icon: "ac",
        accent: "from-emerald-300/90 via-cyan-300/80 to-sky-300/80",
      },
      {
        title: "Cleaning",
        subtitle: "Deep clean, kitchen, bathrooms",
        icon: "cleaning",
        accent: "from-amber-200/90 via-emerald-300/70 to-cyan-300/80",
      },
      {
        title: "Appliances",
        subtitle: "Fridge, washing machine, microwave",
        icon: "appliance",
        accent: "from-violet-300/90 via-fuchsia-300/70 to-cyan-300/80",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen text-slate-50 bg-[#070A14] overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_55%_90%,rgba(168,85,247,0.12),transparent_45%)]" />
        <div className="hidden sm:block absolute -top-24 -left-24 w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-cyan-500/20 blur-3xl animate-blob" />
        <div className="hidden sm:block absolute top-24 -right-24 w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-emerald-500/20 blur-3xl animate-blob [animation-delay:1200ms]" />
        <div className="hidden sm:block absolute -bottom-24 left-1/3 w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-fuchsia-500/15 blur-3xl animate-blob [animation-delay:2200ms]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-base sm:text-lg font-black shadow-lg shadow-cyan-500/30 transition-transform group-hover:scale-[1.03]">
              ⚡
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base text-slate-200 font-semibold tracking-wide">
                QuickServe
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500">
                Home / Customer / Loading
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3 text-sm font-semibold">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">
              I’m a Customer
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>

            <button
              onClick={() => navigate("/auth/customer/login")}
              className="px-3 sm:px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-950/30 hover:bg-slate-900/40 hover:border-cyan-400/60 text-xs sm:text-sm transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth/customer/signin")}
              className="relative px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/30 overflow-hidden"
            >
              <span className="relative z-10">Sign Up</span>
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),transparent_55%)]" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left column */}
          <section className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 mb-2 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Setting up your customer dashboard…
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-2 sm:mb-3">
              Your home services{" "}
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                simplified
              </span>
              .
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl">
              QuickServe is preparing your personalized space—matching nearby
              professionals, verifying availability, and organizing your recent
              requests so booking feels instant and stress‑free.
            </p>

            {/* Steps */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  step: "01",
                  title: "Create a request",
                  desc: "Add a title, choose a service, and (optionally) upload a photo for smart suggestions.",
                },
                {
                  step: "02",
                  title: "Get matched fast",
                  desc: "We shortlist providers by distance, skills, and availability—so you don’t have to search.",
                },
                {
                  step: "03",
                  title: "Pick & confirm",
                  desc: "Compare options, view profiles, and confirm the best pro for the job.",
                },
                {
                  step: "04",
                  title: "Track & relax",
                  desc: "Follow status updates—pending → accepted → completed—with clear communication.",
                },
              ].map((x) => (
                <div
                  key={x.step}
                  className="group rounded-3xl border border-slate-800/70 bg-slate-950/35 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-cyan-900/10 hover:border-cyan-400/30 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-cyan-200 font-black text-xs sm:text-sm">
                      {x.step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        {x.title}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                        {x.desc}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              {[
                { k: "Verified pros", v: "KYC + ratings" },
                { k: "Secure booking", v: "Token-based sessions" },
                { k: "Live updates", v: "Status tracking" },
              ].map((b) => (
                <div
                  key={b.k}
                  className="flex-1 min-w-[130px] rounded-2xl border border-slate-800/70 bg-slate-950/25 backdrop-blur-xl px-3 sm:px-4 py-3"
                >
                  <div className="text-xs sm:text-sm font-bold text-slate-100">
                    {b.k}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {b.v}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right column */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/45 backdrop-blur-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm sm:text-base font-black text-slate-100">
                      Preparing your space
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 mt-1">
                      Loading profile, requests, and nearby providers…
                    </div>
                  </div>

                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-cyan-400/30 bg-slate-900/40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_55%)]" />
                    <div className="relative w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 sm:mt-5">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-cyan-200 font-semibold">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-900/70 rounded-full h-2 overflow-hidden border border-slate-800/70">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 text-[10px] sm:text-[11px] text-slate-500">
                    Tip: Upload a clear photo while creating a request for
                    better auto-suggestions.
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="border-t border-slate-800/70 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                  <div className="text-sm font-bold text-slate-100">
                    Popular services
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500">
                    Smart matching by location
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {services.map((s) => (
                    <div
                      key={s.title}
                      className="group rounded-2xl border border-slate-800/70 bg-slate-900/30 backdrop-blur-xl p-3 hover:border-cyan-400/30 transition relative overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${s.accent}`}
                      />
                      <div className="relative flex items-start gap-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950/45 border border-slate-700/60 flex items-center justify-center text-cyan-200">
                          <Icon type={s.icon} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {s.title}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
                            {s.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/auth/customer/signin")}
                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-sm font-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition"
                  >
                    Get started (free)
                  </button>
                  <button
                    onClick={() => navigate("/auth/customer/login")}
                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-2xl border border-slate-700/80 bg-slate-950/25 hover:bg-slate-900/30 hover:border-cyan-400/40 transition text-slate-100 text-sm font-semibold"
                  >
                    Continue to login
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-25px, 25px) scale(0.98); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
