const path = require('path')

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: path.join(__dirname, 'tsconfig.json'),
    },
  },
  testEnvironment: 'node',
  testMatch: [path.join(__dirname, '__tests__/**/*.spec.ts')],
}

