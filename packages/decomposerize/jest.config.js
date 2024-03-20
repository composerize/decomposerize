module.exports = {
    bail: true,
    verbose: true,
    roots: ['<rootDir>/src/', '<rootDir>/__tests__/'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
