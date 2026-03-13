# Programmatic API

Direct programmatic access to coverage report generation with full configuration control. Ideal for integration into build tools, custom CI/CD pipelines, and advanced coverage analysis.

## Capabilities

### Report Class

Main class for generating coverage reports from V8 coverage data.

```javascript { .api }
/**
 * Coverage report generator
 */
class Report {
  /**
   * Create a new Report instance
   * @param options - Configuration options for coverage reporting
   */
  constructor(options: ReportOptions);

  /**
   * Generate and output coverage reports
   * @returns Promise that resolves when reports are complete
   */
  run(): Promise<void>;

  /**
   * Get merged coverage map from all coverage files
   * @returns Promise resolving to Istanbul coverage map
   */
  getCoverageMapFromAllCoverageFiles(): Promise<CoverageMap>;
}
```

**Usage Examples:**

```javascript
const { Report } = require('c8');

// Basic report generation
const report = new Report({
  reporter: ['text', 'html'],
  reportsDirectory: './coverage'
});

await report.run();

// Advanced configuration
const report = new Report({
  reporter: ['html', 'json'],
  reportsDirectory: './coverage',
  tempDirectory: './tmp/coverage',
  include: ['src/**/*.js'],
  exclude: ['**/*.test.js', '**/*.spec.js'],
  watermarks: {
    statements: [70, 90],
    functions: [70, 90],
    branches: [70, 90],
    lines: [70, 90]
  },
  all: true,
  src: ['src', 'lib'],
  skipFull: true
});

await report.run();

// Access coverage data programmatically
const coverageMap = await report.getCoverageMapFromAllCoverageFiles();
const summary = coverageMap.getCoverageSummary();
console.log(`Lines: ${summary.lines.pct}%`);
```

### Report Factory Function

Alternative factory function for creating Report instances.

```javascript { .api }
/**
 * Factory function to create Report instance
 * @param options - Configuration options
 * @returns Report instance
 */
function Report(options: ReportOptions): Report;
```

**Usage Example:**

```javascript
const createReport = require('c8/lib/report');

const report = createReport({
  reporter: ['text'],
  reportsDirectory: './coverage'
});

await report.run();
```

## Configuration Options

### File Filtering Options

Control which files are included in coverage analysis.

```javascript { .api }
interface FileFilteringOptions {
  /** Files/patterns to exclude from coverage */
  exclude?: string | string[];
  /** File extensions to include (default: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx']) */
  extension?: string | string[];
  /** Apply exclusions after source map remapping */
  excludeAfterRemap?: boolean;
  /** Files/patterns to include in coverage */
  include?: string | string[];
  /** Include all source files in coverage */
  all?: boolean;
  /** Source directories to analyze */
  src?: Array<string>;
  /** Allow files outside cwd */
  allowExternal?: boolean;
  /** Exclude node_modules folders */
  excludeNodeModules?: boolean;
}
```

**Usage Examples:**

```javascript
// Include specific patterns
const report = new Report({
  reporter: ['text'],
  include: ['src/**/*.js', 'lib/**/*.js'],
  exclude: ['**/*.test.js', '**/*.spec.js']
});

// Multiple source directories
const report = new Report({
  reporter: ['html'],
  all: true,
  src: ['src', 'lib', 'utils'],
  extension: ['.js', '.ts']
});
```

### Reporter Configuration

Configure coverage report output formats and options.

```javascript { .api }
interface ReporterOptions {
  /** Coverage reporters to use (text, html, json, lcov, etc.) */
  reporter: string[];
  /** Directory where coverage reports will be output */
  reportsDirectory?: string;
  /** Options for specific reporters */
  reporterOptions?: Record<string, Record<string, unknown>>;
  /** Skip files with 100% coverage in output */
  skipFull?: boolean;
}
```

**Usage Examples:**

```javascript
// Multiple reporters with custom options
const report = new Report({
  reporter: ['text', 'html', 'json'],
  reportsDirectory: './coverage',
  reporterOptions: {
    html: {
      subdir: 'html-report'
    },
    text: {
      maxCols: 120
    }
  },
  skipFull: true
});

// Custom reporter options
const report = new Report({
  reporter: ['lcov', 'text-summary'],
  reportsDirectory: './coverage',
  reporterOptions: {
    lcov: {
      projectRoot: process.cwd()
    }
  }
});
```

### Coverage Processing Options

Advanced options for coverage data processing.

```javascript { .api }
interface ProcessingOptions {
  /** Directory for V8 coverage temp files */
  tempDirectory?: string;
  /** Omit non-absolute paths */
  omitRelative?: boolean;
  /** Wrapper prefix byte length */
  wrapperLength?: number;
  /** Base directory for path resolution */
  resolve?: string;
  /** Merge coverage reports asynchronously */
  mergeAsync?: boolean;
}
```

**Usage Examples:**

