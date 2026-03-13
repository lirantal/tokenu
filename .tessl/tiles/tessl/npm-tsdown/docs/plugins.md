# Plugin System

Built-in plugins for common bundling tasks and integration with external plugin ecosystems. tsdown supports Rollup, Rolldown, unplugin, and select Vite plugins, providing a comprehensive plugin architecture for extending build functionality.

## Capabilities

### External Plugin

Handles external dependency resolution and bundling decisions based on package.json dependencies and configuration.

```typescript { .api }
/**
 * Plugin for handling external dependencies
 * @param options - Resolved tsdown options containing dependency information
 * @returns Rolldown plugin for external dependency handling
 */
function ExternalPlugin(options: ResolvedOptions): Plugin;
```

**Features:**
- Automatically externalizes production dependencies and peer dependencies
- Respects `external` and `noExternal` configuration options
- Supports `skipNodeModulesBundle` for excluding all node_modules
- Handles Node.js built-in modules with proper side effects configuration
- Supports regex patterns and function-based external resolution

**Usage Example:**

```typescript
import { ExternalPlugin } from "tsdown/plugins";

// Used internally by tsdown, but can be configured via options
export default defineConfig({
  external: ["lodash", /^@types\/.*$/],
  noExternal: ["small-utility"],
  skipNodeModulesBundle: true
});
```

### Shebang Plugin

Manages shebang execution permissions for CLI tools and executable bundles.

```typescript { .api }
/**
 * Plugin for handling shebang execution permissions
 * @param logger - Logger instance for output
 * @param cwd - Current working directory
 * @param name - Optional project name for logging
 * @param isMultiFormat - Whether building multiple formats
 * @returns Rolldown plugin for shebang handling
 */
function ShebangPlugin(
  logger: Logger,
  cwd: string,
  name?: string,
  isMultiFormat?: boolean
): Plugin;
```

**Features:**
- Automatically detects shebang lines in entry chunks
- Grants execute permissions (0o755) to files with shebangs
- Provides detailed logging of permission changes
- Supports multi-format builds with appropriate logging

**Usage Example:**

```typescript
// In your source file (src/cli.ts)
#!/usr/bin/env node
import { runCLI } from "./cli-impl";
runCLI();

// Configuration
export default defineConfig({
  entry: "src/cli.ts",
  format: "esm"
  // ShebangPlugin is automatically applied
});
```

### Report Plugin

Provides comprehensive size reporting and build analysis with compression metrics.

```typescript { .api }
/**
 * Plugin for size reporting and build analysis
 * @param options - Reporting configuration options
 * @param logger - Logger instance for output
 * @param cwd - Current working directory
 * @param cjsDts - Whether building CommonJS declaration files
 * @param name - Optional project name for logging
 * @param isMultiFormat - Whether building multiple formats
 * @returns Rolldown plugin for size reporting
 */
function ReportPlugin(
  options: ReportOptions,
  logger: Logger,
  cwd: string,
  cjsDts?: boolean,
  name?: string,
  isMultiFormat?: boolean
): Plugin;

interface ReportOptions {
  /**
   * Enable/disable brotli-compressed size reporting.
   * Compressing large output files can be slow.
   * @default false
   */
  brotli?: boolean;
  
  /**
   * Skip reporting compressed size for files larger than this size.
   * @default 1_000_000 // 1MB
   */
  maxCompressSize?: number;
}
```

**Features:**
- File size reporting with raw, gzip, and optional brotli compression
- Sorting by entry files first, then by size
- TypeScript declaration file highlighting
- Total size summary across all files
- Performance optimization for large files

**Usage Example:**

```typescript
export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  report: {
    brotli: true,
    maxCompressSize: 500_000
  }
});

// Output example:
// dist/index.mjs    2.1 kB │ gzip: 1.1 kB │ brotli: 1.0 kB
// dist/index.d.mts  856 B  │ gzip: 445 B  │ brotli: 398 B
// 2 files, total: 2.9 kB
```

### Node Protocol Plugin

Handles Node.js protocol prefixes (`node:`) for built-in modules with options to add or strip the protocol.

```typescript { .api }
/**
 * Plugin for handling node: protocol
 * @param nodeProtocolOption - Either 'strip' to remove node: prefix or true to add it
 * @returns Rolldown plugin for node protocol handling
 */
function NodeProtocolPlugin(nodeProtocolOption: 'strip' | true): Plugin;
```

**Features:**
- **Strip Mode**: Removes `node:` prefix from imports (e.g., `node:fs` → `fs`)
- **Add Mode**: Adds `node:` prefix to built-in module imports (e.g., `fs` → `node:fs`)
- Proper external marking and side effects handling
- Pre-order resolution for optimal performance

**Usage Examples:**

```typescript
// Strip node: protocol
export default defineConfig({
  entry: "src/index.ts",
  nodeProtocol: 'strip'
  // node:fs becomes fs in output
});

// Add node: protocol  
export default defineConfig({
  entry: "src/index.ts", 
  nodeProtocol: true
  // fs becomes node:fs in output
});
```

### Plugin Ecosystem Integration

tsdown supports multiple plugin ecosystems for maximum flexibility.

```typescript { .api }
interface Options {
  /**
   * Rolldown plugins array
   */
  plugins?: InputOptions['plugins'];
}
```

**Supported Plugin Types:**

1. **Rolldown Plugins**: Native plugins for maximum performance
2. **Rollup Plugins**: Broad compatibility with existing ecosystem
3. **unplugin**: Universal plugins that work across bundlers
4. **Vite Plugins**: Select Vite plugins (via `fromVite` option)

**Usage Examples:**

```typescript
import { defineConfig } from "tsdown";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { json } from "@rollup/plugin-json";

export default defineConfig({
  entry: "src/index.ts",
  plugins: [
    nodeResolve(),
    json()
  ]
});

// Using unplugin
import { unpluginExample } from "unplugin-example/rolldown";

export default defineConfig({
  entry: "src/index.ts",
  plugins: [
    unpluginExample()
  ]
});

// Reusing Vite plugins
export default defineConfig({
  entry: "src/index.ts",
  fromVite: true, // Automatically imports plugins from vite.config.ts
  plugins: [
    // Additional plugins specific to tsdown
  ]
});
```

### Custom Plugin Development

Plugins follow the Rolldown plugin interface for optimal performance.

```typescript { .api }
// Example custom plugin
interface Plugin {
  name: string;
  buildStart?(options: InputOptions): void | Promise<void>;
  resolveId?(id: string, importer?: string, options?: ResolveIdOptions): string | null | void | Promise<string | null | void>;
  load?(id: string): string | null | void | Promise<string | null | void>;
  transform?(code: string, id: string): string | null | void | Promise<string | null | void>;
  writeBundle?(options: OutputOptions, bundle: OutputBundle): void | Promise<void>;
}
```

**Custom Plugin Example:**

```typescript
import { defineConfig } from "tsdown";

function customPlugin(): Plugin {
  return {
    name: "custom-plugin",
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return `export default ${JSON.stringify(code)};`;
      }
    }
  };
}

export default defineConfig({
  entry: "src/index.ts",
  plugins: [
    customPlugin()
  ]
});
```

### Production Dependency Detection

Utility function for determining which dependencies should be externalized.

```typescript { .api }
/**
 * Get production dependencies that should be excluded from the bundle
 * @param pkg - Package.json object
 * @returns Set of dependency names to externalize
 */
function getProductionDeps(pkg: PackageJson): Set<string>;
```

This function extracts dependencies and peerDependencies from package.json, which are typically externalized in library builds to avoid bundling runtime dependencies.