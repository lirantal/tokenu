# Build System

Core build functionality for bundling TypeScript/JavaScript libraries with Rolldown. Provides high-performance bundling with TypeScript support, multiple output formats, and extensive configuration options.

## Capabilities

### Main Build Function

The primary entry point for building projects with tsdown.

```typescript { .api }
/**
 * Build with tsdown. Main function for bundling libraries.
 * @param userOptions - Build configuration options
 */
function build(userOptions?: Options): Promise<void>;
```

**Usage Examples:**

```typescript
import { build } from "tsdown";

// Simple build with defaults
await build();

// Build with specific entry and formats
await build({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true
});

// Advanced configuration
await build({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts"
  },
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  minify: true,
  target: "node18",
  external: ["lodash"],
  dts: {
    resolve: true
  }
});
```

### Single Configuration Build

Internal build function for single configurations without watch mode.

```typescript { .api }
/**
 * Build a single configuration, without watch and shortcuts features.
 * Internal API, not for public use.
 * @private
 * @param config - Resolved options
 * @param clean - Clean function to call before build
 */
function buildSingle(
  config: ResolvedOptions,
  clean: () => Promise<void>
): Promise<(() => Promise<void>) | undefined>;
```

### Core Options Interface

Main configuration interface for build options.

```typescript { .api }
interface Options {
  // Input Options
  /** Entry point(s) for the build. Defaults to 'src/index.ts' if it exists */
  entry?: InputOption;
  /** External dependencies to exclude from bundle */
  external?: ExternalOption;
  /** Dependencies to include in bundle (opposite of external) */
  noExternal?: 
    | Arrayable<string | RegExp>
    | ((id: string, importer: string | undefined) => boolean | null | undefined | void);
  /** Skip bundling node_modules dependencies */
  skipNodeModulesBundle?: boolean;
  /** Path aliases for module resolution */
  alias?: Record<string, string>;
  /** TypeScript configuration file path */
  tsconfig?: string | boolean;
  /** Target runtime platform */
  platform?: 'node' | 'neutral' | 'browser';
  /** Compilation target environment(s) */
  target?: string | string[] | false;
  /** Compile-time environment variables */
  env?: Record<string, any>;
  /** Define compile-time constants */
  define?: Record<string, string>;
  /** Enable CJS and ESM shims */
  shims?: boolean;
  /** Enable tree-shaking */
  treeshake?: boolean;
  /** Module type overrides for file extensions */
  loader?: ModuleTypes;
  /** Node.js protocol handling */
  nodeProtocol?: 'strip' | boolean;
  /** Rolldown plugins */
  plugins?: InputOptions['plugins'];
  /** Custom input options function */
  inputOptions?: 
    | InputOptions
    | ((options: InputOptions, format: NormalizedFormat, context: { cjsDts: boolean }) => Awaitable<InputOptions | void | null>);

  // Output Options
  /** Output format(s) */
  format?: Format | Format[];
  /** Global variable name for IIFE/UMD formats */
  globalName?: string;
  /** Output directory */
  outDir?: string;
  /** Source map generation */
  sourcemap?: Sourcemap;
  /** Clean directories before build */
  clean?: boolean | string[];
  /** Minification options */
  minify?: boolean | 'dce-only' | MinifyOptions;
  /** Code to prepend to each chunk */
  banner?: ChunkAddon;
  /** Code to append to each chunk */
  footer?: ChunkAddon;
  /** Enable unbundle mode (mirrors input structure) */
  unbundle?: boolean;
  /** Use fixed extensions (.cjs/.mjs) */
  fixedExtension?: boolean;
  /** Custom output extensions */
  outExtensions?: OutExtensionFactory;
  /** Append hash to filenames */
  hash?: boolean;
  /** CommonJS default export handling */
  cjsDefault?: boolean;
  /** Custom output options function */
  outputOptions?: 
    | OutputOptions
    | ((options: OutputOptions, format: NormalizedFormat, context: { cjsDts: boolean }) => Awaitable<OutputOptions | void | null>);

  // TypeScript Options
  /** Generate TypeScript declaration files */
  dts?: boolean | DtsOptions;

  // Development Options
  /** Working directory */
  cwd?: string;
  /** Project name for CLI output */
  name?: string;
  /** Log level */
  logLevel?: LogLevel;
  /** Fail build on warnings */
  failOnWarn?: boolean;
  /** Custom logger implementation */
  customLogger?: Logger;
  /** Configuration file path */
  config?: boolean | string;
  /** Reuse Vite/Vitest configuration */
  fromVite?: boolean | 'vitest';
  /** Enable watch mode */
  watch?: boolean | Arrayable<string>;
  /** Paths to ignore in watch mode */
  ignoreWatch?: Arrayable<string | RegExp>;
  /** Command or function to run on successful build */
  onSuccess?: 
    | string
    | ((config: ResolvedOptions, signal: AbortSignal) => void | Promise<void>);

  // Quality Assurance Options
  /** Enable unused dependency checking */
  unused?: boolean | UnusedOptions;
  /** Run publint after bundling */
  publint?: boolean | PublintOptions;
  /** Run Are The Types Wrong after bundling */
  attw?: boolean | AttwOptions;
  /** Enable size reporting */
  report?: boolean | ReportOptions;

  // Advanced Options
  /** Generate package.json exports metadata */
  exports?: boolean | ExportsOptions;
  /** Copy files to output directory */
  copy?: CopyOptions | CopyOptionsFn;
  /** Build hooks for customization */
  hooks?: 
    | Partial<TsdownHooks>
    | ((hooks: Hookable<TsdownHooks>) => Awaitable<void>);
  /** Workspace configuration for monorepos */
  workspace?: Workspace | Arrayable<string> | true;
  /** Filter workspace packages */
  filter?: RegExp | string | string[];
}
```

