// Mock @react-navigation/native
const React = require('react');
const { View } = require('react-native');

module.exports = {
  NavigationContainer: ({ children }) => React.createElement(View, null, children),
  DarkTheme: { colors: {} },
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getParent: () => ({
      navigate: jest.fn(),
    }),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
};