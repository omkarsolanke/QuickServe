import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

export default function JobMap({ providerPos, customerPos }) {
  if (!providerPos || !customerPos) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Location not available
      </div>
    );
  }

  const center = [
    (providerPos.lat + customerPos.lat) / 2,
    (providerPos.lng + customerPos.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: 320, width: "100%", borderRadius: 16 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      <Marker position={[providerPos.lat, providerPos.lng]} />
      <Marker position={[customerPos.lat, customerPos.lng]} />

      <Polyline
        positions={[
          [providerPos.lat, providerPos.lng],
          [customerPos.lat, customerPos.lng],
        ]}
        color="cyan"
      />
    </MapContainer>
  );
}
