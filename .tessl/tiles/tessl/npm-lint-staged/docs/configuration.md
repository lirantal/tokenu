# Configuration

Flexible configuration system supporting multiple file formats, glob patterns, and both simple command strings and advanced task functions.

## Capabilities

### Configuration Types

lint-staged supports multiple configuration formats and task definition patterns.

```javascript { .api }
type Configuration = 
  | Record<string, string | TaskFunction | GenerateTask | (string | GenerateTask)[]>
  | GenerateTask;

type SyncGenerateTask = (stagedFileNames: string[]) => string | string[];

type AsyncGenerateTask = (stagedFileNames: string[]) => Promise<string | string[]>;

type GenerateTask = SyncGenerateTask | AsyncGenerateTask;

interface TaskFunction {
  title: string;
  task: (stagedFileNames: string[]) => void | Promise<void>;
}
```

### Configuration File Formats

lint-staged automatically discovers configuration from multiple file formats:

**package.json:**
```json
{
  "lint-staged": {
    "*.js": "eslint --fix",
    "*.{json,md}": "prettier --write"
  }
}
```

**.lintstagedrc.json:**
```json
{
  "*.js": ["eslint --fix", "git add"],
  "*.scss": "stylelint --fix",
  "*.md": "prettier --write"
}
```

**.lintstagedrc.js:**
```javascript
export default {
  "*.{js,ts}": ["eslint --fix", "prettier --write"],
  "*.css": "stylelint --fix"
};
```

**lint-staged.config.js:**
```javascript
export default {
  "*.js": (filenames) => [
    `eslint --fix ${filenames.join(" ")}`,
    `prettier --write ${filenames.join(" ")}`
  ]
};
```

**.lintstagedrc.yml:**
```yaml
"*.js": eslint --fix
"*.{json,md}": prettier --write
```

### Simple String Commands

Basic string commands that will be executed with the list of staged files.

**Usage Examples:**

```json
{
  "*.js": "eslint --fix",
  "*.css": "stylelint --fix",
  "*.{json,yml,yaml}": "prettier --write",
  "*.md": "markdownlint --fix"
}
```

**With multiple commands:**
```json
{
  "*.js": ["eslint --fix", "prettier --write", "git add"]
}
```

> **Note**: Using `git add` in task commands is deprecated. All modifications made by tasks are automatically added to the git commit index, so `git add` commands are unnecessary and will show a deprecation warning.

### Generate Task Functions

Functions that receive staged filenames and return command strings dynamically.

```javascript { .api }
/**
 * Synchronous task generator
 * @param stagedFileNames - Array of staged file paths
 * @returns Command string or array of command strings
 */
type SyncGenerateTask = (stagedFileNames: string[]) => string | string[];

/**
 * Asynchronous task generator  
 * @param stagedFileNames - Array of staged file paths
 * @returns Promise resolving to command string or array of command strings
 */
type AsyncGenerateTask = (stagedFileNames: string[]) => Promise<string | string[]>;
```

**Usage Examples:**

```javascript
// Simple generate task
export default {
  "*.js": (filenames) => `eslint --fix ${filenames.join(" ")}`
};

// Multiple commands from generate task
export default {
  "*.js": (filenames) => [
    `eslint --fix ${filenames.join(" ")}`,
    `prettier --write ${filenames.join(" ")}`,
    "git add ."
  ]
};

// Async generate task
export default {
  "*.ts": async (filenames) => {
    const hasTests = filenames.some(f => f.includes('.test.'));
    const commands = [`tsc --noEmit ${filenames.join(" ")}`];
    
    if (hasTests) {
      commands.push("npm test");
    }
    
    return commands;
  }
};

// Conditional logic
export default {
  "*.js": (filenames) => {
    const commands = [`eslint --fix ${filenames.join(" ")}`];
    
    // Only run Prettier on non-minified files
    const nonMinified = filenames.filter(f => !f.includes('.min.'));
    if (nonMinified.length > 0) {
      commands.push(`prettier --write ${nonMinified.join(" ")}`);
    }
    
    return commands;
  }
};
```

### Task Function Objects

Advanced task definitions with custom titles and programmatic execution.

