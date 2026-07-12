// __tests__/MuseumLocations.test.ts
// Tests for the museum GPS cross-referencing logic

import {findNearestVenue, getAllKnownVenues} from '../src/services/MuseumLocations';
import type {LocationData} from '../src/types';

describe('MuseumLocations', () => {
  describe('getAllKnownVenues', () => {
    it('should return a list of known venues', () => {
      const venues = getAllKnownVenues();
      expect(venues).toBeDefined();
      expect(venues.length).toBeGreaterThan(5);
    });

    it('should include the National Gallery of Art', () => {
      const venues = getAllKnownVenues();
      const nga = venues.find(v => v.name === 'National Gallery of Art');
      expect(nga).toBeDefined();
      expect(nga!.location.lat).toBeCloseTo(38.8913, 3);
      expect(nga!.location.lng).toBeCloseTo(-77.0197, 3);
    });

    it('should include the Metropolitan Museum of Art with an API endpoint', () => {
      const venues = getAllKnownVenues();
      const met = venues.find(v => v.name === 'Metropolitan Museum of Art');
      expect(met).toBeDefined();
      expect(met!.apiEndpoint).toContain('metmuseum.org');
    });

    it('should include international museums', () => {
      const venues = getAllKnownVenues();
      const names = venues.map(v => v.name);
      expect(names).toContain('Louvre');
      expect(names).toContain('British Museum');
      expect(names).toContain('Uffizi Gallery');
      expect(names).toContain('Rijksmuseum');
    });

    it('should have a valid radius for each venue', () => {
      const venues = getAllKnownVenues();
      venues.forEach(v => {
        expect(v.location.radius).toBeGreaterThan(50);
        expect(v.location.radius).toBeLessThan(1000);
      });
    });
  });

  describe('findNearestVenue', () => {
    it('should find the National Gallery of Art when nearby', () => {
      const location: LocationData = {
        latitude: 38.8913,
        longitude: -77.0197,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).not.toBeNull();
      expect(venue!.name).toBe('National Gallery of Art');
    });

    it('should find the Met when at the Met', () => {
      const location: LocationData = {
        latitude: 40.7794,
        longitude: -73.9632,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).not.toBeNull();
      expect(venue!.name).toBe('Metropolitan Museum of Art');
    });

    it('should find the Louvre when in Paris', () => {
      const location: LocationData = {
        latitude: 48.8606,
        longitude: 2.3376,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).not.toBeNull();
      expect(venue!.name).toBe('Louvre');
    });

    it('should return null when not near any known venue', () => {
      // Somewhere in rural Kansas
      const location: LocationData = {
        latitude: 38.5,
        longitude: -98.0,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).toBeNull();
    });

    it('should return null for coordinates in the middle of the ocean', () => {
      const location: LocationData = {
        latitude: 0,
        longitude: 0,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).toBeNull();
    });

    it('should still find a venue when slightly offset but within radius', () => {
      // NGA with a small offset (still within 200m radius)
      const location: LocationData = {
        latitude: 38.8915,
        longitude: -77.0195,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).not.toBeNull();
      expect(venue!.name).toBe('National Gallery of Art');
    });

    it('should not find a venue when just outside the radius', () => {
      // ~300m away from NGA, outside its 200m radius
      const location: LocationData = {
        latitude: 38.8940,
        longitude: -77.0197,
        timestamp: Date.now(),
      };
      const venue = findNearestVenue(location);
      expect(venue).toBeNull();
    });
  });
});