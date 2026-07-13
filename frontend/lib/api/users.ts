import { apiClient } from './client';

export interface UserProfile {
  userId: string;
  username?: string;
  email: string;
  points: number;
  level: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
}

export const usersApi = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put('/users/me', updates);
    return response.data;
  },
};
