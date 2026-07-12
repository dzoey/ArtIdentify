// Mock @react-navigation/native-stack
const React = require('react');
const { View } = require('react-native');

function createNativeStackNavigator() {
  const Stack = {
    Navigator: ({ children }) => React.createElement(View, null, children),
    Screen: ({ children }) => React.createElement(View, null, children),
    Group: ({ children }) => React.createElement(View, null, children),
  };
  return Stack;
}

module.exports = { createNativeStackNavigator };