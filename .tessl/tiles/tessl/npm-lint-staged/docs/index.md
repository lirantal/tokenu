# lint-staged

lint-staged runs linters and formatters against staged git files and prevents broken code from entering your repository. It optimizes performance by processing only changed files and provides both CLI and programmatic Node.js APIs.

## Package Information

- **Package Name**: lint-staged
- **Package Type**: npm
- **Language**: JavaScript (ES Modules) with TypeScript definitions
- **Installation**: `npm install --save-dev lint-staged`
- **Node.js Requirements**: >= 20.17

## Core Imports

```javascript
import lintStaged from "lint-staged";
```

For TypeScript with type imports:

```typescript
import lintStaged, { type Options, type Configuration } from "lint-staged";
```

For CommonJS:

```javascript
const lintStaged = require("lint-staged");
```

## Basic Usage

### CLI Usage

```bash
# Run lint-staged against all staged files
npx lint-staged

# Run with configuration file
npx lint-staged --config .lintstagedrc.json

# Run with debug output
npx lint-staged --debug
```

### Programmatic Usage

```javascript
import lintStaged from "lint-staged";

// Basic usage with default options
const success = await lintStaged();

// With custom options
const success = await lintStaged({
  config: {
    "*.js": "eslint --fix",
    "*.{json,md}": "prettier --write"
  },
  concurrent: true,
  verbose: true
});

console.log(success ? "All tasks passed" : "Some tasks failed");
```

## Architecture

lint-staged is built around several key components:

- **Main API Function**: Single default export function with comprehensive options
- **CLI Interface**: Feature-rich command-line tool with extensive flag support
- **Configuration System**: Flexible configuration loading from multiple file formats
- **Git Workflow Management**: Safe stashing and restoration with error recovery
- **Task Execution Engine**: Concurrent task execution with file chunking for performance
- **Error Handling**: Comprehensive error symbols and recovery mechanisms

## Capabilities

### Programmatic API

Core programmatic interface for running lint-staged from Node.js applications. Provides full control over execution with comprehensive options.

```javascript { .api }
/**
 * Main lint-staged function for programmatic usage
 * @param options - Configuration options
 * @param logger - Custom logger instance
 * @returns Promise resolving to true if all tasks passed, false if some failed
 */
function lintStaged(options?: Options, logger?: Logger): Promise<boolean>;

interface Options {
  allowEmpty?: boolean;
  concurrent?: boolean | number;
  config?: Configuration;
  configPath?: string;
  cwd?: string;
  debug?: boolean;
  diff?: string;
  diffFilter?: string;
  maxArgLength?: number;
  quiet?: boolean;
  relative?: boolean;
  revert?: boolean;
  stash?: boolean;
  hidePartiallyStaged?: boolean;
  verbose?: boolean;
}

interface Logger {
  log: (...params: any) => void;
  warn: (...params: any) => void;
  error: (...params: any) => void;
}
```

[Programmatic API](./programmatic-api.md)

### Command Line Interface

Full-featured CLI with extensive options for customizing behavior, git operations, and output formatting.

```bash { .api }
lint-staged [options]

Options:
  --allow-empty                    allow empty commits when tasks revert all staged changes
  -p, --concurrent <number|boolean> the number of tasks to run concurrently, or false for serial
  -c, --config [path]              path to configuration file, or - to read from stdin
  --cwd [path]                     run all tasks in specific directory, instead of the current
  -d, --debug                      print additional debug information
  --diff [string]                  override the default "--staged" flag of "git diff" to get list of files
  --diff-filter [string]           override the default "--diff-filter=ACMR" flag of "git diff"
  --max-arg-length [number]        maximum length of the command-line argument string
  --no-revert                      do not revert to original state in case of errors
  --no-stash                       disable the backup stash
  --no-hide-partially-staged       disable hiding unstaged changes from partially staged files
  -q, --quiet                      disable lint-staged's own console output
  -r, --relative                   pass relative filepaths to tasks
  -v, --verbose                    show task output even when tasks succeed
```

[CLI Interface](./cli-interface.md)

### Configuration System

Flexible configuration system supporting multiple file formats and programmatic configuration with glob patterns and task definitions.

```javascript { .api }
type Configuration = 
  | Record<string, string | TaskFunction | GenerateTask | (string | GenerateTask)[]>
  | GenerateTask;

type GenerateTask = (stagedFileNames: string[]) => string | string[] | Promise<string | string[]>;

interface TaskFunction {
  title: string;
  task: (stagedFileNames: string[]) => void | Promise<void>;
}
```

[Configuration](./configuration.md)

## Core Types

These types are exported for TypeScript usage and can be imported as shown in the Core Imports section.

```typescript { .api }
interface Options {
  /** Allow empty commits when tasks revert all staged changes */
  allowEmpty?: boolean;
  
  /** The number of tasks to run concurrently, or false to run tasks serially */
  concurrent?: boolean | number;
  
  /** Manual task configuration; disables automatic config file discovery */
  config?: Configuration;
  
  /** Path to single configuration file; disables automatic config file discovery */
  configPath?: string;
  
  /** Working directory to run all tasks in, defaults to current working directory */
  cwd?: string;
  
  /** Whether or not to enable debug output */
  debug?: boolean;
  
  /** Override the default --staged flag of git diff to get list of files */
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
  
  /** Enable the backup stash, and revert in case of errors */
  stash?: boolean;
  
  /** Whether to hide unstaged changes from partially staged files before running tasks */
  hidePartiallyStaged?: boolean;
  
  /** Show task output even when tasks succeed; by default only failed output is shown */
  verbose?: boolean;
}

type LogFunction = (...params: any) => void;

interface Logger {
  log: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}
```