```javascript { .api }
interface TaskFunction {
  /** Display title for the task */
  title: string;
  /** Task execution function */
  task: (stagedFileNames: string[]) => void | Promise<void>;
}
```

**Usage Examples:**

```javascript
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default {
  "*.js": {
    title: "Linting JavaScript files",
    task: async (filenames) => {
      await execAsync(`eslint --fix ${filenames.join(" ")}`);
      console.log(`Linted ${filenames.length} files`);
    }
  },
  
  "*.css": {
    title: "Formatting CSS",
    task: async (filenames) => {
      for (const filename of filenames) {
        await execAsync(`stylelint --fix "${filename}"`);
      }
    }
  }
};
```

### Glob Patterns

lint-staged uses micromatch for glob pattern matching with support for advanced patterns.

**Basic Patterns:**
```json
{
  "*.js": "eslint --fix",
  "*.{css,scss}": "stylelint --fix",
  "*.{json,yml,yaml}": "prettier --write"
}
```

**Advanced Patterns:**
```json
{
  "src/**/*.{js,ts}": "eslint --fix",
  "!src/**/*.test.js": "echo 'Skipping test files'", 
  "packages/*/src/**/*.ts": "tsc --noEmit",
  "**/*.{spec,test}.{js,ts}": "jest --findRelatedTests"
}
```

**Negation Patterns:**
```json
{
  "*.js": "eslint --fix",
  "!dist/**": "echo 'This will never run'",
  "src/**/*.js": ["eslint --fix", "prettier --write"],
  "!src/**/*.min.js": "echo 'Skip minified files'"
}
```

### Configuration Loading

lint-staged automatically discovers configuration files in the following priority order (first found wins):

1. `.lintstagedrc.js` (ES module or CommonJS)
2. `.lintstagedrc.json`
3. `.lintstagedrc.yml` or `.lintstagedrc.yaml`
4. `lint-staged.config.js`
5. `"lint-staged"` field in `package.json`

Configuration discovery stops at the first file found. Use `--config` flag or the `configPath` option to override automatic discovery.

**Programmatic configuration:**
```javascript
import lintStaged from "lint-staged";

// Override automatic discovery
const success = await lintStaged({
  config: {
    "*.js": "eslint --fix",
    "*.css": "stylelint --fix"
  }
});

// Use specific config file
const success = await lintStaged({
  configPath: "./custom-lint-staged.config.js"
});
```

### Complex Configuration Examples

**Monorepo Configuration:**
```javascript
export default {
  "packages/frontend/**/*.{js,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "packages/backend/**/*.js": [
    "eslint --fix", 
    "npm run test:unit --workspace=backend"
  ],
  "packages/shared/**/*.ts": [
    "tsc --noEmit --project packages/shared/tsconfig.json",
    "prettier --write"
  ],
  "*.{json,yml,yaml}": "prettier --write",
  "*.md": "markdownlint --fix"
};
```

**Conditional Task Execution:**
```javascript
import { existsSync } from "fs";

export default {
  "*.{js,ts}": (filenames) => {
    const commands = [];
    
    // Always run ESLint
    commands.push(`eslint --fix ${filenames.join(" ")}`);
    
    // Run TypeScript check if tsconfig exists
    if (existsSync("tsconfig.json")) {
      commands.push("tsc --noEmit");
    }
    
    // Run tests for test files
    const testFiles = filenames.filter(f => f.includes(".test.") || f.includes(".spec."));
    if (testFiles.length > 0) {
      commands.push(`jest ${testFiles.join(" ")}`);
    }
    
    // Format all files
    commands.push(`prettier --write ${filenames.join(" ")}`);
    
    return commands;
  }
};
```

**Performance-Optimized Configuration:**
```javascript
export default {
  // Chunk large numbers of files
  "*.js": (filenames) => {
    const chunks = [];
    const chunkSize = 10;
    
    for (let i = 0; i < filenames.length; i += chunkSize) {
      const chunk = filenames.slice(i, i + chunkSize);
      chunks.push(`eslint --fix ${chunk.join(" ")}`);
    }
    
    return chunks;
  },
  
  // Separate commands for different file types
  "*.css": "stylelint --fix",
  "*.scss": "sass-lint --fix",
  "*.less": "lesshint --fix"
};
```