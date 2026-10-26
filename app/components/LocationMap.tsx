"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const LOCATION = {
  lat: 47.390952,
  lng: 8.0472332,
  address: "Bahnhofstrasse 30, 5000 Aarau",
};

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -40],
  shadowSize: [41, 41],
});

export default function LocationMap() {
  return (
    <div className="mt-4 flex w-full flex-col items-center gap-4">
      <h2 className="text-lg font-bold text-gold">
        Hier feiern wir Weihnachten
      </h2>

      <div className="w-full overflow-hidden rounded-[20px] border border-white/12 shadow-lg">
        <MapContainer
          center={[LOCATION.lat, LOCATION.lng]}
          zoom={16}
          scrollWheelZoom={false}
          className="h-48 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[LOCATION.lat, LOCATION.lng]} icon={redIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{LOCATION.address}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 glass px-5 py-3.5 text-[15px] font-semibold text-gold transition-colors hover:bg-white/12 active:bg-white/15"
        >
          Route zu {LOCATION.address}
        </a>
      </div>
    </div>
  );
}
