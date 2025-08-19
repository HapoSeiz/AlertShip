
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useSearchParams } from 'next/navigation';

export default function OutageMap() {

  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  const [center, setCenter] = useState({ lat: 22.5937, lng: 78.9629 }); // Default India
  const [zoom, setZoom] = useState(4);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef();

  // Use useJsApiLoader to load Google Maps script only once
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // Always include 'places' for consistency
  });

  // Geocode city to get center
  useEffect(() => {
    async function geocodeCity() {
      if (!location) {
        setCenter({ lat: 22.5937, lng: 78.9629 });
        setZoom(4);
        return;
      }
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setError('Google Maps API key is missing.');
          setLoading(false);
          return;
        }
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
        const data = await res.json();
        console.log('Geocode result:', data);
        if (data.status === 'OK' && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
          setZoom(12);
        } else {
          setError('Could not geocode city. Showing India.');
          setCenter({ lat: 22.5937, lng: 78.9629 });
          setZoom(4);
        }
      } catch (e) {
        setError('Failed to geocode city.');
        setCenter({ lat: 22.5937, lng: 78.9629 });
        setZoom(4);
      } finally {
        setLoading(false);
      }
    }
    geocodeCity();
  }, [location]);

  // Fetch outages for city
  useEffect(() => {
    async function fetchOutages() {
      setLoading(true);
      try {
        if (!location) {
          setOutages([]);
          setLoading(false);
          return;
        }
        const outagesRef = collection(db, 'outageReports');
        const q = query(outagesRef, where('city', '==', location));
        const querySnapshot = await getDocs(q);
        console.log('Firestore outages:', querySnapshot.docs.length);
        const data = querySnapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            lat: typeof d.lat === 'number' ? d.lat : parseFloat(d.lat),
            lng: typeof d.lng === 'number' ? d.lng : parseFloat(d.lng),
          };
        }).filter(o => !isNaN(o.lat) && !isNaN(o.lng));
        setOutages(data);
      } catch (e) {
        setError('Failed to fetch outage data');
      } finally {
        setLoading(false);
      }
    }
    fetchOutages();
  }, [location]);

  // Fit bounds to all markers if more than one
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (outages.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      outages.forEach(o => bounds.extend({ lat: o.lat, lng: o.lng }));
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [outages]);


  // SVG path for a Google Maps-style pin
  // This path is visually similar to the default Google pin
  const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

  const getMarkerIcon = (type) => ({
    path: PIN_PATH,
    fillColor: type === 'electricity' ? '#F59E0B' : '#4F46E5',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#fff',
    scale: 2.2, // visually similar to default pin size
    anchor: new window.google.maps.Point(12, 24), // anchor at tip of pin
  });


  if (error || loadError) {
    return (
      <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error || loadError.message || 'Failed to load Google Maps'}</p>
        </div>
      </div>
    );
  }

  // Custom map style to hide business POIs and make roads/areas more visible
  const mapStyles = [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.attraction',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.government',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.medical',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.place_of_worship',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.school',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.sports_complex',
      stylers: [{ visibility: 'off' }],
    },
    // You can add more style rules as needed
  ];

  return (
    <div className="bg-gray-100 rounded-lg h-[400px] relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading outages...</p>
          </div>
        </div>
      )}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          // Close info card if map is clicked and a marker is active
          onClick={() => {
            if (activeMarker !== null) setActiveMarker(null);
          }}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'greedy',
            styles: mapStyles,
            clickableIcons: false, // Prevent default POI info windows
          }}
        >
          {outages.map((outage) => (
            <Marker
              key={outage.id}
              position={{ lat: outage.lat, lng: outage.lng }}
              icon={getMarkerIcon(outage.type)}
              onClick={e => {
                // Prevent map onClick from firing
                e.domEvent && e.domEvent.stopPropagation();
                setActiveMarker(outage.id);
              }}
              onMouseOver={() => setActiveMarker(outage.id)}
              onMouseOut={() => setActiveMarker(null)}
            >
              {activeMarker === outage.id && (
                <InfoWindow
                  position={{ lat: outage.lat, lng: outage.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -32),
                    // Remove default padding/margin if needed
                  }}
                >
                  <div style={{ minWidth: 180, padding: 0, margin: 0, lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 2 }}>{outage.type}</div>
                    {outage.description && (
                      <div style={{ marginBottom: 2 }}>{outage.description}</div>
                    )}
                    {outage.locality && (
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>Locality: {outage.locality}</div>
                    )}
                    <div style={{ fontSize: 12, color: '#888' }}>Reported: {new Date(outage.timestamp).toLocaleString()}</div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      )}
    </div>
  );
}