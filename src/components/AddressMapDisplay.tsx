import React from 'react';
import { MapPin } from 'lucide-react';

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
  if (!address && !latitude && !longitude && !mapUrl) return null;

  // Use coordinates if available, otherwise encode address
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
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          />
          {/* Map Pin Overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
