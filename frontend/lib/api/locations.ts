import { apiClient } from './client';
import { Location, LocationFilters } from '@/types';

export const locationsApi = {
  // Get all locations
  async getAll(filters?: LocationFilters): Promise<{ locations: Location[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.chain) params.append('chain', filters.chain);
    if (filters?.city) params.append('city', filters.city);

    const url = `/locations${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  },

  // Get nearby locations
  async getNearby(
    lat: number,
    lng: number,
    radius = 20
  ): Promise<{
    locations: Location[];
    count: number;
    searchRadius: number;
    center: { lat: number; lng: number };
  }> {
    return apiClient.get(`/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },

  // Get location by ID
  async getById(locationId: string): Promise<Location> {
    return apiClient.get(`/locations/${locationId}`);
  },

  // Get reviews for a location
  async getReviews(locationId: string) {
    return apiClient.get(`/locations/${locationId}/reviews`);
  },
};
