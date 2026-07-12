// Mock react-native-vision-camera
const React = require('react');
const { View } = require('react-native');

const Camera = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    takePhoto: jest.fn().mockResolvedValue({
      path: '/tmp/test-photo.jpg',
      width: 1080,
      height: 1920,
    }),
  }));
  return React.createElement(View, { ...props, ref });
});

Camera.requestCameraPermission = jest.fn().mockResolvedValue('granted');

module.exports = {
  Camera,
  useCameraDevice: jest.fn().mockReturnValue({
    id: 'back-camera',
    position: 'back',
    hasFlash: true,
  }),
};