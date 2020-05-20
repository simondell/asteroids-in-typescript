module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^/src/(.*)\.js$': '<rootDir>/src/$1.ts',
    '^/src/libs/(.*)\.js$': '<rootDir>/src/libs/$1.ts',
    '^\./libs/(.*)\.js$': '<rootDir>/src/libs/$1.ts',
  }
};