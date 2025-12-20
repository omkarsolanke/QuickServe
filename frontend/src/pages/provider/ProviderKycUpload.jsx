// src/pages/provider/ProviderKycUpload.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function ProviderKycUpload() {
  const navigate = useNavigate();

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("not_submitted"); // not_submitted | pending | approved | rejected

  const [form, setForm] = useState({
    id_number: "",
    address_line: "",
  });

  const [files, setFiles] = useState({
    id_proof: null,
    address_proof: null,
    profile_photo: null,
  });

  const cameraInputRef = useRef(null);

  const statusUI = useMemo(() => {
    const map = {
      not_submitted: {
        badge: "bg-slate-800/70 border-slate-700 text-slate-200",
        title: "KYC not submitted",
        desc: "Upload your documents to unlock online mode and start getting jobs.",
      },
      pending: {
        badge: "bg-amber-500/15 border-amber-500/40 text-amber-200",
        title: "Under review",
        desc: "Your documents are submitted. Approval usually takes some time.",
      },
      approved: {
        badge: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
        title: "Approved",
        desc: "You’re verified. You can go online and receive requests.",
      },
      rejected: {
        badge: "bg-red-500/15 border-red-500/40 text-red-200",
        title: "Rejected",
        desc: "Please re-upload clear documents. Ensure details match your ID.",
      },
    };
    return map[status] || map.not_submitted;
  }, [status]);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "provider") {
      navigate("/auth/provider/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/provider/kyc/status");
        setStatus(res.data?.status || "not_submitted");
      } catch {
        setStatus("not_submitted");
      } finally {
        setLoadingStatus(false);
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const { name, files: selected } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selected?.[0] || null }));
  };

  const validate = () => {
    if (!form.id_number.trim()) return "ID number is required.";
    if (!files.id_proof) return "Please upload ID proof.";
    // address_proof is optional server-side; do not require here
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("id_number", form.id_number);
      fd.append("address_line", form.address_line || "");
      fd.append("id_proof", files.id_proof);
      if (files.address_proof) fd.append("address_proof", files.address_proof);
      if (files.profile_photo) fd.append("profile_photo", files.profile_photo);

      await api.post("/provider/kyc/upload", fd);

      setStatus("pending");
      navigate("/provider/kyc-pending");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      let message = "KYC upload failed";

      if (Array.isArray(detail) && detail.length) {
        // FastAPI 422: list of {loc,msg,type}
        message = detail.map((d) => d.msg).join(", ");
      } else if (typeof detail === "string") {
        message = detail;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-2xl p-6 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-xl">🧾</span>
          </div>
          <p className="text-sm text-slate-200 font-semibold">Checking KYC status…</p>
          <p className="text-xs text-slate-500 mt-1">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  const FileCard = ({ title, subtitle, name, required, accept, extra }) => {
    const f = files[name];
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-100">{title}</p>
            <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
          </div>
          <span
            className={`text-[10px] px-2 py-1 rounded-full border ${
              required
                ? "border-slate-700 text-slate-300"
                : "border-slate-800 text-slate-500"
            }`}
          >
            {required ? "Required" : "Optional"}
          </span>
        </div>

        <label className="block cursor-pointer">
          <div
            className={`w-full rounded-xl border px-3 py-2.5 text-xs transition ${
              f
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-slate-950/40 border-slate-700 text-slate-300 hover:border-emerald-400/50"
            }`}
          >
            {f ? `Selected: ${f.name}` : "Choose file from gallery"}
          </div>
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {extra}

        <p className="text-[10px] text-slate-600">
          Accepted: {accept.replaceAll(",", ", ")}
        </p>
      </div>
    );
  };

  const triggerCameraCapture = () => {
    if (!cameraInputRef.current) return;
    cameraInputRef.current.click();
  };

  const handleCameraChange = (e) => {
    const captured = e.target.files?.[0];
    if (!captured) return;
    setFiles((prev) => ({ ...prev, profile_photo: captured }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4 py-14">
      {/* background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-24 w-96 h-96 bg-emerald-500/18 blur-3xl rounded-full opacity-40" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-400/12 blur-3xl rounded-full opacity-40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl shadow-emerald-900/30 backdrop-blur-2xl p-6 md:p-8">
          {/* Top bar */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p
                className="text-xs text-slate-500 mb-1 cursor-pointer hover:text-slate-400"
                onClick={() => navigate("/provider/dashboard")}
              >
                Home / ProviderDashboard / <span className="text-emerald-300">KYC</span>
              </p>

              <h1 className="text-2xl md:text-3xl font-black text-slate-100">
                Verify your identity (KYC)
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                Complete verification once. Then go online and receive nearby requests.
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs border text-right ${statusUI.badge}`}
            >
              {status.toUpperCase()}
            </div>
          </div>

          {/* Status banner */}
          <div className={`mb-6 rounded-2xl border p-4 ${statusUI.badge}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-center">
                <span className="text-lg">
                  {status === "approved"
                    ? "✅"
                    : status === "pending"
                    ? "⏳"
                    : status === "rejected"
                    ? "⚠️"
                    : "🧾"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{statusUI.title}</p>
                <p className="text-xs opacity-80 mt-1">{statusUI.desc}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 text-sm px-4 py-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: steps */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
                <p className="text-xs font-semibold text-slate-200">Steps</p>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-200">
                      1
                    </div>
                    <div>
                      <p className="text-slate-200 font-semibold">Enter details</p>
                      <p className="text-slate-500 mt-0.5">
                        ID number + optional address line.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-200">
                      2
                    </div>
                    <div>
                      <p className="text-slate-200 font-semibold">Upload documents</p>
                      <p className="text-slate-500 mt-0.5">
                        Clear photo/PDF. No blur or glare.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-200">
                      3
                    </div>
                    <div>
                      <p className="text-slate-200 font-semibold">Submit for review</p>
                      <p className="text-slate-500 mt-0.5">
                        Status becomes pending until approved.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-950/40 border border-slate-800 p-3">
                  <p className="text-[11px] text-slate-400">
                    Tip: Upload documents in good lighting and match the name you used
                    during signup. You can capture a selfie directly from your camera.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
                <p className="text-xs font-semibold text-slate-200 mb-4">
                  Personal details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-slate-300">
                      ID number <span className="text-emerald-300">(required)</span>
                    </label>
                    <input
                      name="id_number"
                      value={form.id_number}
                      onChange={handleChange}
                      placeholder="Aadhar / PAN / Driving License"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-slate-300">
                      Address line <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      name="address_line"
                      value={form.address_line}
                      onChange={handleChange}
                      placeholder="Street, city"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-semibold text-slate-200">
                    Document uploads
                  </p>
                  <p className="text-[11px] text-slate-500">
                    JPG / PNG / PDF supported. Use camera for selfie.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FileCard
                    title="ID proof"
                    subtitle="Aadhar / PAN / License"
                    name="id_proof"
                    required
                    accept="image/*,application/pdf"
                  />
                  <FileCard
                    title="Address proof"
                    subtitle="Bill / rent agreement"
                    name="address_proof"
                    required={false} // optional in backend
                    accept="image/*,application/pdf"
                  />
                  <FileCard
                    title="Profile photo"
                    subtitle="Shown to customers"
                    name="profile_photo"
                    required={false}
                    accept="image/*"
                    extra={
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <button
                          type="button"
                          onClick={triggerCameraCapture}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-100 hover:bg-emerald-500/20 transition"
                        >
                          <span>📷</span>
                          <span>Capture from camera</span>
                        </button>
                        {files.profile_photo && (
                          <span className="text-[10px] text-slate-400 truncate">
                            {files.profile_photo.name}
                          </span>
                        )}
                      </div>
                    }
                  />
                </div>

                {/* hidden camera input with capture attribute for mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleCameraChange}
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/provider/dashboard")}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800/60"
                >
                  Back to dashboard
                </button>

                <button
                  type="submit"
                  disabled={submitting || status === "approved"}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-60"
                >
                  {submitting
                    ? "Uploading..."
                    : status === "approved"
                    ? "Already approved"
                    : "Submit for review"}
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                By submitting, you confirm the documents are valid and belong to you.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
