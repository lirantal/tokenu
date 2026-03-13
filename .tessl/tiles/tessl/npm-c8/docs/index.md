# c8

c8 is a native V8 code coverage tool that leverages Node.js' built-in coverage functionality. It provides both a command-line interface and programmatic API for generating coverage reports compatible with Istanbul's reporter ecosystem. The tool can instrument JavaScript code execution, collect coverage data from V8's built-in profiler, and output detailed coverage reports in various formats.

## Package Information

- **Package Name**: c8
- **Package Type**: npm  
- **Language**: JavaScript/Node.js
- **Installation**: `npm install c8`

## Core Imports

```javascript
const { Report } = require("c8");
```

For ES modules:

```javascript
import { Report } from "c8";
```

## Basic Usage

```javascript
const { Report } = require("c8");

// Create a coverage report
const report = new Report({
  reporter: ['text', 'html'],
  reportsDirectory: './coverage',
  tempDirectory: './coverage/tmp'
});

// Generate coverage reports
await report.run();
```

## Architecture

c8 is built around several key components:

- **CLI Interface**: Command-line tool for instrumenting and reporting on code coverage
- **Report Class**: Core programmatic API for generating coverage reports  
- **V8 Coverage Integration**: Native V8 coverage data collection and processing
- **Istanbul Compatibility**: Full compatibility with Istanbul's reporter ecosystem
- **Source Map Support**: Handles source maps for transpiled code (TypeScript, JSX, etc.)

## Capabilities

### Command Line Interface

Complete CLI for code coverage including instrumentation, report generation, and threshold checking. Supports all major Istanbul reporters and advanced features like source map handling.

```bash { .api }
# Basic usage
c8 [options] <command>

# Generate coverage for a script
c8 node script.js

# Check coverage thresholds
c8 check-coverage --lines 95 --functions 95

# Generate reports from existing coverage data
c8 report
```

[Command Line Interface](./cli.md)

### Programmatic API

Direct programmatic access to coverage report generation with full configuration control. Ideal for integration into build tools, custom CI/CD pipelines, and advanced coverage analysis.

```javascript { .api }
class Report {
  constructor(options: ReportOptions);
  run(): Promise<void>;
  getCoverageMapFromAllCoverageFiles(): Promise<CoverageMap>;
}

interface ReportOptions {
  exclude?: string | string[];
  extension?: string | string[];
  excludeAfterRemap?: boolean;
  include?: string | string[];
  reporter: string[];
  reportsDirectory?: string;
  reporterOptions?: Record<string, Record<string, unknown>>;
  tempDirectory?: string;
  watermarks?: Partial<{
    statements: Watermark;
    functions: Watermark;
    branches: Watermark;
    lines: Watermark;
  }>;
  omitRelative?: boolean;
  wrapperLength?: number;
  resolve?: string;
  all?: boolean;
  src?: Array<string>;
  allowExternal?: boolean;
  skipFull?: boolean;
  excludeNodeModules?: boolean;
  mergeAsync?: boolean;
  monocartArgv?: object;
}

type Watermark = [number, number];
```

[Programmatic API](./programmatic.md)

## Types

```javascript { .api }
/**
 * Coverage watermark thresholds as [low, high] values
 */
type Watermark = [number, number];

/**
 * Istanbul coverage map containing coverage data for all files
 */
interface CoverageMap {
  files(): string[];
  fileCoverageFor(filename: string): FileCoverage;
  getCoverageSummary(): CoverageSummary;
  merge(other: CoverageMap): void;
}

/**
 * Coverage data for a single file
 */
interface FileCoverage {
  toSummary(): CoverageSummary;
  getUncoveredLines(): number[];
}

/**
 * Coverage summary statistics
 */
interface CoverageSummary {
  lines: CoverageStats;
  functions: CoverageStats;
  statements: CoverageStats;
  branches: CoverageStats;
}

/**
 * Individual coverage statistics
 */
interface CoverageStats {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

/**
 * Configuration options for Report class
 */
interface ReportOptions {
  /** Files/patterns to exclude from coverage */
  exclude?: string | string[];
  /** File extensions to include */
  extension?: string | string[];
  /** Apply exclusions after source map remapping */
  excludeAfterRemap?: boolean;
  /** Files/patterns to include in coverage */
  include?: string | string[];
  /** Coverage reporters to use (text, html, json, etc.) */
  reporter: string[];
  /** Directory where coverage reports will be output */
  reportsDirectory?: string;
  /** Options for specific reporters */
  reporterOptions?: Record<string, Record<string, unknown>>;
  /** Directory for V8 coverage temp files */
  tempDirectory?: string;
  /** Coverage watermark thresholds */
  watermarks?: Partial<{
    statements: Watermark;
    functions: Watermark;
    branches: Watermark;
    lines: Watermark;
  }>;
  /** Omit non-absolute paths */
  omitRelative?: boolean;
  /** Wrapper prefix byte length */
  wrapperLength?: number;
  /** Base directory for path resolution */
  resolve?: string;
  /** Include all source files in coverage */
  all?: boolean;
  /** Source directories to analyze */
  src?: Array<string>;
  /** Allow files outside cwd */
  allowExternal?: boolean;
  /** Skip files with 100% coverage in output */
  skipFull?: boolean;
  /** Exclude node_modules folders */
  excludeNodeModules?: boolean;
  /** Merge coverage reports asynchronously */
  mergeAsync?: boolean;
  /** Monocart coverage configuration */
  monocartArgv?: object;
}
```