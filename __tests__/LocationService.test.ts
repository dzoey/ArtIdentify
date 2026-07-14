// __tests__/LocationService.test.ts
// Tests for GPS location acquisition

import {getCurrentLocation, requestLocationPermission} from '../src/services/LocationService';

// The geolocation mock is set up in __mocks__/@react-native-community/geolocation.js
const Geolocation = require('@react-native-community/geolocation');

describe('LocationService', () => {
  describe('getCurrentLocation', () => {
    beforeEach(() => {
      Geolocation.getCurrentPosition.mockClear();
    });

    it('should return location data with latitude and longitude', async () => {
      const location = await getCurrentLocation();
      expect(location).not.toBeNull();
      expect(location!.latitude).toBeDefined();
      expect(location!.longitude).toBeDefined();
    });

    it('should include accuracy and altitude', async () => {
      const location = await getCurrentLocation();
      expect(location!.accuracy).toBeDefined();
      expect(location!.altitude).toBeDefined();
    });

    it('should include a timestamp', async () => {
      const location = await getCurrentLocation();
      expect(location!.timestamp).toBeDefined();
      expect(typeof location!.timestamp).toBe('number');
    });

    it('should return null when geolocation fails', async () => {
      Geolocation.getCurrentPosition.mockImplementationOnce((_success: any, error: any) => {
        error({ code: 1, message: 'Permission denied' });
      });

      const location = await getCurrentLocation();
      expect(location).toBeNull();
    });

    it('should return null when geolocation times out', async () => {
      Geolocation.getCurrentPosition.mockImplementationOnce((_success: any, error: any) => {
        error({ code: 3, message: 'Timeout' });
      });

      const location = await getCurrentLocation();
      expect(location).toBeNull();
    });
  });

  describe('requestLocationPermission', () => {
    it('should return true (mock always grants)', async () => {
      const granted = await requestLocationPermission();
      expect(granted).toBe(true);
    });
  });
});