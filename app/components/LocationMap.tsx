'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const LOCATION = {
  lat: 47.3909520,
  lng: 8.0472332,
  address: 'Bahnhofstrasse 30, 5000 Aarau'
}

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -40],
  shadowSize: [41, 41]
})

export default function LocationMap() {
  return (
    <div className='w-full max-w-3xl mx-auto flex flex-col items-center gap-4'>
      <h2 className='text-2xl font-bold text-center text-yellow-500 drop-shadow-md'>
        Hier feiern wir Weihnachten
      </h2>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-[0_0_15px_#ff5555] hover:shadow-[0_0_25px_#ff8888] hover:bg-red-700 transition-all'
      >
        {LOCATION.address}
      </a>

      <MapContainer
        center={[LOCATION.lat, LOCATION.lng]}
        zoom={16}
        scrollWheelZoom={false}
        className='w-full h-72 rounded-2xl shadow-lg'
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[LOCATION.lat, LOCATION.lng]} icon={redIcon}>
          <Popup>
            <div className='text-center'>
              <p className='font-semibold'>{LOCATION.address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-yellow-500 font-bold underline mt-2 block'
              >
                Route auf Google Maps anzeigen
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
