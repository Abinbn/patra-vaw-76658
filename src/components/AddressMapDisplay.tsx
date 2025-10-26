import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  if (!address && !latitude && !longitude && !mapUrl) return null;

  const hasCoordinates = latitude !== null && latitude !== undefined && 
                         longitude !== null && longitude !== undefined;
  
  const mapsLink = mapUrl
    ? mapUrl
    : hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  useEffect(() => {
    if (!showMap || !hasCoordinates || !mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom: 15,
        zoomControl: true,
        attributionControl: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;

      // Create marker icon that stays at the user's coordinates
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 30px;
              height: 30px;
              background: #ef4444;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: translateX(-50%) rotate(-45deg);
              box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      // Add marker at the user's location - this marker will STAY at these coordinates
      markerRef.current = L.marker([latitude!, longitude!], { 
        icon: customIcon
      }).addTo(map);

      // Add popup to marker
      if (address) {
        markerRef.current.bindPopup(address);
      }

      // Function to check if marker is visible and show edge indicator if not
      const updateEdgeIndicator = () => {
        if (!mapRef.current || !latitude || !longitude) return;

        const userLatLng = L.latLng(latitude, longitude);
        const bounds = mapRef.current.getBounds();
        
        // Check if user location is within visible map bounds
        const isVisible = bounds.contains(userLatLng);

        if (isVisible) {
          // User location is visible, hide edge indicator
          setEdgeIndicator(null);
        } else {
          // User location is off-screen, show edge indicator
          const containerPoint = mapRef.current.latLngToContainerPoint(userLatLng);
          const container = mapRef.current.getContainer();
          const containerRect = container.getBoundingClientRect();
          
          const centerX = containerRect.width / 2;
          const centerY = containerRect.height / 2;
          
          // Calculate direction from center to user location
          const dx = containerPoint.x - centerX;
          const dy = containerPoint.y - centerY;
          const angle = Math.atan2(dy, dx);
          
          // Calculate position at edge of map
          const margin = 50;
          const halfWidth = containerRect.width / 2 - margin;
          const halfHeight = containerRect.height / 2 - margin;
          
          let edgeX = centerX;
          let edgeY = centerY;
          
          const slope = dy / dx;
          
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
      
      // Initial check
      updateEdgeIndicator();
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off('move');
        mapRef.current.off('zoom');
        mapRef.current.off('moveend');
        mapRef.current.off('zoomend');
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, hasCoordinates, latitude, longitude, address]);

  // Function to recenter map on user location
  const recenterMap = () => {
    if (mapRef.current && hasCoordinates) {
      mapRef.current.setView([latitude!, longitude!], 15, {
        animate: true,
        duration: 0.5
      });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">Location</h4>
          {address && <p className="text-sm text-muted-foreground break-words">{address}</p>}
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
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Edge indicator - shows when user location is off-screen */}
          {edgeIndicator && (
            <button
              onClick={recenterMap}
              className="absolute z-[1000] w-12 h-12 bg-primary hover:bg-primary/90 transition-colors rounded-full flex items-center justify-center shadow-lg border-2 border-background cursor-pointer"
              style={{
                left: `${edgeIndicator.x}px`,
                top: `${edgeIndicator.y}px`,
                transform: `translate(-50%, -50%) rotate(${edgeIndicator.angle}deg)`
              }}
              title="Click to center on location"
            >
              <Navigation 
                className="w-6 h-6 text-primary-foreground" 
                style={{ transform: 'rotate(-90deg)' }} 
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
