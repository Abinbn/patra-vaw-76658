import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

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
  const [showDirectionArrow, setShowDirectionArrow] = useState(false);
  const [arrowAngle, setArrowAngle] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<HTMLIFrameElement>(null);
  const animationFrameRef = useRef<number>();

  if (!address && !latitude && !longitude && !mapUrl) return null;

  const hasCoordinates = latitude !== null && latitude !== undefined && 
                         longitude !== null && longitude !== undefined;
  
  const mapEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${latitude},${longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address)}`;
  
  const mapsLink = mapUrl
    ? mapUrl
    : hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Get user's current location
  useEffect(() => {
    if (showMap && hasCoordinates && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, [showMap, hasCoordinates]);

  // Calculate if target is likely out of view and direction
  useEffect(() => {
    if (!showMap || !hasCoordinates || !userLocation) {
      setShowDirectionArrow(false);
      return;
    }

    const updateDirection = () => {
      const targetLat = latitude!;
      const targetLng = longitude!;

      // Calculate distance in degrees (rough approximation)
      const latDiff = Math.abs(userLocation.lat - targetLat);
      const lngDiff = Math.abs(userLocation.lng - targetLng);
      
      // If target is far from user location (more than ~0.05 degrees ~5.5km)
      // Show the direction arrow
      const distanceThreshold = 0.05;
      const isFarAway = latDiff > distanceThreshold || lngDiff > distanceThreshold;

      if (isFarAway) {
        setShowDirectionArrow(true);
        
        // Calculate bearing angle
        const dy = targetLat - userLocation.lat;
        const dx = targetLng - userLocation.lng;
        const angle = Math.atan2(dx, dy) * (180 / Math.PI);
        
        setArrowAngle(angle);
      } else {
        setShowDirectionArrow(false);
      }
    };

    updateDirection();

    // Optional: Update periodically if map is interactive
    animationFrameRef.current = window.setInterval(updateDirection, 2000);

    return () => {
      if (animationFrameRef.current) {
        clearInterval(animationFrameRef.current);
      }
    };
  }, [showMap, hasCoordinates, userLocation, latitude, longitude]);

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
      
      {showMap && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50">
          <iframe
            ref={mapRef}
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          />
          
          {/* Direction Arrow Indicator - Only shows when target is far */}
          {showDirectionArrow && (
            <>
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-pulse">
                  <Navigation className="w-4 h-4" />
                  <span>Target Direction</span>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div 
                  style={{ 
                    transform: `rotate(${arrowAngle}deg)`,
                    transition: 'transform 0.5s ease'
                  }}
                  className="relative"
                >
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="25" fill="#EF4444" opacity="0.15"/>
                    <circle cx="30" cy="30" r="20" fill="#EF4444" opacity="0.25"/>
                    <circle cx="30" cy="30" r="15" fill="#EF4444" opacity="0.35"/>
                    <path
                      d="M30 10 L38 24 L33 24 L33 40 L27 40 L27 24 L22 24 Z"
                      fill="#EF4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle cx="30" cy="30" r="4" fill="white" stroke="#EF4444" strokeWidth="2"/>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
                  📍 Location pin is in this direction
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
