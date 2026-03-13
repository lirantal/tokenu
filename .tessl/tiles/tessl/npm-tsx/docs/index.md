# tsx

tsx (TypeScript Execute) is a TypeScript execution runtime and CLI tool that enables developers to directly run TypeScript and ESM files in Node.js without requiring a separate compilation step. Built on top of esbuild for fast transpilation, it provides seamless execution of TypeScript code with full support for both CommonJS and ESM modules.

## Package Information

- **Package Name**: tsx
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install tsx`

## Core Imports

For CommonJS environments:

```javascript
const { register, require } = require("tsx/cjs/api");
```

For ESM environments:

```typescript
import { register, tsImport } from "tsx/esm/api";
```

Direct CLI usage:

```bash
npx tsx script.ts
```

## Basic Usage

### CLI Execution

```bash
# Run TypeScript files directly
tsx hello.ts

# Watch mode for development
tsx watch server.ts

# REPL mode
tsx

# Eval mode
tsx -e "console.log('Hello TypeScript')"
```

### Programmatic CommonJS API

```javascript
const { register } = require("tsx/cjs/api");

// Register tsx loader
const unregister = register();

// Now you can require TypeScript files
const myModule = require("./my-module.ts");

// Unregister when done
unregister();
```

### Programmatic ESM API

```typescript
import { register, tsImport } from "tsx/esm/api";

// Register tsx loader for ESM
const unregister = register();

// Import TypeScript modules
const myModule = await tsImport("./my-module.ts", import.meta.url);

// Unregister when done
await unregister();
```

## Architecture

tsx is built around several key components:

- **CLI Interface**: Command-line tool with support for direct execution, watch mode, and REPL
- **CommonJS Loader**: Module registration system for CommonJS environments
- **ESM Loader**: Hook-based loader system for ESM environments using Node.js module.register()
- **Transform Engine**: Uses esbuild for fast TypeScript-to-JavaScript transformation
- **Caching System**: Built-in caching for improved performance on subsequent runs
- **Source Map Support**: Full source map integration for debugging TypeScript code

## Capabilities

### CLI Operations

Command-line interface for direct TypeScript execution with watch mode, REPL, and evaluation capabilities.

```bash { .api }
tsx [options] [script] [script-args...]
tsx watch [options] [script] [script-args...]
```

[CLI Usage](./cli.md)

### CommonJS API

Registration system for enabling TypeScript support in CommonJS modules with scoped require functionality.

```javascript { .api }
const { register, require } = require("tsx/cjs/api");

function register(options?: RegisterOptions): Unregister;
function register(options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;

function require(id: string, fromFile: string | URL): any;
```

[CommonJS API](./cjs-api.md)

### ESM API  

Hook-based loader system for ESM environments with dynamic import capabilities and advanced configuration options.

```typescript { .api }
import { register, tsImport, type RegisterOptions } from "tsx/esm/api";

function register(options?: RegisterOptions): Unregister;
function register(options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;

function tsImport(specifier: string, options: string | TsImportOptions): Promise<any>;

interface RegisterOptions {
  namespace?: string;
  onImport?: (url: string) => void;
  tsconfig?: TsconfigOptions;
}

type TsconfigOptions = false | string;
type Unregister = () => Promise<void>;

interface TsImportOptions {
  parentURL: string;
  onImport?: (url: string) => void;
  tsconfig?: TsconfigOptions;
}
```

[ESM API](./esm-api.md)

### Main Loader

Default export that automatically registers both CommonJS and ESM transformation hooks.

```typescript { .api }
import "tsx";
// or
require("tsx");
```

This automatically enables TypeScript transformation for the entire process without explicit registration calls.

### Warning Suppression

Suppress Node.js experimental feature warnings related to ESM loaders and import assertions.

```javascript { .api }
require("tsx/suppress-warnings");
```

**Note**: This entry point is deprecated and will be removed in the next major version. Use `tsx/preflight` instead.

### Preflight Module

Preflight module that sets up tsx for use with Node.js `--require` flag, enabling TypeScript support for subsequent `--require` modules.

```javascript { .api }
require("tsx/preflight");
```

Usage with Node.js flags:
```bash
node --require tsx/preflight --require ./my-typescript-config.ts app.js
```

This module:
- Registers CommonJS TypeScript transformation
- Suppresses ESM loader warnings  
- Sets up signal handling for watch mode and IPC communication
- Only executes in the main thread to avoid loader conflicts

### REPL Enhancement  

Patch Node.js REPL to support TypeScript syntax in interactive mode.

```javascript { .api }
require("tsx/patch-repl");
```

When required, this automatically patches the Node.js REPL to support TypeScript transformation.

### Standalone REPL

Standalone TypeScript REPL that can be executed directly.

```javascript { .api }
// Available as entry point: tsx/repl
```

**Note**: This entry point is deprecated and will be removed in the next major version. Use `tsx` command without arguments for REPL mode instead.

Usage:
```bash
node tsx/repl
# or via direct execution of tsx/repl entry point
```

## Types

### Common Types

```typescript { .api }
type RequiredProperty<Type, Keys extends keyof Type> = Type & { [P in Keys]-?: Type[P] };

type NodeError = Error & {
  code: string;
  url?: string;
  path?: string;
};
```