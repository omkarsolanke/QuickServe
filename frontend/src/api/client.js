// src/api/client.js
import axios from "axios";

const host = window.location.hostname;

let baseURL;

// 🔹 Cloudflare tunnel (mobile + public demo)
if (host.endsWith(".trycloudflare.com")) {
  baseURL = "https://cluster-reviewer-relate-post.trycloudflare.com";
}

// 🔹 Local LAN (same WiFi)
else if (host.startsWith("192.168.")) {
  baseURL = "http://192.168.1.2:8000";
}

// 🔹 College / internal network
else if (host.startsWith("10.153.")) {
  baseURL = "http://10.153.157.195:8000";
}

// 🔹 Default local dev
else {
  baseURL = "http://127.0.0.1:8000";
}

const api = axios.create({
  baseURL,
  // Do NOT force JSON here; set per-request / in interceptor
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON when body is NOT FormData
  if (config.data instanceof FormData) {
    // Let browser set correct multipart/form-data boundary
    if (config.headers && config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
  } else {
    config.headers = {
      ...(config.headers || {}),
      "Content-Type": "application/json",
    };
  }

  return config;
});

export default api;
