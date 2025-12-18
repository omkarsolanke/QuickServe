import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import MapmyIndiaIframeMap from "../../components/maps/MapmyIndiaMap";

export default function ProviderJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(location.state?.request || null);
  const [providerPos, setProviderPos] = useState(null);

  const loadJob = async () => {
    try {
      const res = await api.get(`/provider/requests/${id}`);
      setJob(res.data);
    } catch {
      navigate("/provider/dashboard");
    }
  };

  const loadLocation = async () => {
    try {
      const res = await api.get("/provider/providers/location/me");
      if (res.data?.latitude && res.data?.longitude) {
        setProviderPos({
          lat: res.data.latitude,
          lng: res.data.longitude,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadJob();
    loadLocation();
    const id1 = setInterval(loadJob, 8000);
    const id2 = setInterval(loadLocation, 5000);

    return () => {
      clearInterval(id1);
      clearInterval(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (status) => {
    try {
      await api.post(`/provider/requests/${id}/status`, { status });
      await loadJob();
      if (status === "completed") {
        navigate("/provider/dashboard");
      }
    } catch {
      // optional toast
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        Loading job…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <button
        onClick={() => navigate("/provider/dashboard")}
        className="mb-4 text-xs text-slate-400 hover:text-white"
      >
        ← Back to dashboard
      </button>

      <div className="max-w-4xl mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-500 mb-1">Current job</p>
          <h1 className="text-lg font-semibold">
            {job.title || job.service_type || "Service request"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {job.service_type} • Final price: ₹{job.budget ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-400 capitalize">
            Status: {job.status}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-500 mb-2">Live route</p>
          <MapmyIndiaIframeMap
            customerLat={job?.customer_lat}
            customerLng={job?.customer_lng}
            providerLat={providerPos?.lat}
            providerLng={providerPos?.lng}
            height={320}
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2 text-xs">
          <p className="text-slate-400 mb-1">Update job status</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateStatus("en_route")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              To location
            </button>
            <button
              onClick={() => updateStatus("arrived")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              Arriving
            </button>
            <button
              onClick={() => updateStatus("payment")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              Payment
            </button>
            <button
              onClick={() => updateStatus("completed")}
              className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-900 font-semibold"
            >
              Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
