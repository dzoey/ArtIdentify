// Mock @react-navigation/bottom-tabs
const React = require('react');
const { View } = require('react-native');

function createBottomTabNavigator() {
  const Tab = {
    Navigator: ({ children }) => React.createElement(View, null, children),
    Screen: ({ children }) => React.createElement(View, null, children),
  };
  return { Navigator: Tab.Navigator, Screen: Tab.Screen };
}

module.exports = { createBottomTabNavigator };