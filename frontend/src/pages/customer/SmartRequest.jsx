// src/pages/customer/SmartRequest.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heic2any from "heic2any";
import api from "../../api/client";

const SERVICE_OPTIONS = [
  "AC Repair",
  "Electrical issue",
  "Plumbing leak",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Appliance repair",
];

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "px-3 py-1.5 rounded-full text-xs border transition whitespace-nowrap",
        active
          ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30"
          : "border-slate-700 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200 hover:bg-slate-900/40"
      )}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 backdrop-blur-xl px-4 py-3">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}

export default function SmartRequest() {
  const navigate = useNavigate();

  const [locLoading, setLocLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [aiHint, setAiHint] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [coords, setCoords] = useState({ lat: null, lng: null });

  const [form, setForm] = useState({
    title: "",
    service_type: "",
    address: "",
    description: "",
  });

  const uploadId = useMemo(
    () => `upload_${Math.random().toString(16).slice(2)}`,
    []
  );
  const cameraId = useMemo(
    () => `camera_${Math.random().toString(16).slice(2)}`,
    []
  );

  // Auth guard
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "customer") {
      navigate("/auth/customer/login");
    }
  }, [navigate]);

  // Cleanup blob url
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const kickToLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/auth/customer/login");
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Location + reverse geocode
  const getLocation = () => {
    setLocLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Location not supported in this browser.");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await api.get("/location/reverse", {
            params: { lat: latitude, lng: longitude },
          });
          const addr =
            res.data?.address ||
            `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`;
          setForm((f) => ({ ...f, address: addr }));
        } catch {
          const fallback = `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(
            4
          )}`;
          setForm((f) => ({ ...f, address: fallback }));
        }

        setLocLoading(false);
      },
      (err) => {
        if (err.code === 1)
          setError("Location permission denied. Enable it in browser settings.");
        else if (err.code === 2)
          setError("Location unavailable. Turn on GPS / Location services.");
        else if (err.code === 3)
          setError("Location request timed out. Try again.");
        else setError("Could not get location.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const analyzeAndAutofill = async (file) => {
    setAiLoading(true);
    setError("");
    setAiHint("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/ai/analyze-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("AI RESULT 👉", res.data);

      const { suggested_service, suggested_title, suggested_description } =
        res.data || {};

      setForm((f) => ({
        ...f,
        title: suggested_title ?? f.title,
        service_type: suggested_service ?? f.service_type,
        description: suggested_description ?? f.description,
      }));

      setAiHint("Description generated from image. You can edit it.");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        kickToLogin();
      } else {
        setError("Could not analyze image. You can fill details manually.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handlePickedFile = async (file) => {
    setError("");
    setAiHint("");

    if (!file) return;

    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.heic$/i.test(file.name) ||
      /\.heif$/i.test(file.name);

    try {
      let previewBlob = file;
      let uploadBlob = file;
      let uploadName = file.name;

      if (isHeic) {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        });

        const jpgBlob = Array.isArray(converted) ? converted[0] : converted;

        previewBlob = jpgBlob;
        uploadBlob = jpgBlob;
        uploadName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
      } else {
        if (!file.type?.startsWith("image/")) {
          setError("Please select an image file.");
          return;
        }
      }

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      const nextUrl = URL.createObjectURL(previewBlob);
      setImagePreview(nextUrl);

      const fileToSend = new File([uploadBlob], uploadName, {
        type: uploadBlob.type || "image/jpeg",
        lastModified: Date.now(),
      });

      setImageFile(fileToSend);

      await analyzeAndAutofill(fileToSend);
    } catch {
      setError(
        "Your phone selected a HEIC image that cannot be previewed/converted on this device. Please upload JPG/PNG or change camera setting to JPG."
      );
    }
  };

  const onUploadChange = async (e) => {
    const file = e.target.files?.[0];
    await handlePickedFile(file);
    e.target.value = "";
  };

  const onCameraChange = async (e) => {
    const file = e.target.files?.[0];
    await handlePickedFile(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setAiHint("");
    setError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  };

  // handleSubmit with payload debug + robust 422 handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.title.trim() || !form.service_type) {
      setError("Title and service type are required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        service_type: form.service_type,
        address: form.address?.trim() || null,
        description: form.description?.trim() || null,
        budget: null,
        customer_lat: coords.lat ?? null,
        customer_lng: coords.lng ?? null,
      };

      console.log("REQUEST PAYLOAD 👉", payload);

      const res = await api.post("/requests", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      navigate("/customer/providers", {
        state: {
          request: res.data,
          lat: payload.customer_lat,
          lng: payload.customer_lng,
        },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join(", "));
        } else {
          setError("Invalid request data");
        }
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        kickToLogin();
      } else {
        setError("Failed to create request");
      }
    } finally {
      setSaving(false);
    }
  };

  const locationLabel = useMemo(() => {
    if (coords.lat != null && coords.lng != null)
      return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    return "Not added";
  }, [coords.lat, coords.lng]);

  return (
    <div className="min-h-screen bg-[#040717] text-slate-50">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-cyan-500/18 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 sm:w-96 sm	h-96 rounded-full bg-emerald-500/16 blur-3xl opacity-70" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* top bar */}
      <header className="relative z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/customer/dashboard")}
            className="flex items-center gap-3 px-2 sm:px-3 py-1.5 rounded-2xl bg-[#05091F] border border-cyan-500/30"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-emerald-300 flex items-center justify-center text-[13px] sm:text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/40">
              QS
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-slate-100">
                Smart Request
              </span>
              <span className="text-[11px] text-slate-500">
                Customer / Create service
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/customer/profile")}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-200 hover:border-sky-400/50 hover:text-sky-100 hover:bg-slate-900/60 transition"
            >
              👤 Profile
            </button>
            <button
              type="button"
              onClick={() => navigate("/customer/dashboard")}
              className="px-3.5 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-200 hover:border-cyan-400/50 hover:text-cyan-100 hover:bg-slate-900/60 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              Upload a photo (or capture) to auto-fill details.
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
              Create a smart service request
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-[520px]">
            <MiniStat label="Selected service" value={form.service_type || "—"} />
            <MiniStat label="Location" value={locationLabel} />
            <MiniStat
              label="AI status"
              value={aiLoading ? "Analyzing…" : aiHint ? "Suggested" : "Idle"}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-[12px] px-4 py-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left */}
          <section className="lg:col-span-7 rounded-3xl bg-slate-900/55 border border-slate-700/80 backdrop-blur-2xl p-5 sm:p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-200">
                  Request title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  placeholder="AC not cooling, unusual noise"
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-950/55 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Service type
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tap one to match providers
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt}
                      active={form.service_type === opt}
                      onClick={() => setForm((f) => ({ ...f, service_type: opt }))}
                    >
                      {opt}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-200">
                  Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Apartment, street, city"
                    className="flex-1 px-3 py-2.5 rounded-2xl bg-slate-950/55 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={locLoading}
                    className={cx(
                      "px-4 py-2.5 rounded-2xl text-xs font-semibold border transition whitespace-nowrap",
                      locLoading
                        ? "border-slate-800 bg-slate-900/50 text-slate-500"
                        : "border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15 hover:border-cyan-300/60"
                    )}
                  >
                    {locLoading ? "Locating…" : "Use my location"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-200">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue, urgency, and preferred time."
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-950/55 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm placeholder:text-slate-500 resize-none"
                />
                {aiHint && (
                  <p className="mt-2 text-[11px] text-emerald-200">{aiHint}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/customer/dashboard")}
                  className="px-4 py-2.5 rounded-2xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800/60 transition"
                  disabled={saving || aiLoading || locLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || aiLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Find Providers"}
                </button>
              </div>
            </form>
          </section>

          {/* Right */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl bg-slate-900/55 border border-slate-700/80 backdrop-blur-2xl p-5 sm:p-6 overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    Add a photo
                  </div>
                </div>
                {imageFile ? (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:text-red-200 hover:border-red-500/60 hover:bg-red-500/10 transition"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-52 sm:h-60 object-cover rounded-2xl border border-slate-700"
                  />
                ) : (
                  <div className="w-full h-52 sm:h-60 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-200 mb-3">
                      📷
                    </div>
                    <div className="text-sm font-semibold text-slate-100">
                      Add an image for AI suggestions
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Upload from gallery or capture on mobile.
                    </div>
                  </div>
                )}
              </div>

              <input
                id={uploadId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUploadChange}
              />
              <input
                id={cameraId}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onCameraChange}
              />

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  htmlFor={uploadId}
                  className={cx(
                    "cursor-pointer select-none px-4 py-2.5 rounded-2xl border text-center text-xs font-semibold transition",
                    aiLoading || saving
                      ? "border-slate-800 bg-slate-900/40 text-slate-500 pointer-events-none"
                      : "border-slate-700 bg-slate-950/40 text-slate-100 hover:border-cyan-400/60 hover:text-cyan-100 hover:bg-slate-900/50"
                  )}
                >
                  ⬆ Upload image
                </label>

                <label
                  htmlFor={cameraId}
                  className={cx(
                    "cursor-pointer select-none px-4 py-2.5 rounded-2xl text-center text-xs font-semibold transition shadow-lg",
                    aiLoading || saving
                      ? "bg-slate-900/40 text-slate-500 border border-slate-800 pointer-events-none shadow-none"
                      : "bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 hover:-translate-y-0.5 shadow-cyan-500/35"
                  )}
                >
                  📸 Capture photo
                </label>
              </div>

              {aiLoading && (
                <div className="mt-4 text-[11px] px-3 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
                  Analyzing image… please wait.
                </div>
              )}

              {imageFile?.name ? (
                <p className="mt-3 text-[10px] text-slate-500">
                  Selected: {imageFile.name}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
