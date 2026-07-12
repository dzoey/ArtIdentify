// __tests__/StorageService.test.ts
// Tests for the AsyncStorage persistence layer

import {saveScan, getAllScans, deleteScan, clearAllScans, getScanById} from '../src/services/StorageService';
import type {ScanRecord} from '../src/types';

// Reset the mock store between tests
beforeEach(() => {
  require('../__mocks__/async-storage').__resetStore();
});

function makeScan(overrides?: Partial<ScanRecord>): ScanRecord {
  return {
    id: 'test-scan-1',
    timestamp: Date.now(),
    photoUri: 'file:///tmp/photo.jpg',
    detectedObjects: [
      {
        id: 'obj-1',
        label: 'Painting',
        confidence: 0.92,
        boundingBox: { x: 50, y: 50, width: 200, height: 300 },
      },
    ],
    ...overrides,
  };
}

describe('StorageService', () => {
  describe('saveScan', () => {
    it('should save a scan record', async () => {
      const scan = makeScan();
      await saveScan(scan);
      const all = await getAllScans();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('test-scan-1');
    });

    it('should prepend new scans to the beginning of the list', async () => {
      await saveScan(makeScan({ id: 'scan-a', timestamp: 1000 }));
      await saveScan(makeScan({ id: 'scan-b', timestamp: 2000 }));
      const all = await getAllScans();
      expect(all).toHaveLength(2);
      expect(all[0].id).toBe('scan-b');
      expect(all[1].id).toBe('scan-a');
    });

    it('should save a scan with location data', async () => {
      const scan = makeScan({
        location: {
          latitude: 38.8913,
          longitude: -77.0197,
          accuracy: 10,
          altitude: 20,
          timestamp: Date.now(),
        },
      });
      await saveScan(scan);
      const all = await getAllScans();
      expect(all[0].location).toBeDefined();
      expect(all[0].location!.latitude).toBeCloseTo(38.8913);
    });
  });

  describe('getAllScans', () => {
    it('should return an empty array when nothing is saved', async () => {
      const all = await getAllScans();
      expect(all).toEqual([]);
    });

    it('should return all saved scans', async () => {
      await saveScan(makeScan({ id: 'scan-1' }));
      await saveScan(makeScan({ id: 'scan-2' }));
      await saveScan(makeScan({ id: 'scan-3' }));
      const all = await getAllScans();
      expect(all).toHaveLength(3);
    });
  });

  describe('getScanById', () => {
    it('should return the scan with the given id', async () => {
      await saveScan(makeScan({ id: 'scan-a' }));
      await saveScan(makeScan({ id: 'scan-b' }));
      const found = await getScanById('scan-b');
      expect(found).not.toBeNull();
      expect(found!.id).toBe('scan-b');
    });

    it('should return null when id does not exist', async () => {
      const found = await getScanById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('deleteScan', () => {
    it('should delete a scan by id', async () => {
      await saveScan(makeScan({ id: 'scan-a' }));
      await saveScan(makeScan({ id: 'scan-b' }));
      await deleteScan('scan-a');
      const all = await getAllScans();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('scan-b');
    });

    it('should not throw when deleting a non-existent id', async () => {
      await expect(deleteScan('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('clearAllScans', () => {
    it('should remove all saved scans', async () => {
      await saveScan(makeScan({ id: 'scan-a' }));
      await saveScan(makeScan({ id: 'scan-b' }));
      await clearAllScans();
      const all = await getAllScans();
      expect(all).toEqual([]);
    });
  });
});