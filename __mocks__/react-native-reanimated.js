// Mock react-native-reanimated
module.exports = {
  default: {
    createAnimatedComponent: (Component) => Component,
    View: require('react').forwardRef((props, ref) => null),
    Text: require('react').forwardRef((props, ref) => null),
    ScrollView: require('react').forwardRef((props, ref) => null),
  },
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: () => ({}),
  withTiming: (v) => v,
  withSpring: (v) => v,
  withDecay: (v) => v,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  Easing: { linear: {}, ease: {}, bounce: {} },
  FadeIn: {},
  FadeOut: {},
};