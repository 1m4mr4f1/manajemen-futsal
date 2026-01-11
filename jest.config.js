// File: jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Arahkan ke folder project Next.js kamu
  dir: './',
})

// Config custom untuk support path alias (@/...)
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)