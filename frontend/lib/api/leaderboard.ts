import { apiClient } from './client';

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  points: number;
  level: number;
  reviewCount: number;
}

export interface MyRankResponse {
  rank: number;
  points: number;
  level: number;
  reviewCount: number;
}

export const leaderboardApi = {
  async getTop(): Promise<{ users: LeaderboardEntry[] }> {
    const response = await apiClient.get('/leaderboard');
    return response.data;
  },

  async getMyRank(): Promise<MyRankResponse> {
    const response = await apiClient.get('/leaderboard/me');
    return response.data;
  },
};
