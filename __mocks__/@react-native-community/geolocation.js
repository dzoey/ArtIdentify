// Mock @react-native-community/geolocation
module.exports = {
  getCurrentPosition: jest.fn((success, error) => {
    success({
      coords: {
        latitude: 38.8913,
        longitude: -77.0197,
        accuracy: 10,
        altitude: 20,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  setRNConfiguration: jest.fn(),
};