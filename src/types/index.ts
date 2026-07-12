// Core type definitions for the ArtIdentify app

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  // Art-specific enrichment fields (filled in by the info service)
  artist?: string;
  title?: string;
  date?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  provenance?: string;
  culturalSignificance?: string;
  criticalReception?: string;
  sourceUrl?: string;
  imageUrl?: string;
}

export interface ScanRecord {
  id: string;
  timestamp: number;
  photoUri: string;
  location?: LocationData;
  detectedObjects: DetectedObject[];
  selectedObjectId?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  timestamp: number;
  // Reverse-geocoded venue info (filled by the info service)
  venueName?: string;
  venueType?: string;
  address?: string;
}

export interface MuseumCollection {
  name: string;
  location: { lat: number; lng: number; radius: number }; // meters
  apiEndpoint?: string;
}

export type InfoSource = 'wikipedia' | 'wikidata' | 'museum_api' | 'google_vision' | 'local';

export interface ObjectInfo {
  detectedObject: DetectedObject;
  infoText: string;
  infoSource: InfoSource;
  relatedObjects?: DetectedObject[];
  externalLinks?: { label: string; url: string }[];
}