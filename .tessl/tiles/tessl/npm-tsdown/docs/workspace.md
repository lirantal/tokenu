# Workspace Support

Multi-package support for monorepos with filtering and configuration management. Enables building multiple packages in a single command with shared configuration and efficient dependency management.

## Capabilities

### Workspace Configuration

Interface for configuring workspace behavior in monorepos and multi-package projects.

```typescript { .api }
interface Workspace {
  /**
   * Workspace directories. Glob patterns are supported.
   * - `auto`: Automatically detect `package.json` files in the workspace.
   * @default 'auto'
   */
  include?: Arrayable<string> | 'auto';
  
  /**
   * Exclude directories from workspace.
   * Defaults to all `node_modules`, `dist`, `test`, `tests`, `temp`, and `tmp` directories.
   */
  exclude?: Arrayable<string>;
  
  /**
   * Path to the workspace configuration file.
   */
  config?: boolean | string;
}
```

### Workspace Options

Main workspace configuration options in the build configuration.

```typescript { .api }
interface Options {
  /**
   * Enable workspace mode for building multiple packages in a monorepo
   */
  workspace?: Workspace | Arrayable<string> | true;
  
  /**
   * Filter workspace packages. Only available in workspace mode.
   */
  filter?: RegExp | string | string[];
}
```

**Usage Examples:**

```typescript
import { defineConfig } from "tsdown";

// Enable workspace mode with auto-discovery
export default defineConfig({
  workspace: true,
  format: ["esm", "cjs"],
  dts: true
});

// Workspace with custom include patterns
export default defineConfig({
  workspace: {
    include: ["packages/*", "apps/*"],
    exclude: ["packages/*/test"]
  },
  format: "esm"
});

// Workspace with string shorthand
export default defineConfig({
  workspace: ["packages/*", "tools/*"],
  sourcemap: true
});

// Workspace with filtering
export default defineConfig({
  workspace: true,
  filter: /^@myorg\/.*$/, // Only packages matching pattern
  format: ["esm", "cjs"]
});
```

### Default Exclusions

Workspace discovery automatically excludes common directories that shouldn't be treated as packages:

- `**/node_modules/**`
- `**/dist/**`
- `**/test?(s)/**`
- `**/t?(e)mp/**`

### CLI Workspace Commands

Command-line interface for workspace operations.

```bash
# Enable workspace mode
tsdown --workspace

# Workspace with custom directory
tsdown --workspace packages

# Filter workspace packages
tsdown --workspace --filter @myorg
tsdown --workspace --filter "/ui-.*/"

# Multiple filters
tsdown --workspace --filter "ui,utils"
```

### Package Discovery

Workspace package discovery process:

1. **Auto Discovery**: Searches for `package.json` files in workspace directories
2. **Pattern Matching**: Uses glob patterns to find package directories
3. **Exclusion Filtering**: Applies exclude patterns to remove unwanted directories
4. **Filter Application**: Applies user-defined filters to discovered packages
5. **Configuration Loading**: Loads individual package configurations

**Discovery Examples:**

```typescript
// Auto-discovery (default)
{
  workspace: {
    include: 'auto' // Finds all package.json files
  }
}

// Explicit patterns
{
  workspace: {
    include: [
      "packages/*",      // All direct subdirectories in packages/
      "apps/*/lib",      // Nested lib directories in apps/
      "tools/build-*"    // Build tools matching pattern
    ]
  }
}

// With exclusions
{
  workspace: {
    include: "packages/*",
    exclude: [
      "packages/*/test",
      "packages/*/docs",
      "packages/legacy-*"
    ]
  }
}
```

### Filtering Packages

Multiple filtering options for targeting specific packages in the workspace.

```typescript { .api }
/**
 * Filter patterns for workspace packages
 */
type FilterPattern = RegExp | string | string[];
```

**Filter Types:**

1. **String Matching**: Substring matching against package paths
2. **Regular Expression**: Pattern matching with full regex support
3. **Array of Patterns**: Multiple filters applied with OR logic

**Filter Examples:**

```typescript
// String filter - matches paths containing "ui"
export default defineConfig({
  workspace: true,
  filter: "ui"
});

// Regex filter - matches packages starting with @myorg/
export default defineConfig({
  workspace: true,
  filter: /^@myorg\/.*/
});

// Multiple filters - matches any of the patterns
export default defineConfig({
  workspace: true,
  filter: ["ui", "utils", "shared"]
});

// Complex regex - matches UI and utility packages
export default defineConfig({
  workspace: true,
  filter: /\/(ui-|utils-|shared-)/
});
```

### Configuration Inheritance

Workspace packages inherit configuration from the root with package-specific overrides.

**Root Configuration (`tsdown.config.ts`):**

```typescript
export default defineConfig({
  workspace: true,
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true
});
```

**Package-Specific Configuration (`packages/ui-lib/tsdown.config.ts`):**

```typescript
export default defineConfig({
  // Inherits: format, dts, sourcemap, clean from root
  entry: "src/index.ts",
  external: ["react", "react-dom"], // Package-specific externals
  target: "es2020" // Override root target
});
```

### Workspace Configuration Files

Each workspace package can have its own configuration file for package-specific settings.

```typescript { .api }
interface Workspace {
  /**
   * Path to workspace configuration file
   * - `true`: Use default tsdown.config.* files
   * - `string`: Use specific configuration file path
   * - `false`: Disable workspace configuration files
   */
  config?: boolean | string;
}
```

**Usage Examples:**

```typescript
// Use default config files in each package
{
  workspace: {
    include: "packages/*",
    config: true
  }
}

// Use specific config file name
{
  workspace: {
    include: "packages/*", 
    config: "build.config.ts"
  }
}

// Disable package-specific configs (root config only)
{
  workspace: {
    include: "packages/*",
    config: false
  }
}
```

### Build Execution

Workspace builds execute in the following sequence:

1. **Root Configuration**: Load and resolve root configuration
2. **Package Discovery**: Find all packages matching workspace criteria
3. **Filter Application**: Apply filters to reduce package set
4. **Configuration Resolution**: Resolve configuration for each package
5. **Parallel Builds**: Execute builds for all packages in parallel
6. **Error Handling**: Collect and report errors from all packages

### Example Workspace Structures

**Typical Monorepo Structure:**

```
my-monorepo/
├── packages/
│   ├── ui-lib/
│   │   ├── src/index.ts
│   │   ├── package.json
│   │   └── tsdown.config.ts
│   ├── utils/
│   │   ├── src/index.ts
│   │   ├── package.json
│   │   └── tsdown.config.ts
│   └── cli-tool/
│       ├── src/index.ts
│       ├── package.json
│       └── tsdown.config.ts
├── apps/
│   └── web-app/
│       ├── package.json
│       └── (not built with tsdown)
├── tsdown.config.ts (root config)
└── package.json
```

**Configuration for Above Structure:**

```typescript
// Root tsdown.config.ts
export default defineConfig({
  workspace: {
    include: "packages/*", // Only build packages/, not apps/
    exclude: ["packages/*/test"]
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true
});
```

### Error Handling

Workspace builds handle errors gracefully:

- **Individual Package Errors**: Reported with package context
- **Configuration Errors**: Validation errors shown with package path
- **Build Failures**: Continue building other packages, report all failures
- **Filter Errors**: No packages matching filters results in error
- **Discovery Errors**: Missing packages or invalid patterns reported clearly