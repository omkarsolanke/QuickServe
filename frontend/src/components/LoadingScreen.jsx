import "./loading.css";

export default function LoadingScreen({ message = "Preparing your experience..." }) {
  return (
    <div className="loading-root">
      <div className="loading-card">
        <div className="logo-glow">QS</div>
        <div className="loader-orbit">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <p className="loading-title">QuickServe</p>
        <p className="loading-subtitle">{message}</p>
      </div>
    </div>
  );
}
