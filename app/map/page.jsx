'use client'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('../../components/MapView'), { 
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>
})

export default function MapPage() {
  return (
    <div>
      <MapView />
    </div>
  );
}