'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { reviewsApi } from '@/lib/api/reviews';
import { Trophy, Star, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import { getLevelName, BADGES } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
  });

  // Fetch user's reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['profile', 'reviews'],
    queryFn: () => reviewsApi.getMyReviews(),
  });

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: (newUsername: string) => usersApi.updateProfile({ username: newUsername }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
  });

  const handleEditToggle = () => {
    if (!isEditing) {
      setUsername(profile?.username || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (username.trim()) {
      updateUsernameMutation.mutate(username.trim());
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const earnedBadges = BADGES.filter(badge =>
    profile && badge.requirement(profile)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {profile?.username ? profile.username[0].toUpperCase() : '?'}
                </span>
              </div>

              {/* User Info */}
              <div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="px-4 py-2 rounded-lg text-gray-900 font-semibold"
                      placeholder="Enter username"
                    />
                    <button
                      onClick={handleSave}
                      disabled={updateUsernameMutation.isPending}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold">
                      {profile?.username || 'Anonymous User'}
                    </h1>
                    <button
                      onClick={handleEditToggle}
                      className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-blue-100 mt-1">
                  Level {profile?.level} • {getLevelName(profile?.level || 1)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{profile?.points || 0}</p>
                <p className="text-blue-100 text-sm">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{profile?.reviewCount || 0}</p>
                <p className="text-blue-100 text-sm">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{earnedBadges.length}</p>
                <p className="text-blue-100 text-sm">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards - Mobile */}
            <div className="md:hidden grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile?.points || 0}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile?.reviewCount || 0}</p>
                <p className="text-xs text-gray-600">Reviews</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{earnedBadges.length}</p>
                <p className="text-xs text-gray-600">Badges</p>
              </div>
            </div>

            {/* Progress to Next Level */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Level Progress</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Level {profile?.level} ({getLevelName(profile?.level || 1)})
                  </span>
                  <span className="text-gray-600">
                    Level {(profile?.level || 1) + 1} ({getLevelName((profile?.level || 1) + 1)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((profile?.points || 0) % 500) / 5)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  {500 - ((profile?.points || 0) % 500)} points until next level
                </p>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Reviews</h2>
                <Link
                  href="/reviews/new"
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  Write Review
                </Link>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't written any reviews yet</p>
                  <Link
                    href="/map"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Find a Location
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <Link
                              href={`/locations/${review.locationId}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {review.locationName || 'Location'}
                            </Link>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.menuItem}</p>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            {review.verified && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg font-bold text-lg">
                            {review.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges</h2>
              {earnedBadges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Earn badges by writing reviews!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-4 bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-lg"
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {badge.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Badges */}
              {BADGES.filter(b => !earnedBadges.includes(b)).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Locked Badges
                  </p>
                  <div className="space-y-2">
                    {BADGES.filter(b => !earnedBadges.includes(b)).slice(0, 3).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                      >
                        <div className="text-2xl opacity-30">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">
                            {badge.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Member since</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total reviews</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {profile?.reviewCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Verified reviews</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {reviews.filter((r) => r.verified).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Average rating</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {reviews.length > 0
                      ? (
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                          reviews.length
                        ).toFixed(1)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
