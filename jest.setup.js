// jest.setup.js — global mock for React Native modules

// Mock React Native's PermissionsAndroid
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.PermissionsAndroid = {
    PERMISSIONS: {
      CAMERA: 'android.permission.CAMERA',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
    request: jest.fn().mockResolvedValue('granted'),
    requestMultiple: jest.fn().mockResolvedValue({}),
  };
  return RN;
});

// Global fetch mock
global.fetch = jest.fn();

// Dimensions is mocked via the RN jest preset setup, but we ensure it works
const RN = jest.requireActual('react-native');
RN.Dimensions = {
  get: jest.fn().mockReturnValue({ width: 375, height: 812, scale: 1, fontScale: 1 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};