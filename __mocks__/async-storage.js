// Mock @react-native-async-storage/async-storage
let store = {};

module.exports = {
  setItem: jest.fn((key, value) => {
    store[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => {
    return Promise.resolve(store[key] || null);
  }),
  removeItem: jest.fn((key) => {
    delete store[key];
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
  clear: jest.fn(() => {
    store = {};
    return Promise.resolve();
  }),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn(),
  __resetStore: () => { store = {}; },
};