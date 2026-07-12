// Mock react-native-screens
const React = require('react');
const { View } = require('react-native');
module.exports = {
  Screen: ({ children }) => React.createElement(View, null, children),
  enableScreens: jest.fn(),
  useReanimatedTransitionProgress: () => ({ progress: 1 }),
};