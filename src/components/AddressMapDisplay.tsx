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
  const waypointRef = useRef<HTMLDivElement>(null);
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number; visible: boolean; angle: number } | null>(null);

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

    // Initialize map
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      markerRef.current = L.marker([latitude!, longitude!], { icon: customIcon }).addTo(map);

      // Update waypoint position on map move
      const updateWaypoint = () => {
        if (!mapRef.current || !latitude || !longitude) return;

        const targetLatLng = L.latLng(latitude, longitude);
        const point = mapRef.current.latLngToContainerPoint(targetLatLng);
        const bounds = mapRef.current.getContainer().getBoundingClientRect();
        
        const margin = 40;
        const isVisible = 
          point.x >= margin && 
          point.x <= bounds.width - margin && 
          point.y >= margin && 
          point.y <= bounds.height - margin;

        if (isVisible) {
          setPinPosition({ x: point.x, y: point.y, visible: true, angle: 0 });
        } else {
          // Calculate position at border
          const centerX = bounds.width / 2;
          const centerY = bounds.height / 2;
          const dx = point.x - centerX;
          const dy = point.y - centerY;
          const angle = Math.atan2(dy, dx);
          
          // Calculate intersection with border
          let borderX = centerX;
          let borderY = centerY;
          
          const slope = dy / dx;
          const halfWidth = bounds.width / 2 - margin;
          const halfHeight = bounds.height / 2 - margin;
          
          if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
            // Hit left or right border
            borderX = dx > 0 ? bounds.width - margin : margin;
            borderY = centerY + slope * (borderX - centerX);
          } else {
            // Hit top or bottom border
            borderY = dy > 0 ? bounds.height - margin : margin;
            borderX = centerX + (borderY - centerY) / slope;
          }
          
          setPinPosition({ 
            x: borderX, 
            y: borderY, 
            visible: false, 
            angle: angle * (180 / Math.PI) 
          });
        }
      };

      map.on('move', updateWaypoint);
      map.on('zoom', updateWaypoint);
      updateWaypoint();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, hasCoordinates, latitude, longitude]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">Location</h4>
          {address && <p className="text-sm text-muted-foreground break-words">{address}</p>}
          {hasCoordinates && (
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {latitude}, {longitude}
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
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Waypoint indicator */}
          {pinPosition && !pinPosition.visible && (
            <div
              ref={waypointRef}
              className="absolute pointer-events-none z-[1000] flex items-center justify-center"
              style={{
                left: `${pinPosition.x}px`,
                top: `${pinPosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="w-12 h-12 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                style={{
                  transform: `rotate(${pinPosition.angle}deg)`
                }}
              >
                <Navigation className="w-6 h-6 text-primary-foreground" style={{ transform: 'rotate(-90deg)' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
