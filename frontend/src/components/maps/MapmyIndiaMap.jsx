import { useEffect, useRef } from "react";

export default function MapmyIndiaIframeMap({
  customerLat,
  customerLng,
  providerLat,
  providerLng,
  height = 320,
}) {
  const iframeRef = useRef(null);

  const config = {
    customerLat,
    customerLng,
    providerLat,
    providerLng,
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const win = iframe.contentWindow;
      if (!win || typeof win.initJobMap !== "function") return;
      win.initJobMap(config);
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [config]);

  return (
    <iframe
      ref={iframeRef}
      src="/mapmyindia-job.html"
      title="Job Map"
      style={{ width: "100%", height, borderRadius: 16, border: "1px solid #1f2937" }}
    />
  );
}
