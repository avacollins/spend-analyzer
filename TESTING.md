# Testing Documentation

## Setup

This project uses Jest for unit testing with the following setup:

- **Jest**: Testing framework
- **@testing-library/jest-dom**: Additional Jest matchers for DOM testing
- **TypeScript support**: Tests are written in TypeScript

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` directories next to the code they test:

```
src/
  app/
    utils/
      dataTransform.ts
      __tests__/
        dataTransform.test.ts
```

## Data Transform Utility Tests

The `dataTransform.test.ts` file provides comprehensive coverage for:

### `normalizeStringObjects`
- String normalization (trim, uppercase, special character removal)
- Null/undefined value handling
- Custom standardization rules
- Type conversion to strings

### `normalizePoliticalAdData`
- Predefined political ad data standardizations
- Election type normalization (pres → PRESIDENT, etc.)
- Topic standardization
- Preservation of non-standardized values

### `removeDuplicates`
- Duplicate object removal using JSON stringification
- Order preservation (keeps first occurrence)
- Empty array handling
- Object property order sensitivity

### Integration Tests
- Combined normalization and deduplication workflows
- Real-world data transformation scenarios

## Coverage

Current test coverage for `dataTransform.ts`: **100%**
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

## Adding New Tests

When adding new utility functions:

1. Create test files in `__tests__` directories
2. Follow the naming convention: `[filename].test.ts`
3. Import the functions you want to test
4. Use descriptive test names that explain the behavior
5. Test both happy paths and edge cases
6. Aim for high test coverage
