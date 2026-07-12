// __tests__/Types.test.ts
// Tests for type integrity and data structures

import type {DetectedObject, LocationData, ScanRecord, ObjectInfo, BoundingBox} from '../src/types';

describe('Types', () => {
  describe('BoundingBox', () => {
    it('should have x, y, width, height fields', () => {
      const box: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      expect(box.x).toBe(0);
      expect(box.y).toBe(0);
      expect(box.width).toBe(100);
      expect(box.height).toBe(100);
    });
  });

  describe('DetectedObject', () => {
    it('should create a valid detected object', () => {
      const obj: DetectedObject = {
        id: 'obj-1',
        label: 'Painting',
        confidence: 0.92,
        boundingBox: { x: 10, y: 20, width: 200, height: 300 },
      };
      expect(obj.id).toBe('obj-1');
      expect(obj.label).toBe('Painting');
      expect(obj.confidence).toBe(0.92);
    });

    it('should support optional enrichment fields', () => {
      const obj: DetectedObject = {
        id: 'obj-1',
        label: 'Painting',
        confidence: 0.92,
        boundingBox: { x: 10, y: 20, width: 200, height: 300 },
        artist: 'Vincent van Gogh',
        title: 'Starry Night',
        date: '1889',
        medium: 'Oil on canvas',
        dimensions: '73.7 × 92.1 cm',
        description: 'A post-impressionist masterpiece',
        provenance: 'Museum of Modern Art, NYC',
        culturalSignificance: 'Iconic painting of the night sky',
        criticalReception: 'Considered Van Gogh\'s magnum opus',
        sourceUrl: 'https://en.wikipedia.org/wiki/The_Starry_Night',
      };
      expect(obj.artist).toBe('Vincent van Gogh');
      expect(obj.title).toBe('Starry Night');
      expect(obj.provenance).toContain('Museum of Modern Art');
    });
  });

  describe('LocationData', () => {
    it('should create a valid location object', () => {
      const loc: LocationData = {
        latitude: 38.8913,
        longitude: -77.0197,
        accuracy: 10,
        altitude: 20,
        timestamp: Date.now(),
      };
      expect(loc.latitude).toBeCloseTo(38.8913);
      expect(loc.longitude).toBeCloseTo(-77.0197);
    });

    it('should support optional venue info', () => {
      const loc: LocationData = {
        latitude: 38.8913,
        longitude: -77.0197,
        timestamp: Date.now(),
        venueName: 'National Gallery of Art',
        venueType: 'Art Museum',
        address: 'Constitution Ave NW, Washington, DC',
      };
      expect(loc.venueName).toBe('National Gallery of Art');
    });
  });

  describe('ScanRecord', () => {
    it('should create a valid scan record', () => {
      const scan: ScanRecord = {
        id: 'scan-1',
        timestamp: Date.now(),
        photoUri: 'file:///tmp/photo.jpg',
        detectedObjects: [
          {
            id: 'obj-1',
            label: 'Painting',
            confidence: 0.92,
            boundingBox: { x: 0, y: 0, width: 100, height: 100 },
          },
        ],
      };
      expect(scan.id).toBe('scan-1');
      expect(scan.detectedObjects).toHaveLength(1);
    });

    it('should support optional location', () => {
      const scan: ScanRecord = {
        id: 'scan-1',
        timestamp: Date.now(),
        photoUri: 'file:///tmp/photo.jpg',
        detectedObjects: [],
        location: {
          latitude: 40.7794,
          longitude: -73.9632,
          timestamp: Date.now(),
        },
      };
      expect(scan.location).toBeDefined();
      expect(scan.location!.latitude).toBeCloseTo(40.7794);
    });
  });

  describe('ObjectInfo', () => {
    it('should create a valid object info object', () => {
      const info: ObjectInfo = {
        detectedObject: {
          id: 'obj-1',
          label: 'Painting',
          confidence: 0.92,
          boundingBox: { x: 0, y: 0, width: 100, height: 100 },
        },
        infoText: 'A painting is a form of visual art.',
        infoSource: 'wikipedia',
        externalLinks: [
          { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Painting' },
        ],
      };
      expect(info.infoText).toContain('painting');
      expect(info.infoSource).toBe('wikipedia');
      expect(info.externalLinks).toHaveLength(1);
    });
  });
});