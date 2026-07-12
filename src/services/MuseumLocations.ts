import type {LocationData, MuseumCollection} from '../types';

// Known museums and galleries with their GPS coordinates and search radius
// This lets us narrow the search space when the user is at a known venue
const KNOWN_VENUES: MuseumCollection[] = [
  {
    name: 'National Gallery of Art',
    location: {lat: 38.8913, lng: -77.0197, radius: 200},
    apiEndpoint: 'https://api.nga.gov/iiif/v2/',
  },
  {
    name: 'Smithsonian American Art Museum',
    location: {lat: 38.8974, lng: -77.0251, radius: 200},
  },
  {
    name: 'Metropolitan Museum of Art',
    location: {lat: 40.7794, lng: -73.9632, radius: 250},
    apiEndpoint: 'https://collectionapi.metmuseum.org/public/collection/v1/',
  },
  {
    name: 'Museum of Modern Art',
    location: {lat: 40.7614, lng: -73.9776, radius: 200},
  },
  {
    name: 'Art Institute of Chicago',
    location: {lat: 41.8796, lng: -87.6237, radius: 250},
  },
  {
    name: 'Louvre',
    location: {lat: 48.8606, lng: 2.3376, radius: 300},
  },
  {
    name: 'British Museum',
    location: {lat: 51.5194, lng: -0.1270, radius: 250},
  },
  {
    name: 'Uffizi Gallery',
    location: {lat: 43.7677, lng: 11.2553, radius: 200},
  },
  {
    name: 'Vatican Museums',
    location: {lat: 41.9065, lng: 12.4536, radius: 300},
  },
  {
    name: 'Rijksmuseum',
    location: {lat: 52.3600, lng: 4.8852, radius: 250},
  },
  {
    name: 'National Gallery London',
    location: {lat: 51.5089, lng: -0.1283, radius: 200},
  },
  {
    name: 'Musee d\'Orsay',
    location: {lat: 48.8600, lng: 2.3266, radius: 200},
  },
];

/**
 * Calculate the Haversine distance between two GPS points (in meters)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest known museum/gallery to the user's location
 */
export function findNearestVenue(
  location: LocationData,
): MuseumCollection | null {
  let nearest: MuseumCollection | null = null;
  let minDistance = Infinity;

  for (const venue of KNOWN_VENUES) {
    const distance = haversineDistance(
      location.latitude,
      location.longitude,
      venue.location.lat,
      venue.location.lng,
    );
    if (distance < venue.location.radius && distance < minDistance) {
      minDistance = distance;
      nearest = venue;
    }
  }

  return nearest;
}

/**
 * Get all known venues (for display/debugging)
 */
export function getAllKnownVenues(): MuseumCollection[] {
  return KNOWN_VENUES;
}