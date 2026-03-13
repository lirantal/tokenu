# CLI Interface

Command-line interface with comprehensive options for building, watching, and managing projects. The CLI provides extensive configuration options, debug capabilities, and migration utilities for seamless development workflows.

## Capabilities

### CLI Runner

Main CLI execution function that handles command parsing and execution.

```typescript { .api }
/**
 * Run the tsdown CLI with command-line arguments
 */
function runCLI(): Promise<void>;
```

**Basic Usage:**

```bash
# Build with defaults
npx tsdown

# Build specific files
npx tsdown src/index.ts src/cli.ts

# Build with options
npx tsdown --format esm,cjs --dts --sourcemap

# Watch mode
npx tsdown --watch

# Debug mode
npx tsdown --debug
```

### Build Command

Main build command with extensive configuration options.

```bash
tsdown [files...] [options]
```

#### Input Options

```bash
# Entry files
tsdown src/index.ts src/cli.ts

# Configuration
-c, --config <filename>    # Use custom config file
--no-config               # Disable config file

# External dependencies
--external <module>       # Mark dependencies as external

# Source processing
--tsconfig <tsconfig>     # Set tsconfig path
--from-vite [vitest]     # Reuse config from Vite or Vitest
```

#### Output Options

```bash
# Format and output
-f, --format <format>     # Bundle format: esm, cjs, iife, umd (default: esm)
-d, --out-dir <dir>      # Output directory (default: dist)

# Code generation
--dts                    # Generate TypeScript declaration files
--sourcemap             # Generate source maps (default: false)
--minify                # Minify output code

# Build behavior
--clean                 # Clean output directory
--no-clean              # Disable cleaning output directory
--unbundle              # Unbundle mode (mirror input structure)
```

#### Development Options

```bash
# Build target and platform
--target <target>        # Bundle target (e.g., es2015, esnext, node18)
--platform <platform>   # Target platform: node, neutral, browser (default: node)

# Tree-shaking and optimization
--treeshake             # Enable tree-shaking (default: true)
--shims                 # Enable CJS and ESM shims (default: false)

# Environment
--env.* <value>         # Define compile-time env variables
--on-success <command>  # Command to run on success
```

#### Watch and Development

```bash
# Watch mode
-w, --watch [path]      # Enable watch mode
--ignore-watch <path>   # Ignore custom paths in watch mode

# Debugging
--debug [feat]          # Show debug logs (tsdown:* or specific features)
```

#### Quality Assurance

```bash
# Linting and validation
--publint              # Enable publint (default: false)
--attw                 # Enable Are The Types Wrong (default: false)
--unused               # Enable unused dependencies check (default: false)

# Reporting
--report               # Enable size report (default: true)
```

#### Workspace Options

```bash
# Workspace and filtering
-W, --workspace [dir]   # Enable workspace mode
-F, --filter <pattern> # Filter workspace packages (regex or substring)
```

#### Advanced Options

```bash
# Experimental features
--exports              # Generate export metadata for package.json
--copy <dir>          # Copy files to output directory
--public-dir <dir>    # Alias for --copy (deprecated)

# Logging
-l, --logLevel <level> # Set log level: info, warn, error, silent
--fail-on-warn        # Fail on warnings (default: true)
```

**Complete Example:**

```bash
tsdown src/index.ts \
  --format esm,cjs \
  --target node18 \
  --dts \
  --sourcemap \
  --clean \
  --minify \
  --external react,react-dom \
  --env.NODE_ENV=production \
  --publint \
  --attw \
  --watch
```

### Migration Command

Migration utility for converting tsup configurations to tsdown.

```bash
tsdown migrate [options]
```

```typescript { .api }
/**
 * Migrate from tsup to tsdown configuration
 * @param options - Migration options
 */
function migrate(options: {
  cwd?: string;
  dryRun?: boolean;
}): Promise<void>;
```

**Migration Options:**

```bash
-c, --cwd <dir>    # Working directory (default: current directory)
-d, --dry-run      # Preview changes without applying them
```

**Usage Examples:**

```bash
# Preview migration changes
tsdown migrate --dry-run

# Apply migration in current directory
tsdown migrate

# Migrate project in specific directory
tsdown migrate --cwd ./packages/my-lib
```

**Migration Process:**

1. **package.json Updates**:
   - Updates `tsup` dependency to `tsdown`
   - Replaces `tsup` commands in scripts with `tsdown`
   - Renames `tsup` configuration field to `tsdown`

2. **Configuration File Migration**:
   - Converts `tsup.config.*` files to `tsdown.config.*`
   - Updates import statements and references
   - Preserves all existing configuration options

3. **Supported File Extensions**:
   - `.ts`, `.cts`, `.mts`
   - `.js`, `.cjs`, `.mjs`
   - `.json`

### Debug System

Comprehensive debugging system with namespaced debug output.

```bash
# Enable all debug output
tsdown --debug

# Enable specific debug namespaces
tsdown --debug options,external

# Debug specific features
tsdown --debug rolldown,plugins
```

**Available Debug Namespaces:**
- `tsdown:options` - Options resolution and validation
- `tsdown:external` - External dependency handling
- `tsdown:report` - Size reporting and analysis
- `tsdown:rolldown` - Rolldown integration
- `tsdown:plugins` - Plugin system operations
- `tsdown:workspace` - Workspace discovery and processing

### Environment Variables

Environment variables that affect CLI behavior.

```bash
# Debug output
DEBUG=tsdown:*                 # Enable all debug output
DEBUG=tsdown:options,external  # Enable specific namespaces

# Node.js optimizations
NODE_OPTIONS=--enable-source-maps  # Enable source map support
```

### Exit Codes

The CLI uses standard exit codes for process management:

- `0` - Success
- `1` - Build failure, configuration error, or user cancellation
- Process terminates immediately on unhandled errors

### Output Format

The CLI provides structured, colorized output with progress indicators:

```
tsdown v0.14.2 powered by rolldown v0.x.x
✓ my-package Build complete in 1234ms
  dist/index.mjs    2.1 kB │ gzip: 1.1 kB
  dist/index.d.mts  856 B  │ gzip: 445 B
  2 files, total: 2.9 kB
```

### Configuration File Discovery

The CLI automatically discovers configuration files in the following order:

1. File specified by `--config` flag
2. `tsdown.config.ts`
3. `tsdown.config.cts`
4. `tsdown.config.mts`
5. `tsdown.config.js`
6. `tsdown.config.cjs`
7. `tsdown.config.mjs`
8. `tsdown.config.json`

### Integration Examples

**npm scripts integration:**

```json
{
  "scripts": {
    "build": "tsdown",
    "build:watch": "tsdown --watch",
    "build:prod": "tsdown --minify --clean",
    "dev": "tsdown --watch --sourcemap",
    "check": "tsdown --publint --attw --unused"
  }
}
```

**CI/CD integration:**

```bash
# GitHub Actions example
- name: Build library
  run: |
    npm run build
    npm run check
    
# With specific options for CI
- name: Build and validate
  run: tsdown --format esm,cjs --dts --publint --attw --fail-on-warn
```