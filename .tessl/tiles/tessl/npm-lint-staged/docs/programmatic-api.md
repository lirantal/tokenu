# Programmatic API

Core programmatic interface for running lint-staged from Node.js applications with full control over execution and comprehensive configuration options.

## Capabilities

### Main Function

The primary entry point for programmatic usage of lint-staged.

```javascript { .api }
/**
 * Main lint-staged function for programmatic usage
 * @param options - Configuration options object
 * @param logger - Custom logger instance (defaults to console)
 * @returns Promise resolving to true if all tasks passed, false if some failed
 * @throws Error when failed to some other errors (e.g., configuration compilation errors)
 */
function lintStaged(options?: Options, logger?: Logger): Promise<boolean>;
```

**Usage Examples:**

```javascript
import lintStaged from "lint-staged";

// Basic usage with default options
const success = await lintStaged();
if (success) {
  console.log("All tasks passed!");
} else {
  console.log("Some tasks failed");
  process.exit(1);
}

// With custom configuration
const success = await lintStaged({
  config: {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md}": "prettier --write"
  },
  concurrent: 2,
  verbose: true
});

// With custom logger
const customLogger = {
  log: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

const success = await lintStaged({
  debug: true,
  quiet: false
}, customLogger);
```

### Configuration Options

Comprehensive options for controlling lint-staged behavior.

```javascript { .api }
interface Options {
  /** Allow empty commits when tasks revert all staged changes */
  allowEmpty?: boolean;
  
  /** The number of tasks to run concurrently, or false to run tasks serially */
  concurrent?: boolean | number;
  
  /** Manual task configuration; disables automatic config file discovery when used */
  config?: Configuration;
  
  /** Path to single configuration file; disables automatic config file discovery when used */
  configPath?: string;
  
  /** Working directory to run all tasks in, defaults to current working directory */
  cwd?: string;
  
  /** Whether or not to enable debug output */
  debug?: boolean;
  
  /** Override the default --staged flag of git diff to get list of files. Changing this also implies stash: false */
  diff?: string;
  
  /** Override the default --diff-filter=ACMR flag of git diff to get list of files */
  diffFilter?: string;
  
  /** Maximum argument string length, by default automatically detected */
  maxArgLength?: number;
  
  /** Disable lint-staged's own console output */
  quiet?: boolean;
  
  /** Pass filepaths relative to CWD to tasks, instead of absolute */
  relative?: boolean;
  
  /** Revert to original state in case of errors */
  revert?: boolean;
  
  /** Enable the backup stash, and revert in case of errors. Disabling this also implies hidePartiallyStaged: false */
  stash?: boolean;
  
  /** Whether to hide unstaged changes from partially staged files before running tasks */
  hidePartiallyStaged?: boolean;
  
  /** Show task output even when tasks succeed; by default only failed output is shown */
  verbose?: boolean;
}
```

### Logger Interface

Custom logger interface for controlling output.

```javascript { .api }
type LogFunction = (...params: any) => void;

interface Logger {
  log: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}
```

**Usage Examples:**

```javascript
// File-based logger
import fs from 'fs';

const fileLogger = {
  log: (msg) => fs.appendFileSync('lint-staged.log', `[LOG] ${msg}\n`),
  warn: (msg) => fs.appendFileSync('lint-staged.log', `[WARN] ${msg}\n`),
  error: (msg) => fs.appendFileSync('lint-staged.log', `[ERROR] ${msg}\n`)
};

// Silent logger
const silentLogger = {
  log: () => {},
  warn: () => {},
  error: () => {}
};

// Structured logger
const structuredLogger = {
  log: (msg) => console.log(JSON.stringify({ level: 'info', message: msg, timestamp: Date.now() })),
  warn: (msg) => console.warn(JSON.stringify({ level: 'warn', message: msg, timestamp: Date.now() })),
  error: (msg) => console.error(JSON.stringify({ level: 'error', message: msg, timestamp: Date.now() }))
};
```

### Advanced Usage Patterns

**Custom Working Directory:**

```javascript
import lintStaged from "lint-staged";
import path from "path";

// Run lint-staged in a specific subdirectory
const success = await lintStaged({
  cwd: path.join(process.cwd(), 'packages', 'frontend'),
  config: {
    "*.tsx": "eslint --fix",
    "*.css": "stylelint --fix"
  }
});
```

**Performance Optimization:**

```javascript
// Optimize for large repositories
const success = await lintStaged({
  concurrent: 4, // Run 4 tasks in parallel
  maxArgLength: 4000, // Reduce argument length to prevent command line overflow
  relative: true, // Use relative paths to reduce argument length
  quiet: true // Disable output for better performance
});
```

**Git Workflow Customization:**

```javascript
// Custom git diff settings
const success = await lintStaged({
  diff: "HEAD~1", // Compare against previous commit instead of staged files
  diffFilter: "AM", // Only added and modified files
  stash: false, // Disable stashing since we're not using staged files
  revert: false // Don't revert since no stash
});
```

**Error Handling:**

```javascript
import lintStaged from "lint-staged";

try {
  const success = await lintStaged({
    config: {
      "*.js": "eslint --fix"
    },
    debug: true
  });
  
  if (!success) {
    console.error("Linting failed - some files have errors");
    process.exit(1);
  }
} catch (error) {
  console.error("lint-staged encountered an error:", error.message);
  process.exit(2);
}
```