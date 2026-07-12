// Mock react-native-safe-area-context
const React = require('react');
const { View } = require('react-native');

module.exports = {
  SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
  SafeAreaView: ({ children }) => React.createElement(View, null, children),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};