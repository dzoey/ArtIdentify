// Mock react-native-vector-icons
module.exports = new Proxy({}, { get: () => 'Icon' });
module.exports.default = module.exports;