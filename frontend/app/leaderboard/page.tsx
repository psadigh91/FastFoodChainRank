'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/lib/api/leaderboard';
import { Trophy, Medal, Crown, TrendingUp, Star, Award } from 'lucide-react';
import { getLevelName, formatRelativeTime } from '@/lib/utils';

export default function LeaderboardPage() {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.getTop(),
  });

  const { data: myRank } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: () => leaderboardApi.getMyRank(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topUsers = leaderboardData?.users || [];
  const top3 = topUsers.slice(0, 3);
  const rest = topUsers.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
            <p className="text-blue-100 text-lg">
              Top reviewers competing for the crown
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Your Rank Card */}
        {myRank && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-gray-900">#{myRank.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Your Points</p>
                <p className="text-3xl font-bold text-blue-600">{myRank.points}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getLevelName(myRank.level)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reviews</span>
                <span className="font-semibold">{myRank.reviewCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="mb-12">
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="text-center">
                <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg p-6 relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Medal className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-4xl font-bold text-white">2</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-lg">
                  <p className="font-semibold text-gray-900 truncate">
                    {top3[1].username || 'User ' + top3[1].userId.slice(0, 8)}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {top3[1].points}
                  </p>
                  <p className="text-sm text-gray-500">{top3[1].reviewCount} reviews</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="text-center">
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg p-8 relative">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white rounded-full p-4 shadow-xl">
                      <Crown className="w-12 h-12 text-yellow-500" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-5xl font-bold text-white">1</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-b-lg shadow-xl border-2 border-yellow-400">
                  <p className="font-bold text-gray-900 text-lg truncate">
                    {top3[0].username || 'User ' + top3[0].userId.slice(0, 8)}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {top3[0].points}
                  </p>
                  <p className="text-sm text-gray-500">{top3[0].reviewCount} reviews</p>
                  <div className="mt-3 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    <Trophy className="w-3 h-3 mr-1" />
                    Champion
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="text-center">
                <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg p-6 relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Medal className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-4xl font-bold text-white">3</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-lg">
                  <p className="font-semibold text-gray-900 truncate">
                    {top3[2].username || 'User ' + top3[2].userId.slice(0, 8)}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {top3[2].points}
                  </p>
                  <p className="text-sm text-gray-500">{top3[2].reviewCount} reviews</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of Leaderboard */}
        {rest.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Rankings</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {rest.map((user, index) => {
                const rank = index + 4; // Starting from 4th place
                return (
                  <div
                    key={user.userId}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {rank}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.username || `User ${user.userId.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Level {user.level} • {user.reviewCount} reviews
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {user.points}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {topUsers.length}
            </p>
            <p className="text-sm text-gray-600">Active Reviewers</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {topUsers.reduce((sum, u) => sum + u.reviewCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {topUsers[0]?.points || 0}
            </p>
            <p className="text-sm text-gray-600">Highest Score</p>
          </div>
        </div>

        {/* How Points Work */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📊 How Points Work</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Review with receipt verification:</span>
              <span className="font-semibold">10 points</span>
            </div>
            <div className="flex justify-between">
              <span>Review without receipt:</span>
              <span className="font-semibold">5 points</span>
            </div>
            <div className="flex justify-between">
              <span>Level up requirements:</span>
              <span className="font-semibold">50, 200, 500, 1000, 2500 points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