```javascript
// Custom temp directory and processing
const report = new Report({
  reporter: ['html'],
  tempDirectory: './tmp/v8-coverage',
  resolve: '/app',
  omitRelative: false,
  mergeAsync: true
});

// Wrapper length for instrumented code
const report = new Report({
  reporter: ['text'],
  wrapperLength: 62
});
```

### Coverage Thresholds

Define coverage watermarks for reporting.

```javascript { .api }
interface ThresholdOptions {
  /** Coverage watermark thresholds */
  watermarks?: Partial<{
    statements: Watermark;
    functions: Watermark;
    branches: Watermark;
    lines: Watermark;
  }>;
}

/** Coverage watermark as [low, high] thresholds */
type Watermark = [number, number];
```

**Usage Examples:**

```javascript
// Custom watermarks
const report = new Report({
  reporter: ['html'],
  watermarks: {
    statements: [60, 80],
    functions: [60, 80], 
    branches: [50, 70],
    lines: [60, 80]
  }
});

// Conservative thresholds
const report = new Report({
  reporter: ['text'],
  watermarks: {
    statements: [80, 95],
    functions: [80, 95],
    branches: [70, 90],
    lines: [80, 95]
  }
});
```

## Integration Examples

### Build Tool Integration

```javascript
// webpack.config.js
const { Report } = require('c8');

module.exports = {
  // ... webpack config
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.done.tapAsync('CoverageReport', async (stats, callback) => {
          if (process.env.NODE_ENV === 'test') {
            const report = new Report({
              reporter: ['html', 'json'],
              reportsDirectory: './dist/coverage'
            });
            await report.run();
          }
          callback();
        });
      }
    }
  ]
};
```

### Custom CI/CD Pipeline

```javascript
// ci-coverage.js
const { Report } = require('c8');
const fs = require('fs');

async function generateCoverageReport() {
  const report = new Report({
    reporter: ['json', 'lcov'],
    reportsDirectory: './coverage',
    all: true,
    src: ['src'],
    exclude: ['**/*.test.js']
  });

  await report.run();

  // Read coverage summary
  const coverageData = JSON.parse(
    fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
  );
  
  const linesPct = coverageData.total.lines.pct;
  
  if (linesPct < 90) {
    console.error(`Coverage ${linesPct}% below threshold 90%`);
    process.exit(1);
  }
  
  console.log(`Coverage: ${linesPct}% - PASSED`);
}

generateCoverageReport().catch(console.error);
```

### Coverage Analysis Tool

```javascript
// analyze-coverage.js
const { Report } = require('c8');

async function analyzeCoverage() {
  const report = new Report({
    reporter: ['json'],
    reportsDirectory: './tmp',
    all: true
  });

  // Generate coverage data
  await report.run();
  
  // Get detailed coverage map
  const coverageMap = await report.getCoverageMapFromAllCoverageFiles();
  
  // Analyze each file
  coverageMap.files().forEach(file => {
    const fileCoverage = coverageMap.fileCoverageFor(file);
    const summary = fileCoverage.toSummary();
    
    if (summary.lines.pct < 80) {
      console.log(`Low coverage in ${file}: ${summary.lines.pct}%`);
      
      // Get uncovered lines
      const uncoveredLines = fileCoverage.getUncoveredLines();
      console.log(`Uncovered lines: ${uncoveredLines.join(', ')}`);
    }
  });
}

analyzeCoverage().catch(console.error);
```

## Error Handling

```javascript
const { Report } = require('c8');

async function runCoverage() {
  try {
    const report = new Report({
      reporter: ['html'],
      tempDirectory: './coverage/tmp'
    });
    
    await report.run();
    console.log('Coverage report generated successfully');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Coverage temp directory not found');
    } else if (error.message.includes('No coverage data')) {
      console.error('No coverage data collected - ensure NODE_V8_COVERAGE is set');
    } else {
      console.error('Coverage report failed:', error.message);
    }
    process.exit(1);
  }
}
```

## Advanced Features

### Monocart Integration

```javascript { .api }
interface MonocartOptions {
  /** Enable experimental monocart coverage reports */
  monocartArgv?: object;
}
```

**Usage Example:**

```javascript
// Enable monocart for advanced reporting
const report = new Report({
  reporter: ['html'],
  monocartArgv: {
    name: 'My Project Coverage',
    logging: 'info',
    reports: [
      ['html', { subdir: 'html' }],
      ['lcov', { file: 'lcov.info' }]
    ]
  }
});
```

### Source Map Support

c8 automatically handles source maps for transpiled code. No additional configuration required for TypeScript, JSX, or other transpiled languages.

```javascript
// Works automatically with TypeScript
const report = new Report({
  reporter: ['html'],
  include: ['src/**/*.ts'],
  extension: ['.ts', '.js']
});

// Apply exclusions after source map remapping
const report = new Report({
  reporter: ['text'],
  excludeAfterRemap: true,
  exclude: ['**/*.spec.ts']
});
```