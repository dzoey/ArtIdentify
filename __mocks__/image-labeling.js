// Mock @react-native-ml-kit/image-labeling
module.exports = {
  label: jest.fn().mockResolvedValue([
    { text: 'Painting', confidence: 0.92 },
    { text: 'Sculpture', confidence: 0.85 },
    { text: 'Portrait', confidence: 0.78 },
  ]),
};