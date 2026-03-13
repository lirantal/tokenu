# ESM API

The ESM API (`tsx/esm/api`) provides programmatic access to tsx's TypeScript transformation capabilities within ES modules. It uses Node.js's module.register() system to provide hook-based loading of TypeScript files with advanced configuration options.

## Capabilities

### Module Registration

Register tsx transformation hooks for ES modules using Node.js module.register().

```typescript { .api }
/**
 * Register tsx loader for ES modules
 * @param options - Optional configuration
 * @returns Unregister function
 */
function register(options?: RegisterOptions): Unregister;

/**
 * Register tsx loader with required namespace
 * @param options - Configuration with required namespace
 * @returns Namespaced unregister function with additional methods
 */
function register(options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;

interface RegisterOptions {
  namespace?: string;
  onImport?: (url: string) => void;
  tsconfig?: TsconfigOptions;
}

interface InitializationOptions {
  namespace?: string;
  port?: MessagePort;
  tsconfig?: TsconfigOptions;
}

type TsconfigOptions = false | string;
type Unregister = () => Promise<void>;

interface NamespacedUnregister extends Unregister {
  import: ScopedImport;
  unregister: Unregister;
}

type Register = {
  (options: RequiredProperty<RegisterOptions, 'namespace'>): NamespacedUnregister;
  (options?: RegisterOptions): Unregister;
};
```

**Usage Examples:**

```typescript
import { register } from "tsx/esm/api";

// Basic registration
const unregister = register();

// Now TypeScript files can be imported
const myModule = await import("./my-module.ts");

// Unregister when done
await unregister();

// Registration with import callback
const unregister2 = register({
  onImport: (url) => console.log(`Loading: ${url}`)
});

// Namespaced registration for isolation
const api = register({ namespace: "my-app" });
const tsModule = await api.import("./module.ts", import.meta.url);
await api.unregister();
```

### TypeScript Import

Dynamic import function with TypeScript transformation support.

```typescript { .api }
/**
 * Import TypeScript modules with transformation
 * @param specifier - Module specifier or path
 * @param options - Parent URL or options object
 * @returns Promise resolving to module exports
 */
function tsImport(
  specifier: string,
  options: string | TsImportOptions
): Promise<any>;

interface TsImportOptions {
  parentURL: string;
  onImport?: (url: string) => void;
  tsconfig?: TsconfigOptions;
}
```

**Usage Examples:**

```typescript
import { tsImport } from "tsx/esm/api";

// Import TypeScript files
const utils = await tsImport("./utils.ts", import.meta.url);
const config = await tsImport("./config.ts", import.meta.url);

// Import relative modules
const helper = await tsImport("../helpers/format.ts", import.meta.url);

// Import with options
const module = await tsImport("./module.ts", {
  parentURL: import.meta.url,
  onImport: (url) => console.log(`Importing: ${url}`),
  tsconfig: "./custom-tsconfig.json"
});
```

### Scoped Import

When using namespace registration, access to scoped import functionality.

```typescript { .api }
type ScopedImport = (
  specifier: string,
  parent: string,
) => Promise<any>;
```

**Usage Examples:**

```typescript
import { register } from "tsx/esm/api";

// Create namespaced registration
const api = register({ namespace: "isolated-context" });

// Use scoped import - isolated from other tsx instances
const module1 = await api.import("./module1.ts", import.meta.url);
const module2 = await api.import("./module2.ts", import.meta.url);

// Cleanup
await api.unregister();
```

### TypeScript Configuration

Control tsx behavior through tsconfig options.

```typescript { .api }
// Disable tsconfig loading
const unregister = register({ tsconfig: false });

// Use custom tsconfig path
const unregister2 = register({ 
  tsconfig: "./custom-tsconfig.json" 
});

// Environment variable control
process.env.TSX_TSCONFIG_PATH = "./my-config.json";
const unregister3 = register();
```

**Usage Examples:**

```typescript
import { register } from "tsx/esm/api";

// Use specific tsconfig for registration
const unregister = register({
  tsconfig: "./build-tsconfig.json",
  onImport: (url) => {
    if (url.includes('.test.')) {
      console.log(`Loading test file: ${url}`);
    }
  }
});

// Import modules with custom configuration
const testModule = await import("./test.ts");
const srcModule = await import("./src/index.ts");

await unregister();
```