### Resolved Options Interface

Internal resolved configuration after processing user options.

```typescript { .api }
interface ResolvedOptions {
  // Core resolved properties
  entry: InputOption;
  format: NormalizedFormat[];
  target?: string[];
  outDir: string;
  clean: string[];
  dts: false | DtsOptions;
  report: false | ReportOptions;
  tsconfig: string | false;
  pkg?: PackageJson;
  exports: false | ExportsOptions;
  nodeProtocol: 'strip' | boolean;
  logger: Logger;
  ignoreWatch: Array<string | RegExp>;
  
  // All other Options properties (with some excluded/transformed)
  plugins?: InputOptions['plugins'];
  treeshake?: boolean;
  platform?: 'node' | 'neutral' | 'browser';
  sourcemap?: Sourcemap;
  unused?: boolean | UnusedOptions;
  watch?: boolean | Arrayable<string>;
  shims?: boolean;
  skipNodeModulesBundle?: boolean;
  publint?: boolean | PublintOptions;
  attw?: boolean | AttwOptions;
  alias?: Record<string, string>;
  cwd?: string;
  env?: Record<string, any>;
  copy?: CopyOptions | CopyOptionsFn;
  hash?: boolean;
  name?: string;
  external?: ExternalOption;
  noExternal?: 
    | Arrayable<string | RegExp>
    | ((id: string, importer: string | undefined) => boolean | null | undefined | void);
  unbundle?: boolean;
  cjsDefault?: boolean;
}
```

### Input and Output Types

Type definitions for Rolldown integration.

```typescript { .api }
// Re-exported from rolldown
type InputOption = string | string[] | Record<string, string>;
type ExternalOption = (string | RegExp)[] | string | RegExp | ((id: string, importer?: string, isResolved?: boolean) => boolean | null | void);
type MinifyOptions = {
  // Rolldown minification options
  mangle?: boolean;
  compress?: boolean;
};

// Chunk addon types
type ChunkAddon = string | ChunkAddonFunction | ChunkAddonObject;
type ChunkAddonFunction = (chunk: OutputChunk) => string | Promise<string>;
type ChunkAddonObject = {
  [format in NormalizedFormat]?: string | ChunkAddonFunction;
};

// Output extension types
type OutExtensionFactory = OutExtensionObject | OutExtensionFunction;
type OutExtensionObject = Partial<Record<NormalizedFormat, string>>;
type OutExtensionFunction = (context: OutExtensionContext) => string | void;
interface OutExtensionContext {
  format: NormalizedFormat;
  options: ResolvedOptions;
}
```

## Build Process

The build process follows these key steps:

1. **Options Resolution**: User options are merged with defaults and validated
2. **Workspace Discovery**: If workspace mode is enabled, discover and process all packages
3. **Configuration Resolution**: Each configuration is resolved with proper paths and settings
4. **Clean Phase**: Output directories are cleaned if requested
5. **Build Phase**: Rolldown builds each format in parallel
6. **Post-processing**: Declaration files, copying, and quality checks are performed
7. **Reporting**: Size analysis and build summary are displayed
8. **Watch Mode**: If enabled, file watching and rebuild logic is activated

## Error Handling

The build system handles various error scenarios:

- **Configuration Errors**: Invalid options or missing files
- **Build Errors**: TypeScript errors, import resolution failures
- **Plugin Errors**: Plugin initialization or execution failures  
- **File System Errors**: Permission issues, disk space problems
- **Watch Mode Errors**: File watching setup or rebuild failures

In watch mode, build errors are logged but don't terminate the process, allowing for continuous development.