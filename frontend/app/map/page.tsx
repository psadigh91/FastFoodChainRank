'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/lib/api/locations';
import { Location } from '@/types';
import Link from 'next/link';
import { MapPin, Star, Navigation } from 'lucide-react';

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to LA
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    } else {
      // Default to LA
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }
  }, []);

  // Fetch nearby locations
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', 'nearby', userLocation],
    queryFn: () =>
      userLocation
        ? locationsApi.getNearby(userLocation.lat, userLocation.lng, 20)
        : locationsApi.getAll({ chain: 'chipotle', city: 'Los Angeles' }),
    enabled: !!userLocation,
  });

  if (!userLocation || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load locations</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const locations = data?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🗺️ Location Map</h1>
              <p className="text-gray-600">
                {locations.length} Chipotle locations near you
              </p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Map Placeholder + Location List */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-[600px]">
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Interactive Map
                </h3>
                <p className="text-gray-600 mb-4">
                  Mapbox integration coming soon!
                </p>
                <p className="text-sm text-gray-500">
                  Configure NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
                </p>
              </div>
            </div>
          </div>

          {/* Location List */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nearby Locations</h2>
            <div className="space-y-4">
              {locations.map((location) => (
                <LocationCard
                  key={location.locationId}
                  location={location}
                  isSelected={selectedLocation?.locationId === location.locationId}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationCard({
  location,
  isSelected,
  onClick,
}: {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{location.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
          <p className="text-sm text-gray-500">
            {location.city}, {location.state} {location.zipCode}
          </p>

          {location.distance !== undefined && (
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Navigation className="w-4 h-4 mr-1" />
              {location.distance.toFixed(1)} mi away
            </div>
          )}

          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-semibold text-gray-900">
              {location.averageRating > 0
                ? location.averageRating.toFixed(1)
                : 'No ratings yet'}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              ({location.reviewCount} reviews)
            </span>
          </div>
        </div>

        <Link
          href={`/locations/${location.locationId}`}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