### Advanced Import Hooks

Monitor and control the import process with callback hooks.

```typescript { .api }
interface ImportHookOptions {
  namespace?: string;
  onImport?: (url: string) => void;
  tsconfig?: TsconfigOptions;
}
```

**Usage Examples:**

```typescript
import { register } from "tsx/esm/api";

// Track all imports
const importedFiles = new Set<string>();
const unregister = register({
  onImport: (url) => {
    importedFiles.add(url);
    console.log(`Imported: ${url}`);
  }
});

// Use the imports
await import("./app.ts");
await import("./config.ts");

console.log(`Total imports: ${importedFiles.size}`);
await unregister();
```

### Integration Patterns

Common patterns for integrating tsx in ESM applications.

**Application Bootstrap:**

```typescript
import { register } from "tsx/esm/api";

// Register at application start
const unregister = register({
  onImport: (url) => console.log(`Loading: ${url}`)
});

// Import TypeScript application modules
const { startServer } = await import("./server.ts");
const { loadConfig } = await import("./config.ts");

// Start application
const config = await loadConfig();
await startServer(config);

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  await unregister();
  process.exit(0);
});
```

**Conditional TypeScript Loading:**

```typescript
import { register, tsImport } from "tsx/esm/api";

async function loadPlugin(pluginPath: string) {
  if (pluginPath.endsWith('.ts')) {
    // Use tsx for TypeScript files
    return await tsImport(pluginPath, import.meta.url);
  } else {
    // Use standard import for JavaScript
    return await import(pluginPath);
  }
}

// Load mixed plugin types
const jsPlugin = await loadPlugin("./plugins/js-plugin.js");
const tsPlugin = await loadPlugin("./plugins/ts-plugin.ts");
```

**Multiple Isolated Contexts:**

```typescript
import { register } from "tsx/esm/api";

// Create separate contexts
const devContext = register({ 
  namespace: "dev",
  tsconfig: "./tsconfig.dev.json"
});

const prodContext = register({ 
  namespace: "prod", 
  tsconfig: "./tsconfig.prod.json"
});

// Load modules in different contexts
const devModule = await devContext.import("./dev.ts", import.meta.url);
const prodModule = await prodContext.import("./prod.ts", import.meta.url);

// Cleanup
await devContext.unregister();
await prodContext.unregister();
```

## Types

### Core Types

```typescript { .api }
interface TsxRequest {
  namespace: string;
  parentURL: string;
  specifier: string;
}

type Message = {
  type: 'deactivated';
} | {
  type: 'load';
  url: string;
};
```

### Node.js Compatibility

tsx ESM API requires Node.js v18.19+ or v20.6+ for module.register() support.

```typescript
import { register } from "tsx/esm/api";

try {
  const unregister = register();
  // Registration successful
} catch (error) {
  if (error.message.includes('does not support module.register')) {
    console.error('Please upgrade Node.js to v18.19+ or v20.6+');
  }
}
```

### Error Handling

tsx preserves TypeScript error information and source maps for debugging.

#### Node.js Version Compatibility

```typescript
import { register } from "tsx/esm/api";

try {
  const unregister = register();
  // Registration successful
} catch (error) {
  if (error.message.includes('does not support module.register')) {
    console.error('Please upgrade Node.js to v18.19+ or v20.6+');
    process.exit(1); 
  }
  throw error;
}
```

#### TypeScript Transformation Errors

```typescript
import { tsImport } from "tsx/esm/api";

try {
  const module = await tsImport("./broken.ts", import.meta.url);
} catch (error) {
  // Error includes TypeScript source locations with source maps
  console.error('TypeScript compilation error:', error.stack);
  
  // Handle specific error types
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Module could not be resolved:', error.path);
  }
}
```

#### Import Parameter Validation

```typescript
import { tsImport } from "tsx/esm/api";

try {
  // This will throw an error
  const module = await tsImport("./module.ts"); // Missing parentURL
} catch (error) {
  console.error(error.message); 
  // "The current file path (import.meta.url) must be provided in the second argument of tsImport()"
}

try {
  // This will also throw an error  
  const module = await tsImport("./module.ts", { /* missing parentURL */ });
} catch (error) {
  console.error(error.message);
  // "The current file path (import.meta.url) must be provided in the second argument of tsImport()"
}
```