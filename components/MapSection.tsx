import React, { useEffect, useRef, useState } from 'react';

// Declare L as any to bypass TS checks for the global Leaflet object since we loaded it via CDN
declare const L: any;

const MapSection: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pathLineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [tracking, setTracking] = useState(false);
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
      const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      
      // Try to get initial location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 15);
            L.marker([latitude, longitude]).addTo(map).bindPopup("You are here").openPopup();
          },
          (err) => console.error("Geo error", err)
        );
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Tracking Logic
  useEffect(() => {
    let watchId: number;

    if (tracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos: [number, number] = [latitude, longitude];
          
          setPositions(prev => [...prev, newPos]);
          
          if (mapInstanceRef.current) {
            // Update Marker
            if (markerRef.current) {
               markerRef.current.setLatLng(newPos);
            } else {
               markerRef.current = L.marker(newPos).addTo(mapInstanceRef.current);
            }
            mapInstanceRef.current.panTo(newPos);

            // Update Polyline
            if (pathLineRef.current) {
              pathLineRef.current.setLatLngs([...positions, newPos]);
            } else {
              pathLineRef.current = L.polyline([...positions, newPos], { color: 'blue' }).addTo(mapInstanceRef.current);
            }
          }
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, positions]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[600px] flex flex-col">
       <div className="flex justify-between items-center mb-4">
         <div>
            <h2 className="text-xl font-bold text-slate-800">Exercise Map</h2>
            <p className="text-sm text-slate-500">Track your run or walk path.</p>
         </div>
         <button
           onClick={() => setTracking(!tracking)}
           className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
             tracking ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
           }`}
         >
           {tracking ? 'Stop Tracking' : 'Start Tracking'}
         </button>
       </div>
       
       {error && <div className="bg-red-50 text-red-600 p-2 mb-2 rounded">{error}</div>}
       
       <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
          <div ref={mapContainerRef} className="w-full h-full" id="map" />
       </div>
       
       <div className="mt-4 flex gap-4 text-sm text-slate-600">
          <div className="bg-slate-50 px-4 py-2 rounded-lg">
            <span className="block text-xs text-slate-400 uppercase">Points</span>
            <span className="font-bold">{positions.length}</span>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-lg">
             <span className="block text-xs text-slate-400 uppercase">Status</span>
             <span className={`font-bold ${tracking ? 'text-emerald-500' : 'text-slate-500'}`}>
                {tracking ? 'Recording...' : 'Idle'}
             </span>
          </div>
       </div>
    </div>
  );
};

export default MapSection;