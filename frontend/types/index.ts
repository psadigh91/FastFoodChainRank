// ========== Location Types ==========

export interface Location {
  locationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  chain: string;
  phone?: string;
  hours?: string;
  averageRating: number;
  reviewCount: number;
  menuItems: Record<string, MenuItemRating>;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Added by nearby API
}

export interface MenuItemRating {
  avgRating: number;
  count: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'burrito' | 'bowl' | 'tacos' | 'other';
  protein: 'chicken' | 'steak' | 'carnitas' | 'barbacoa' | 'veggie';
}

// ========== Review Types ==========

export interface Review {
  reviewId: string;
  userId: string;
  locationId: string;
  menuItem: string;
  rating: number; // 1-10
  comment?: string;
  receiptUrl?: string;
  verified: boolean;
  verificationDetails?: {
    locationMatched: boolean;
    dateMatched: boolean;
    confidence: number;
  };
  createdAt: string;
  updatedAt: string;
  // Populated from other tables
  user?: User;
  location?: Location;
}

export interface CreateReviewInput {
  locationId: string;
  menuItem: string;
  rating: number;
  comment?: string;
  receiptUrl?: string;
}

// ========== User Types ==========

export interface User {
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  points: number;
  level: number;
  badges: string[];
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserInput {
  username?: string;
  firstName?: string;
  lastName?: string;
}

// ========== Leaderboard Types ==========

export interface LeaderboardEntry {
  userId: string;
  username: string;
  city: string;
  points: number;
  reviewCount: number;
  badges: string[];
  rank: number;
  lastUpdated: string;
}

// ========== Badge Types ==========

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type:
      | 'review_count'
      | 'streak_days'
      | 'unique_locations'
      | 'photo_reviews'
      | 'detailed_reviews'
      | 'rank'
      | 'perfect_ratings'
      | 'category_reviews'
      | 'city_reviews';
    value: number;
    category?: string;
    city?: string;
  };
}

// ========== Receipt Types ==========

export interface ReceiptUploadResponse {
  receiptUrl: string;
  uploadUrl: string; // Presigned URL
  expiresIn: number;
}

export interface ReceiptVerificationResponse {
  verified: boolean;
  confidence: number;
  locationMatched: boolean;
  dateMatched: boolean;
  extractedText: string[];
  message: string;
}

// ========== API Response Types ==========

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  nextToken?: string;
}

// ========== Map Types ==========

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface LocationMarker {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  averageRating: number;
  reviewCount: number;
}

// ========== Form Types ==========

export interface ReviewFormData {
  locationId: string;
  menuItem: string;
  rating: number;
  comment: string;
  receiptFile?: File;
}

// ========== Filter Types ==========

export interface LocationFilters {
  chain?: string;
  city?: string;
  minRating?: number;
}

export interface ReviewFilters {
  locationId?: string;
  userId?: string;
  menuItem?: string;
  minRating?: number;
  verified?: boolean;
}
