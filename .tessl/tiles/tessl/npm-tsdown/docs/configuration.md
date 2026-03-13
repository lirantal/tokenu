# Configuration

Type-safe configuration system with defineConfig helper and extensive options for customizing the build process. Supports multiple configuration patterns including arrays, functions, and workspace configurations.

## Capabilities

### Define Configuration

Type-safe configuration helper that provides IntelliSense and validation for build options.

```typescript { .api }
/**
 * Defines the configuration for tsdown with type safety
 * @param options - Static configuration object
 */
function defineConfig(options: UserConfig): UserConfig;

/**
 * Defines the configuration for tsdown with dynamic configuration
 * @param options - Function that returns configuration based on CLI options
 */
function defineConfig(options: UserConfigFn): UserConfigFn;
```

**Usage Examples:**

```typescript
import { defineConfig } from "tsdown";

// Simple static configuration
export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true
});

// Multiple configurations
export default defineConfig([
  {
    entry: "src/index.ts",
    format: "esm",
    outDir: "dist/esm"
  },
  {
    entry: "src/index.ts", 
    format: "cjs",
    outDir: "dist/cjs"
  }
]);

// Dynamic configuration based on CLI options
export default defineConfig((options) => {
  return {
    entry: "src/index.ts",
    format: options.watch ? ["esm"] : ["esm", "cjs"],
    minify: !options.watch,
    sourcemap: options.watch
  };
});

// Conditional configuration
export default defineConfig((options) => {
  const config = {
    entry: "src/index.ts",
    format: ["esm", "cjs"] as const,
    dts: true
  };

  if (process.env.NODE_ENV === "production") {
    config.minify = true;
    config.sourcemap = false;
  }

  return config;
});
```

### Configuration Types

Type definitions for configuration objects and functions.

```typescript { .api }
/**
 * User configuration type supporting single config or array of configs
 */
type UserConfig = Arrayable<Omit<Options, 'config' | 'filter'>>;

/**
 * User configuration function type for dynamic configuration
 * @param cliOptions - Options passed from CLI
 * @returns Configuration object or array
 */
type UserConfigFn = (cliOptions: Options) => Awaitable<UserConfig>;

/**
 * Normalized user configuration (array flattened)
 */
type NormalizedUserConfig = Exclude<UserConfig, any[]>;
```

### Options Resolution

Main function for resolving and processing configuration options.

```typescript { .api }
/**
 * Resolve user options into build configurations
 * @param options - Raw options from CLI or API
 * @returns Resolved configurations and config file paths
 */
function resolveOptions(options: Options): Promise<{
  configs: ResolvedOptions[];
  files: string[];
}>;
```

### Configuration File Loading

Configuration files are automatically detected in the following order:

1. `tsdown.config.ts`
2. `tsdown.config.cts` 
3. `tsdown.config.mts`
4. `tsdown.config.js`
5. `tsdown.config.cjs`
6. `tsdown.config.mjs`
7. `tsdown.config.json`

**TypeScript Configuration Example:**

```typescript
// tsdown.config.ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  target: "es2020"
});
```

**JavaScript Configuration Example:**

```javascript
// tsdown.config.js
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.js",
  format: ["esm", "cjs"],
  minify: true,
  outDir: "lib"
});
```

**JSON Configuration Example:**

```json
{
  "entry": "src/index.ts",
  "format": ["esm", "cjs"],
  "dts": true,
  "outDir": "dist"
}
```

### Multi-Configuration Setup

Support for building multiple configurations in a single run.

```typescript { .api }
// Multiple entry points
export default defineConfig([
  {
    entry: "src/index.ts",
    format: "esm",
    outDir: "dist/esm"
  },
  {
    entry: "src/cli.ts",
    format: "esm", 
    outDir: "dist/cli",
    external: ["commander"]
  }
]);

// Different formats for same entry
export default defineConfig([
  {
    entry: "src/index.ts",
    format: "esm",
    platform: "neutral"
  },
  {
    entry: "src/index.ts",
    format: "cjs", 
    platform: "node"
  }
]);
```

### Vite Integration

Integration with existing Vite configurations for plugin reuse.

```typescript { .api }
interface Options {
  /**
   * Reuse config from Vite or Vitest (experimental)
   * @default false
   */
  fromVite?: boolean | 'vitest';
}
```

**Usage Example:**

```typescript
export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  fromVite: true, // Reuse vite.config.ts plugins and aliases
  dts: true
});
```

### Configuration Validation

The configuration system validates options and provides helpful error messages:

- **Type Safety**: TypeScript integration catches type mismatches
- **Option Validation**: Invalid combinations are detected and reported
- **Path Resolution**: Entry points and output directories are validated
- **Plugin Compatibility**: Plugin compatibility warnings are shown
- **Format Validation**: Unsupported format combinations are flagged

### Environment-Based Configuration

Configuration can be adapted based on environment variables and runtime conditions.

```typescript
export default defineConfig((options) => {
  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production";
  
  return {
    entry: "src/index.ts",
    format: ["esm", "cjs"],
    minify: isProd,
    sourcemap: isDev ? "inline" : false,
    watch: isDev,
    dts: isProd,
    clean: isProd
  };
});
```

### Merging User Options

Utility function for merging configuration objects with proper async handling.

```typescript { .api }
/**
 * Merge user options with defaults
 * @param defaults - Default configuration
 * @param user - User configuration (object, function, or null)
 * @param args - Additional arguments for function configurations
 * @returns Merged configuration
 */
function mergeUserOptions<T extends object, A extends unknown[]>(
  defaults: T,
  user: T | undefined | null | ((options: T, ...args: A) => Awaitable<T | void | null>),
  args: A
): Promise<T>;
```

This utility is used internally for merging `inputOptions` and `outputOptions` with their respective defaults while supporting both static objects and dynamic functions.