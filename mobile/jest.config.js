module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    // Order matters — Jest uses the first matching pattern, so the .css rule must come
    // before the @/ alias rule (otherwise "@/global.css" matches @/ first and never reaches
    // this one).
    '\\.css$': '<rootDir>/__mocks__/style-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-router|standard-navigation|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
