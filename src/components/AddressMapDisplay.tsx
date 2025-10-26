import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Hide Leaflet attribution and control links
const mapStyles = `
  .leaflet-control-attribution,
  .leaflet-control-attribution a {
    display: none !important;
  }
  .custom-map-marker {
    background: transparent !important;
    border: none !important;
  }
  .leaflet-top.leaflet-left {
    display: none !important;
  }
`;

interface AddressMapDisplayProps {
  address: string;
  showMap?: boolean;
  className?: string;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string;
}

export const AddressMapDisplay: React.FC<AddressMapDisplayProps> = ({ 
  address, 
  showMap = false,
  className = '',
  latitude,
  longitude,
  mapUrl
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [edgeIndicator, setEdgeIndicator] = useState<{ x: number; y: number; angle: number } | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  if (!address && !latitude && !longitude && !mapUrl) return null;

  const hasCoordinates = latitude !== null && latitude !== undefined && 
                         longitude !== null && longitude !== undefined &&
                         !isNaN(latitude) && !isNaN(longitude);
  
  const mapsLink = mapUrl
    ? mapUrl
    : hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  useEffect(() => {
    if (!showMap || !hasCoordinates || !mapContainerRef.current) return;

    // Store user location
    userLocationRef.current = { lat: latitude!, lng: longitude! };

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true
      });

      // Add tile layer (OpenStreetMap - free, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 3
      }).addTo(map);

      mapRef.current = map;

      // Create a better marker icon using SVG
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
              </filter>
            </defs>
            <g filter="url(#shadow)">
              <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="#ef4444"/>
              <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="none" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="7" fill="white"/>
            </g>
          </svg>
        `,
        iconSize: [40, 52],
        iconAnchor: [20, 52], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -52]
      });

      // Add marker at the EXACT user coordinates - this will stay fixed at these coordinates
      markerRef.current = L.marker([latitude!, longitude!], { 
        icon: customIcon,
        draggable: false // Ensure marker can't be dragged
      }).addTo(map);

      // Add popup to marker with address
      if (address) {
        markerRef.current.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
            <strong style="display: block; margin-bottom: 4px; color: #ef4444;">Your Location</strong>
            <span style="font-size: 13px; color: #666;">${address}</span>
          </div>
        `);
      }

      // Function to check if marker is visible and show edge indicator if not
      const updateEdgeIndicator = () => {
        if (!mapRef.current || !userLocationRef.current) return;

        const { lat, lng } = userLocationRef.current;
        const userLatLng = L.latLng(lat, lng);
        const bounds = mapRef.current.getBounds();
        
        // Check if user location is within visible map bounds
        const isVisible = bounds.contains(userLatLng);

        if (isVisible) {
          // User location is visible on screen, hide edge indicator
          setEdgeIndicator(null);
        } else {
          // User location is off-screen, calculate edge indicator position
          const containerPoint = mapRef.current.latLngToContainerPoint(userLatLng);
          const container = mapRef.current.getContainer();
          const containerRect = container.getBoundingClientRect();
          
          const centerX = containerRect.width / 2;
          const centerY = containerRect.height / 2;
          
          // Calculate direction from center to user location
          const dx = containerPoint.x - centerX;
          const dy = containerPoint.y - centerY;
          const angle = Math.atan2(dy, dx);
          
          // Calculate position at edge of map with margin
          const margin = 60;
          const halfWidth = containerRect.width / 2 - margin;
          const halfHeight = containerRect.height / 2 - margin;
          
          let edgeX = centerX;
          let edgeY = centerY;
          
          const slope = dy / dx;
          
          // Determine which edge the indicator should appear on
          if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
            // Hit left or right edge
            edgeX = dx > 0 ? containerRect.width - margin : margin;
            edgeY = centerY + slope * (edgeX - centerX);
          } else {
            // Hit top or bottom edge
            edgeY = dy > 0 ? containerRect.height - margin : margin;
            edgeX = centerX + (edgeY - centerY) / slope;
          }
          
          setEdgeIndicator({
            x: edgeX,
            y: edgeY,
            angle: angle * (180 / Math.PI)
          });
        }
      };

      // Update edge indicator when map moves or zooms
      map.on('move', updateEdgeIndicator);
      map.on('zoom', updateEdgeIndicator);
      map.on('moveend', updateEdgeIndicator);
      map.on('zoomend', updateEdgeIndicator);
      map.on('drag', updateEdgeIndicator);
      
      // Initial check
      setTimeout(updateEdgeIndicator, 100);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off('move');
        mapRef.current.off('zoom');
        mapRef.current.off('moveend');
        mapRef.current.off('zoomend');
        mapRef.current.off('drag');
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, hasCoordinates, latitude, longitude, address]);

  // Function to recenter map on user location with smooth animation
  const recenterMap = () => {
    if (mapRef.current && userLocationRef.current) {
      const { lat, lng } = userLocationRef.current;
      mapRef.current.setView([lat, lng], 15, {
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <style>{mapStyles}</style>
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">Location</h4>
          {address && <p className="text-sm text-muted-foreground break-words">{address}</p>}
          {hasCoordinates && (
            <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
              {latitude}, {longitude}
            </p>
          )}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>

      {showMap && hasCoordinates && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50 bg-gray-100">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Edge indicator - shows when user location is off-screen */}
          {edgeIndicator && (
            <button
              onClick={recenterMap}
              className="absolute z-[1000] w-14 h-14 bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer hover:scale-110 active:scale-95"
              style={{
                left: `${edgeIndicator.x}px`,
                top: `${edgeIndicator.y}px`,
                transform: `translate(-50%, -50%) rotate(${edgeIndicator.angle}deg)`
              }}
              title="Click to center on your location"
              aria-label="Center map on location"
            >
              <Navigation 
                className="w-7 h-7 text-white" 
                style={{ transform: 'rotate(-90deg)' }} 
                strokeWidth={2.5}
              />
            </button>
          )}
          
          {/* Recenter button - always visible in bottom right */}
          <button
            onClick={recenterMap}
            className="absolute bottom-4 right-4 z-[999] w-10 h-10 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-lg flex items-center justify-center shadow-lg border border-gray-300 cursor-pointer hover:scale-105 active:scale-95"
            title="Center on location"
            aria-label="Center map on location"
          >
            <MapPin className="w-5 h-5 text-red-500" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};
