// Mock react-native-image-resizer
module.exports = {
  default: {
    createResizedImage: jest.fn().mockResolvedValue({ uri: '/tmp/resized.jpg', path: '/tmp/resized.jpg' }),
  },
  createResizedImage: jest.fn().mockResolvedValue({ uri: '/tmp/resized.jpg', path: '/tmp/resized.jpg' }),
};