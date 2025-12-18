import { useNavigate } from "react-router-dom";

function LogoMark() {
  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-lg font-black shadow-lg shadow-cyan-500/30 border border-emerald-300/20">
      ⚡
    </div>
  );
}

function IconCustomer({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20.2c1.8-4.3 13.2-4.3 15 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 9.2l1.1 1.1 2.4-2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProvider({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M14.5 7.5l2-2a2.1 2.1 0 0 1 3 3l-2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.2 9.8l-6.9 6.9c-.4.4-.7 1-.7 1.6V20h1.7c.6 0 1.2-.2 1.6-.7l6.9-6.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1 8l2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#070A14] text-slate-50 overflow-hidden relative">
      {/* Background (aurora + subtle grid) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_82%_22%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_50%_88%,rgba(168,85,247,0.10),transparent_45%)]" />
        <div className="absolute -top-28 -left-28 w-[560px] h-[560px] rounded-full bg-cyan-500/16 blur-3xl animate-blob" />
        <div className="absolute top-24 -right-28 w-[560px] h-[560px] rounded-full bg-emerald-500/14 blur-3xl animate-blob [animation-delay:1200ms]" />
        <div className="absolute -bottom-28 left-1/3 w-[560px] h-[560px] rounded-full bg-fuchsia-500/10 blur-3xl animate-blob [animation-delay:2200ms]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      </div>

      {/* Single fixed page layout */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col min-h-[100dvh]">
        {/* Minimal top brand (no nav, no auth buttons) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <LogoMark />
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">
              QuickServe
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="px-3 py-1.5 rounded-full border border-slate-800/70 bg-slate-950/35 backdrop-blur">
              Choose your mode to continue
            </span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8">
          <div className="text-center max-w-3xl">
            <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-2 rounded-full bg-slate-950/35 border border-slate-800/70 backdrop-blur-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                Fast matching • Verified pros • Real-time updates
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight animate-fadeUp">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                Home services,
              </span>{" "}
              without the hassle.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300/85 leading-relaxed animate-fadeUp animation-delay-200">
              One platform for customers to book trusted help, and for providers to
              receive quality jobs—simple, clear, and fast.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fadeUp animation-delay-300">
              {["AC Repair", "Electrical", "Plumbing", "Cleaning", "Appliances", "Painting"].map(
                (x) => (
                  <span
                    key={x}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-slate-800/70 bg-slate-950/30 backdrop-blur hover:border-cyan-400/30 transition"
                  >
                    {x}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Two cards only */}
          <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl animate-fadeUp animation-delay-400">
            {/* Customer card */}
            <button
              type="button"
              onClick={() => navigate("/customer/loading")}
              className="group text-left rounded-3xl p-[1px] bg-[conic-gradient(from_180deg,rgba(34,211,238,0.32),rgba(52,211,153,0.22),rgba(34,211,238,0.32))] hover:scale-[1.01] transition-transform"
            >
              <div className="relative rounded-3xl p-8 bg-slate-950/45 border border-slate-800/70 backdrop-blur-2xl overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[420px] h-[420px] bg-cyan-500/14 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold text-cyan-200/90 mb-2">
                      Customer
                    </p>
                    <h2 className="text-2xl font-black text-slate-100">
                      I need a service
                    </h2>
                    <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
                      Create a request, upload a photo , and get matched
                      with nearby professionals.
                    </p>
                  </div>

                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center text-cyan-200 group-hover:animate-float">
                    <IconCustomer />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-slate-300/90">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Smart suggestions
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Track job status
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Verified providers
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Clear pricing
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-950 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 shadow-lg shadow-cyan-500/20">
                  Continue as Customer
                  <span className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </button>

            {/* Provider card */}
            <button
              type="button"
              onClick={() => navigate("/provider/loading")}
              className="group text-left rounded-3xl p-[1px] bg-[conic-gradient(from_180deg,rgba(52,211,153,0.32),rgba(190,242,100,0.22),rgba(52,211,153,0.32))] hover:scale-[1.01] transition-transform"
            >
              <div className="relative rounded-3xl p-8 bg-slate-950/45 border border-slate-800/70 backdrop-blur-2xl overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[420px] h-[420px] bg-emerald-500/12 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold text-emerald-200/90 mb-2">
                      Provider
                    </p>
                    <h2 className="text-2xl font-black text-slate-100">
                      I provide services
                    </h2>
                    <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
                      Go online, receive jobs, build ratings, and manage earnings
                      from a clean console.
                    </p>
                  </div>

                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-200 group-hover:animate-float">
                    <IconProvider />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-slate-300/90">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Job notifications
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Ratings & trust
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    KYC verification
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                    Secure payouts
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-950 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-300 via-lime-300 to-emerald-200 shadow-lg shadow-emerald-500/20">
                  Continue as Provider
                  <span className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(28px, -36px) scale(1.05); }
          66% { transform: translate(-22px, 22px) scale(0.98); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-blob { animation: blob 9s ease-in-out infinite; }
        .animate-float { animation: float 3.6s ease-in-out infinite; }
        .animate-fadeUp { animation: fadeUp 0.9s ease-out both; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
