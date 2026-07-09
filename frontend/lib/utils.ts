import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to human-readable string
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Calculate relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(d);
}

// Format rating (e.g., 8.5 → "8.5/10")
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}/10`;
}

// Get rating color class based on value
export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-600';
  if (rating >= 6) return 'text-yellow-600';
  if (rating >= 4) return 'text-orange-600';
  return 'text-red-600';
}

// Get rating background color class
export function getRatingBgColor(rating: number): string {
  if (rating >= 8) return 'bg-green-100';
  if (rating >= 6) return 'bg-yellow-100';
  if (rating >= 4) return 'bg-orange-100';
  return 'bg-red-100';
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Format distance (e.g., 1.5 → "1.5 mi")
export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'nearby';
  return `${miles.toFixed(1)} mi`;
}

// Get level name from level number
export function getLevelName(level: number): string {
  if (level === 1) return 'Novice';
  if (level === 2) return 'Explorer';
  if (level === 3) return 'Enthusiast';
  if (level === 4) return 'Expert';
  if (level === 5) return 'Master';
  if (level >= 6) return 'Legend';
  return 'Unknown';
}

// Calculate level from points
export function calculateLevel(points: number): number {
  if (points < 50) return 1;
  if (points < 200) return 2;
  if (points < 500) return 3;
  if (points < 1000) return 4;
  if (points < 2500) return 5;
  return 6;
}

// Calculate progress to next level
export function getLevelProgress(points: number): {
  currentLevel: number;
  nextLevel: number;
  currentPoints: number;
  pointsNeeded: number;
  progress: number; // 0-100
} {
  const levels = [
    { level: 1, threshold: 0 },
    { level: 2, threshold: 50 },
    { level: 3, threshold: 200 },
    { level: 4, threshold: 500 },
    { level: 5, threshold: 1000 },
    { level: 6, threshold: 2500 },
  ];

  let currentLevel = 1;
  let nextLevel = 2;
  let currentThreshold = 0;
  let nextThreshold = 50;

  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].threshold) {
      currentLevel = levels[i].level;
      currentThreshold = levels[i].threshold;

      if (i + 1 < levels.length) {
        nextLevel = levels[i + 1].level;
        nextThreshold = levels[i + 1].threshold;
      }
    }
  }

  const pointsInCurrentLevel = points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progress = Math.min(100, (pointsInCurrentLevel / pointsNeeded) * 100);

  return {
    currentLevel,
    nextLevel,
    currentPoints: pointsInCurrentLevel,
    pointsNeeded,
    progress,
  };
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Pluralize word based on count
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Parse menu item ID to readable name
export function parseMenuItem(itemId: string): string {
  return itemId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get menu item category
export function getMenuItemCategory(itemId: string): string {
  if (itemId.includes('burrito')) return 'Burrito';
  if (itemId.includes('bowl')) return 'Bowl';
  if (itemId.includes('tacos')) return 'Tacos';
  return 'Other';
}

// Get menu item protein
export function getMenuItemProtein(itemId: string): string {
  if (itemId.includes('chicken')) return 'Chicken';
  if (itemId.includes('steak')) return 'Steak';
  if (itemId.includes('carnitas')) return 'Carnitas';
  if (itemId.includes('barbacoa')) return 'Barbacoa';
  if (itemId.includes('veggie')) return 'Veggie';
  return 'Unknown';
}
