# Command Line Interface

Complete command-line interface for code coverage including instrumentation, report generation, and threshold checking. Supports all major Istanbul reporters and advanced features like source map handling.

## Capabilities

### Basic Coverage Collection

Instrument and collect coverage for any Node.js script or command.

```bash { .api }
# Run a script with coverage
c8 [options] <command> [command-options]

# Examples
c8 node script.js
c8 npm test
c8 mocha test/*.js
c8 --reporter=html --reporter=text npm test
```

**Usage Examples:**

```bash
# Basic usage - runs script.js and outputs text coverage report
c8 node script.js

# Multiple reporters
c8 --reporter=html --reporter=json npm test

# Custom output directory
c8 --reports-dir=./my-coverage npm test

# Include all source files (not just tested ones)
c8 --all npm test
```

### Report Generation

Generate coverage reports from existing V8 coverage data.

```bash { .api }
# Generate reports from existing coverage data
c8 report [options]
```

**Usage Examples:**

```bash
# Generate default text report
c8 report

# Generate HTML report
c8 report --reporter=html

# Custom output directory
c8 report --reports-dir=./coverage --reporter=html
```

### Coverage Threshold Checking

Check coverage against specified thresholds and fail if coverage is insufficient.

```bash { .api }
# Check coverage thresholds
c8 check-coverage [options]

# Combine with test execution
c8 --check-coverage [options] <command>
```

**Usage Examples:**

```bash
# Check that lines, functions, and branches are at least 95%
c8 check-coverage --lines 95 --functions 95 --branches 95

# Run tests and check coverage in one command
c8 --check-coverage --lines 90 npm test

# Check coverage per file
c8 check-coverage --per-file --lines 80

# Shortcut for 100% coverage
c8 --100 npm test
```

## Configuration Options

### Reporter Options

Control coverage report format and output location.

```bash { .api }
# Reporter selection
--reporter, -r <reporter>          # Reporter type (text, html, json, etc.)
--reports-dir, -o <directory>      # Output directory (default: ./coverage)
--skip-full                        # Hide files with 100% coverage
```

### File Inclusion/Exclusion

Control which files are included in coverage analysis.

```bash { .api }
# File filtering
--include, -n <pattern>            # Include files matching pattern
--exclude, -x <pattern>            # Exclude files matching pattern  
--extension, -e <extension>        # File extensions to cover
--exclude-after-remap, -a          # Apply exclusions after source maps
--exclude-node-modules             # Exclude node_modules (default: true)
--all                              # Include all source files
--src <directory>                  # Source directories to analyze
```

**Usage Examples:**

```bash
# Include only specific files
c8 --include='src/**/*.js' npm test

# Exclude test files
c8 --exclude='**/*.test.js' --exclude='**/*.spec.js' npm test

# Multiple source directories
c8 --all --src=src --src=lib npm test

# Include TypeScript files
c8 --extension=.ts --extension=.js npm test
```

### Coverage Thresholds

Set minimum coverage requirements.

```bash { .api }
# Coverage thresholds
--check-coverage                   # Enable threshold checking
--branches <number>                # Branch coverage threshold (default: 0)
--functions <number>               # Function coverage threshold (default: 0)  
--lines <number>                   # Line coverage threshold (default: 90)
--statements <number>              # Statement coverage threshold (default: 0)
--per-file                         # Check thresholds per file
--100                              # Shortcut for 100% coverage
```

### Technical Options

Advanced configuration for coverage collection and processing.

```bash { .api }
# Technical configuration
--temp-directory <directory>       # V8 coverage data directory
--clean                            # Clean temp files before execution (default: true)
--resolve <directory>              # Base directory for path resolution
--wrapper-length <number>          # Wrapper prefix byte length
--omit-relative                    # Omit non-absolute paths (default: true)
--allow-external                   # Allow files outside cwd
--merge-async                      # Merge coverage reports asynchronously
--experimental-monocart            # Use Monocart coverage reports
```

### Configuration Files

c8 supports configuration via files and package.json.

```bash { .api }
# Configuration file
--config, -c <file>                # Path to JSON configuration file
```

**Supported configuration files:**
- `.c8rc`
- `.c8rc.json`  
- `.nycrc`
- `.nycrc.json`
- `package.json` (in `c8` section)

**Example .c8rc.json:**

```json
{
  "reporter": ["text", "html"],
  "reports-dir": "./coverage",
  "all": true,
  "include": ["src/**/*.js"],
  "exclude": ["**/*.test.js"],
  "check-coverage": true,
  "lines": 90,
  "functions": 90,
  "branches": 90
}
```

**Example package.json section:**

```json
{
  "c8": {
    "reporter": ["text", "html"],
    "all": true,
    "include": ["src/**/*.js"],
    "exclude": ["**/*.test.js"]
  }
}
```

## Environment Variables

```bash { .api }
NODE_V8_COVERAGE                   # Default temp directory for coverage data
EXPERIMENTAL_MONOCART              # Enable monocart coverage reports
```

## Supported Reporters

c8 supports all Istanbul reporters:

- `text` - Console text output (default)
- `html` - HTML coverage report
- `json` - JSON coverage data
- `lcov` - LCOV format
- `text-summary` - Brief text summary
- `cobertura` - Cobertura XML format
- `teamcity` - TeamCity service messages
- `clover` - Clover XML format

## Error Handling

Coverage threshold failures exit with code 1:

```bash
ERROR: Coverage for lines (85%) does not meet global threshold (90%)
ERROR: Coverage for functions (70%) does not meet threshold (80%) for src/utils.js
```

Missing dependencies or configuration errors are reported with descriptive messages and appropriate exit codes.