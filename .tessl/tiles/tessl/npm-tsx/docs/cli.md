# CLI Usage

tsx provides a powerful command-line interface for executing TypeScript files directly without compilation, with support for watch mode, REPL, and various execution options.

## Capabilities

### Direct Execution

Execute TypeScript files directly from the command line.

```bash { .api }
tsx [options] <script> [script-args...]
```

**Options:**
- `--no-cache`: Disable transformation caching
- `--tsconfig <path>`: Custom tsconfig.json path
- `--input-type <type>`: Specify input type for evaluation
- `--test`: Run Node.js built-in test runner
- `--version, -v`: Show version
- `--help, -h`: Show help

**Usage Examples:**

```bash
# Run a TypeScript file
tsx server.ts

# Run with custom tsconfig
tsx --tsconfig ./custom-tsconfig.json app.ts

# Run with arguments passed to script
tsx script.ts --arg1 value1 --arg2 value2

# Disable caching
tsx --no-cache slow-script.ts
```

### Watch Mode

Monitor files for changes and automatically restart execution.

```bash { .api }
tsx watch [options] <script> [script-args...]
```

**Additional Watch Options:**
- `--clear-screen`: Clear screen on restart (default: true)
- `--no-clear-screen`: Disable screen clearing on restart
- `--include <patterns>`: Additional paths & globs to watch
- `--exclude <patterns>`: Paths & globs to exclude from watching
- `--ignore <patterns>`: Paths & globs to exclude from being watched (deprecated: use --exclude)

**Usage Examples:**

```bash
# Basic watch mode
tsx watch server.ts

# Watch with specific include/exclude patterns
tsx watch --include "src/**/*.ts" --exclude "**/*.test.ts" app.ts

# Disable screen clearing
tsx watch --no-clear-screen server.ts
```

### Evaluation Mode

Execute TypeScript code directly from command line.

```bash { .api }
tsx -e <code>
tsx --eval <code>
tsx -p <code>
tsx --print <code>
```

**Usage Examples:**

```bash
# Execute TypeScript code
tsx -e "console.log('Hello from TypeScript!')"

# Print expression result
tsx -p "Math.PI * 2"

# Execute with imports
tsx -e "import fs from 'fs'; console.log(fs.readdirSync('.'))"
```

### REPL Mode

Interactive TypeScript REPL with enhanced features.

```bash { .api }
tsx
```

The REPL provides:
- TypeScript syntax support
- Import statement support
- Automatic transformation
- Standard Node.js REPL features

**Usage Examples:**

```bash
# Start REPL
tsx

# In REPL:
> const name: string = "tsx"
> console.log(`Hello ${name}!`)
> import fs from 'fs'
> fs.readdirSync('.')
```

### Test Runner Integration

Integration with Node.js built-in test runner for executing TypeScript test files.

```bash { .api }
tsx --test [test-patterns...]
```

**Features:**
- Automatically discovers and runs TypeScript test files
- Supports Node.js built-in test runner patterns and options
- Works with `.test.ts`, `.test.js`, and other test file patterns
- Can be combined with other tsx options like `--no-cache` and `--tsconfig`

**Usage Examples:**

```bash
# Run all TypeScript test files
tsx --test

# Run specific test patterns
tsx --test "**/*.test.ts"

# Run tests with custom tsconfig
tsx --test --tsconfig ./test-tsconfig.json

# Run tests with caching disabled
tsx --test --no-cache

# Run tests with watch mode
tsx watch --test

# Run tests from specific directory
tsx --test "./tests/**/*.test.ts"
```

### Environment Variables

Control tsx behavior through environment variables.

```bash { .api }
TSX_DISABLE_CACHE=1    # Disable transformation caching
TSX_TSCONFIG_PATH=path # Custom tsconfig.json path
```

**Usage Examples:**

```bash
# Run with caching disabled
TSX_DISABLE_CACHE=1 tsx script.ts

# Use custom tsconfig via environment
TSX_TSCONFIG_PATH=./my-config.json tsx app.ts
```

### Signal Handling

tsx properly handles process signals and forwards them to child processes.

**Supported Signals:**
- `SIGINT` (Ctrl+C): Graceful shutdown
- `SIGTERM`: Termination request
- Process exit codes are preserved from child processes

### Node.js Integration

tsx seamlessly integrates with Node.js features:

- **IPC Support**: Maintains IPC channels when spawned from Node.js processes
- **Process Arguments**: Preserves all Node.js arguments and flags
- **Module Resolution**: Works with Node.js module resolution algorithms
- **Source Maps**: Integrates with Node.js source map support

**Usage with Node.js flags:**

```bash
# Use Node.js flags with tsx
node --inspect tsx script.ts
node --experimental-modules tsx app.ts
```