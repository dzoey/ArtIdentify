// __tests__/InfoService.test.ts
// Tests for the Wikipedia + museum API info retrieval service

import {isArtRelated, getObjectInfo} from '../src/services/InfoService';
import type {DetectedObject, LocationData} from '../src/types';

// Mock global fetch
const mockFetch = globalThis.fetch as jest.MockedFunction<typeof fetch>;

function makeDetectedObject(label: string, confidence: number = 0.9): DetectedObject {
  return {
    id: 'obj-1',
    label,
    confidence,
    boundingBox: { x: 50, y: 50, width: 200, height: 200 },
  };
}

describe('InfoService', () => {
  describe('isArtRelated', () => {
    it('should identify "painting" as art-related', () => {
      expect(isArtRelated('painting')).toBe(true);
    });

    it('should identify "sculpture" as art-related', () => {
      expect(isArtRelated('sculpture')).toBe(true);
    });

    it('should identify "portrait" as art-related', () => {
      expect(isArtRelated('portrait')).toBe(true);
    });

    it('should identify "vase" as art-related', () => {
      expect(isArtRelated('vase')).toBe(true);
    });

    it('should identify "altar" as art-related', () => {
      expect(isArtRelated('altar')).toBe(true);
    });

    it('should identify "triptych" as art-related', () => {
      expect(isArtRelated('triptych')).toBe(true);
    });

    it('should identify "engraving" as art-related', () => {
      expect(isArtRelated('engraving')).toBe(true);
    });

    it('should not identify "car" as art-related', () => {
      expect(isArtRelated('car')).toBe(false);
    });

    it('should not identify "dog" as art-related', () => {
      expect(isArtRelated('dog')).toBe(false);
    });

    it('should not identify "coffee" as art-related', () => {
      expect(isArtRelated('coffee')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isArtRelated('PAINTING')).toBe(true);
      expect(isArtRelated('Sculpture')).toBe(true);
    });

    it('should match partial strings', () => {
      expect(isArtRelated('oil painting on canvas')).toBe(true);
      expect(isArtRelated('marble sculpture')).toBe(true);
    });
  });

  describe('getObjectInfo', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should return info text from Wikipedia', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'standard',
          extract: 'A painting is a form of visual art...',
        }),
      } as any);

      const obj = makeDetectedObject('Painting');
      const result = await getObjectInfo(obj, null);

      expect(result.infoText).toContain('painting');
      expect(result.infoSource).toBe('wikipedia');
    });

    it('should include confidence info in the result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'standard',
          extract: 'A sculpture is...',
        }),
      } as any);

      const obj = makeDetectedObject('Sculpture', 0.85);
      const result = await getObjectInfo(obj, null);

      expect(result.infoText).toContain('85%');
      expect(result.infoText).toContain('Sculpture');
    });

    it('should include external links from Wikipedia', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'standard',
          extract: 'Art info...',
        }),
      } as any);

      const obj = makeDetectedObject('Painting');
      const result = await getObjectInfo(obj, null);

      expect(result.externalLinks).toBeDefined();
      expect(result.externalLinks!.length).toBeGreaterThan(0);
      expect(result.externalLinks![0].label).toBe('Wikipedia');
      expect(result.externalLinks![0].url).toContain('wikipedia.org');
    });

    it('should add location context when at a known museum', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'standard',
          extract: 'Painting info...',
        }),
      } as any);

      const location: LocationData = {
        latitude: 38.8913,
        longitude: -77.0197,
        timestamp: Date.now(),
      };

      const obj = makeDetectedObject('Painting');
      const result = await getObjectInfo(obj, location);

      // The info text should mention the museum name
      expect(result.infoText).toContain('National Gallery of Art');
    });

    it('should handle Wikipedia disambiguation pages', async () => {
      // First call returns disambiguation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'disambiguation',
        }),
      } as any);
      // Search call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pages: [
            { key: 'Painting_(art)', title: 'Painting', snippet: 'Painting is art' },
          ],
        }),
      } as any);
      // Summary call for the found page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'standard',
          extract: 'Painting is a form of visual art.',
        }),
      } as any);

      const obj = makeDetectedObject('Painting');
      const result = await getObjectInfo(obj, null);

      expect(result.infoText).toContain('Painting is a form of visual art');
    });

    it('should handle fetch failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const obj = makeDetectedObject('Painting');
      const result = await getObjectInfo(obj, null);

      expect(result.infoText).toBeDefined();
      expect(result.infoText).toContain('Unable');
    });

    it('should handle non-ok HTTP responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);
      // Search fallback
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pages: [],
        }),
      } as any);

      const obj = makeDetectedObject('ObscureArt');
      const result = await getObjectInfo(obj, null);

      expect(result.infoText).toBeDefined();
    });
  });
});