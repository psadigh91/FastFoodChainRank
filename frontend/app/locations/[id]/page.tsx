'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { locationsApi } from '@/lib/api/locations';
import Link from 'next/link';
import { MapPin, Star, Phone, Clock, ArrowLeft } from 'lucide-react';
import { formatRating, getRatingColor, parseMenuItem, formatDistance } from '@/lib/utils';

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id as string;

  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => locationsApi.getById(locationId),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'location', locationId],
    queryFn: () => locationsApi.getReviews(locationId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Location not found</p>
          <Link
            href="/map"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];

  // Get top-rated menu items
  const menuItemsArray = Object.entries(location.menuItems || {})
    .map(([id, data]: [string, any]) => ({
      id,
      name: parseMenuItem(id),
      avgRating: data.avgRating,
      count: data.count,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.avgRating - a.avgRating);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/map"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{location.name}</h1>

              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-900">{location.address}</p>
                    <p className="text-gray-600">
                      {location.city}, {location.state} {location.zipCode}
                    </p>
                  </div>
                </div>

                {location.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">{location.phone}</p>
                  </div>
                )}

                {location.hours && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">{location.hours}</p>
                  </div>
                )}

                {location.distance !== undefined && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">{formatDistance(location.distance)} away</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mr-2" />
                      <span className="text-2xl font-bold text-gray-900">
                        {location.averageRating > 0
                          ? location.averageRating.toFixed(1)
                          : 'No ratings'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Based on {location.reviewCount} reviews
                    </p>
                  </div>

                  <Link
                    href={`/reviews/new?locationId=${location.locationId}`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Write a Review
                  </Link>
                </div>
              </div>
            </div>

            {/* Menu Item Rankings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Item Rankings</h2>

              {menuItemsArray.length === 0 ? (
                <p className="text-gray-600">No ratings yet. Be the first to review!</p>
              ) : (
                <div className="space-y-3">
                  {menuItemsArray.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.count} reviews</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getRatingColor(item.avgRating)}`}
                        >
                          {item.avgRating.toFixed(1)}
                        </div>
                        <p className="text-xs text-gray-500">/ 10</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reviews</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 10).map((review: any) => (
                    <div key={review.reviewId} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {parseMenuItem(review.menuItem)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`text-xl font-bold ${getRatingColor(review.rating)}`}
                        >
                          {review.rating}/10
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                      {review.verified && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">
                    {location.reviewCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">
                    {location.averageRating > 0
                      ? formatRating(location.averageRating)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Menu Items</span>
                  <span className="font-semibold text-gray-900">
                    {menuItemsArray.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Rated Item */}
            {menuItemsArray.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="font-semibold mb-2">⭐ Top Rated</h3>
                <p className="text-2xl font-bold mb-1">{menuItemsArray[0].name}</p>
                <p className="text-3xl font-bold">{menuItemsArray[0].avgRating.toFixed(1)}/10</p>
                <p className="text-sm opacity-90 mt-2">
                  Based on {menuItemsArray[0].count} reviews
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
