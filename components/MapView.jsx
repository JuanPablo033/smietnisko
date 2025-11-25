'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'
import AddMarkerForm from './AddMarkerForm'
import Link from 'next/link'
// Fix dla ikonek Leafleta w Next.js
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const supabase = createClient()

export default function MapView() {
  const [markers, setMarkers] = useState([])
  const [user, setUser] = useState(null)
  
  const [isPlacing, setIsPlacing] = useState(false)
  const [tempMarkerPos, setTempMarkerPos] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [map, setMap] = useState(null)
  const markerRef = useRef(null)

  useEffect(() => {
    fetchMarkers()
    checkUser()
    const channel = supabase.channel('public:smietniki')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'smietniki' }, payload => {
        // --- POPRAWKA NA DUPLIKATY (Błąd key='24') ---
        setMarkers(prev => {
            const exists = prev.find(m => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
        })
        // ---------------------------------------------
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  async function fetchMarkers() {
    const { data, error } = await supabase
      .from('smietniki')
      .select('id, nazwa, typ, zdjecie, latitude, longitude')
    if (error) return console.log(error)
    setMarkers(data || [])
  }

  const startAdding = () => {
    if (!map) return;
    const center = map.getCenter();
    setTempMarkerPos(center);
    setIsPlacing(true);
    setShowForm(false);
  }

  const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setTempMarkerPos(marker.getLatLng())
        }
      },
    }), [],)

  const confirmPosition = () => {
    setIsPlacing(false);
    setShowForm(true);
  }

  const cancelAdding = () => {
    setIsPlacing(false);
    setShowForm(false);
    setTempMarkerPos(null);
  }

  return (
    <div className="relative h-screen w-full bg-gray-100 font-sans text-gray-900">
      
      {/* --- WYSPA MENU --- */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[9999]">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 transition-all hover:scale-105">
            <div className="font-bold text-lg tracking-tight text-green-700 mr-2 flex items-center gap-2">
                <span>♻️</span> MojeŚmietnisko
            </div>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            {user ? (
                <>
                    {!isPlacing && !showForm && (
                        <button 
                            onClick={startAdding}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-full transition shadow-md flex items-center gap-2 text-sm"
                        >
                            + Dodaj znacznik
                        </button>
                    )}
                    {isPlacing && (
                         <span className="text-sm font-medium text-gray-600 animate-pulse">
                            Ustaw pinezkę na mapie...
                         </span>
                    )}
                    <button 
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-500 font-medium text-sm transition"
                    >
                        Wyloguj
                    </button>
                </>
            ) : (
                <Link href="/login">
                    <button className="bg-black text-white hover:bg-gray-800 font-medium py-2 px-6 rounded-full transition shadow-lg text-sm">
                        Zaloguj się
                    </button>
                </Link>
            )}
        </div>
      </div>

      {/* --- DYMEK ZATWIERDZENIA --- */}
      {isPlacing && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[9999] flex gap-2">
              <button 
                onClick={confirmPosition}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-green-700 transition transform hover:-translate-y-1"
              >
                  ✓ Zatwierdź lokalizację
              </button>
              <button 
                onClick={cancelAdding}
                className="bg-white text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-50 transition"
              >
                  Anuluj
              </button>
          </div>
      )}

      {/* --- MAPA --- */}
      <MapContainer 
        center={[52.237, 21.017]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
        zoomControl={false}
      >
        {/* Kolorowa mapa */}
        <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* ZNACZNIKI */}
        {markers.map(m => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup className="custom-popup" minWidth={250}>
              <div className="text-center p-1">
                  <strong className="block text-lg mb-2">{m.nazwa}</strong>
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">{m.typ}</span>
                  
                  {/* --- POPRAWKA ZDJĘCIA TU --- */}
                  {m.zdjecie && (
                    <div className="mt-4 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img 
                            src={m.zdjecie} 
                            alt={m.nazwa} 
                            // h-auto = automatyczna wysokość
                            // max-h-[300px] = nie większe niż 300px
                            // object-contain = pokaż całe zdjęcie bez ucinania
                            className="w-full h-auto max-h-[300px] object-contain" 
                        />
                    </div>
                  )}
                  {/* --------------------------- */}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* PRZESUWANA PINEZKA */}
        {isPlacing && tempMarkerPos && (
             <Marker 
                draggable={true}
                eventHandlers={eventHandlers}
                position={tempMarkerPos}
                ref={markerRef}
                opacity={0.8}
             ></Marker>
        )}
      </MapContainer>

      {/* --- FORMULARZ (MODAL) --- */}
      {showForm && tempMarkerPos && (
        <div className="absolute inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">Szczegóły zgłoszenia</h3>
                    <button onClick={cancelAdding} className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">
                    <AddMarkerForm 
                        pos={tempMarkerPos} 
                        onDone={() => { 
                            setShowForm(false); 
                            setTempMarkerPos(null); 
                            fetchMarkers(); 
                        }} 
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  )
}