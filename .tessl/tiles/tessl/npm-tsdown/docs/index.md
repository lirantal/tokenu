# tsdown

tsdown is a modern JavaScript/TypeScript bundler for libraries built on top of Rolldown (powered by Oxc). It serves as a high-performance alternative to tsup, offering blazing fast builds with declaration file generation, comprehensive plugin ecosystem support (Rollup, Rolldown, unplugin, and some Vite plugins), and zero-configuration setup for immediate productivity.

## Package Information

- **Package Name**: tsdown
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install tsdown`

## Core Imports

```typescript
import { build, defineConfig } from "tsdown";
```

For CommonJS:

```javascript
const { build, defineConfig } = require("tsdown");
```

For plugins:

```typescript
import { ExternalPlugin, ShebangPlugin, ReportPlugin, NodeProtocolPlugin } from "tsdown/plugins";
```

For CLI usage:

```bash
npx tsdown [files]
```

## Basic Usage

```typescript
import { build, defineConfig } from "tsdown";

// Simple build with defaults
await build({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true
});

// Using defineConfig for type safety
export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: true
});
```

## Architecture

tsdown is built around several key components:

- **Core Build Engine**: Powered by Rolldown (Oxc) for maximum performance and modern JavaScript/TypeScript support
- **Configuration System**: Zero-config defaults with extensive customization options via defineConfig
- **Plugin Ecosystem**: Compatible with Rollup, Rolldown, unplugin, and select Vite plugins
- **TypeScript Integration**: Built-in TypeScript support with automatic declaration file generation
- **Workspace Support**: Monorepo and workspace capabilities for multi-package projects
- **CLI Interface**: Command-line tool with comprehensive options and migration utilities
- **Quality Assurance**: Integration with publint, Are The Types Wrong, and unused dependency checking

## Capabilities

### Core Build System

Main build functionality for bundling TypeScript/JavaScript libraries with Rolldown. Supports multiple output formats, TypeScript declaration generation, and extensive configuration options.

```typescript { .api }
function build(userOptions?: Options): Promise<void>;

interface Options {
  entry?: InputOption;
  format?: Format | Format[];
  outDir?: string;
  dts?: boolean | DtsOptions;
  sourcemap?: boolean | 'inline' | 'hidden';
  clean?: boolean | string[];
  // ... extensive options interface
}

type Format = 'es' | 'cjs' | 'iife' | 'umd';
```

[Build System](./build-system.md)

### Configuration Management

Type-safe configuration system with defineConfig helper and extensive options for customizing the build process.

```typescript { .api }
function defineConfig(options: UserConfig): UserConfig;
function defineConfig(options: UserConfigFn): UserConfigFn;

type UserConfig = Arrayable<Omit<Options, 'config' | 'filter'>>;
type UserConfigFn = (cliOptions: Options) => Awaitable<UserConfig>;
```

[Configuration](./configuration.md)

### Plugin System

Built-in plugins for common bundling tasks and integration with external plugin ecosystems.

```typescript { .api }
function ExternalPlugin(options: ResolvedOptions): Plugin;
function ShebangPlugin(logger: Logger, cwd: string, name?: string, isMultiFormat?: boolean): Plugin;
function ReportPlugin(options: ReportOptions, logger: Logger, cwd: string, cjsDts?: boolean, name?: string, isMultiFormat?: boolean): Plugin;
function NodeProtocolPlugin(nodeProtocolOption: 'strip' | true): Plugin;
```

[Plugin System](./plugins.md)

### CLI Interface

Command-line interface with comprehensive options for building, watching, and managing projects.

```typescript { .api }
function runCLI(): Promise<void>;
```

Available CLI commands:
- `tsdown [files]` - Build command with extensive options
- `tsdown migrate` - Migration utility from tsup to tsdown

[CLI Interface](./cli.md)

### Workspace Support

Multi-package support for monorepos with filtering and configuration management.

```typescript { .api }
interface Workspace {
  include?: Arrayable<string> | 'auto';
  exclude?: Arrayable<string>;
  config?: boolean | string;
}
```

[Workspace Support](./workspace.md)

### Migration Tools

Built-in migration utilities for moving from tsup to tsdown with automatic configuration conversion.

```typescript { .api }
function migrate(options: { cwd?: string; dryRun?: boolean }): Promise<void>;
```

[Migration Tools](./migration.md)

## Types

```typescript { .api }
// Core types
type Sourcemap = boolean | 'inline' | 'hidden';
type Format = 'es' | 'cjs' | 'iife' | 'umd';
type NormalizedFormat = 'es' | 'cjs' | 'iife' | 'umd';

// Platform and target types
type Platform = 'node' | 'neutral' | 'browser';

// Module types for file processing
type ModuleTypes = Record<string, 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'text' | 'base64' | 'dataurl' | 'binary' | 'empty' | 'css' | 'asset'>;

// Logging types
type LogLevel = 'silent' | 'error' | 'warn' | 'info';

interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  success(...args: any[]): void;
}

// Utility types
type Arrayable<T> = T | T[];
type Awaitable<T> = T | Promise<T>;
```