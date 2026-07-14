// __tests__/DetectionService.test.ts
// Tests for the on-device ML Kit detection + fallback logic

import {detectObjects} from '../src/services/DetectionService';

describe('DetectionService', () => {
  describe('detectObjects', () => {
    it('should return an array of detected objects', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      expect(result).toBeDefined();
      expect(result.objects).toBeDefined();
      expect(Array.isArray(result.objects)).toBe(true);
    });

    it('should include processing time', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      expect(result.processingTime).toBeDefined();
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should return objects with required fields', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      if (result.objects.length > 0) {
        const obj = result.objects[0];
        expect(obj.id).toBeDefined();
        expect(obj.label).toBeDefined();
        expect(obj.confidence).toBeDefined();
        expect(obj.boundingBox).toBeDefined();
        expect(obj.boundingBox.x).toBeDefined();
        expect(obj.boundingBox.y).toBeDefined();
        expect(obj.boundingBox.width).toBeDefined();
        expect(obj.boundingBox.height).toBeDefined();
      }
    });

    it('should return objects with unique IDs', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      const ids = result.objects.map(o => o.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return confidence values between 0 and 1', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      result.objects.forEach(obj => {
        expect(obj.confidence).toBeGreaterThanOrEqual(0);
        expect(obj.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should return reasonable bounding box values', async () => {
      const result = await detectObjects('file:///tmp/test-photo.jpg');
      result.objects.forEach(obj => {
        expect(obj.boundingBox.width).toBeGreaterThan(0);
        expect(obj.boundingBox.height).toBeGreaterThan(0);
      });
    });
  });
});