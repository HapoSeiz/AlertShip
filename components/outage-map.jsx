'use client';

import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function OutageMap({ city }) {
  const [outages, setOutages] = useState([]);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Default to Delhi
  const [selectedOutage, setSelectedOutage] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchOutages = async () => {
      try {
        const outagesRef = collection(db, 'outageReports');
        let querySnapshot;
        
        if (city && city.trim()) {
          // Filter by city if provided
          const cityQuery = query(
            outagesRef,
            where('city', '==', city.trim())
          );
          querySnapshot = await getDocs(cityQuery);
        } else {
          // Fetch all outages if no city specified
          querySnapshot = await getDocs(outagesRef);
        }
        
        const outageData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            lat: parseFloat(data.lat) || parseFloat(data.latitude),
            lng: parseFloat(data.lng) || parseFloat(data.longitude),
          };
        }).filter(outage => !isNaN(outage.lat) && !isNaN(outage.lng));
        
        setOutages(outageData);
        
        if (outageData.length > 0) {
          setCenter({ lat: outageData[0].lat, lng: outageData[0].lng });
        }
      } catch (error) {
        console.error('Error fetching outages:', error);
      }
    };
    
    fetchOutages();
  }, [city]);

  if (loadError) return <div>Map cannot be loaded right now.</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  // Custom marker colors based on outage type
  const getMarkerIcon = (type) => {
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${type === 'electricity' ? '#EF4444' : '#3B82F6'}" stroke="white" stroke-width="3"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
            ${type === 'electricity' ? '⚡' : '💧'}
          </text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={city ? 12 : 10}
      >
        {outages.map(outage => (
          <Marker
            key={outage.id}
            position={{ lat: outage.lat, lng: outage.lng }}
            title={`${outage.locality} - ${outage.type} outage`}
            icon={getMarkerIcon(outage.type)}
            onClick={() => setSelectedOutage(outage)}
          />
        ))}
        
        {selectedOutage && (
          <InfoWindow
            position={{ lat: selectedOutage.lat, lng: selectedOutage.lng }}
            onCloseClick={() => setSelectedOutage(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm">{selectedOutage.locality}</h3>
              <p className="text-xs text-gray-600">{selectedOutage.city}</p>
              <p className="text-xs mt-1">
                <strong>Type:</strong> {selectedOutage.type}
              </p>
              <p className="text-xs">
                <strong>Description:</strong> {selectedOutage.description}
              </p>
              <p className="text-xs">
                <strong>Source:</strong> {selectedOutage.source}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(selectedOutage.timestamp).toLocaleDateString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}